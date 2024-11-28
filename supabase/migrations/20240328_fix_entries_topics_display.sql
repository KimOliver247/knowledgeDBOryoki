-- Drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "topics_select_policy" ON topics;
DROP POLICY IF EXISTS "entry_topics_select_policy" ON entry_topics;
DROP POLICY IF EXISTS "support_case_select_policy" ON support_case;
DROP POLICY IF EXISTS "product_knowledge_select_policy" ON product_knowledge;
DROP POLICY IF EXISTS "process_select_policy" ON process;

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE process ENABLE ROW LEVEL SECURITY;

-- Create public select policies for authenticated users
CREATE POLICY "entries_select_policy"
ON entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "topics_select_policy"
ON topics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "entry_topics_select_policy"
ON entry_topics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "support_case_select_policy"
ON support_case
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "product_knowledge_select_policy"
ON product_knowledge
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "process_select_policy"
ON process
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON entries TO authenticated;
GRANT SELECT ON topics TO authenticated;
GRANT SELECT ON entry_topics TO authenticated;
GRANT SELECT ON support_case TO authenticated;
GRANT SELECT ON product_knowledge TO authenticated;
GRANT SELECT ON process TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
CREATE INDEX IF NOT EXISTS idx_entry_topics_entry_id ON entry_topics(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_topics_topic_id ON entry_topics(topic_id);

-- Create view for easier querying
CREATE OR REPLACE VIEW entry_details AS
SELECT 
    e.*,
    array_agg(DISTINCT t.name) as topic_names,
    CASE
        WHEN e.type = 'support_case' THEN jsonb_build_object(
            'problem', sc.problem,
            'solution', sc.solution,
            'customer_satisfaction', sc.customer_satisfaction
        )
        WHEN e.type = 'product_knowledge' THEN jsonb_build_object(
            'knowledge_content', pk.knowledge_content
        )
        WHEN e.type = 'process' THEN jsonb_build_object(
            'description', p.description
        )
    END as type_details
FROM entries e
LEFT JOIN entry_topics et ON e.id = et.entry_id
LEFT JOIN topics t ON et.topic_id = t.id
LEFT JOIN support_case sc ON e.id = sc.id AND e.type = 'support_case'
LEFT JOIN product_knowledge pk ON e.id = pk.id AND e.type = 'product_knowledge'
LEFT JOIN process p ON e.id = p.id AND e.type = 'process'
GROUP BY e.id, sc.id, pk.id, p.id;

-- Grant access to the view
GRANT SELECT ON entry_details TO authenticated;

-- Create function to get entries with topics
CREATE OR REPLACE FUNCTION get_entries_with_topics()
RETURNS TABLE (
    id UUID,
    type entry_type,
    heading TEXT,
    created_at TIMESTAMPTZ,
    is_frequent BOOLEAN,
    needs_improvement BOOLEAN,
    status TEXT,
    topics JSONB,
    details JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.type,
        e.heading,
        e.created_at,
        e.is_frequent,
        e.needs_improvement,
        e.status,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'topics', jsonb_build_object('name', t.name)
                )
            ) FILTER (WHERE t.name IS NOT NULL),
            '[]'::jsonb
        ) as topics,
        CASE
            WHEN e.type = 'support_case' THEN (
                SELECT to_jsonb(sc.*) FROM support_case sc WHERE sc.id = e.id
            )
            WHEN e.type = 'product_knowledge' THEN (
                SELECT to_jsonb(pk.*) FROM product_knowledge pk WHERE pk.id = e.id
            )
            WHEN e.type = 'process' THEN (
                SELECT to_jsonb(p.*) FROM process p WHERE p.id = e.id
            )
        END as details
    FROM entries e
    LEFT JOIN entry_topics et ON e.id = et.entry_id
    LEFT JOIN topics t ON et.topic_id = t.id
    GROUP BY e.id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_entries_with_topics() TO authenticated;