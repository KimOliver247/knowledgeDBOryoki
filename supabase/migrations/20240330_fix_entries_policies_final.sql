-- First, drop all existing policies
DO $$ 
BEGIN
    -- Drop policies for entries table
    DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
    DROP POLICY IF EXISTS "entries_select_policy" ON entries;
    DROP POLICY IF EXISTS "entries_update_policy" ON entries;
    
    -- Drop policies for topics table
    DROP POLICY IF EXISTS "topics_insert_policy" ON topics;
    DROP POLICY IF EXISTS "topics_select_policy" ON topics;
    DROP POLICY IF EXISTS "topics_update_policy" ON topics;
    DROP POLICY IF EXISTS "topics_delete_policy" ON topics;
    
    -- Drop policies for entry_topics table
    DROP POLICY IF EXISTS "entry_topics_insert_policy" ON entry_topics;
    DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;
    
    -- Drop policies for type-specific tables
    DROP POLICY IF EXISTS "support_case_insert_policy" ON support_case;
    DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
    DROP POLICY IF EXISTS "support_case_update_policy" ON support_case;
    
    DROP POLICY IF EXISTS "product_knowledge_insert_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_update_policy" ON product_knowledge;
    
    DROP POLICY IF EXISTS "process_insert_policy" ON process;
    DROP POLICY IF EXISTS "process_select_policy" ON process;
    DROP POLICY IF EXISTS "process_update_policy" ON process;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- Create policies for entries table
CREATE POLICY "entries_select_policy"
ON entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entries_insert_policy"
ON entries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "entries_update_policy"
ON entries FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for topics table
CREATE POLICY "topics_select_policy"
ON topics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "topics_insert_policy"
ON topics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "topics_update_policy"
ON topics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for entry_topics table
CREATE POLICY "entry_topics_select_policy"
ON entry_topics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entry_topics_insert_policy"
ON entry_topics FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policies for support_case table
CREATE POLICY "support_case_select_policy"
ON support_case FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_insert_policy"
ON support_case FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "support_case_update_policy"
ON support_case FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for product_knowledge table
CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_insert_policy"
ON product_knowledge FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_update_policy"
ON product_knowledge FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for process table
CREATE POLICY "process_select_policy"
ON process FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_insert_policy"
ON process FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "process_update_policy"
ON process FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT ALL ON topics TO authenticated;
GRANT ALL ON entry_topics TO authenticated;
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;