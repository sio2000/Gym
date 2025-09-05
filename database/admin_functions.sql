-- Admin functions for bypassing RLS policies
-- These functions run with SECURITY DEFINER, so they bypass RLS

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    up.user_id,
    up.first_name,
    up.last_name,
    up.email,
    up.phone,
    'user'::TEXT as role, -- Default role since user_profiles doesn't have role
    up.created_at,
    up.updated_at
  FROM user_profiles up
  ORDER BY up.created_at DESC;
END;
$$;

-- Function to get personal training codes (admin only)
CREATE OR REPLACE FUNCTION get_personal_training_codes()
RETURNS TABLE (
  id UUID,
  code TEXT,
  package_type TEXT,
  used_by UUID,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    ptc.id,
    ptc.code,
    ptc.package_type,
    ptc.used_by,
    ptc.is_active,
    ptc.created_at
  FROM personal_training_codes ptc
  WHERE ptc.is_active = true;
END;
$$;

-- Function to create personal training code (admin only)
CREATE OR REPLACE FUNCTION create_personal_training_code(
  p_code TEXT,
  p_package_type TEXT DEFAULT 'personal',
  p_used_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Generate new UUID
  new_id := gen_random_uuid();

  -- Insert new personal training code
  INSERT INTO personal_training_codes (
    id,
    code,
    package_type,
    used_by,
    is_active,
    created_at
  ) VALUES (
    new_id,
    p_code,
    p_package_type,
    p_used_by,
    true,
    NOW()
  );

  RETURN new_id;
END;
$$;
