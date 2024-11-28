-- Drop existing policies
DROP POLICY IF EXISTS "allow_authenticated_insert" ON system_logs;
DROP POLICY IF EXISTS "allow_authenticated_select" ON system_logs;

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "system_logs_insert_policy"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "system_logs_select_policy"
ON system_logs
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment explaining policy purpose
COMMENT ON POLICY "system_logs_insert_policy" ON system_logs IS 'Allow authenticated users to insert logs';
COMMENT ON POLICY "system_logs_select_policy" ON system_logs IS 'Allow authenticated users to read logs';