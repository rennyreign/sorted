# Outreach Sender Operator

Deterministic email sender for the Sorted CRM pipeline. Automatically sends the approved initial outreach email to prospects whose mockup and review have been added to the CRM.

**No LLM. No probabilistic decisions. Fixed rules only.**

## How it works

```
Mockup added to CRM
    ↓
DB trigger marks prospect as READY
    ↓
Supabase pg_cron fires every 5 min (08:00-16:55 UTC, Mon-Fri)
    ↓
pg_cron calls GitHub workflow_dispatch API via pg_net
    ↓
GitHub Actions runs send.py
    ↓
send.py finds oldest READY prospect
    ↓
Compiles fixed email template with {{review_url}}
    ↓
Sends via Resend API
    ↓
Updates CRM with SENT/FAILED status
    ↓
Writes audit log entry
```

> **Why pg_cron, not GitHub Actions cron?** GitHub Actions scheduled workflows are best-effort and silently drop runs — an entire day of missed triggers was observed on 2026-07-15. pg_cron is a deterministic Postgres job scheduler that runs inside Supabase. It calls the GitHub `workflow_dispatch` API via `pg_net` to trigger the workflow. The GitHub Actions cron remains as a fallback, but pg_cron is the primary scheduler. See migration `20260718000000_enable_outreach_cron_scheduler.sql`.

## Configuration

All sending controls are stored in the `outreach_config` Supabase table:

| Setting | Default | Description |
|---------|---------|-------------|
| `mode` | `AUTO_SEND` | `AUTO_SEND`, `QUEUE_ONLY`, or `PAUSED` |
| `daily_send_limit` | `20` | Max emails per day |
| `sending_window_start` | `09:00` | UK business hours start |
| `sending_window_end` | `16:30` | UK business hours end |
| `sending_window_days` | `1,2,3,4,5` | Mon-Fri (ISO day numbers) |
| `sending_window_tz` | `Europe/London` | Timezone |
| `send_spacing_minutes` | `5` | Minutes between sends |
| `max_retry_attempts` | `3` | Max retries for temporary failures |
| `from_email` | `renaldo@sortmydigital.site` | Sender address |
| `from_name` | `Renaldo` | Sender name |

## Campaign versioning

Campaigns are stored in the `outreach_campaigns` table. The current campaign is:

- **ID**: `sorted_initial_outreach_v1`
- **Subject**: `We redesigned your website`
- **Body**: Fixed enquiry-leakage template with `{{review_url}}` variable

Future revisions should be `sorted_initial_outreach_v2`, etc. Previous sends remain auditable.

### Template variables

| Variable | Replaced with | Example |
|----------|---------------|---------|
| `{{review_url}}` | Prospect's review page URL | `https://sortmydigital.site/review/forrest-coffee-house` |
| `{{owner_first_name}}` | Business owner's first name (if identified) | `Sarah` |
| `{{owner_name}}` | Business owner's full name (if identified) | `Sarah Smith` |
| `{{business_name}}` | Prospect's business name | `Forrest Coffee House` |
| `{{greeting}}` | Personalized greeting | `Hi Sarah` or `Hi there` (fallback) |

### Email selection priority

The sender prefers `owner_email` (direct owner contact from Hunter.io enrichment) over the generic `email` field (scraped from website). This improves open rates by reaching the decision-maker directly rather than a shared `info@` inbox.

## Running

### Automatic (Supabase pg_cron → GitHub Actions)

The primary scheduler is a **Supabase pg_cron job** (`trigger-outreach-sender`) that fires every 5 minutes during 08:00-16:55 UTC, Mon-Fri. It calls the GitHub `workflow_dispatch` API via `pg_net` to trigger the `.github/workflows/outreach-sender.yml` workflow. Each run sends one email.

The GitHub Actions cron schedule in the workflow file remains as a fallback, but pg_cron is the primary trigger. Both can fire — `send.py` is idempotent and will skip prospects already in `SENT` state.

**Audit trail:** Every pg_cron dispatch is logged in the `outreach_cron_log` table.

**Required Vault secret:** `github_outreach_token` — a GitHub fine-grained PAT with Actions: Write permission on `rennyreign/sorted`.

### Manual

```bash
cd operators/outreach-sender/implementation
pip install -r requirements.txt

# Send one email
python send.py

# Dry run (log without sending)
python send.py --dry-run

# Send up to 5 emails (respecting daily limit and spacing)
python send.py --batch 5
```

### Required secrets (GitHub Actions)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`

## Tests

```bash
cd operators/outreach-sender/implementation
python test_send.py
```

Tests cover all 15 scenarios from the brief: eligibility, sending, duplicate protection, suppression, daily limits, sending window, retries, idempotency, pause/resume.

## State machine

```
NOT_READY → READY → SENDING → SENT → DELIVERED → OPENED → CLICKED → REPLIED
                ↘          ↘
              FAILED_TEMPORARY (retries)
              FAILED_PERMANENT (no retry)
              BOUNCED
              OPTED_OUT (from any state)
```

Engagement states (`DELIVERED`, `OPENED`, `CLICKED`) are updated automatically by a database trigger when Resend webhook events arrive. See [Engagement Tracking](#engagement-tracking) below.

## Database tables

- `outreach_campaigns` — versioned email templates
- `outreach_log` — audit trail for every state change
- `outreach_events` — raw engagement events from Resend webhooks (delivered, opened, clicked, bounced, complained)
- `outreach_suppression` — emails that should never receive outreach
- `outreach_config` — sending controls (single row)
- `outreach_cron_log` — audit trail for pg_cron dispatch attempts
- `prospects` (extended) — outreach status, timestamps, error tracking, engagement counts
- Vault secret `github_outreach_token` — GitHub PAT for workflow_dispatch

## Engagement Tracking

Open and click tracking is built in. Emails are sent as HTML (with a plain text fallback), which allows Resend to inject an open-tracking pixel automatically.

### How it works

```
send.py sends HTML email via Resend
    ↓
Resend injects tracking pixel + wraps links
    ↓
Recipient opens email → pixel fires
    ↓
Resend sends webhook to Supabase Edge Function
    ↓
Edge function verifies Svix signature
    ↓
Event inserted into outreach_events table
    ↓
DB trigger updates prospect status (SENT → DELIVERED → OPENED → CLICKED)
```

### Setup (one-time)

1. **Deploy the edge function:**
   ```bash
   supabase functions deploy resend-webhook
   ```

2. **Set the webhook secret:**
   ```bash
   supabase functions secrets set RESEND_WEBHOOK_SECRET=whsec_your_secret_here
   ```

3. **Create the webhook in Resend:**
   - Go to [resend.com/webhooks](https://resend.com/webhooks)
   - Add webhook endpoint: `https://qweevancxedkkfxysnzq.supabase.co/functions/v1/resend-webhook`
   - Select events: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
   - Copy the signing secret (`whsec_...`) and set it as the edge function secret (step 2)

4. **Enable open tracking in Resend** (if not already on):
   - Go to resend.com → Settings → Tracking
   - Enable "Open Tracking" and "Click Tracking"

### What you get

| Event | Prospect status | Timestamp column |
|-------|----------------|-----------------|
| `email.delivered` | `DELIVERED` | `email_delivered_at` |
| `email.opened` | `OPENED` | `email_opened_at` + `email_open_count` |
| `email.clicked` | `CLICKED` | `email_clicked_at` + `email_click_count` |
| `email.bounced` | `BOUNCED` | `email_bounced_at` + auto-suppressed |
| `email.complained` | `OPTED_OUT` | `email_opted_out_at` + auto-suppressed |

### Querying engagement

```sql
-- Open rate for current campaign
SELECT
  count(*) FILTER (WHERE outreach_status IN ('OPENED','CLICKED','REPLIED')) AS opened,
  count(*) FILTER (WHERE outreach_status = 'SENT') AS sent_only,
  count(*) FILTER (WHERE outreach_status IN ('DELIVERED')) AS delivered_unopened,
  count(*) AS total
FROM prospects
WHERE outreach_campaign_id = 'sorted_initial_outreach_v1'
  AND outreach_status IN ('SENT','DELIVERED','OPENED','CLICKED','REPLIED');

-- Recent engagement events
SELECT e.event_type, p.name, e.occurred_at
FROM outreach_events e
JOIN prospects p ON p.id = e.prospect_id
ORDER BY e.occurred_at DESC
LIMIT 20;
```
