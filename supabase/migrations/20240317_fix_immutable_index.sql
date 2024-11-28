-- Drop the problematic index
DROP INDEX IF EXISTS idx_system_logs_auth_role;

-- Create a stable function for role checking
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT
IMMUTABLE
LANGUAGE SQL
AS $$
  SELECT COALESCE(current_setting('request.jwt.claim.role', true), 'anon');
$$;

-- Create the index using the immutable function
CREATE INDEX idx_system_logs_auth_role 
ON system_logs (get_auth_role());

-- Add comment explaining the function
COMMENT ON FUNCTION get_auth_role() IS 'Returns the current authentication role in an immutable way for indexing';

-- Update the policies to use the new function
DROP POLICY IF EXISTS "allow_authenticated_insert" ON system_logs;
DROP POLICY IF EXISTS "allow_authenticated_select" ON system_logs;

CREATE POLICY "allow_authenticated_insert"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (
    CASE
        WHEN get_auth_role() = 'authenticated' THEN true
        ELSE false
    END
);

CREATE POLICY "allow_authenticated_select"
ON system_logs
FOR SELECT
TO authenticated
USING (
    CASE
        WHEN get_auth_role() = 'authenticated' THEN true
        ELSE false
    END
);