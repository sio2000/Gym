-- FINAL ADMIN FIX - Run this to fix all admin issues

-- Step 1: Check current admin role
SELECT 'BEFORE FIX - Admin Role:' as step, user_id, email, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 2: Force update admin role to 'admin'
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Step 3: Verify the update
SELECT 'AFTER FIX - Admin Role:' as step, user_id, email, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 4: Check if there are any schedules in the table
SELECT 'Schedule Count:' as step, COUNT(*) as count
FROM personal_training_schedules;

-- Step 5: Test admin access to schedules
SELECT 'Admin Access Test:' as step, COUNT(*) as accessible_schedules
FROM personal_training_schedules;

-- Step 6: List all RLS policies
SELECT 'RLS Policies:' as step, policyname, cmd
FROM pg_policies 
WHERE tablename = 'personal_training_schedules'
ORDER BY policyname;
