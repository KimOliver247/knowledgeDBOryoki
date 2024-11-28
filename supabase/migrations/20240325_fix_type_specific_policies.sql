-- First, drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "product_knowledge_insert_policy" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_update_policy" ON product_knowledge;

DROP POLICY IF EXISTS "process_insert_policy" ON process;
DROP POLICY IF EXISTS "process_select_policy" ON process;
DROP POLICY IF EXISTS "process_update_policy" ON process;

DROP POLICY IF EXISTS "support_case_insert_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_update_policy" ON support_case;

-- Enable RLS on all type-specific tables
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;

-- Create policies for product_knowledge table
CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_insert_policy"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_update_policy"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for process table
CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_insert_policy"
ON process
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "process_update_policy"
ON process
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for support_case table
CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_insert_policy"
ON support_case
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "support_case_update_policy"
ON support_case
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON support_case TO authenticated;

-- Ensure sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;