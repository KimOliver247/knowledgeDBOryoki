-- First, drop all existing policies to ensure clean state
DO $$ 
BEGIN
    -- Drop policies for entries table
    DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
    DROP POLICY IF EXISTS "entries_select_policy" ON entries;
    DROP POLICY IF EXISTS "entries_update_policy" ON entries;
    
    -- Drop policies for type-specific tables
    DROP POLICY IF EXISTS "support_case_insert_policy" ON support_case;
    DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
    DROP POLICY IF EXISTS "support_case_update_policy" ON support_case;
    
    DROP POLICY IF EXISTS "product_knowledge_insert_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_update_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy_v2" ON product_knowledge;
    
    DROP POLICY IF EXISTS "process_insert_policy" ON process;
    DROP POLICY IF EXISTS "process_select_policy" ON process;
    DROP POLICY IF EXISTS "process_update_policy" ON process;
END $$;

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- Create unified select policies
CREATE POLICY "entries_select_policy_v2"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_select_policy_v2"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_select_policy_v3"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_select_policy_v2"
ON process
FOR SELECT
TO authenticated
USING (true);

-- Create unified insert policies
CREATE POLICY "entries_insert_policy_v2"
ON entries
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "support_case_insert_policy_v2"
ON support_case
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_insert_policy_v2"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "process_insert_policy_v2"
ON process
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create unified update policies
CREATE POLICY "entries_update_policy_v2"
ON entries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "support_case_update_policy_v2"
ON support_case
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "product_knowledge_update_policy_v2"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "process_update_policy_v2"
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

-- Ensure sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments explaining policies
COMMENT ON POLICY "entries_select_policy_v2" ON entries IS 'Allow authenticated users to view all entries';
COMMENT ON POLICY "entries_insert_policy_v2" ON entries IS 'Allow authenticated users to create entries';
COMMENT ON POLICY "entries_update_policy_v2" ON entries IS 'Allow authenticated users to update entries';