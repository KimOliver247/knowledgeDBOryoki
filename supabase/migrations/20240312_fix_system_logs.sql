-- First, drop existing table and policies if they exist
DROP POLICY IF EXISTS "allow_read_logs" ON system_logs;
DROP POLICY IF EXISTS "allow_insert_logs" ON system_logs;
DROP TABLE IF EXISTS system_logs;

-- Create system_logs table
CREATE TABLE system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger to update timestamp
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