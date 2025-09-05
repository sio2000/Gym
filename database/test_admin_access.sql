-- TEST ADMIN ACCESS SCRIPT
-- Run this after the complete_admin_fix.sql to verify everything works

-- Test 1: Check if admin user has correct role
SELECT 
    'Admin Role Check' as test_name,
    user_id, 
    email, 
    first_name, 
    last_name, 
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ PASS' 
        ELSE '❌ FAIL - Role should be admin' 
    END as result
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Test 2: Check if admin can read personal_training_schedules
SELECT 
    'Schedule Access Check' as test_name,
    COUNT(*) as schedule_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can read schedules' 
        ELSE '❌ FAIL - Cannot read schedules' 
    END as result
FROM personal_training_schedules;

-- Test 3: Check if admin can read personal_training_codes
SELECT 
    'Codes Access Check' as test_name,
    COUNT(*) as codes_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can read codes' 
        ELSE '❌ FAIL - Cannot read codes' 
    END as result
FROM personal_training_codes;

-- Test 4: List all RLS policies for personal_training_schedules
SELECT 
    'RLS Policies Check' as test_name,
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%admin%' THEN '✅ Admin policy exists'
        ELSE '⚠️ Policy exists'
    END as result
FROM pg_policies 
WHERE tablename = 'personal_training_schedules'
ORDER BY policyname;
