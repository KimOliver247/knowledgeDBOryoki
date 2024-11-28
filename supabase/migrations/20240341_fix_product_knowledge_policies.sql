-- First, drop existing policies to ensure clean state
DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_insert_policy" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_update_policy" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_select_policy_v2" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_insert_policy_v2" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_update_policy_v2" ON product_knowledge;
DROP POLICY IF EXISTS "product_knowledge_select_policy_v3" ON product_knowledge;

-- Enable RLS
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "product_knowledge_select_policy_v4"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_insert_policy_v4"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "product_knowledge_update_policy_v4"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON product_knowledge TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments explaining policies
COMMENT ON POLICY "product_knowledge_select_policy_v4" ON product_knowledge IS 'Allow authenticated users to view all product knowledge entries';
COMMENT ON POLICY "product_knowledge_insert_policy_v4" ON product_knowledge IS 'Allow authenticated users to create product knowledge entries';
COMMENT ON POLICY "product_knowledge_update_policy_v4" ON product_knowledge IS 'Allow authenticated users to update product knowledge entries';