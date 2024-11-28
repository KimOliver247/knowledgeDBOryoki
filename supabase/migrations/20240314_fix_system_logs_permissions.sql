-- First, drop existing policies
DROP POLICY IF EXISTS "allow_read_logs" ON system_logs;
DROP POLICY IF EXISTS "allow_insert_logs" ON system_logs;

-- Ensure RLS is enabled
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "allow_read_logs"
ON system_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_insert_logs"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant proper permissions to roles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the cron extension is available
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Recreate the cleanup job
SELECT cron.schedule(
    'clean_old_logs_job',
    '0 0 * * *',  -- Run at midnight every day
    $$DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '30 days'$$
);