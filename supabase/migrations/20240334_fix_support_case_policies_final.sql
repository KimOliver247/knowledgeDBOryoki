-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_insert_policy" ON support_case;
DROP POLICY IF EXISTS "support_case_update_policy" ON support_case;

-- Enable RLS
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for support_case table
CREATE POLICY "support_case_select_policy_new"
ON support_case
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = support_case.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
            OR e.author_id IS NULL
        )
    )
);

CREATE POLICY "support_case_insert_policy_new"
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

CREATE POLICY "support_case_update_policy_new"
ON support_case
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = support_case.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
        )
    )
)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON support_case TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create similar policies for product_knowledge and process
CREATE POLICY "product_knowledge_select_policy_new"
ON product_knowledge
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = product_knowledge.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
            OR e.author_id IS NULL
        )
    )
);

CREATE POLICY "product_knowledge_insert_policy_new"
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

CREATE POLICY "product_knowledge_update_policy_new"
ON product_knowledge
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = product_knowledge.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
        )
    )
)
WITH CHECK (true);

CREATE POLICY "process_select_policy_new"
ON process
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = process.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
            OR e.author_id IS NULL
        )
    )
);

CREATE POLICY "process_insert_policy_new"
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

CREATE POLICY "process_update_policy_new"
ON process
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM entries e
        WHERE e.id = process.id
        AND (
            EXISTS (
                SELECT 1 FROM kb_users
                WHERE username = current_user
                AND role = 'admin'
            )
            OR e.author_id = (
                SELECT id FROM kb_users
                WHERE username = current_user
            )
        )
    )
)
WITH CHECK (true);

-- Grant permissions for all related tables
GRANT ALL ON product_knowledge TO authenticated;
GRANT ALL ON process TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;