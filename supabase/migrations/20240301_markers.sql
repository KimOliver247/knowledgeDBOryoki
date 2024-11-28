-- Add marker columns to entries table
ALTER TABLE entries
ADD COLUMN is_frequent BOOLEAN DEFAULT false,
ADD COLUMN needs_improvement BOOLEAN DEFAULT false;

-- Update entry_versions to include markers
ALTER TABLE entry_versions
ADD COLUMN is_frequent BOOLEAN DEFAULT false,
ADD COLUMN needs_improvement BOOLEAN DEFAULT false;