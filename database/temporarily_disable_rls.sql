-- Temporarily disable RLS for user_profiles table to test admin access
-- This is for testing purposes only

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Test query to see all users
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Check how many users we have
SELECT COUNT(*) as total_users FROM user_profiles;

-- Check users with missing names
SELECT 
    user_id,
    first_name,
    last_name,
    email
FROM user_profiles 
WHERE first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '';

-- To re-enable RLS later, run:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
