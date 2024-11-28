-- Drop existing policies
DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "entries_update_policy" ON entries;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for entries table
CREATE POLICY "entries_insert_policy"
ON entries
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entries_update_policy"
ON entries
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

-- Grant necessary permissions
GRANT ALL ON entries TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Enable RLS and create policies for support_case table
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_case_insert_policy"
ON support_case
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS and create policies for product_knowledge table
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_knowledge_insert_policy"
ON product_knowledge
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS and create policies for process table
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

CREATE POLICY "process_insert_policy"
ON process
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS and create policies for entry_topics table
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entry_topics_insert_policy"
ON entry_topics
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM kb_users
        WHERE username = current_user
        AND is_active = true
    )
);

CREATE POLICY "entry_topics_select_policy"
ON entry_topics
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions for all related tables
GRANT ALL ON support_case TO authenticated;
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;
GRANT ALL ON entry_topics TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;