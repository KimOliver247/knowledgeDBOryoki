-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.create_user(TEXT, TEXT, user_role);

-- Create user creation function
CREATE OR REPLACE FUNCTION public.create_user(
  p_username TEXT,
  p_password TEXT,
  p_role user_role
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Validate inputs
  IF p_username IS NULL OR p_password IS NULL OR p_role IS NULL THEN
    RAISE EXCEPTION 'Username, password, and role are required';
  END IF;

  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM kb_users WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;

  -- Insert new user
  INSERT INTO kb_users (
    username,
    password_hash,
    role,
    is_active,
    created_at
  ) VALUES (
    p_username,
    public.hash_password(p_password),
    p_role,
    true,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user(TEXT, TEXT, user_role) TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION public.create_user IS 'Creates a new user with the specified username, password, and role';