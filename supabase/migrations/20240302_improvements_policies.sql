-- Enable Row Level Security
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access" ON improvements;
DROP POLICY IF EXISTS "Allow authenticated read access" ON improvements;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON improvements;
DROP POLICY IF EXISTS "Allow service role full access" ON improvements;

-- Create policies for improvements table
-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
ON improvements
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read improvements
CREATE POLICY "Allow authenticated read access"
ON improvements
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to delete improvements
CREATE POLICY "Allow authenticated delete access"
ON improvements
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to insert improvements
CREATE POLICY "Allow authenticated insert access"
ON improvements
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow service role to manage all operations
CREATE POLICY "Allow service role full access"
ON improvements
TO service_role
USING (true)
WITH CHECK (true);