-- Update phone field to be required in user_profiles table
-- This script makes the phone field NOT NULL and updates existing records

-- First, update any existing NULL phone values to a default value
UPDATE user_profiles 
SET phone = '+306900000000' 
WHERE phone IS NULL OR phone = '';

-- Now make the phone column NOT NULL
ALTER TABLE user_profiles 
ALTER COLUMN phone SET NOT NULL;

-- Add a check constraint to ensure phone format is valid
ALTER TABLE user_profiles 
ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^[\+]?[0-9\s\-\(\)]{10,}$');

-- Update the trigger to ensure phone is always provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    first_name,
    last_name,
    phone,
    referral_code,
    language,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '+306900000000'),
    COALESCE(NEW.raw_user_meta_data->>'referral_code', NULL),
    COALESCE(NEW.raw_user_meta_data->>'language', 'el'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
