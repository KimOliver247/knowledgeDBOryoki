-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read logs" ON system_logs;
DROP POLICY IF EXISTS "Users can create logs" ON system_logs;

-- Recreate system_logs table with proper structure
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);

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

-- Grant proper permissions to roles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;