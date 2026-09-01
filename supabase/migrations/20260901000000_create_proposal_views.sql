-- Proposal view tracking — records each time a password-protected proposal page is viewed.
--
-- Drives the "number of times viewed" metric for Sorted proposals. Each row is one
-- authenticated page load. session_id lets us distinguish total views from unique viewers.

CREATE TABLE IF NOT EXISTS proposal_views (
  id BIGSERIAL PRIMARY KEY,
  proposal_slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_proposal_views_slug ON proposal_views (proposal_slug);
CREATE INDEX IF NOT EXISTS idx_proposal_views_viewed_at ON proposal_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_views_session ON proposal_views (proposal_slug, session_id);

-- Enable RLS. The Next.js API route uses the Supabase service role, which bypasses RLS.
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON proposal_views FOR ALL TO service_role USING (true) WITH CHECK (true);
