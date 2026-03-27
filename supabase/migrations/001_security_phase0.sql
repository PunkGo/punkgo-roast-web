-- Phase 0: Security hardening

-- Add public_id column to mailboxes
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

-- Backfill existing rows with random public_id
UPDATE mailboxes SET public_id = substr(md5(random()::text), 1, 8) WHERE public_id IS NULL;

-- Make public_id NOT NULL after backfill
ALTER TABLE mailboxes ALTER COLUMN public_id SET NOT NULL;

-- RLS policies
-- Note: Using anon key, so auth.uid() is not available.
-- RLS limits operation types, not per-user access.

ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Mailboxes: allow read and create, disallow update/delete
CREATE POLICY "mailboxes_select" ON mailboxes FOR SELECT USING (true);
CREATE POLICY "mailboxes_insert" ON mailboxes FOR INSERT WITH CHECK (true);

-- Messages: allow read by mailbox_id, allow insert, disallow update/delete
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);
