-- FreeGym MVP Sample Data
-- Insert sample data for development and testing

-- Insert lesson categories
INSERT INTO lesson_categories (id, name, description, color) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Yoga', 'Κλασικά μαθήματα yoga για όλα τα επίπεδα', '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440002', 'Pilates', 'Ενισχυτικά ασκήσεις Pilates', '#10B981'),
('550e8400-e29b-41d4-a716-446655440003', 'Cardio', 'Καρδιαγγειακές ασκήσεις', '#F59E0B'),
('550e8400-e29b-41d4-a716-446655440004', 'Strength', 'Ασκήσεις αντοχής και μυϊκής μάζας', '#EF4444'),
('550e8400-e29b-41d4-a716-446655440005', 'Dance', 'Χορευτικά μαθήματα', '#8B5CF6');

-- Insert rooms
INSERT INTO rooms (id, name, capacity, description, equipment) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Αίθουσα A', 25, 'Κύρια αίθουσα για ομαδικά μαθήματα', '["mats", "blocks", "straps"]'),
('550e8400-e29b-41d4-a716-446655440011', 'Αίθουσα B', 15, 'Μικρότερη αίθουσα για Pilates', '["reformers", "mats", "rings"]'),
('550e8400-e29b-41d4-a716-446655440012', 'Cardio Zone', 20, 'Ζώνη καρδιαγγειακών ασκήσεων', '["treadmills", "bikes", "ellipticals"]'),
('550e8400-e29b-41d4-a716-446655440013', 'Weight Room', 30, 'Αίθουσα βαρών και αντοχής', '["dumbbells", "barbells", "machines"]');

-- Insert membership packages
INSERT INTO membership_packages (id, name, description, price, credits, validity_days) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Βασικό Πακέτο', '10 μαθήματα για 30 ημέρες', 50.00, 10, 30),
('550e8400-e29b-41d4-a716-446655440021', 'Προηγμένο Πακέτο', '20 μαθήματα για 60 ημέρες', 90.00, 20, 60),
('550e8400-e29b-41d4-a716-446655440022', 'Premium Πακέτο', '40 μαθήματα για 90 ημέρες', 160.00, 40, 90),
('550e8400-e29b-41d4-a716-446655440023', 'Μηνιαία Συνδρομή', 'Απεριόριστα μαθήματα για 30 ημέρες', 120.00, 999, 30);

-- Insert admin user
INSERT INTO users (id, email, password_hash, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'admin@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'admin', true, true);

-- Insert admin profile
INSERT INTO user_profiles (id, user_id, first_name, last_name, phone, referral_code) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440030', 'Διαχειριστής', 'FreeGym', '+306900000000', 'ADMIN001');

-- Insert trainer users
INSERT INTO users (id, email, password_hash, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'maria@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'trainer', true, true),
('550e8400-e29b-41d4-a716-446655440041', 'nikos@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'trainer', true, true),
('550e8400-e29b-41d4-a716-446655440042', 'eleni@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'trainer', true, true);

-- Insert trainer profiles
INSERT INTO user_profiles (id, user_id, first_name, last_name, phone, referral_code) VALUES
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440040', 'Μαρία', 'Παπαδοπούλου', '+306900000001', 'MARIA001'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440041', 'Νίκος', 'Γεωργίου', '+306900000002', 'NIKOS001'),
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440042', 'Ελένη', 'Κωνσταντίνου', '+306900000003', 'ELENI001');

-- Insert trainers
INSERT INTO trainers (id, user_id, bio, specialties, experience_years, certifications, hourly_rate) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', 'Πιστοποιημένη εκπαιδεύτρια Yoga με 8+ χρόνια εμπειρίας', ARRAY['Hatha Yoga', 'Vinyasa Yoga', 'Yin Yoga'], 8, ARRAY['RYT-200', 'RYT-500'], 35.00),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440041', 'Ειδικευμένος σε Pilates και αντοχικές ασκήσεις', ARRAY['Mat Pilates', 'Reformer Pilates', 'Strength Training'], 6, ARRAY['Pilates Mat', 'Reformer'], 40.00),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440042', 'Εκπαιδεύτρια καρδιαγγειακών ασκήσεων και χορού', ARRAY['Cardio', 'Dance', 'HIIT'], 5, ARRAY['ACE Personal Trainer', 'Zumba Instructor'], 30.00);

-- Insert regular users
INSERT INTO users (id, email, password_hash, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440060', 'user1@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'user', true, true),
('550e8400-e29b-41d4-a716-446655440061', 'user2@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'user', true, true),
('550e8400-e29b-41d4-a716-446655440062', 'user3@freegym.gr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'user', true, true);

-- Insert user profiles
INSERT INTO user_profiles (id, user_id, first_name, last_name, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, referral_code) VALUES
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440060', 'Γιώργος', 'Δημητρίου', '+306900000010', '1990-05-15', 'Ερμού 123, Αθήνα', 'Μαρία Δημητρίου', '+306900000011', 'GIORG001'),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440061', 'Αννα', 'Παπαδοπούλου', '+306900000012', '1988-12-03', 'Σόλωνος 45, Αθήνα', 'Κώστας Παπαδόπουλος', '+306900000013', 'ANNA001'),
('550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440062', 'Μιχάλης', 'Κωνσταντίνου', '+306900000014', '1992-08-22', 'Ακαδημίας 78, Αθήνα', 'Ελένη Κωνσταντίνου', '+306900000015', 'MIHAL001');

-- Insert lessons
INSERT INTO lessons (id, name, description, category_id, trainer_id, room_id, day_of_week, start_time, end_time, capacity, difficulty) VALUES
('550e8400-e29b-41d4-a716-446655440070', 'Hatha Yoga', 'Κλασικό Hatha Yoga για αρχάριους', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', 1, '09:00:00', '10:00:00', 20, 'beginner'),
('550e8400-e29b-41d4-a716-446655440071', 'Vinyasa Flow', 'Δυναμικό Vinyasa Yoga', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', 2, '18:00:00', '19:00:00', 20, 'intermediate'),
('550e8400-e29b-41d4-a716-446655440072', 'Mat Pilates', 'Κλασικό Mat Pilates', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440011', 1, '11:00:00', '12:00:00', 15, 'beginner'),
('550e8400-e29b-41d4-a716-446655440073', 'Reformer Pilates', 'Pilates με Reformer', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440011', 3, '17:00:00', '18:00:00', 12, 'intermediate'),
('550e8400-e29b-41d4-a716-446655440074', 'Cardio Dance', 'Χορευτικές καρδιαγγειακές ασκήσεις', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440010', 2, '19:00:00', '20:00:00', 25, 'beginner'),
('550e8400-e29b-41d4-a716-446655440075', 'HIIT Training', 'Υψηλής έντασης διαστημικές ασκήσεις', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440012', 4, '18:00:00', '19:00:00', 20, 'advanced'),
('550e8400-e29b-41d4-a716-446655440076', 'Strength Training', 'Ασκήσεις αντοχής', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440013', 5, '19:00:00', '20:00:00', 25, 'intermediate'),
('550e8400-e29b-41d4-a716-446655440077', 'Zumba', 'Λατινικοί χοροί και ασκήσεις', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440010', 6, '10:00:00', '11:00:00', 30, 'beginner');

-- Insert memberships for users
INSERT INTO memberships (id, user_id, package_id, status, credits_remaining, credits_total, start_date, end_date) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440020', 'active', 8, 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440021', 'active', 15, 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440023', 'active', 999, 999, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');

-- Insert sample bookings
INSERT INTO bookings (id, user_id, lesson_id, lesson_date, status, credits_used) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440070', CURRENT_DATE + INTERVAL '1 day', 'confirmed', 1),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440072', CURRENT_DATE + INTERVAL '2 days', 'confirmed', 1),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440074', CURRENT_DATE + INTERVAL '1 day', 'confirmed', 1);

-- Insert QR codes for bookings
INSERT INTO qr_codes (id, booking_id, code, status, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440090', 'qr_code_001', 'active', CURRENT_DATE + INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440091', 'qr_code_002', 'active', CURRENT_DATE + INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440092', 'qr_code_003', 'active', CURRENT_DATE + INTERVAL '2 days');

-- Insert sample payments
INSERT INTO payments (id, user_id, membership_id, amount, currency, status, payment_method, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440080', 50.00, 'EUR', 'approved', 'card', CURRENT_DATE + INTERVAL '48 hours'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440081', 90.00, 'EUR', 'approved', 'card', CURRENT_DATE + INTERVAL '48 hours'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440082', 120.00, 'EUR', 'approved', 'card', CURRENT_DATE + INTERVAL '48 hours');

-- Insert sample referrals
INSERT INTO referrals (id, referrer_id, referred_id, referral_code, status) VALUES
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440061', 'GIORG001', 'completed'),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440062', 'ANNA001', 'pending');

-- Update referral codes in user profiles
UPDATE user_profiles SET referral_code = 'GIORG001' WHERE user_id = '550e8400-e29b-41d4-a716-446655440060';
UPDATE user_profiles SET referral_code = 'ANNA001' WHERE user_id = '550e8400-e29b-41d4-a716-446655440061';
UPDATE user_profiles SET referral_code = 'MIHAL001' WHERE user_id = '550e8400-e29b-41d4-a716-446655440062';
