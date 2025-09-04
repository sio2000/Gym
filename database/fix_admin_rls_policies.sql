-- Fix RLS policies for admin to access all user_profiles
-- This will allow the admin to see all users in the admin panel

-- First, let's check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Create new policies that allow admin to access all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (
      -- Check if user is admin (you might need to add a role column or check another way)
      user_id IN (
        SELECT user_id FROM public.user_profiles 
        WHERE user_id = '550e8400-e29b-41d4-a716-446655440030' -- Admin user ID
      )
      OR
      -- Alternative: allow if user_id matches any admin user_id
      user_id = '550e8400-e29b-41d4-a716-446655440030'
    )
  )
  OR
  -- Allow users to view their own profile
  user_id = auth.uid()
);

CREATE POLICY "Admins can update all user profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND user_id = '550e8400-e29b-41d4-a716-446655440030' -- Admin user ID
  )
  OR
  user_id = auth.uid()
);

CREATE POLICY "Admins can insert user profiles" ON user_profiles
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND user_id = '550e8400-e29b-41d4-a716-446655440030' -- Admin user ID
  )
  OR
  user_id = auth.uid()
);

-- Alternative simpler approach: Temporarily disable RLS for testing
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Test query to see if admin can now access all users
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;
