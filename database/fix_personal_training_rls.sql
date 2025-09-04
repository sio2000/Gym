-- Fix RLS policy for personal_training_schedules
-- The current policy uses auth.uid() but we need to check against user_profiles table

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own schedules" ON personal_training_schedules;

-- Create new policy that works with user_profiles
CREATE POLICY "Users can view their own schedules" ON personal_training_schedules
    FOR SELECT USING (
        user_id IN (
            SELECT user_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Also allow admins to view all schedules
CREATE POLICY "Admins can view all schedules" ON personal_training_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow users to update their own schedules (for accept/decline)
CREATE POLICY "Users can update their own schedules" ON personal_training_schedules
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to update all schedules
CREATE POLICY "Admins can update all schedules" ON personal_training_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
