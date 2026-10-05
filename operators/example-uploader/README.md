# Example Uploader Operator

Takes built sites and mockups, enriches them with AI-generated case studies, screenshots live sites, and publishes to the Sorted examples page.

## What it removes

The manual loop of:
- Screenshotting live sites at 3 viewport sizes
- Writing case study content (goal, solution, testimonial, stats)
- Editing `_caseStudies.ts` by hand
- Uploading to Supabase

Now: one command produces screenshots + full case studies + publishes.

## Setup

```bash
cd operators/example-uploader/implementation
npm install
npx playwright install chromium
cp .env.example .env
# Fill in: ANTHROPIC_API_KEY, SUPABASE_SERVICE_KEY
```

## Usage

```bash
# Full run — screenshot + generate + publish all known sites
npm run upload

# Preview only — no writes, no API calls
npm run upload -- --dry-run

# Live sites only (skip mockup sync)
npm run upload -- --source live

# Case studies only (skip screenshots if they exist)
npm run upload -- --source case-studies

# Specific business
npm run upload -- --business "School"

# Force re-capture screenshots
npm run upload -- --force-screenshots

# Verbose output
npm run upload -- --verbose
```

## How it works

```
Ingest sites from clients/sites.json + KNOWN_SITES
  ↓
Screenshot each live site at desktop/tablet/mobile (Playwright)
  ↓
Generate blurb + case study via Claude (Anthropic)
  ↓
Write to app/examples/_generatedCaseStudies.ts
  ↓
Upsert to Supabase examples table
```

## Adding new sites

Add entries to `KNOWN_SITES` in `src/ingest.ts`:

```typescript
{
  slug: "my-new-site",
  name: "My New Site",
  liveUrl: "https://my-new-site.netlify.app",
  localPath: "../my-new-site",
  category: "Hospitality",
  isClaimed: false,  // true if client is paying
}
```

Or add to `clients/sites.json` in the repo root.

## Cost

~$0.013 per site (blurb + case study via Claude Sonnet 4.5).
~$0.05 for a typical batch of 4 sites.

## Unclaimed builds

Sites with `isClaimed: false` get:
- Amber "Unclaimed" badge on the case study rail
- "Unclaimed build" badge on the detail page
- Testimonial role set to "Pending response"

This makes it clear which sites are live client work vs speculative builds.

## Files written

| File | Purpose |
|------|---------|
| `public/examples/live/{slug}-desktop.png` | Desktop screenshot (1440px) |
| `public/examples/live/{slug}-tablet.png` | Tablet screenshot (768px) |
| `public/examples/live/{slug}-mobile.png` | Mobile screenshot (390px) |
| `app/examples/_generatedCaseStudies.ts` | Generated case study data |

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Claude API for blurb + case study generation |
| `SUPABASE_SERVICE_KEY` | No* | Supabase examples table upsert |
| `SUPABASE_URL` | No | Override Supabase URL (defaults to Sorted project) |
| `SORTED_REPO_ROOT` | No | Override repo root path |

*If not set, Supabase upsert is skipped — case studies still written to file.
