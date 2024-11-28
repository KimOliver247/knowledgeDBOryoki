-- Drop existing policies
DROP POLICY IF EXISTS "topics_insert_policy" ON topics;
DROP POLICY IF EXISTS "topics_select_policy" ON topics;
DROP POLICY IF EXISTS "topics_update_policy" ON topics;
DROP POLICY IF EXISTS "topics_delete_policy" ON topics;

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for topics table
CREATE POLICY "topics_insert_policy"
ON topics
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to create topics

CREATE POLICY "topics_select_policy"
ON topics
FOR SELECT
TO authenticated
USING (true);  -- Allow any authenticated user to read topics

CREATE POLICY "topics_update_policy"
ON topics
FOR UPDATE
TO authenticated
USING (true)  -- Allow any authenticated user to update topics
WITH CHECK (true);

CREATE POLICY "topics_delete_policy"
ON topics
FOR DELETE
TO authenticated
USING (true);  -- Allow any authenticated user to delete topics

-- Grant necessary permissions
GRANT ALL ON topics TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;