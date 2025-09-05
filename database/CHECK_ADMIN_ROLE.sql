-- CHECK ADMIN ROLE - Run this to verify admin role is correct

-- Check the admin user's role in user_profiles
SELECT 
    'Admin Role Check' as test,
    user_id, 
    email, 
    first_name, 
    last_name, 
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ CORRECT - Admin role found' 
        WHEN role = 'user' THEN '❌ WRONG - Role is user, should be admin'
        ELSE '⚠️ UNKNOWN - Role is: ' || role
    END as status
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- If role is wrong, fix it
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr' AND role != 'admin';

-- Verify the fix
SELECT 
    'After Fix Check' as test,
    user_id, 
    email, 
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ FIXED - Now admin' 
        ELSE '❌ STILL WRONG - Role is: ' || role
    END as status
FROM user_profiles 
WHERE email = 'admin@freegym.gr';
