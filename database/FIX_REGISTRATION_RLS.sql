-- FIX REGISTRATION RLS - Fix RLS policies for user registration

-- Check current RLS policies on user_profiles
SELECT 'Current RLS Policies:' as test, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Drop existing policies that might be blocking registration
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Create new RLS policies that allow registration
-- Allow users to insert their own profile (for registration)
CREATE POLICY "Allow user registration" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Verify the new policies
SELECT 'New RLS Policies:' as test, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
