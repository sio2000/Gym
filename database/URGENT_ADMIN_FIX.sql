-- URGENT ADMIN FIX - Run this immediately in Supabase SQL Editor
-- This will fix the admin role and RLS policies

-- Step 1: Update admin user role to 'admin'
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Step 2: Verify the update worked
SELECT user_id, email, first_name, last_name, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 3: Drop all existing RLS policies
DROP POLICY IF EXISTS "Admins can manage personal training codes" ON personal_training_codes;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can view their own schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can update their schedule status" ON personal_training_schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Admins can update all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON personal_training_schedules;

-- Step 4: Create new RLS policies
CREATE POLICY "Admins can manage personal training codes" ON personal_training_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own schedules" ON personal_training_schedules
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all schedules" ON personal_training_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their schedule status" ON personal_training_schedules
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Step 5: Test that admin can now access data
SELECT 'Admin access test:' as test, COUNT(*) as schedule_count
FROM personal_training_schedules;
