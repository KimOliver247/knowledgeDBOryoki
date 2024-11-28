-- First, ensure RLS is enabled on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "topics_select_policy" ON topics;
DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
DROP POLICY IF EXISTS "process_select_policy" ON process;

-- Create public select policies for all tables
CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
USING (true);

CREATE POLICY "topics_select_policy"
ON topics
FOR SELECT
USING (true);

CREATE POLICY "entry_topics_select_policy"
ON entry_topics
FOR SELECT
USING (true);

CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
USING (true);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
USING (true);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
USING (true);

-- Grant necessary permissions to public and authenticated roles
GRANT SELECT ON entries TO anon, authenticated;
GRANT SELECT ON topics TO anon, authenticated;
GRANT SELECT ON entry_topics TO anon, authenticated;
GRANT SELECT ON support_case TO anon, authenticated;
GRANT SELECT ON product_knowledge TO anon, authenticated;
GRANT SELECT ON process TO anon, authenticated;

-- Grant additional permissions to authenticated users
GRANT INSERT, UPDATE ON entries TO authenticated;
GRANT INSERT, UPDATE ON topics TO authenticated;
GRANT INSERT, UPDATE ON entry_topics TO authenticated;
GRANT INSERT, UPDATE ON support_case TO authenticated;
GRANT INSERT, UPDATE ON product_knowledge TO authenticated;
GRANT INSERT, UPDATE ON process TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_topic_id ON entry_topics(topic_id);