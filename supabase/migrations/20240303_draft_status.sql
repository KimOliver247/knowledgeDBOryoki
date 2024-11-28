-- Add status column to entries table
ALTER TABLE entries
ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
CHECK (status IN ('draft', 'published'));

-- Update entry_versions to include status
ALTER TABLE entry_versions
ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
CHECK (status IN ('draft', 'published'));