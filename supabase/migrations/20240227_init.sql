-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for entry types
CREATE TYPE entry_type AS ENUM ('support_case', 'product_knowledge', 'process');

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create base table for entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type entry_type NOT NULL,
  heading TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create junction table for entries and topics
CREATE TABLE IF NOT EXISTS entry_topics (
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, topic_id)
);

-- Create support case entries table
CREATE TABLE IF NOT EXISTS support_case (
  id UUID PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  customer_satisfaction TEXT NOT NULL
);

-- Create product knowledge entries table
CREATE TABLE IF NOT EXISTS product_knowledge (
  id UUID PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  knowledge_content TEXT NOT NULL
);

-- Create process entries table
CREATE TABLE IF NOT EXISTS process (
  id UUID PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();