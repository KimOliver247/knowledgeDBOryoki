-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS update_system_logs_timestamp ON system_logs;
DROP FUNCTION IF EXISTS update_system_logs_timestamp();
DROP POLICY IF EXISTS "allow_read_logs" ON system_logs;
DROP POLICY IF EXISTS "allow_insert_logs" ON system_logs;
DROP TABLE IF EXISTS system_logs;

-- Create system_logs table with proper constraints
CREATE TABLE system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function and trigger for timestamp updates
CREATE OR REPLACE FUNCTION update_system_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_logs_timestamp
    BEFORE INSERT ON system_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_system_logs_timestamp();

-- Create function to clean old logs (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM system_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old logs (runs daily)
SELECT cron.schedule(
    'clean_old_logs_job',
    '0 0 * * *',  -- Run at midnight every day
    $$SELECT clean_old_logs()$$
);