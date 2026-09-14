# Quote Page Workflow

How to create a client quote page with counter-offer flow.

## When to use this workflow

When a client has seen their built site (Nod 1 complete) and needs a quote page to agree on price before deposit. This is the "agree on a quote" step in the Sorted delivery process.

## What the quote page does

1. **Password-protected** — private page for the client
2. **Shows what they're getting** — website build, Sorted Updates, Sorted Tracking
3. **Shows the price** — original quote amount with deposit/balance breakdown
4. **Counter-offer flow** — client can accept as-is OR propose a different amount
5. **Auto-accept floor** — proposals at or above the floor are automatically accepted
6. **Review routing** — proposals below the floor trigger an email to Renaldo via Supabase Edge Function
7. **Agreement + signature** — client reviews terms and signs
8. **Onboarding stepper** — visual progress showing where the client is in the process

## Architecture

```
Client (static page) → Supabase Edge Function → Resend Email
                         ↓
                    quote_responses table (Supabase)
```

- The page is a Next.js static export (`output: 'export'`) — no server-side API routes
- Counter-offers in the review zone call a Supabase Edge Function via `fetch()`
- The edge function stores the record and sends an email via Resend API
- A shared secret (`NEXT_PUBLIC_QUOTE_COUNTER_SECRET`) authenticates the request
- The secret is set as both a Next.js env var (client) and a Supabase secret (edge function)

## Counter-offer logic (ratio-based with two-chance lock)

The counter-offer flow uses **ratio-based thresholds** relative to the asking price, not a flat floor. This prevents clients from lowballing just because a fixed number is visible.

### Thresholds

| Zone | Range | Behaviour |
|---|---|---|
| **Auto-accept** | >= 80% of asking | Automatically accepted, no waiting |
| **Review** | 50–80% of asking | Sent to Renaldo for review, response within 24 hours |
| **Low** | < 50% of asking | Warning shown — client must confirm before submission |

For a £750 quote: auto-accept at £600+, review at £375–£600, warning below £375.
For a £1000 quote: auto-accept at £800+, review at £500–£800, warning below £500.

### Two-chance lock

Clients get **2 attempts** to propose a counter-offer. After that, the price is locked.

1. **First attempt** — if in the auto-accept zone, locked immediately. If in the review zone, submitted and locked. If in the low zone, a warning is shown with the option to adjust or confirm.
2. **Second attempt** (only if they adjusted from the warning) — whatever they submit is final. Locked.
3. Once locked, the counter-offer input is hidden. The client can either:
   - Wait for Renaldo's response (if review zone)
   - Accept the original quote (always available as a fallback)

The attempt count is persisted in localStorage so it survives page reloads.

### State machine

```
idle → showCounterInput → [submit]
                           ├─ auto zone → accepted + locked
                           ├─ review zone → submitting → review + locked
                           └─ low zone → warning
                                          ├─ adjust → back to input (attempt 2)
                                          └─ confirm → submitting → review + locked
```

### Why ratio-based?

A flat £500 floor has two problems:
1. **Anchor effect** — clients see £500 and propose exactly £500 because it's the visible threshold
2. **No intelligence** — £500 on a £750 quote (67%) is very different from £500 on a £2000 quote (25%)

Ratio-based thresholds adapt to any quote size and prevent the floor from becoming an anchor. The client never sees the exact thresholds — only the outcome of their proposal.

## Steps

### 1. Create the page

Create `app/clients/[client-slug]/page.tsx`.

Reference implementation: `app/clients/advocate-better-care/page.tsx`

Key constants to change per client:
- `AUTH_KEY` — `[clientname]_auth` (e.g. `abc_auth`)
- `QUOTE_AMOUNT` — the quote price in pounds (e.g. `750`)
- `AUTO_ACCEPT_PCT` — ratio for auto-accept (default: `0.80` = 80% of asking)
- `REVIEW_PCT` — ratio for review zone (default: `0.50` = 50% of asking)
- `MAX_ATTEMPTS` — number of counter attempts before lock (default: `2`)
- `CLIENT_SLUG` — the client slug (e.g. `advocate-better-care`)
- `CLIENT_NAME` — the client display name (e.g. `Advocate Better Care`)
- Password — `[firstname][year]` convention (e.g. `mark2026`)

### 2. Set up Supabase (if counter-offer flow is enabled)

Only needed for the first quote page (table + edge function already exist).

**Table:** `quote_responses` — see migration `supabase/migrations/20260914090000_quote_responses_table.sql`

**Edge function:** `quote-counter-offer` — see `supabase/functions/quote-counter-offer/index.ts`

**Secrets (Supabase CLI):**
```bash
supabase link --project-ref qweevancxedkkfxysnzq
supabase secrets set \
  QUOTE_COUNTER_SECRET="[generate with: openssl rand -hex 24]" \
  RESEND_API_KEY="[from .env.local]" \
  RENALDO_EMAIL="hello@sortmydigital.site" \
  RESEND_FROM_EMAIL="Sorted <hello@sortmydigital.site>"
```

**Client env (.env.local):**
```
NEXT_PUBLIC_QUOTE_COUNTER_SECRET=[same secret as above]
```

### 3. Deploy the edge function (if changes were made)

```bash
# Via Supabase MCP: deploy_edge_function
# Or via CLI: supabase functions deploy quote-counter-offer
```

### 4. Customise the page content

- **What you're getting** — update the three items to match the client's deliverables
- **Stepper** — update step descriptions with client-specific details
- **Agreement terms** — update the terms in the modal to match the agreed scope
- **Bank details** — ADX ENGINE LTD, NatWest, Sort Code 52-30-02, Account Number 30189489
- **Payment reference** — use the client name

### 5. Test locally

```bash
npm run dev
# Visit http://localhost:3000/clients/[client-slug]
# Enter the password
# Test: accept quote, propose >= floor, propose < floor
```

### 6. Commit and deploy

Follow the deployment discipline in AGENTS.md:
```bash
git checkout -b feat/[client-slug]-quote
git add app/clients/[client-slug]/page.tsx
git commit -m "feat: add quote page for [client name]"
git checkout main
git merge --no-ff feat/[client-slug]-quote
git push origin main
```

## Counter-offer flow states

```
idle → showCounterInput → [submit]
                           ├─ auto zone (>=80%) → accepted + locked
                           ├─ review zone (50-80%) → submitting → review + locked
                           └─ low zone (<50%) → warning
                                                  ├─ adjust → input (attempt 2)
                                                  └─ confirm → submitting → review + locked
```

- `idle` — initial state, shows "Accept quote" and "Propose a different amount" buttons
- `showCounterInput` — shows the counter-offer input form with live preview and attempt counter
- `warning` — low zone, shows amber warning with "Adjust my offer" or "Confirm for review" options
- `submitting` — calling the edge function (review and low zones)
- `accepted` — auto-accepted (auto zone), shows green confirmation + accept button
- `review` — sent for review (review/low zone), shows amber "sent for review" message
- `locked` — no more counter-offers allowed (after 2 attempts or any accepted/review state)
- `error` — network failure, shows error with retry option

## Design standards

- **Sorted brand wordmark** — `Sorted.` with lime dot
- **Typography** — font-sans for headings, font-mono for labels/metadata
- **Color palette** — black `#0A0A0A`, grey `#525252`, light grey `#737373`, lime `#cfe900`
- **Max width** — 680px centered
- **Section dividers** — `border-t border-black/[0.08]`
- **Investment card** — black rounded card with white text for the price
- **Stepper** — vertical timeline with checkmarks (done), filled dot (current), outline (upcoming)
- **Transparency** — the floor amount is always visible to the client

## Reviewing counter-offers

Counter-offers below the floor are stored in the `quote_responses` table. To review:

```sql
SELECT * FROM quote_responses WHERE status = 'pending_review' ORDER BY created_at DESC;
```

Or check the email sent to `RENALDO_EMAIL` (currently `hello@sortmydigital.site`).

After reviewing, update the status:
```sql
UPDATE quote_responses SET status = 'accepted', reviewed_at = now(), reviewed_by = 'renaldo' WHERE id = [id];
UPDATE quote_responses SET status = 'declined', reviewed_at = now(), reviewed_by = 'renaldo', review_notes = '[reason]' WHERE id = [id];
```
