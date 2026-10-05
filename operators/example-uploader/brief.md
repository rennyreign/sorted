# Example Uploader — Build Brief

## What this operator does

Takes new sites and mockups that Sorted has built, enriches them with AI-generated case study content (via Anthropic Claude), screenshots live sites at desktop/tablet/mobile breakpoints, and publishes them to the examples page at `/examples/`.

## What it replaces

Manual process:
1. Build a site
2. Manually screenshot it at 3 viewport sizes
3. Manually write a case study (goal, solution, testimonial, stats)
4. Manually add it to `_caseStudies.ts`
5. Manually upload mockup images to Supabase

Now:
1. Run `npm run upload`
2. Done.

## Inputs

- **`clients/sites.json`** — live client sites with domains
- **`KNOWN_SITES` in `ingest.ts`** — manually registered sites (School of Skill, A Good Catch, Bridge Growth)
- **Sibling project directories** (`../sos`, `../agoodcatch`, `../bridgegrowth`) — for briefs and mockup images
- **`site-briefs/`** — rich context for AI generation

## Outputs

- **`public/examples/live/{slug}-{desktop,tablet,mobile}.png`** — Playwright screenshots
- **`app/examples/_generatedCaseStudies.ts`** — TypeScript data file with generated case studies
- **Supabase `examples` table** — upserted rows for the mockup gallery

## AI Generation

- **Model:** Claude Sonnet 4.5
- **Blurb:** 1-sentence description per example (~$0.001 per site)
- **Case study:** Full ExampleCaseStudy object with goal, solution, testimonial, stats (~$0.01 per site)
- **Total cost:** ~$0.05 for 4 sites

## Unclaimed builds

Sites that Sorted built speculatively (not yet sold to the client) are marked with:
- `isClaimed: false` in the generated data
- "Unclaimed" badge (amber) on the case study rail card
- "Unclaimed build" badge on the case study detail page
- Testimonial role set to "Pending response"

## Case study format

Follows the exact `ExampleCaseStudy` type from `_caseStudies.ts`:
- slug, category, title, business, location, description
- image, screenshots (desktop/tablet/mobile)
- liveUrl, goal, solution
- testimonial, testimonialName, testimonialRole
- stats (array of [value, label] pairs)

Extended with `isClaimed: boolean` for unclaimed build tracking.

## Screenshot specs

- Desktop: 1440×900 @ 2x scale
- Tablet: 768×1024 @ 2x scale
- Mobile: 390×844 @ 2x scale
- Format: PNG
- Wait: networkidle + 2.5s settle for animations
- Saved to: `public/examples/live/{slug}-{viewport}.png`
