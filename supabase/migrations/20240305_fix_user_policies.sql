-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON kb_users;
DROP POLICY IF EXISTS "Admins can create users" ON kb_users;
DROP POLICY IF EXISTS "Admins can update users" ON kb_users;
DROP POLICY IF EXISTS "Admins can delete users" ON kb_users;

-- Recreate policies with correct permissions
CREATE POLICY "kb_users_select_policy"
ON kb_users
FOR SELECT
TO authenticated
USING (id = auth.uid() OR role = 'admin');

CREATE POLICY "kb_users_insert_policy"
ON kb_users
FOR INSERT
TO authenticated
WITH CHECK (role = 'admin');

CREATE POLICY "kb_users_update_policy"
ON kb_users
FOR UPDATE
TO authenticated
USING (role = 'admin');

CREATE POLICY "kb_users_delete_policy"
ON kb_users
FOR DELETE
TO authenticated
USING (role = 'admin');