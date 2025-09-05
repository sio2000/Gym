-- Add profile fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dob_locked BOOLEAN DEFAULT FALSE;

-- Create profile-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile-photos bucket
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own profile photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Users can view their own profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    
  CREATE POLICY "Users can upload their own profile photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    
  CREATE POLICY "Users can update their own profile photos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    
  CREATE POLICY "Users can delete their own profile photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
END $$;
