-- EMERGENCY ADMIN FIX - Run this immediately!
-- This will force update the admin role

-- Step 1: Check current state
SELECT 'BEFORE - Admin Role:' as step, user_id, email, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 2: Force update admin role (using user_id directly)
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = '74b92be4-f54a-4cbd-9cdc-572406f928be';

-- Step 3: Also try updating by email as backup
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Step 4: Verify the update
SELECT 'AFTER - Admin Role:' as step, user_id, email, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Step 5: Test admin access
SELECT 'Admin Access Test:' as step, COUNT(*) as accessible_schedules
FROM personal_training_schedules;
