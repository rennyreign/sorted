-- Assistant demo: conversations, messages, jobs and quote drafts for the
-- messaging-first assistant (Twilio -> assistant-inbound edge function).
--
-- Kept separate from public.prospects / assistant_job_requests: this is the
-- working product demo, not the marketing-page lead capture.
--
-- All tables have RLS enabled with NO policies: nothing is readable or
-- writable by anon/authenticated. The edge function uses the service role.
-- The single public window is assistant_demo_overview(), a SECURITY DEFINER
-- read that masks phone numbers so the /assistants/demo page can show state.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.assistant_demo_overview();
--   DROP TABLE IF EXISTS public.assistant_config;
--   DROP TABLE IF EXISTS public.assistant_price_book;
--   DROP TABLE IF EXISTS public.assistant_quote_drafts;
--   DROP TABLE IF EXISTS public.assistant_jobs;
--   DROP TABLE IF EXISTS public.assistant_messages;
--   DROP TABLE IF EXISTS public.assistant_conversations;

CREATE TABLE public.assistant_conversations (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'customer', 'unknown')),
  channel TEXT NOT NULL DEFAULT 'sms',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone, channel)
);

CREATE TABLE public.assistant_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES public.assistant_conversations(id),
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  body TEXT NOT NULL,
  sender_phone TEXT,
  channel TEXT NOT NULL DEFAULT 'sms',
  dry_run BOOLEAN NOT NULL DEFAULT false,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assistant_jobs (
  id BIGSERIAL PRIMARY KEY,
  owner_conversation_id BIGINT REFERENCES public.assistant_conversations(id),
  kind TEXT NOT NULL DEFAULT 'quote',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assistant_quote_drafts (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES public.assistant_jobs(id),
  customer_name TEXT,
  customer_phone TEXT,
  line_items JSONB NOT NULL,
  total_pence INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'awaiting_owner'
    CHECK (status IN ('awaiting_owner', 'approved', 'sent', 'rejected')),
  approved_by_phone TEXT,
  sent_to_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assistant_price_book (
  item TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price_pence INT NOT NULL
);

CREATE TABLE public.assistant_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_quote_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_price_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.assistant_price_book (item, label, price_pence) VALUES
  ('boiler_service', 'Boiler service', 9500),
  ('call_out', 'Call-out', 6000),
  ('hourly', 'Labour (per hour)', 5500),
  ('urgent', 'Urgent priority', 4000);

-- Demo placeholders so the flow works end-to-end before real numbers exist.
-- Update these via the dashboard (service role only) when the Twilio number arrives.
INSERT INTO public.assistant_config (key, value) VALUES
  ('owner_number', '+447000000001'),
  ('test_customer_number', '+447000000002'),
  ('live_sms', 'false'),
  ('webhook_key', 'sorted-assistant-demo-2026');

CREATE OR REPLACE FUNCTION public.assistant_demo_overview()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
    'jobs', (
      SELECT COALESCE(jsonb_agg(job_row ORDER BY job_row->>'created_at' DESC), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', j.id,
          'title', j.title,
          'kind', j.kind,
          'status', j.status,
          'created_at', j.created_at,
          'drafts', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'id', d.id,
              'customer_name', d.customer_name,
              'total_pence', d.total_pence,
              'line_items', d.line_items,
              'status', d.status,
              'created_at', d.created_at
            ) ORDER BY d.created_at DESC), '[]'::jsonb)
            FROM public.assistant_quote_drafts d
            WHERE d.job_id = j.id
          )
        ) AS job_row
        FROM public.assistant_jobs j
        ORDER BY j.created_at DESC
        LIMIT 20
      ) t
    ),
    'conversations', (
      SELECT COALESCE(jsonb_agg(convo_row ORDER BY convo_row->>'last_at' DESC), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', c.id,
          'role', c.role,
          'channel', c.channel,
          'phone_mask', '···' || right(c.phone, 4),
          'last_at', (
            SELECT max(m.created_at) FROM public.assistant_messages m
            WHERE m.conversation_id = c.id
          ),
          'messages', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'direction', m.direction,
              'body', m.body,
              'dry_run', m.dry_run,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC), '[]'::jsonb)
            FROM (
              SELECT * FROM public.assistant_messages m
              WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC
              LIMIT 30
            ) m
          )
        ) AS convo_row
        FROM public.assistant_conversations c
        ORDER BY c.id DESC
        LIMIT 10
      ) t
    )
  );
$$;

REVOKE ALL ON FUNCTION public.assistant_demo_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assistant_demo_overview() TO anon, authenticated;
