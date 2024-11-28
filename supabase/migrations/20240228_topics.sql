-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create junction table for entries and topics
CREATE TABLE IF NOT EXISTS entry_topics (
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, topic_id)
);

-- Migrate existing topics
INSERT INTO topics (name)
SELECT DISTINCT topic FROM entries
ON CONFLICT (name) DO NOTHING;

-- Migrate existing entry-topic relationships
INSERT INTO entry_topics (entry_id, topic_id)
SELECT e.id, t.id
FROM entries e
JOIN topics t ON t.name = e.topic;

-- Remove old topic column from entries
ALTER TABLE entries DROP COLUMN topic;