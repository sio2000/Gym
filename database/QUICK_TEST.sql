-- QUICK TEST - Run this to verify everything is working

-- 1. Check admin user role
SELECT 'Admin Role Check:' as test, user_id, email, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- 2. Check if admin can read schedules (should return 0 or more rows)
SELECT 'Schedule Access Check:' as test, COUNT(*) as count
FROM personal_training_schedules;

-- 3. Check if admin can read codes (should return 0 or more rows)  
SELECT 'Codes Access Check:' as test, COUNT(*) as count
FROM personal_training_codes;

-- 4. List all RLS policies for personal_training_schedules
SELECT 'RLS Policies:' as test, policyname, cmd
FROM pg_policies 
WHERE tablename = 'personal_training_schedules';
