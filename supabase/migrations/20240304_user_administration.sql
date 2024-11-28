-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user');
    END IF;
END$$;

-- Create users table
CREATE TABLE IF NOT EXISTS kb_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES kb_users(id),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create secure password hash function
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create password verification function
CREATE OR REPLACE FUNCTION verify_password(stored_hash TEXT, attempted_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN stored_hash = crypt(attempted_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user authentication function
CREATE OR REPLACE FUNCTION authenticate_user(p_username TEXT, p_password TEXT)
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

-- Create user creation function
CREATE OR REPLACE FUNCTION create_user(
  p_username TEXT,
  p_password TEXT,
  p_role user_role
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO kb_users (username, password_hash, role)
  VALUES (p_username, hash_password(p_password), p_role)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create initial admin user (password: admin)
INSERT INTO kb_users (username, password_hash, role)
VALUES ('admin', hash_password('admin'), 'admin')
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE kb_users ENABLE ROW LEVEL SECURITY;

-- Policies for kb_users table
CREATE POLICY "Users can view their own data"
ON kb_users
FOR SELECT
TO authenticated
USING (id = auth.uid() OR role = 'admin');

CREATE POLICY "Admins can create users"
ON kb_users
FOR INSERT
TO authenticated
WITH CHECK (role = 'admin');

CREATE POLICY "Admins can update users"
ON kb_users
FOR UPDATE
TO authenticated
USING (role = 'admin');

CREATE POLICY "Admins can delete users"
ON kb_users
FOR DELETE
TO authenticated
USING (role = 'admin');