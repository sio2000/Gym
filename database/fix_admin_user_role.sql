-- Fix admin user role in user_profiles table
-- This updates the admin user's role from 'user' to 'admin'

-- First, let's check the current admin user
SELECT user_id, email, first_name, last_name, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';

-- Update the admin user's role to 'admin'
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@freegym.gr';

-- Verify the update
SELECT user_id, email, first_name, last_name, role 
FROM user_profiles 
WHERE email = 'admin@freegym.gr';
