-- Drop existing policies
DROP POLICY IF EXISTS "system_logs_insert_policy" ON system_logs;
DROP POLICY IF EXISTS "system_logs_select_policy" ON system_logs;

-- Ensure RLS is enabled
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "system_logs_insert_policy"
ON system_logs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "system_logs_select_policy"
ON system_logs
FOR SELECT
TO public
USING (true);

-- Grant necessary permissions
GRANT ALL ON system_logs TO anon;
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment explaining policy purpose
COMMENT ON POLICY "system_logs_insert_policy" ON system_logs IS 'Allow all users to insert logs';
COMMENT ON POLICY "system_logs_select_policy" ON system_logs IS 'Allow all users to read logs';