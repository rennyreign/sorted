# Iteration 002 — Tier A Locksmith

## Brief

Test whether the Sorted assembly system can produce a credible, conversion-ready website for an emergency/local locksmith using the same manufacturing pipeline that produced the LRT Plumbing and Bright Spark Electrical baselines.

The goal is to confirm the Tier A emergency-trades pattern transfers across three categories, and to identify whether the trust signals need to change more dramatically between plumbing, electrical, and locksmith services.

## Category

**Tier A — Emergency / Local Trades**

Business type: Emergency locksmith (lockouts, lock repairs, key cutting, security upgrades, UPVC door locks, commercial locks)

Similar to plumbing and electrical in urgency, phone-forward conversion, local trust, and 24/7 availability. Different in security trust signals, speed-of-response emphasis, and non-destructive entry messaging.

## Starting Point

- Existing LRT Plumbing composition: `operators/site-composer-operator/output/lrt-plumbing-v11/composition.json`
- Existing Bright Spark Electrical iteration: `.devin/assembly-library-iterations/001-tier-a-electrician.md`
- Existing 10 approved assemblies in `sorted-skills/11-assembly-library/`
- Frontend builder assembly mode: `operators/frontend-builder/implementation/`
- QA operator: `operators/qa-operator/qa.js`

## Expected Transferable Pattern

The following emergency-trade patterns should transfer directly to locksmith:

- Nav: logo + links + phone + CTA
- Hero utility split: text left, tradesperson image right, phone CTA
- Trust stat strip: 24/7, local coverage, fast response, certified/insured
- 3 service cards: emergency lockouts, lock repairs, security upgrades
- 3-step process: call, arrive, fix
- About split with credentials
- Featured testimonials
- Dark CTA band with phone/WhatsApp

## Required Category-Specific Changes

- Business name, phone, location, service copy
- Services: emergency lockouts, lock repairs, key cutting, security upgrades, UPVC/commercial locks
- Trust signals: fast response time, non-destructive entry, police/DBS checked, fully insured, local coverage
- Photography: locksmith in workwear, locks, keys, door hardware, vans
- Accent color: deep blue or steel grey (trust/security) instead of amber/red

## Generated Output

**Output directory:** `operators/site-composer-operator/output/tier-a-locksmith-site-v1/`

**Composition:** `operators/site-composer-operator/output/tier-a-locksmith-v1/composition.json`

**Screenshots:**
- Desktop: `/tmp/tier-a-locksmith-v1-desktop.png`
- Mobile: `/tmp/tier-a-locksmith-v1-mobile.png`

**Build status:**
- ✓ Assembly sync: 10 synced, 0 failed
- ✓ Wrapper sync: 10 regenerated
- ✓ Metadata sync: 1 file updated
- ✓ Build passed

**QA score:** 9.6/10 (24/25 passed, HUMAN REVIEW REQUIRED)

**Verified title:**
```html
<title>Keyguard Locksmiths | Emergency Locksmith in Warwickshire &amp; Coventry</title>
```

## Professional Score

**Score:** 8 / 10

**Reasons:**
- Layout and conversion structure transfer cleanly from plumbing → electrical → locksmith.
- Metadata sync patch works correctly on the third category without manual intervention.
- Phone-forward CTA, trust strip, process, services, about, and final CTA are coherent.
- Copy is category-appropriate (lockouts, lock repairs, security upgrades, DBS-checked).
- Trust strip successfully carries category-specific signals (24/7, fast response, DBS checked, local coverage).
- **Remaining issue:** images are still plumbing photographs (copied baseline), which undermines the locksmith credibility.
- QA warning: compressed density is appropriate for emergency trades but must be verified visually.

## Taste Score

**Score:** 6 / 10

**Reasons:**
- Deep blue accent (`#1E40AF`) is appropriate for security/trust and differentiates from plumbing red and electrical amber.
- Section rhythm and typography are consistent across all three emergency-trade iterations.
- **Major issue:** the hero image is a plumber in a van. For a locksmith, this is a clear category mismatch that breaks trust.
- The copy is competent but not yet distinctive to locksmith security/entry reassurance.
- Without category-specific photography, the site still feels like a templated swap.

## Manufacturability Score

**Score:** 8 / 10

**Reasons:**
- The composition → assembly → wrapper → build pipeline successfully produced a third category with only business-level changes.
- The metadata-sync patch proved robust across electrician and locksmith.
- No new assemblies were required; the 10 utility assemblies covered the structure.
- The stat-strip assembly successfully absorbed different category-specific trust signals (certified, DBS checked, response time) without structural changes.
- **Gap identified:** asset generation remains detached. The factory cannot yet produce a new category with correct photography without a full mockup/asset-generation pass.
- **Opportunity:** the trust strip could be made more configurable through the composition, with a clearer slot for 4 category-specific trust phrases.

## Patch Notes

- **Confirmed:** `syncPageMetadata()` works across multiple categories (electrician and locksmith) with no regressions.
- **Asset pipeline:** remains the highest-impact manufacturability gap. Consider adding a `regenerate-assets` step to the operator pipeline that accepts a composition and produces new images for the same asset IDs without requiring a full mockup.
- **Trust strip:** the stat-strip assembly is flexible enough for category-specific trust signals, but the composition schema should expose a clearer `trust_signals` array rather than generic stat/label pairs.
- **QA operator:** add a check that the rendered hero image subject matches the business category, or at least flag when asset descriptions differ from the actual image content.

## Next Recommendation

Move to **003 — Tier A HVAC** or **Tier A Roofing**. The emergency-trades pattern is now proven across three categories. The next iteration should focus on **asset pipeline integration** — run a category that requires a full mockup and asset generation, or build a deterministic asset-regeneration step that uses the composition's asset descriptions without a mockup.

Alternatively, if the immediate priority is factory stability, fix the asset gap before expanding to more categories.
