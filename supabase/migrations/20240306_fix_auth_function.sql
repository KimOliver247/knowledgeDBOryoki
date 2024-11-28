-- Drop existing function if it exists
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Recreate authentication function with proper schema reference
CREATE OR REPLACE FUNCTION public.authenticate_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (authenticated BOOLEAN, is_admin BOOLEAN) AS $$
DECLARE
  v_user kb_users;
BEGIN
  -- Get user record
  SELECT * INTO v_user
  FROM kb_users
  WHERE username = p_username AND is_active = true;
  
  -- Check if user exists and password matches
  IF v_user.id IS NOT NULL AND verify_password(v_user.password_hash, p_password) THEN
    RETURN QUERY SELECT 
      true AS authenticated,
      (v_user.role = 'admin') AS is_admin;
  ELSE
    RETURN QUERY SELECT 
      false AS authenticated,
      false AS is_admin;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;