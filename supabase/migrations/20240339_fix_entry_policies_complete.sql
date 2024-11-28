-- Drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_select_policy_v2" ON product_knowledge;
DROP POLICY IF EXISTS "process_select_policy" ON process;
DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;

-- Create unified select policies
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

CREATE POLICY "entry_topics_select_policy"
ON entry_topics
FOR SELECT
TO authenticated
USING (true);

-- Create unified insert policies
CREATE POLICY "entries_insert_policy"
ON entries
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "support_case_insert_policy"
ON support_case
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_insert_policy"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "process_insert_policy"
ON process
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "entry_topics_insert_policy"
ON entry_topics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create unified update policies
CREATE POLICY "entries_update_policy"
ON entries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "support_case_update_policy"
ON support_case
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "product_knowledge_update_policy"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "process_update_policy"
ON process
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON entry_topics TO authenticated;
GRANT ALL ON topics TO authenticated;

-- Ensure sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_id ON entries(id);
CREATE INDEX IF NOT EXISTS idx_support_case_id ON support_case(id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_id ON product_knowledge(id);
CREATE INDEX IF NOT EXISTS idx_process_id ON process(id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_topic_id ON entry_topics(topic_id);

-- Add comments explaining policies
COMMENT ON POLICY "entries_select_policy" ON entries IS 'Allow authenticated users to view all entries';
COMMENT ON POLICY "entries_insert_policy" ON entries IS 'Allow authenticated users to create entries';
COMMENT ON POLICY "entries_update_policy" ON entries IS 'Allow authenticated users to update entries';