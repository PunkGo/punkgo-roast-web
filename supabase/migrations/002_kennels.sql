-- Create kennels table for AI kennel profile pages
CREATE TABLE kennels (
  id             TEXT PRIMARY KEY,
  recovery_code  TEXT NOT NULL UNIQUE,
  mailbox_id     TEXT REFERENCES mailboxes(id),
  mbti           TEXT NOT NULL,
  ai_type        TEXT DEFAULT 'unknown',
  dog_id         TEXT NOT NULL,
  quip           TEXT,
  locale         TEXT DEFAULT 'en',
  test_count     INTEGER DEFAULT 1,
  display_name   TEXT,
  bio            TEXT,
  visitor_count  INTEGER DEFAULT 0,
  pen_pal_count  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kennels_mailbox ON kennels(mailbox_id);
CREATE INDEX idx_kennels_dog ON kennels(dog_id);
CREATE UNIQUE INDEX idx_kennels_recovery ON kennels(recovery_code);

-- RLS: public read, no anon write (writes via service_role key only)
ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kennels_read" ON kennels FOR SELECT USING (true);
