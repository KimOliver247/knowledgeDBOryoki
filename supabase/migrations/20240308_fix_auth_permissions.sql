-- Drop existing function to ensure clean state
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT);

-- Recreate authentication function with proper permissions
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
    IF v_user.id IS NOT NULL AND 
       v_user.password_hash = crypt(p_password, v_user.password_hash) THEN
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

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
GRANT SELECT ON TABLE kb_users TO anon, authenticated;

-- Recreate admin user with proper password
DO $$
BEGIN
    DELETE FROM kb_users WHERE username = 'admin';
    
    INSERT INTO kb_users (
        username,
        password_hash,
        role,
        is_active,
        created_at
    ) VALUES (
        'admin',
        crypt('admin', gen_salt('bf')),
        'admin'::user_role,
        true,
        CURRENT_TIMESTAMP
    );
END $$;