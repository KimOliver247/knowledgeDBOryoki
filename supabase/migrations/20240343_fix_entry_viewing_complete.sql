-- First, drop all existing policies to ensure clean state
DO $$ 
BEGIN
    -- Drop policies for entries table
    DROP POLICY IF EXISTS "entries_select_policy" ON entries;
    DROP POLICY IF EXISTS "entries_select_policy_v2" ON entries;
    
    -- Drop policies for type-specific tables
    DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
    DROP POLICY IF EXISTS "support_case_select_policy_v2" ON support_case;
    DROP POLICY IF EXISTS "support_case_select_policy_new" ON support_case;
    
    DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy_v2" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy_v3" ON product_knowledge;
    DROP POLICY IF EXISTS "product_knowledge_select_policy_v4" ON product_knowledge;
    
    DROP POLICY IF EXISTS "process_select_policy" ON process;
    DROP POLICY IF EXISTS "process_select_policy_v2" ON process;
    DROP POLICY IF EXISTS "process_select_policy_new" ON process;
    
    -- Drop policies for entry_topics table
    DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;
END $$;

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create unified select policies for all tables
CREATE POLICY "entries_select_policy_final"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_select_policy_final"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_select_policy_final"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_select_policy_final"
ON process
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entry_topics_select_policy_final"
ON entry_topics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "topics_select_policy_final"
ON topics
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON entries TO authenticated;
GRANT SELECT ON support_case TO authenticated;
GRANT SELECT ON product_knowledge TO authenticated;
GRANT SELECT ON process TO authenticated;
GRANT SELECT ON entry_topics TO authenticated;
GRANT SELECT ON topics TO authenticated;
GRANT SELECT ON kb_users TO authenticated;

-- Create indexes for better join performance
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

-- Create helper function for retrieving entry details
CREATE OR REPLACE FUNCTION get_entry_details(p_entry_id UUID)
RETURNS TABLE (
    id UUID,
    type entry_type,
    heading TEXT,
    created_at TIMESTAMPTZ,
    is_frequent BOOLEAN,
    needs_improvement BOOLEAN,
    status TEXT,
    author_username TEXT,
    last_modified_by_username TEXT,
    last_modified_at TIMESTAMPTZ,
    topics TEXT[],
    details JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH entry_base AS (
        SELECT 
            e.*,
            a.username as author_username,
            m.username as last_modified_by_username
        FROM entries e
        LEFT JOIN kb_users a ON e.author_id = a.id
        LEFT JOIN kb_users m ON e.last_modified_by = m.id
        WHERE e.id = p_entry_id
    ),
    entry_topics AS (
        SELECT array_agg(t.name ORDER BY t.name) as topic_names
        FROM entry_topics et
        JOIN topics t ON et.topic_id = t.id
        WHERE et.entry_id = p_entry_id
    )
    SELECT 
        e.id,
        e.type,
        e.heading,
        e.created_at,
        e.is_frequent,
        e.needs_improvement,
        e.status,
        e.author_username,
        e.last_modified_by_username,
        e.last_modified_at,
        COALESCE(t.topic_names, ARRAY[]::TEXT[]),
        CASE
            WHEN e.type = 'support_case' THEN (
                SELECT to_jsonb(sc.*) FROM support_case sc WHERE sc.id = p_entry_id
            )
            WHEN e.type = 'product_knowledge' THEN (
                SELECT to_jsonb(pk.*) FROM product_knowledge pk WHERE pk.id = p_entry_id
            )
            WHEN e.type = 'process' THEN (
                SELECT to_jsonb(p.*) FROM process p WHERE p.id = p_entry_id
            )
        END
    FROM entry_base e
    LEFT JOIN entry_topics t ON true;
END;
$$;

-- Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION get_entry_details(UUID) TO authenticated;

-- Add comments explaining policies
COMMENT ON POLICY "entries_select_policy_final" ON entries IS 'Allow authenticated users to view all entries';
COMMENT ON POLICY "support_case_select_policy_final" ON support_case IS 'Allow authenticated users to view all support cases';
COMMENT ON POLICY "product_knowledge_select_policy_final" ON product_knowledge IS 'Allow authenticated users to view all product knowledge';
COMMENT ON POLICY "process_select_policy_final" ON process IS 'Allow authenticated users to view all processes';
COMMENT ON POLICY "entry_topics_select_policy_final" ON entry_topics IS 'Allow authenticated users to view all entry topics';
COMMENT ON POLICY "topics_select_policy_final" ON topics IS 'Allow authenticated users to view all topics';