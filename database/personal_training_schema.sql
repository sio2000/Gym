-- Personal Training Schedule Schema
-- Νέα δομή για το προσωποποιημένο μηνιαίο πρόγραμμα Personal Training

-- Personal Training Access Codes table
-- Ο admin δημιουργεί κωδικούς πρόσβασης για Personal Training
CREATE TABLE personal_training_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('personal', 'kickboxing', 'combo')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    used_by UUID REFERENCES users(id),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Personal Training Schedules table
-- Το προσωποποιημένο πρόγραμμα για κάθε χρήστη
CREATE TABLE personal_training_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    schedule_data JSONB NOT NULL, -- Περιέχει τις ώρες, ημέρες, τύπο προπόνησης
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    decline_reason TEXT
);

-- Indexes για performance
CREATE INDEX idx_personal_training_codes_code ON personal_training_codes(code);
CREATE INDEX idx_personal_training_codes_used_by ON personal_training_codes(used_by);
CREATE INDEX idx_personal_training_schedules_user_id ON personal_training_schedules(user_id);
CREATE INDEX idx_personal_training_schedules_month_year ON personal_training_schedules(month, year);
CREATE INDEX idx_personal_training_schedules_status ON personal_training_schedules(status);

-- RLS Policies
ALTER TABLE personal_training_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_training_schedules ENABLE ROW LEVEL SECURITY;

-- Policy για personal_training_codes - μόνο admins μπορούν να δημιουργούν/διαβάζουν
CREATE POLICY "Admins can manage personal training codes" ON personal_training_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy για personal_training_schedules - admins και ο ίδιος ο χρήστης
CREATE POLICY "Users can view their own schedules" ON personal_training_schedules
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all schedules" ON personal_training_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy για users να μπορούν να ενημερώνουν το status του δικού τους προγράμματος
CREATE POLICY "Users can update their schedule status" ON personal_training_schedules
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
