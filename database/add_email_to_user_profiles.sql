-- Add email column to user_profiles table
-- This will allow us to store and display user emails in the admin panel

-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN email VARCHAR(255);

-- Update existing user profiles with sample emails
-- In a real scenario, you would populate these from the auth.users table
UPDATE user_profiles 
SET email = CASE 
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440030' THEN 'admin@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440040' THEN 'maria@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440041' THEN 'nikos@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440042' THEN 'eleni@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440060' THEN 'user1@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440061' THEN 'user2@freegym.gr'
    WHEN user_id = '550e8400-e29b-41d4-a716-446655440062' THEN 'user3@freegym.gr'
    ELSE CONCAT('user-', SUBSTRING(user_id::text, 1, 8), '@freegym.gr')
END;

-- Make email column NOT NULL after populating it
ALTER TABLE user_profiles 
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint to email column
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Add index for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles (email);

-- Update the trigger to also handle email when creating new user profiles
-- First, let's drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function that includes email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, 'user@freegym.gr')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
