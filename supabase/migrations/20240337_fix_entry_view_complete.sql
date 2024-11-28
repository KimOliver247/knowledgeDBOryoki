-- Drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "support_case_select_policy_new" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_select_policy_new" ON product_knowledge;
DROP POLICY IF EXISTS "process_select_policy_new" ON process;
DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "entry_topics_select_policy"
ON entry_topics
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON entries TO authenticated;
GRANT SELECT ON support_case TO authenticated;
GRANT SELECT ON product_knowledge TO authenticated;
GRANT SELECT ON process TO authenticated;
GRANT SELECT ON entry_topics TO authenticated;
GRANT SELECT ON topics TO authenticated;
GRANT SELECT ON kb_users TO authenticated;

-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_entries_id ON entries(id);
CREATE INDEX IF NOT EXISTS idx_support_case_id ON support_case(id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_id ON product_knowledge(id);
CREATE INDEX IF NOT EXISTS idx_process_id ON process(id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_topic_id ON entry_topics(topic_id);

-- Add comment explaining policy changes
COMMENT ON POLICY "entries_select_policy" ON entries IS 'Allow authenticated users to view all entries';
COMMENT ON POLICY "support_case_select_policy" ON support_case IS 'Allow authenticated users to view all support cases';
COMMENT ON POLICY "product_knowledge_select_policy" ON product_knowledge IS 'Allow authenticated users to view all product knowledge';
COMMENT ON POLICY "process_select_policy" ON process IS 'Allow authenticated users to view all processes';
COMMENT ON POLICY "entry_topics_select_policy" ON entry_topics IS 'Allow authenticated users to view all entry topics';