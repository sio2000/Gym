-- COMPLETE ADMIN FIX SCRIPT
-- Run this script in Supabase SQL Editor to fix all admin access issues

-- Step 1: Update admin user role from 'user' to 'admin'
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Step 2: Verify admin user role update
SELECT user_id, email, first_name, last_name, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 3: Drop ALL existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage personal training codes" ON personal_training_codes;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can view their own schedules" ON personal_training_schedules;
DROP POLICY IF EXISTS "Users can update their schedule status" ON personal_training_schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON personal_training_schedules;

-- Step 4: Create new RLS policies that check user_profiles table

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
CREATE POLICY "Admins can view all schedules" ON personal_training_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Step 5: Test the policies by checking if admin can access data
-- This should return the admin user's profile
SELECT 'Admin user check:' as test, user_id, email, role 
FROM user_profiles 
WHERE user_id = auth.uid() AND role = 'admin';

-- Step 6: Verify RLS policies are working
-- This should show all policies for personal_training_schedules
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'personal_training_schedules';
