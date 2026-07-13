# Cost Dashboard

The Sorted Cost Dashboard lives at `/operators/costs/` inside the operator dashboard.

## What it shows

- **Monthly burn** — fixed subscription costs + estimated variable costs (e.g. Apify map runs derived from CRM prospect count)
- **Supplier balances** — current remaining credit on each supplier account
- **Top-up warnings** — flagged when a balance drops below the configured threshold
- **Cost per nod** — total monthly burn divided by the number of prospects at each pipeline stage
  - Mockup reveal
  - Build request
  - Quote request
  - Sale
- **Pipeline funnel** — CRM counts and conversion rates between stages
- **Cost ledger** — a table view of all suppliers

## Live vs configured balances

The dashboard tries to fetch live balances from supplier APIs when keys are configured in `.env.local`:

| Supplier | Env var needed | Notes |
|---|---|---|
| Apify | `APIFY_API_TOKEN` | Fetched from Apify `/v2/users/me` |
| OpenAI API | `OPENAI_API_KEY` | OpenAI does not expose a secret-key billing endpoint; status will show as unavailable unless a usage-scoped key is provided |
| Claude / Anthropic | `ANTHROPIC_API_KEY` | No public balance endpoint; configure manually |
| ChatGPT Plus | — | No API available; add as fixed monthly cost |
| Screenshot API | — | Fixed monthly cost |
| Devin Pro | — | Add fixed monthly cost when known |

When a supplier key is missing or the API cannot return a balance, the dashboard falls back to configured data from `cost-config.json`. You can also click any balance in the Supplier balances card to set a manual value. Manual values are saved in browser localStorage under `sorted_supplier_balances`.

## Cost per nod calculation

```
cost_per_nod = total_monthly_burn / prospects_at_stage
```

Stages later in the funnel naturally show a higher cost per nod because fewer prospects reach them. As the CRM pipeline fills out, these numbers will become more meaningful.

## Updating costs

Edit `accounting/cost-config.json` to change:

- Monthly subscription costs
- Per-unit usage costs (e.g. Apify map runs)
- Top-up thresholds
- Supplier metadata and API key environment variable names

## Future improvements

- Track actual monthly usage per supplier (map runs, tokens, image gen calls)
- Persist manual balances to Supabase instead of localStorage
- Add a monthly cost target and projected runway
- Integrate labor hours once time tracking is in place
