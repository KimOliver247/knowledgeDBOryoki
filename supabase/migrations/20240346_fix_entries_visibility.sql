-- First, verify and fix RLS settings
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "entries_policy" ON entries;
DROP POLICY IF EXISTS "support_case_policy" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_policy" ON product_knowledge;
DROP POLICY IF EXISTS "process_policy" ON process;
DROP POLICY IF EXISTS "topics_policy" ON topics;
DROP POLICY IF EXISTS "entry_topics_policy" ON entry_topics;

-- Create simplified policies that allow all authenticated users to access data
CREATE POLICY "allow_authenticated_access"
ON entries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_access"
ON support_case
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_access"
ON product_knowledge
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_access"
ON process
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_access"
ON topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_access"
ON entry_topics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant explicit permissions
GRANT ALL ON entries TO authenticated;
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON topics TO authenticated;
GRANT ALL ON entry_topics TO authenticated;

-- Grant schema and sequence permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify admin user has proper role
DO $$
BEGIN
    -- Ensure admin user exists and has proper role
    UPDATE kb_users
    SET role = 'admin'
    WHERE username = 'admin'
    AND role != 'admin';
    
    -- Log the verification
    INSERT INTO system_logs (level, message, details)
    VALUES (
        'INFO',
        'Verified admin user role and fixed entries visibility',
        jsonb_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'action', 'fix_entries_visibility'
        )
    );
END $$;