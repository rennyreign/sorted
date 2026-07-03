# Iteration 001 — Tier A Electrician

## Brief

Test whether the current Sorted assembly system can produce a credible, conversion-ready website for an emergency/local electrician using the same manufacturing pipeline that produced the LRT Plumbing baseline.

The goal is to identify which patterns transfer cleanly from plumbing to electrical, and where the factory needs new assemblies, copy patterns, or configuration logic.

## Category

**Tier A — Emergency / Local Trades**

Business type: Domestic electrician (emergency repairs, rewiring, fuse boards, lighting, EV chargers, EICR certificates)

Similar to plumbing in urgency, phone-forward conversion, local trust, and service clarity. Different in safety signalling, certification emphasis, and slightly more technical service descriptions.

## Starting Point

- Existing LRT Plumbing composition: `operators/site-composer-operator/output/lrt-plumbing-v11/composition.json`
- Existing 10 approved assemblies in `sorted-skills/11-assembly-library/`
- Frontend builder assembly mode: `operators/frontend-builder/implementation/`
- QA operator: `operators/qa-operator/qa.js`

## Expected Transferable Pattern

The following plumbing patterns should transfer directly to electrical:

- Nav: logo + links + phone + CTA
- Hero utility split: text left, tradesperson image right, phone CTA
- Trust stat strip: 24/7, local coverage, fast response, certified/fair pricing
- 3 service cards: emergency repairs, installations, inspections
- 3-step process: call, diagnose, fix
- About split with credentials
- Featured testimonials
- Dark CTA band with phone/WhatsApp

## Required Category-Specific Changes

- Business name, phone, location, service copy
- Services: emergency electrical repairs, fuse board upgrades, lighting, EV chargers, EICR certificates
- Trust signals: NICEIC/Part P certification, safety, insurance, guarantees
- Photography: electrician in workwear, fuse boards, wiring, lighting, vans
- Accent color: consider amber/electric blue instead of plumbing red (test both)

## Generated Output

**Output directory:** `operators/site-composer-operator/output/tier-a-electrician-site-v1/`

**Composition:** `operators/site-composer-operator/output/tier-a-electrician-v1/composition.json`

**Screenshots:**
- Desktop: `/tmp/tier-a-electrician-v1-desktop.png`
- Mobile: `/tmp/tier-a-electrician-v1-mobile.png`

**Build status:**
- ✓ Assembly sync: 10 synced, 0 failed
- ✓ Wrapper sync: 10 regenerated
- ✓ Build passed

**QA score:** 9.2/10 (23/25 passed, HUMAN REVIEW REQUIRED)

## Professional Score

**Score:** 7 / 10

**Reasons:**
- Layout, spacing, and conversion structure transfer cleanly from plumbing.
- Phone-forward CTA, trust strip, process, services, and CTA are all present and coherent.
- Copy is category-appropriate (emergency repairs, fuse boards, EICR, EV chargers).
- **Major issue:** page title and meta description still say "LRT Plumbing Services" — the `sync-assemblies` command does not regenerate `app/page.tsx` metadata from the new composition.
- **Visual issue:** images are still plumbing photographs (copied from baseline), which undermines the electrical credibility of the site.
- QA warning: compressed density is appropriate for emergency trades but must be verified visually.

## Taste Score

**Score:** 6 / 10

**Reasons:**
- Amber accent (`#F59E0B`) is a reasonable electrical/energy choice and differentiates from the plumbing red.
- Section rhythm and typography are consistent with the baseline.
- **Major issue:** using a plumber in a van as the hero image for an electrician is a clear mismatch that breaks trust.
- Service cards show plumbing work instead of fuse boards, wiring, or EV chargers.
- The copy is competent but not yet distinctive to electrical safety/certification.
- Without category-specific photography, the site feels like a templated swap rather than a considered electrical brand.

## Manufacturability Score

**Score:** 7 / 10

**Reasons:**
- The composition → assembly → wrapper → build pipeline worked for a new category with only business-level changes.
- No new assemblies were needed; the existing 10 utility assemblies handled the layout.
- The process proved that the Tier A pattern (nav → hero → trust → process → services → proof → about → testimonials → CTA → footer) transfers across emergency trades.
- **Gap identified:** `sync-assemblies` must regenerate `app/page.tsx` metadata from the composition's `metadata` block.
- **Gap identified:** asset generation is currently detached from the composition. The factory needs a way to regenerate or replace assets when a new composition reuses a layout.
- **Gap identified:** the manifest/asset paths are currently hard to separate from the source composition. The factory should treat assets as a replaceable layer per iteration.

## Patch Notes

- **operators/frontend-builder/implementation/src/cli.ts / syncAssemblyWrappers:** extend wrapper regeneration to include `app/page.tsx` metadata from `composition.metadata` so the title and description update with the new composition.
- **operators/frontend-builder/implementation:** consider adding a `sync-metadata` subcommand or making metadata sync the default behaviour during `--sync-assemblies`.
- **Asset pipeline:** add a deterministic way to re-run asset generation for a new composition using existing asset IDs, or clearly mark placeholder images in iteration outputs.
- **Composition template:** add a `business_category` field and a `tier` field to make category-specific assembly selection more explicit.
- **QA operator:** add a check for metadata mismatch between composition and rendered HTML `<title>`.
- **Taste skills:** strengthen the rule that photography must match the business category; a reused layout with wrong-category images fails the taste test.

## Next Recommendation

Run **002 — Tier A Locksmith** next. Locksmith is another emergency/local trade with similar urgency but different trust signals (response time, non-destructive entry, police/DBS checks). This will confirm whether the transferable pattern holds across three similar categories and expose whether the copy/schema needs more category-specific fields.

Alternatively, fix the metadata-sync gap first, then re-run the electrician iteration to verify the patch before expanding to more categories.
