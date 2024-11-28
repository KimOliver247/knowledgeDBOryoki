# Database Policies Documentation

## Overview
This document outlines the Row Level Security (RLS) policies implemented in the database, identifying redundant and deprecated policies.

## Improvements Table Policies

### Current Active Policies
1. `Allow anonymous inserts` (INSERT)
   - Applied to: anon role
   - Purpose: Allows anonymous users to submit improvements

2. `Allow anonymous read access` (SELECT)
   - Applied to: anon role
   - Purpose: Allows anonymous users to view improvements

3. `Allow authenticated delete access` (DELETE)
   - Applied to: authenticated role
   - Purpose: Allows authenticated users to delete improvements

4. `Allow authenticated insert access` (INSERT)
   - Applied to: authenticated role
   - Purpose: Allows authenticated users to submit improvements

5. `Allow authenticated read access` (SELECT)
   - Applied to: authenticated role
   - Purpose: Allows authenticated users to view improvements

6. `Allow service role full access` (ALL)
   - Applied to: service_role
   - Purpose: Allows service role complete access

### Policy Evolution
The improvements table policies have evolved to support:
- Anonymous submissions
- Public viewing
- Authenticated user management
- Service role administration

### Recommendations
1. Consolidate policies into role-based groups
2. Simplify permission structure
3. Maintain separate anonymous and authenticated access
4. Keep service role access for administrative tasks

## Policy Cleanup SQL
```sql
-- Enable Row Level Security
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access" ON improvements;
DROP POLICY IF EXISTS "Allow authenticated read access" ON improvements;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON improvements;
DROP POLICY IF EXISTS "Allow service role full access" ON improvements;

-- Create policies for improvements table
-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
ON improvements
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read improvements
CREATE POLICY "Allow authenticated read access"
ON improvements
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to delete improvements
CREATE POLICY "Allow authenticated delete access"
ON improvements
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to insert improvements
CREATE POLICY "Allow authenticated insert access"
ON improvements
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow service role to manage all operations
CREATE POLICY "Allow service role full access"
ON improvements
TO service_role
USING (true)
WITH CHECK (true);
```

## Security Considerations
1. Anonymous access is limited to read and insert operations
2. Authenticated users have full management capabilities
3. Service role maintains administrative access
4. All operations are tracked and logged
5. Clear separation between anonymous and authenticated permissions

## Best Practices
1. Use descriptive policy names that indicate:
   - The role they apply to
   - The operation they permit
   - The scope of access
2. Document policy changes
3. Regular security audits
4. Maintain consistent naming conventions
5. Keep policies simple and focused

## Regular Maintenance Tasks
1. Review policy effectiveness quarterly
2. Audit access patterns monthly
3. Update documentation with changes
4. Remove deprecated policies
5. Test policy combinations

## Monitoring and Compliance
1. Track policy usage patterns
2. Monitor anonymous submissions
3. Audit deletion operations
4. Review service role access
5. Maintain compliance logs

## Future Considerations
1. Consider implementing rate limiting for anonymous submissions
2. Add more granular authenticated user permissions
3. Implement content moderation workflows
4. Add audit logging for sensitive operations
5. Regular security assessments

## Policy Testing
1. Test anonymous access scenarios
2. Verify authenticated user permissions
3. Validate service role capabilities
4. Check policy combinations
5. Ensure proper access restrictions

## Troubleshooting Guide
1. Check role assignments
2. Verify policy ordering
3. Review access logs
4. Test policy conditions
5. Validate security context

## Documentation Updates
1. Keep policy documentation current
2. Document all policy changes
3. Maintain change history
4. Include testing procedures
5. Update security guidelines