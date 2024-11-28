-- Drop existing policies
DROP POLICY IF EXISTS "topics_policy" ON topics;

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for topics table
CREATE POLICY "topics_insert_policy"
ON topics
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "topics_select_policy"
ON topics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "topics_update_policy"
ON topics
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "topics_delete_policy"
ON topics
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

-- Grant necessary permissions
GRANT ALL ON topics TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;