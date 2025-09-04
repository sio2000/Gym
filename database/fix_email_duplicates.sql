-- Fix email duplicates in user_profiles table
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

-- Now try to add the unique constraint again (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_email_unique'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);
