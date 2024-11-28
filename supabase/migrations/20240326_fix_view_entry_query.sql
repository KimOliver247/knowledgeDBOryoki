-- Drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
DROP POLICY IF EXISTS "process_select_policy" ON process;

-- Create more permissive select policies
CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (true);

-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_entries_id ON entries(id);
CREATE INDEX IF NOT EXISTS idx_support_case_id ON support_case(id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_id ON product_knowledge(id);
CREATE INDEX IF NOT EXISTS idx_process_id ON process(id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);

-- Grant necessary permissions
GRANT SELECT ON entries TO authenticated;
GRANT SELECT ON support_case TO authenticated;
GRANT SELECT ON product_knowledge TO authenticated;
GRANT SELECT ON process TO authenticated;
GRANT SELECT ON entry_topics TO authenticated;
GRANT SELECT ON topics TO authenticated;
GRANT SELECT ON kb_users TO authenticated;