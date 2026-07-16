# Email Enricher Operator

Finds direct email addresses for business owners using Hunter.io. Replaces generic `info@` addresses with the owner's actual email, improving open rates from ~0% to industry-standard cold email rates.

## What It Does

Takes prospects with an identified owner (from the Owner Identifier) and finds their direct email address via Hunter.io. Also verifies the email is deliverable.

Two enrichment strategies:

1. **Email Finder** — given owner name + domain, Hunter predicts the email (e.g. `sarah@forrestcoffeehouse.co.uk`)
2. **Domain Search** — finds all emails at a domain, picks the best match by owner name or job title

Also runs email verification to confirm deliverability before the email is used for outreach.

## Pipeline Position

```
Prospect Finder → Website Analyser → Contact Enricher → Owner Identifier → Email Enricher → Outreach
```

## Setup

```bash
cd implementation
cp .env.example .env
# Fill in HUNTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
pip install -r requirements.txt
```

### Hunter.io API Key

Sign up at https://hunter.io — free plan includes 50 credits/month (no credit card required).

- **Domain Search**: 1 credit per 10 emails found
- **Email Finder**: 1 credit per lookup
- **Email Verifier**: 1 credit per verification

With 50 credits/month, you can enrich ~15-20 prospects (finder + verify each).

## Run

```bash
# Enrich up to 50 prospects (default, but watch credit limits)
python main.py

# Dry run (call Hunter but don't write to DB)
python main.py --dry-run

# Limit to 10 prospects (safe for free plan)
python main.py --limit 10

# Ad-hoc: test a single domain
python main.py --domain forrestcoffeehouse.co.uk

# Only verify existing owner_emails (no new enrichment)
python main.py --verify-only
```

## Output

Writes to `prospects` table:
- `owner_email` — the enriched direct email
- `owner_email_source` — "hunter_email_finder", "hunter_domain_search", or "website_fallback"
- `owner_email_confidence` — 0-100 confidence score from Hunter
- `owner_email_status` — "valid", "risky", "invalid", or "unverified"
- `owner_enriched_at` — timestamp
- `owner_email_verified_at` — timestamp

## Credit Budgeting

The operator processes prospects in priority order (lowest site score first — highest opportunity). This ensures credits are spent on the best leads first.

Monitor credit usage at https://hunter.io/dashboard. The free plan resets monthly with no rollover.
