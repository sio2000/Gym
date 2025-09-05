-- Fix RLS policies for admin access to personal_training_schedules
-- The current policies check the 'users' table but admin role is in 'user_profiles'

-- IMPORTANT: First run database/fix_admin_user_role.sql to update admin role!

-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage personal training codes" ON personal_training_codes;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can view their own schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can update their schedule status" ON personal_training_schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON personal_training_schedules;

-- Create new policies that check user_profiles table for admin role

-- Policy for personal_training_codes - admins can manage all
CREATE POLICY "Admins can manage personal training codes" ON personal_training_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy for personal_training_schedules - users can view their own
CREATE POLICY "Users can view their own schedules" ON personal_training_schedules
    FOR SELECT USING (user_id = auth.uid());

-- Policy for personal_training_schedules - admins can manage all (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all schedules" ON personal_training_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy for users to update their own schedule status
CREATE POLICY "Users can update their schedule status" ON personal_training_schedules
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Additional policy to allow admins to view all schedules (for admin panel)
-- This is separate from the manage policy to ensure SELECT works properly
CREATE POLICY "Admins can view all schedules" ON personal_training_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );