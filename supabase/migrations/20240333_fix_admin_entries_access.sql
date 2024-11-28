-- First, drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
DROP POLICY IF EXISTS "entries_update_policy" ON entries;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for entries table
CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
TO authenticated
USING (
    -- Allow access to all entries for admin users
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
    OR
    -- Allow access to entries created by the current user
    author_id = (
        SELECT id FROM kb_users
        WHERE username = current_user
    )
    OR
    -- Allow access to entries without an author (legacy entries)
    author_id IS NULL
);

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

CREATE POLICY "entries_update_policy"
ON entries
FOR UPDATE
TO authenticated
USING (
    -- Allow updates for admin users
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND role = 'admin'
    )
    OR
    -- Allow updates for entry authors
    author_id = (
        SELECT id FROM kb_users
        WHERE username = current_user
    )
);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure proper permissions for related tables
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON entry_topics TO authenticated;
GRANT ALL ON topics TO authenticated;

-- Create similar policies for related tables
CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT id FROM entries
        WHERE EXISTS (
            SELECT 1 FROM kb_users
            WHERE username = current_user
            AND role = 'admin'
        )
        OR author_id = (
            SELECT id FROM kb_users
            WHERE username = current_user
        )
        OR author_id IS NULL
    )
);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT id FROM entries
        WHERE EXISTS (
            SELECT 1 FROM kb_users
            WHERE username = current_user
            AND role = 'admin'
        )
        OR author_id = (
            SELECT id FROM kb_users
            WHERE username = current_user
        )
        OR author_id IS NULL
    )
);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT id FROM entries
        WHERE EXISTS (
            SELECT 1 FROM kb_users
            WHERE username = current_user
            AND role = 'admin'
        )
        OR author_id = (
            SELECT id FROM kb_users
            WHERE username = current_user
        )
        OR author_id IS NULL
    )
);

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;