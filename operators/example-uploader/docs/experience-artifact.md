# Experience Artifact — Example Uploader

## First production run
**Date:** 2026-09-02
**Sites processed:** 4 (School of Skill, A Good Catch, Bridge Growth, Warwickshire Short Stays)
**Total cost:** $0.0506

## What worked
- Playwright screenshots captured cleanly at all 3 viewport sizes for all 4 sites
- Claude Sonnet 4.5 generated high-quality case studies with proper formatting
- Unclaimed builds (A Good Catch, Bridge Growth) correctly marked with "Pending response" testimonial role
- Dedup by business name prevented Warwickshire Short Stays from appearing twice (hardcoded + generated)
- Static build passed clean with all new case study pages generated

## What to watch
- School of Skill redirects to `/camps/` — screenshots captured the redirected page, which is fine
- Screenshot files are large (2-4MB each at 2x scale) — consider optimizing with sharp if page weight becomes an issue
- The `KNOWN_SITES` array in `ingest.ts` is the primary source for new sites — needs manual addition per site
- Supabase upsert uses `storage_path` as conflict key, but generated entries set it to null — may need a different conflict strategy

## Cost breakdown
- Blurb generation: ~$0.001 per site (211-218 input tokens, 30-34 output tokens)
- Case study generation: ~$0.01 per site (1198-2559 input tokens, 336-384 output tokens)
- Total per site: ~$0.013
