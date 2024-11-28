-- Drop existing objects to ensure clean state
DROP POLICY IF EXISTS "allow_read_logs" ON system_logs;
DROP POLICY IF EXISTS "allow_insert_logs" ON system_logs;
DROP TABLE IF EXISTS system_logs CASCADE;

-- Create system_logs table with proper structure
CREATE TABLE system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES kb_users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
CREATE POLICY "allow_all_authenticated_insert"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_select"
ON system_logs
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON system_logs TO authenticated;
GRANT ALL ON system_logs TO anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Create function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM system_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;