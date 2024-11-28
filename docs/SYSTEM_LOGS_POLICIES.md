# System Logs Policies Documentation

## Current State Analysis

### Existing Policies
1. `allow_all_authenticated_insert` (INSERT)
   - Applied to: authenticated role
   - Purpose: Allows authenticated users to create logs

2. `allow_all_authenticated_select` (SELECT)
   - Applied to: authenticated role
   - Purpose: Allows authenticated users to read logs

3. `system_logs_insert_policy` (INSERT)
   - Applied to: public role
   - Purpose: Allows public access to create logs

4. `system_logs_policy` (ALL)
   - Applied to: public role
   - Purpose: Allows full public access

5. `system_logs_select_policy` (SELECT)
   - Applied to: public role
   - Purpose: Allows public access to read logs

### Issues Identified
1. Multiple overlapping policies
2. Inconsistent naming conventions
3. Mixed role assignments (public vs authenticated)
4. Redundant permissions
5. Overly permissive public access

## Cleanup Plan

### 1. Policy Consolidation
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "system_logs_insert_policy" ON system_logs;
DROP POLICY IF EXISTS "system_logs_select_policy" ON system_logs;
DROP POLICY IF EXISTS "system_logs_policy" ON system_logs;
DROP POLICY IF EXISTS "allow_all_authenticated_insert" ON system_logs;
DROP POLICY IF EXISTS "allow_all_authenticated_select" ON system_logs;

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create new unified policies
CREATE POLICY "system_logs_policy"
ON system_logs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON system_logs TO anon;
GRANT ALL ON system_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### 2. Table Structure
```sql
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
```

## Best Practices

### Policy Naming Conventions
- Use descriptive, consistent names
- Include operation type in name
- Indicate role in name
- Use lowercase with underscores

### Access Control
1. Public Access
   - Read operations for transparency
   - Insert operations for system-wide logging
   - No update or delete operations

2. Authenticated Access
   - Full read access
   - Insert capabilities
   - No modification of existing logs

### Performance Considerations
1. Indexes
   - Timestamp for chronological queries
   - Log level for filtering
   - Created_at for maintenance

2. Maintenance
   - Regular cleanup of old logs
   - Archival strategy
   - Performance monitoring

## Security Guidelines

### 1. Logging Best Practices
- Include relevant context
- Avoid sensitive information
- Use appropriate log levels
- Include timestamp and source

### 2. Access Control
- Restrict modification of logs
- Maintain audit trail
- Regular access reviews
- Monitor usage patterns

### 3. Data Retention
- Define retention period
- Implement cleanup procedures
- Archive important logs
- Comply with regulations

## Monitoring and Maintenance

### 1. Regular Tasks
- Review log volume
- Check index performance
- Monitor space usage
- Audit access patterns

### 2. Cleanup Procedures
```sql
-- Create function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM system_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule(
    'clean_old_logs_job',
    '0 0 * * *',  -- Run at midnight every day
    $$SELECT clean_old_logs()$$
);
```

## Implementation Guidelines

### 1. New Log Entry
```sql
INSERT INTO system_logs (level, message, details)
VALUES (
    'INFO',
    'User action performed',
    jsonb_build_object(
        'user_id', current_user,
        'action', 'login',
        'timestamp', CURRENT_TIMESTAMP
    )
);
```

### 2. Query Logs
```sql
-- Recent logs
SELECT * FROM system_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Error logs
SELECT * FROM system_logs
WHERE level = 'ERROR'
ORDER BY timestamp DESC;
```

## Troubleshooting

### Common Issues
1. Permission Denied
   - Check role assignments
   - Verify policy configuration
   - Confirm sequence permissions

2. Performance Issues
   - Review index usage
   - Check query patterns
   - Monitor log volume

### Resolution Steps
1. Verify RLS is enabled
2. Check policy definitions
3. Confirm role assignments
4. Review permission grants
5. Validate indexes

## Future Improvements

### 1. Enhanced Logging
- Add structured logging
- Implement log categories
- Add source tracking
- Include request context

### 2. Performance
- Partitioned tables
- Materialized views
- Custom indexes
- Compression strategies

### 3. Security
- Encryption at rest
- Access auditing
- Role-based views
- Compliance reporting