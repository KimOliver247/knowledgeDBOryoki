-- Create entry_versions table to store version history
CREATE TABLE IF NOT EXISTS entry_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  type entry_type NOT NULL,
  heading TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by TEXT,
  change_summary TEXT,
  -- Store the complete entry data as JSONB for flexibility
  data JSONB NOT NULL,
  topics TEXT[] NOT NULL
);

-- Create index for faster version lookups
CREATE INDEX idx_entry_versions_entry_id ON entry_versions(entry_id);

-- Create function to automatically create a version when an entry is updated
CREATE OR REPLACE FUNCTION create_entry_version()
RETURNS TRIGGER AS $$
DECLARE
  topic_names TEXT[];
  version_num INTEGER;
  entry_data JSONB;
BEGIN
  -- Get the current version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO version_num
  FROM entry_versions
  WHERE entry_id = NEW.id;

  -- Get topic names for the entry
  SELECT array_agg(t.name)
  INTO topic_names
  FROM entry_topics et
  JOIN topics t ON t.id = et.topic_id
  WHERE et.entry_id = NEW.id;

  -- Build the entry data based on type
  CASE NEW.type
    WHEN 'support_case' THEN
      SELECT jsonb_build_object(
        'problem', sc.problem,
        'solution', sc.solution,
        'customer_satisfaction', sc.customer_satisfaction
      )
      INTO entry_data
      FROM support_case sc
      WHERE sc.id = NEW.id;
    WHEN 'product_knowledge' THEN
      SELECT jsonb_build_object(
        'knowledge_content', pk.knowledge_content
      )
      INTO entry_data
      FROM product_knowledge pk
      WHERE pk.id = NEW.id;
    WHEN 'process' THEN
      SELECT jsonb_build_object(
        'description', p.description
      )
      INTO entry_data
      FROM process p
      WHERE p.id = NEW.id;
  END CASE;

  -- Insert the new version
  INSERT INTO entry_versions (
    entry_id,
    version_number,
    type,
    heading,
    data,
    topics,
    change_summary
  ) VALUES (
    NEW.id,
    version_num,
    NEW.type,
    NEW.heading,
    entry_data,
    COALESCE(topic_names, ARRAY[]::TEXT[]),
    'Updated entry'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create versions on entry updates
CREATE TRIGGER entry_version_trigger
AFTER UPDATE ON entries
FOR EACH ROW
EXECUTE FUNCTION create_entry_version();

-- Create initial versions for existing entries
INSERT INTO entry_versions (
  entry_id,
  version_number,
  type,
  heading,
  data,
  topics,
  change_summary
)
SELECT 
  e.id,
  1,
  e.type,
  e.heading,
  CASE e.type
    WHEN 'support_case' THEN
      jsonb_build_object(
        'problem', sc.problem,
        'solution', sc.solution,
        'customer_satisfaction', sc.customer_satisfaction
      )
    WHEN 'product_knowledge' THEN
      jsonb_build_object(
        'knowledge_content', pk.knowledge_content
      )
    WHEN 'process' THEN
      jsonb_build_object(
        'description', p.description
      )
  END as data,
  ARRAY(
    SELECT t.name
    FROM entry_topics et
    JOIN topics t ON t.id = et.topic_id
    WHERE et.entry_id = e.id
  ),
  'Initial version'
FROM entries e
LEFT JOIN support_case sc ON sc.id = e.id
LEFT JOIN product_knowledge pk ON pk.id = e.id
LEFT JOIN process p ON p.id = e.id
WHERE NOT EXISTS (
  SELECT 1 FROM entry_versions ev WHERE ev.entry_id = e.id
);