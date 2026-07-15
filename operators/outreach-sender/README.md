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
- **Subject**: `Your website score + rebuilt mockup`
- **Body**: Fixed template with `{{review_url}}` variable

Future revisions should be `sorted_initial_outreach_v2`, etc. Previous sends remain auditable.

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
NOT_READY → READY → SENDING → SENT → REPLIED
                ↘          ↘
              FAILED_TEMPORARY (retries)
              FAILED_PERMANENT (no retry)
              BOUNCED
              OPTED_OUT (from any state)
```

## Database tables

- `outreach_campaigns` — versioned email templates
- `outreach_log` — audit trail for every state change
- `outreach_suppression` — emails that should never receive outreach
- `outreach_config` — sending controls (single row)
- `outreach_cron_log` — audit trail for pg_cron dispatch attempts
- `prospects` (extended) — outreach status, timestamps, error tracking
- Vault secret `github_outreach_token` — GitHub PAT for workflow_dispatch
