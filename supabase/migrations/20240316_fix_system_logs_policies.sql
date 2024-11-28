-- Drop existing policies
DROP POLICY IF EXISTS "allow_all_authenticated_insert" ON system_logs;
DROP POLICY IF EXISTS "allow_all_authenticated_select" ON system_logs;

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "allow_authenticated_insert"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (
    CASE
        WHEN auth.role() = 'authenticated' THEN true
        ELSE false
    END
);

CREATE POLICY "allow_authenticated_select"
ON system_logs
FOR SELECT
TO authenticated
USING (
    CASE
        WHEN auth.role() = 'authenticated' THEN true
        ELSE false
    END
);

-- Grant necessary permissions
GRANT ALL ON system_logs TO authenticated;
GRANT ALL ON system_logs TO anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create index for auth.role() lookups
CREATE INDEX IF NOT EXISTS idx_system_logs_auth_role ON system_logs ((auth.role()));

-- Add comment explaining policy purpose
COMMENT ON POLICY "allow_authenticated_insert" ON system_logs IS 'Allow authenticated users to insert logs';
COMMENT ON POLICY "allow_authenticated_select" ON system_logs IS 'Allow authenticated users to read logs';