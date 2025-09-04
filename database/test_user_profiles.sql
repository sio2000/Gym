-- Test script to check user_profiles table
-- Run this in Supabase SQL Editor to verify the table structure and data

-- Check if user_profiles table exists and has data
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as users_with_names,
    COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as users_with_emails
FROM user_profiles;

-- Show all users with their details
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Check if there are any users with missing names
SELECT 
    user_id,
    first_name,
    last_name,
    email
FROM user_profiles 
WHERE first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '';

-- Check if there are any users with missing emails
SELECT 
    user_id,
    first_name,
    last_name,
    email
FROM user_profiles 
WHERE email IS NULL OR email = '';
