-- CREATE NEW ADMIN - If the existing admin can't be updated

-- First, check if we can update the existing admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Check if the update worked
SELECT 'Update Result:' as test, user_id, email, role
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- If the above doesn't work, create a new admin user
-- (This is a backup plan - only run if the update fails)
INSERT INTO user_profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    role, 
    phone,
    created_at,
    updated_at
) VALUES (
    '74b92be4-f54a-4cbd-9cdc-572406f928be',
    'admin@freegym.gr',
    'Διαχειριστής',
    'FreeGym',
    'admin',
    '2101234567',
    NOW(),
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- Verify the final result
SELECT 'Final Result:' as test, user_id, email, role, first_name, last_name
FROM user_profiles 
WHERE email = 'admin@freegym.gr';
