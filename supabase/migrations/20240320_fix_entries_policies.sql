-- Drop existing policies
DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "entries_update_policy" ON entries;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for entries table
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

-- Ensure proper permissions for related tables
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON entry_topics TO authenticated;
GRANT ALL ON topics TO authenticated;

-- Create policies for related tables
CREATE POLICY "support_case_policy"
ON support_case
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "product_knowledge_policy"
ON product_knowledge
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "process_policy"
ON process
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "entry_topics_policy"
ON entry_topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "topics_policy"
ON topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS on related tables
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;