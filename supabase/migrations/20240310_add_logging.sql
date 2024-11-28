-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster querying
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system_logs
CREATE POLICY "Admins can read logs"
ON system_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
);

-- Allow inserting logs for all authenticated users
CREATE POLICY "Users can create logs"
ON system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON system_logs TO authenticated;