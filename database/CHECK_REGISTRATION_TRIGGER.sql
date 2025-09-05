-- CHECK REGISTRATION TRIGGER - Check if there's a trigger for user registration

-- Check if there are any triggers on auth.users
SELECT 'Triggers on auth.users:' as test, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Check if there are any functions that might handle user creation
SELECT 'Functions:' as test, routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%';

-- Check if there's a trigger function for user profiles
SELECT 'Trigger Functions:' as test, proname, prosrc
FROM pg_proc 
WHERE proname LIKE '%user%' 
OR proname LIKE '%profile%';

-- Check if RLS is enabled on user_profiles
SELECT 'RLS Status:' as test, schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';
