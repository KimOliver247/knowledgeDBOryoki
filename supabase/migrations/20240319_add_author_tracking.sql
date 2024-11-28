-- Add author tracking to entries table
ALTER TABLE entries
ADD COLUMN author_id UUID REFERENCES kb_users(id),
ADD COLUMN last_modified_by UUID REFERENCES kb_users(id),
ADD COLUMN last_modified_at TIMESTAMPTZ;

-- Create trigger to automatically update last_modified fields
CREATE OR REPLACE FUNCTION update_entry_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_by = (
        SELECT id FROM kb_users 
        WHERE username = current_user
        LIMIT 1
    );
    NEW.last_modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entry_modified
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_entry_modified();

-- Add author tracking to entry_versions table
ALTER TABLE entry_versions
ADD COLUMN author_id UUID REFERENCES kb_users(id),
ADD COLUMN modified_by UUID REFERENCES kb_users(id);

-- Update existing entries to set author information
UPDATE entries
SET author_id = (
    SELECT id FROM kb_users 
    WHERE username = 'admin'
    LIMIT 1
)
WHERE author_id IS NULL;

-- Update RLS policies to include author checks
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries_insert_policy"
ON entries
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entries_update_policy"
ON entries
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;