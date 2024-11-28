# Database Structure

## Supabase Configuration

### Tables

#### entries
```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY,
  type entry_type NOT NULL,
  heading TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_frequent BOOLEAN DEFAULT false,
  needs_improvement BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published'
);
```

#### topics
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### entry_topics
```sql
CREATE TABLE entry_topics (
  entry_id UUID REFERENCES entries(id),
  topic_id UUID REFERENCES topics(id),
  PRIMARY KEY (entry_id, topic_id)
);
```

#### improvements
```sql
CREATE TABLE improvements (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Policies

#### Improvements Table
```sql
-- Enable RLS
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- Read access
CREATE POLICY "Allow anonymous read access"
ON improvements FOR SELECT TO anon
USING (true);

-- Authenticated access
CREATE POLICY "Allow authenticated read access"
ON improvements FOR SELECT TO authenticated
USING (true);

-- Delete access
CREATE POLICY "Allow authenticated delete access"
ON improvements FOR DELETE TO authenticated
USING (true);

-- Service role access
CREATE POLICY "Allow service role full access"
ON improvements TO service_role
USING (true)
WITH CHECK (true);
```

## Data Types

### entry_type Enum
```sql
CREATE TYPE entry_type AS ENUM (
  'support_case',
  'product_knowledge',
  'process'
);
```

## Triggers

### Updated At
```sql
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Indexes
- Primary keys on all tables
- Foreign key indexes
- Search optimization indexes