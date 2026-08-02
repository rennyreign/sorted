-- Unified channel attribution + content performance
--
-- Adds a single `channel` dimension to prospects so every lead — cold
-- outreach, inbound website form, partner referral, or future paid/social
-- channels (TikTok, LinkedIn, YouTube) — rolls into one funnel view.
--
-- Also adds content_posts / content_metrics_snapshots so social content
-- performance (views/likes/comments over time) can be tracked per channel.
-- Metrics start as manual entries (source = 'manual'); an automated TikTok
-- API sync can write rows the same way later (source = 'tiktok_api') with
-- no dashboard changes required.
--
-- Rollback:
--   ALTER TABLE public.prospects DROP COLUMN IF EXISTS channel, DROP COLUMN IF EXISTS utm_source, DROP COLUMN IF EXISTS utm_medium, DROP COLUMN IF EXISTS utm_campaign, DROP COLUMN IF EXISTS utm_content, DROP COLUMN IF EXISTS utm_term, DROP COLUMN IF EXISTS partner_id;
--   DROP TABLE IF EXISTS public.content_metrics_snapshots;
--   DROP TABLE IF EXISTS public.content_posts;
--   DROP FUNCTION IF EXISTS public.operator_upsert_content_post(text, text, text, text, text, timestamptz, text);
--   DROP FUNCTION IF EXISTS public.operator_log_content_metric(text, bigint, bigint, bigint, bigint, bigint, bigint, text);
--   DROP FUNCTION IF EXISTS public.operator_get_content_performance(text);
--   DROP FUNCTION IF EXISTS public.operator_get_channel_funnel(text);

-- ─── Attribution columns on prospects ──────────────────────────────────────────

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS channel TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.affiliates(id);

CREATE INDEX IF NOT EXISTS idx_prospects_channel ON public.prospects(channel);
CREATE INDEX IF NOT EXISTS idx_prospects_partner_id ON public.prospects(partner_id);

-- Backfill existing rows so historical data has a channel too.
UPDATE public.prospects SET channel = 'outreach' WHERE channel IS NULL AND status = 'prospect';
UPDATE public.prospects SET channel = 'organic' WHERE channel IS NULL AND status = 'website_lead';
UPDATE public.prospects SET channel = 'partner' WHERE channel IS NULL AND status = 'partner_lead';

UPDATE public.prospects p
SET partner_id = r.affiliate_id
FROM public.affiliate_referrals r
WHERE r.prospect_id = p.id
  AND p.partner_id IS NULL;

-- ─── Content posts + time-series metrics ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_posts (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL, -- 'tiktok' | 'linkedin' | 'youtube'
  external_id TEXT, -- platform's video/post id, if known
  url TEXT,
  caption TEXT,
  posted_at TIMESTAMPTZ,
  utm_content TEXT, -- matches prospects.utm_content from the bio link on this specific post
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, external_id)
);

CREATE TABLE IF NOT EXISTS public.content_metrics_snapshots (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  comments BIGINT NOT NULL DEFAULT 0,
  shares BIGINT NOT NULL DEFAULT 0,
  saves BIGINT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual' -- 'manual' | 'tiktok_api'
);

CREATE INDEX IF NOT EXISTS idx_content_metrics_post_id ON public.content_metrics_snapshots(post_id, captured_at DESC);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metrics_snapshots ENABLE ROW LEVEL SECURITY;
-- No public policies — all access goes through operator_* RPCs below.

-- ─── Operator RPCs (reuse the operator_api_token pattern) ──────────────────────

CREATE OR REPLACE FUNCTION public.operator_upsert_content_post(
  p_operator_token TEXT,
  p_channel TEXT,
  p_external_id TEXT,
  p_url TEXT DEFAULT NULL,
  p_caption TEXT DEFAULT NULL,
  p_posted_at TIMESTAMPTZ DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  INSERT INTO public.content_posts (channel, external_id, url, caption, posted_at, utm_content)
  VALUES (p_channel, p_external_id, p_url, p_caption, p_posted_at, p_utm_content)
  ON CONFLICT (channel, external_id) DO UPDATE SET
    url = COALESCE(EXCLUDED.url, public.content_posts.url),
    caption = COALESCE(EXCLUDED.caption, public.content_posts.caption),
    posted_at = COALESCE(EXCLUDED.posted_at, public.content_posts.posted_at),
    utm_content = COALESCE(EXCLUDED.utm_content, public.content_posts.utm_content)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.operator_log_content_metric(
  p_operator_token TEXT,
  p_post_id BIGINT,
  p_views BIGINT DEFAULT 0,
  p_likes BIGINT DEFAULT 0,
  p_comments BIGINT DEFAULT 0,
  p_shares BIGINT DEFAULT 0,
  p_saves BIGINT DEFAULT 0,
  p_source TEXT DEFAULT 'manual'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  INSERT INTO public.content_metrics_snapshots (post_id, views, likes, comments, shares, saves, source)
  VALUES (p_post_id, p_views, p_likes, p_comments, p_shares, p_saves, p_source)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.operator_get_content_performance(p_operator_token TEXT)
RETURNS TABLE (
  id BIGINT,
  channel TEXT,
  external_id TEXT,
  url TEXT,
  caption TEXT,
  posted_at TIMESTAMPTZ,
  utm_content TEXT,
  latest_views BIGINT,
  latest_likes BIGINT,
  latest_comments BIGINT,
  latest_shares BIGINT,
  latest_saves BIGINT,
  latest_captured_at TIMESTAMPTZ,
  leads_attributed BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  RETURN QUERY
  SELECT
    cp.id,
    cp.channel,
    cp.external_id,
    cp.url,
    cp.caption,
    cp.posted_at,
    cp.utm_content,
    latest.views,
    latest.likes,
    latest.comments,
    latest.shares,
    latest.saves,
    latest.captured_at,
    COALESCE(leads.cnt, 0)::BIGINT AS leads_attributed
  FROM public.content_posts cp
  LEFT JOIN LATERAL (
    SELECT m.views, m.likes, m.comments, m.shares, m.saves, m.captured_at
    FROM public.content_metrics_snapshots m
    WHERE m.post_id = cp.id
    ORDER BY m.captured_at DESC
    LIMIT 1
  ) latest ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt
    FROM public.prospects p
    WHERE p.utm_content = cp.utm_content AND cp.utm_content IS NOT NULL
  ) leads ON true
  ORDER BY cp.posted_at DESC NULLS LAST, cp.created_at DESC;
END;
$$;

-- ─── Channel funnel for the Pulse dashboard ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.operator_get_channel_funnel(p_operator_token TEXT)
RETURNS TABLE (
  channel TEXT,
  partner_name TEXT,
  total BIGINT,
  outreached BIGINT,
  mockup_revealed BIGINT,
  build BIGINT,
  quote BIGINT,
  paid BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  RETURN QUERY
  SELECT
    COALESCE(p.channel, 'unknown') AS channel,
    a.display_name AS partner_name,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE p.crm_status IN ('outreached','responded','mockup_revealed','build','quote','paid'))::BIGINT AS outreached,
    COUNT(*) FILTER (WHERE p.crm_status IN ('mockup_revealed','build','quote','paid'))::BIGINT AS mockup_revealed,
    COUNT(*) FILTER (WHERE p.crm_status IN ('build','quote','paid'))::BIGINT AS build,
    COUNT(*) FILTER (WHERE p.crm_status IN ('quote','paid'))::BIGINT AS quote,
    COUNT(*) FILTER (WHERE p.crm_status = 'paid')::BIGINT AS paid
  FROM public.prospects p
  LEFT JOIN public.affiliates a ON a.id = p.partner_id
  GROUP BY COALESCE(p.channel, 'unknown'), a.display_name
  ORDER BY total DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.operator_upsert_content_post(text, text, text, text, text, timestamptz, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.operator_log_content_metric(text, bigint, bigint, bigint, bigint, bigint, bigint, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.operator_get_content_performance(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.operator_get_channel_funnel(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.operator_upsert_content_post(text, text, text, text, text, timestamptz, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.operator_log_content_metric(text, bigint, bigint, bigint, bigint, bigint, bigint, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.operator_get_content_performance(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.operator_get_channel_funnel(text) TO anon, authenticated;
