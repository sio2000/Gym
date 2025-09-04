-- Simple fix for email duplicates - just update the emails, don't create constraints
-- Run this if you got the unique constraint error

-- First, let's see what emails we have
SELECT email, COUNT(*) as count 
FROM user_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Update all users with duplicate emails to have unique emails based on their user_id
UPDATE user_profiles 
SET email = CONCAT('user-', SUBSTRING(user_id::text, 1, 8), '@freegym.gr')
WHERE email = 'user@freegym.gr';

-- Verify the fix worked
SELECT email, COUNT(*) as count 
FROM user_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
