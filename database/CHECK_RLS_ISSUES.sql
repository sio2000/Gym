-- CHECK RLS ISSUES - See if RLS is blocking the update

-- Check if RLS is enabled on user_profiles
SELECT 'RLS Status:' as test, schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check RLS policies on user_profiles
SELECT 'RLS Policies:' as test, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Try to update as the current user (this might be blocked by RLS)
SELECT 'Current User:' as test, auth.uid() as current_user_id;

-- Check if we can read the admin user
SELECT 'Can Read Admin:' as test, user_id, email, role
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Try a simple update to see if it's blocked
UPDATE user_profiles 
SET updated_at = NOW() 
WHERE email = 'admin@freegym.gr';

-- Check if the update worked
SELECT 'Update Test:' as test, user_id, email, updated_at
FROM user_profiles 
WHERE email = 'admin@freegym.gr';
