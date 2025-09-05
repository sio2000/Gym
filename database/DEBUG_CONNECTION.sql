-- DEBUG CONNECTION - Check if we can connect and update

-- Check if we can see the admin user
SELECT 'Connection Test:' as test, COUNT(*) as admin_count
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Check current admin role
SELECT 'Current Role:' as test, user_id, email, role, first_name, last_name
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Try to update with explicit transaction
BEGIN;
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';
COMMIT;

-- Verify the update worked
SELECT 'After Update:' as test, user_id, email, role
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Check if there are any constraints preventing the update
SELECT 'Table Info:' as test, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'role';
