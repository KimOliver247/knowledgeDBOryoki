-- First, get the admin user's ID
DO $$ 
DECLARE
    v_admin_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO v_admin_id
    FROM kb_users
    WHERE username = 'admin'
    LIMIT 1;

    -- Update entries table
    UPDATE entries
    SET 
        author_id = v_admin_id,
        last_modified_by = v_admin_id,
        last_modified_at = CURRENT_TIMESTAMP
    WHERE author_id IS NULL;

    -- Update entry_versions table
    UPDATE entry_versions
    SET 
        author_id = v_admin_id,
        modified_by = v_admin_id
    WHERE author_id IS NULL;

    -- Add a system log entry
    INSERT INTO system_logs (
        level,
        message,
        details
    ) VALUES (
        'INFO',
        'Assigned existing entries to admin user',
        jsonb_build_object(
            'admin_id', v_admin_id,
            'timestamp', CURRENT_TIMESTAMP
        )
    );
END $$;