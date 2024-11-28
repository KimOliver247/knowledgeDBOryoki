-- Drop existing policies if they exist
DROP POLICY IF EXISTS "support_case_insert_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_update_policy" ON support_case;

-- Enable RLS
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for support_case table
CREATE POLICY "support_case_insert_policy"
ON support_case
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_update_policy"
ON support_case
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON support_case TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add similar policies for other type-specific tables
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- Product Knowledge policies
CREATE POLICY "product_knowledge_insert_policy"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_update_policy"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Process policies
CREATE POLICY "process_insert_policy"
ON process
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_update_policy"
ON process
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions for other tables
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;