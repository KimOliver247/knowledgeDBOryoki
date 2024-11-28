-- First, ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Recreate user_role type if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user');
    END IF;
END$$;

-- Drop existing policies and functions for clean slate
DROP POLICY IF EXISTS "kb_users_select_policy" ON kb_users;
DROP POLICY IF EXISTS "kb_users_insert_policy" ON kb_users;
DROP POLICY IF EXISTS "kb_users_update_policy" ON kb_users;
DROP POLICY IF EXISTS "kb_users_delete_policy" ON kb_users;
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.hash_password(TEXT);

-- Create password hashing function
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create password verification function
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create authentication function
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
    IF v_user.id IS NOT NULL AND verify_password(p_password, v_user.password_hash) THEN
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

-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT ON TABLE kb_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE kb_users TO authenticated;

-- Create RLS policies
CREATE POLICY "kb_users_select_policy"
ON kb_users
FOR SELECT
TO public
USING (true);  -- Allow reading all users for authentication

CREATE POLICY "kb_users_insert_policy"
ON kb_users
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
);

CREATE POLICY "kb_users_update_policy"
ON kb_users
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
);

CREATE POLICY "kb_users_delete_policy"
ON kb_users
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
);

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
        public.hash_password('admin'),
        'admin',
        true,
        CURRENT_TIMESTAMP
    );
END $$;