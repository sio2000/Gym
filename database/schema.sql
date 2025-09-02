-- FreeGym MVP Database Schema
-- Created based on the FreeGym blueprint requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (authentication and basic info)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table (extended user information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'el',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    avatar_url TEXT,
    referral_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table (gym rooms and spaces)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    equipment JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trainers table (extended trainer information)
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[],
    experience_years INTEGER,
    certifications TEXT[],
    hourly_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lesson categories table
CREATE TABLE lesson_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table (classes and programs)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES lesson_categories(id),
    trainer_id UUID REFERENCES trainers(id),
    room_id UUID REFERENCES rooms(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membership packages table
CREATE TABLE membership_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    credits INTEGER NOT NULL,
    validity_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memberships table (user subscriptions)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES membership_packages(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    credits_remaining INTEGER NOT NULL,
    credits_total INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES memberships(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (lesson reservations)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    lesson_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    credits_used INTEGER NOT NULL DEFAULT 1,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- QR codes table
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    reward_credits INTEGER DEFAULT 5,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);

CREATE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE INDEX idx_trainers_active ON trainers(is_active);

CREATE INDEX idx_lessons_trainer_id ON lessons(trainer_id);
CREATE INDEX idx_lessons_room_id ON lessons(room_id);
CREATE INDEX idx_lessons_category_id ON lessons(category_id);
CREATE INDEX idx_lessons_day_time ON lessons(day_of_week, start_time);
CREATE INDEX idx_lessons_active ON lessons(is_active);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_expires ON payments(expires_at);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lesson_id ON bookings(lesson_id);
CREATE INDEX idx_bookings_date ON bookings(lesson_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_qr_codes_booking_id ON qr_codes(booking_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
CREATE INDEX idx_qr_codes_status ON qr_codes(status);
CREATE INDEX idx_qr_codes_expires ON qr_codes(expires_at);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Constraints and triggers
ALTER TABLE lessons ADD CONSTRAINT check_lesson_time CHECK (start_time < end_time);
ALTER TABLE memberships ADD CONSTRAINT check_membership_dates CHECK (start_date < end_date);
ALTER TABLE bookings ADD CONSTRAINT check_booking_date CHECK (lesson_date >= CURRENT_DATE);
ALTER TABLE qr_codes ADD CONSTRAINT check_qr_expiry CHECK (expires_at > CURRENT_TIMESTAMP);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_packages_updated_at BEFORE UPDATE ON membership_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = code) INTO exists;
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check booking availability
CREATE OR REPLACE FUNCTION check_booking_availability(
    p_lesson_id UUID,
    p_lesson_date DATE,
    p_user_id UUID
)
RETURNS TABLE(
    is_available BOOLEAN,
    message TEXT
) AS $$
DECLARE
    lesson_capacity INTEGER;
    current_bookings INTEGER;
    user_credits INTEGER;
    lesson_day INTEGER;
    lesson_start TIME;
BEGIN
    -- Get lesson details
    SELECT capacity, day_of_week, start_time INTO lesson_capacity, lesson_day, lesson_start
    FROM lessons WHERE id = p_lesson_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Lesson not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if lesson is on the correct day
    IF EXTRACT(DOW FROM p_lesson_date) != lesson_day THEN
        RETURN QUERY SELECT false, 'Lesson is not available on this date'::TEXT;
        RETURN;
    END IF;
    
    -- Check if date is in the future
    IF p_lesson_date <= CURRENT_DATE THEN
        RETURN QUERY SELECT false, 'Cannot book lessons for past or current dates'::TEXT;
        RETURN;
    END IF;
    
    -- Check room capacity
    SELECT COUNT(*) INTO current_bookings
    FROM bookings 
    WHERE lesson_id = p_lesson_id 
    AND lesson_date = p_lesson_date 
    AND status != 'cancelled';
    
    IF current_bookings >= lesson_capacity THEN
        RETURN QUERY SELECT false, 'Lesson is full'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user already has a booking for this lesson and date
    IF EXISTS(SELECT 1 FROM bookings WHERE user_id = p_user_id AND lesson_id = p_lesson_id AND lesson_date = p_lesson_date AND status != 'cancelled') THEN
        RETURN QUERY SELECT false, 'You already have a booking for this lesson'::TEXT;
        RETURN;
    END IF;
    
    -- Check user credits
    SELECT COALESCE(SUM(credits_remaining), 0) INTO user_credits
    FROM memberships 
    WHERE user_id = p_user_id 
    AND status = 'active' 
    AND end_date >= CURRENT_DATE;
    
    IF user_credits < 1 THEN
        RETURN QUERY SELECT false, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT true, 'Booking available'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to create booking with QR code
CREATE OR REPLACE FUNCTION create_booking_with_qr(
    p_user_id UUID,
    p_lesson_id UUID,
    p_lesson_date DATE
)
RETURNS TABLE(
    booking_id UUID,
    qr_code VARCHAR(255),
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_booking_id UUID;
    v_qr_code VARCHAR(255);
    v_availability RECORD;
BEGIN
    -- Check availability
    SELECT * INTO v_availability FROM check_booking_availability(p_lesson_id, p_lesson_date, p_user_id);
    
    IF NOT v_availability.is_available THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, false, v_availability.message;
        RETURN;
    END IF;
    
    -- Deduct credits from active membership
    UPDATE memberships 
    SET credits_remaining = credits_remaining - 1
    WHERE user_id = p_user_id 
    AND status = 'active' 
    AND credits_remaining > 0
    AND end_date >= CURRENT_DATE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, false, 'Failed to deduct credits'::TEXT;
        RETURN;
    END IF;
    
    -- Create booking
    INSERT INTO bookings (user_id, lesson_id, lesson_date, credits_used)
    VALUES (p_user_id, p_lesson_id, p_lesson_date, 1)
    RETURNING id INTO v_booking_id;
    
    -- Generate QR code
    v_qr_code := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO qr_codes (booking_id, code, expires_at)
    VALUES (v_booking_id, v_qr_code, p_lesson_date + INTERVAL '1 day');
    
    RETURN QUERY SELECT v_booking_id, v_qr_code, true, 'Booking created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral completion
CREATE OR REPLACE FUNCTION process_referral_completion(
    p_referral_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_referral RECORD;
    v_reward_credits INTEGER;
BEGIN
    -- Get referral details
    SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Referral not found'::TEXT;
        RETURN;
    END IF;
    
    IF v_referral.status != 'pending' THEN
        RETURN QUERY SELECT false, 'Referral already processed'::TEXT;
        RETURN;
    END IF;
    
    v_reward_credits := v_referral.reward_credits;
    
    -- Add credits to both users
    UPDATE memberships 
    SET credits_remaining = credits_remaining + v_reward_credits
    WHERE user_id = v_referral.referrer_id 
    AND status = 'active' 
    AND end_date >= CURRENT_DATE;
    
    UPDATE memberships 
    SET credits_remaining = credits_remaining + v_reward_credits
    WHERE user_id = v_referral.referred_id 
    AND status = 'active' 
    AND end_date >= CURRENT_DATE;
    
    -- Mark referral as completed
    UPDATE referrals 
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    WHERE id = p_referral_id;
    
    RETURN QUERY SELECT true, 'Referral processed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;
