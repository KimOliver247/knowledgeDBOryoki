-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for entries table
CREATE POLICY "entries_policy"
ON entries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for support_case table
CREATE POLICY "support_case_policy"
ON support_case
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for product_knowledge table
CREATE POLICY "product_knowledge_policy"
ON product_knowledge
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for process table
CREATE POLICY "process_policy"
ON process
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for topics table
CREATE POLICY "topics_policy"
ON topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for entry_topics table
CREATE POLICY "entry_topics_policy"
ON entry_topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for system_logs table
CREATE POLICY "system_logs_policy"
ON system_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON topics TO authenticated;
GRANT ALL ON entry_topics TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT ALL ON kb_users TO authenticated;

-- Grant schema and sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_id ON entries(id);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_author_id ON entries(author_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_case_id ON support_case(id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_id ON product_knowledge(id);
CREATE INDEX IF NOT EXISTS idx_process_id ON process(id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_topic_id ON entry_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);

-- Add comments explaining policies
COMMENT ON POLICY "entries_policy" ON entries IS 'Allow authenticated users full access to entries';
COMMENT ON POLICY "support_case_policy" ON support_case IS 'Allow authenticated users full access to support cases';
COMMENT ON POLICY "product_knowledge_policy" ON product_knowledge IS 'Allow authenticated users full access to product knowledge';
COMMENT ON POLICY "process_policy" ON process IS 'Allow authenticated users full access to processes';
COMMENT ON POLICY "topics_policy" ON topics IS 'Allow authenticated users full access to topics';
COMMENT ON POLICY "entry_topics_policy" ON entry_topics IS 'Allow authenticated users full access to entry topics';
COMMENT ON POLICY "system_logs_policy" ON system_logs IS 'Allow authenticated users full access to system logs';