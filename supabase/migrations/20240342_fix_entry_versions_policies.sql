-- First, enable RLS on entry_versions table
ALTER TABLE entry_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "entry_versions_select_policy" ON entry_versions;
DROP POLICY IF EXISTS "entry_versions_insert_policy" ON entry_versions;
DROP POLICY IF EXISTS "entry_versions_update_policy" ON entry_versions;

-- Create comprehensive policies for entry_versions table
CREATE POLICY "entry_versions_select_policy"
ON entry_versions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entry_versions_insert_policy"
ON entry_versions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "entry_versions_update_policy"
ON entry_versions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON entry_versions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entry_versions_entry_id ON entry_versions(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_versions_version_number ON entry_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_entry_versions_created_at ON entry_versions(created_at DESC);

-- Add comments explaining policies
COMMENT ON POLICY "entry_versions_select_policy" ON entry_versions IS 'Allow authenticated users to view all entry versions';
COMMENT ON POLICY "entry_versions_insert_policy" ON entry_versions IS 'Allow authenticated users to create entry versions';
COMMENT ON POLICY "entry_versions_update_policy" ON entry_versions IS 'Allow authenticated users to update entry versions';