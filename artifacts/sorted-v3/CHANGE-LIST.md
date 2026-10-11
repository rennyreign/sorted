# Sorted V3 Website Pass — Change List

Local implementation of `artifacts/sorted-v3-brief.md`. Local only: no packages, no network, no deploy, no root-layout changes, no commits.

## Touched files

- `app/page.tsx` — full rewrite. Dark photographic hero (`/sorted-home/hero-image.png`, right-aligned, black left gradient), exact approved headline with lime Fave Script "look better." + underline, HTML/CSS browser frame showing real BodySharp Fitness screenshot with caption "Real work. A better first impression.", 4-cell proof strip, dark benefits band ("A great website isn't a luxury." / script "It's your first impression." + real Warwickshire Short Stays screenshot), 4-step commercial process (preview → £1,500 deposit → £1,500 balance at launch), portfolio cards (Warwickshire Short Stays, Palace Barn & Cottage, BodySharp Fitness — real `exampleCaseStudies` names/screenshots/routes), black pricing band with actual /pricing inclusions + deposit/balance + link to `/pricing#included`, verified `GoogleReviews`, lime final CTA "Your business grew up. Has your website?". Async `getGoogleReviews` integration and page-local metadata preserved; OpenGraph added.
- `app/what-else-we-do/page.tsx` — NEW route. Server page, page-local metadata, shared header (active "whatelse")/footer. Hero "A great website is just the beginning."; rebuilt HTML workspace preview using the real nav (Overview / Your New Site / Your Ads / Follow-up / Tracking) labelled "Illustrative workspace preview" with proposed/preview statuses only; dark iceberg band "The website is the bit you see." with original faceted blue iceberg SVG + waterline and HTML labels; six capability cards (3×2 desktop) with Included vs Optional-service status chips and plain-English scoping note; flow band "An enquiry isn't a customer. Yet." (Website → Ads → Tracking → Follow-ups → Customers); dark CTA "Start with the bit you can see."
- `app/sites/_components/SitesHeaderClient.tsx` — nav now: How it works, Examples, Pricing, What's included (`/pricing#included`), What else we do, About; six links shown at `lg`; added `tone` prop (`light` default, `dark` = white-on-transparent over dark hero, opaque white on scroll); mobile menu includes the new link with lime active state.
- `app/sites/_components/SitesPrimitives.tsx` — `SitesHeader` accepts `active` incl. "whatelse"/"included" + `tone`; `SitesFooter` brand line "Brilliant websites for good local businesses." + "What else we do" link; `FeatureBar` defaults now "Preview first / Fixed price £3,000 / Your decision / Content control / See it first. Then decide." (no timing promises, no "everything included"); `DarkCta` defaults "See it first. Then decide." / "Get your free mockup. No payment. No obligation."; removed now-unused lucide imports.
- `app/sites/_components/SitesMockupModal.tsx` — added Escape-to-close keydown handler (verification listed Escape close; none existed).
- `app/about/page.tsx` — hero now "Good at the job. / Your website should / show it." with constructive-confrontation intro (respect the work, call out the presentation gap, show improvement before payment); partner CTA replaced with "What else we do" link; wider-capabilities section links to `/what-else-we-do`; local-economy motivation, named person and history preserved.
- `app/howitworks/page.tsx` — removed "Nod Mockup System™" jargon and NOD badges; steps now mirror the real sequence (free homepage preview → approve + £1,500 deposit → finish + £1,500 balance); removed same-day/24hr and 48–72hr delivery claims and SEO/AEO/XEO buzzwords; inclusions match current pricing (support beyond handoff agreed separately); timing section retitled "A short process. Not a rushed website." with scope-confirmed timing.
- `app/pricing/page.tsx` — hero now "See the website." / script "Not a sales pitch." with "£3,000. Fixed." emphasis; `id="included"` on the inclusions section (supports `/pricing#included` nav link); "No extras menu" replaced with plain statement that ads/automations/integrations are agreed separately, linking to `/what-else-we-do`. Prices, deposit/balance and inclusions untouched.
- `app/examples/page.tsx` — hero "We don't sell. / We show."; claim that every mockup was bought replaced with "Some are live sites. Some are design previews. Look at the work, then decide what your business needs."; removed 24-hour CTA promise.
- `app/examples/[slug]/page.tsx` — removed unsourced testimonial quote block and stats band; "See the transformation." → "See the difference." with observable presentation improvements; project goal/solution/screenshots preserved.
- `app/website-updates/page.tsx` — removed "instantly"/"under a minute" and Decap jargon; describes save → rebuild → live; CMS panel labelled "Illustrative preview"; fake buttons now display-only `<span>`s.
- `app/partners/page.tsx` — "world-class" → concrete work description; 24hr mockup claims → agreed turnaround. Rates/workflow untouched.
- `app/v2/page.tsx` — "exactly how much you get back" / "exactly what they return" → measuring agreed outcomes; "No disruption" → rollout planned around your team.
- `app/v2/how-it-works/page.tsx` — hidden-value/"exactly" claims → evidence-based estimates; "launch without disruption" → rollout at an agreed pace.
- `app/v2/about/page.tsx` — "Closing one every month will" → "Useful improvements can compound. We measure each one before deciding what comes next."
- `app/v2/**/page.tsx` (17 files) + `app/v2/results-dashboard/ResultsDashboard.tsx` — page titles/labels "Sorted V2" → "Sorted Ops".

## Input references used

- `inputs/sortedv3-home/` + `inputs/sortedv3-whatelse/` (README, design-ir, mockup) — composition/section order only; all `reference-crops` treated as reference-only per pack READMEs.
- Departures from the reference IR, per brief: no 24-hour/"everything included" claims; no BuildSpark card (replaced by real Palace Barn & Cottage study); no fictional montage as proof; no 60-second video CTA (secondary links to /howitworks); no privacy/terms/cookies dead links added to footer; no guaranteed-outcome benefit wording.

## Exclusions (recorded, not rewritten)

Private proposals/agreements/client portals (`app/clients`, `app/proposals`, `/workspace`, partner portal internals), brand asset pages, operator dashboards, archived/experimental routes and all numerical model/dashboard/template data were left alone.

## Verification

- `node_modules/.bin/tsc --noEmit` — clean, 0 errors.
- `env -u GOOGLE_PLACES_API_KEY npm run build` — success, all 132 routes generated (`artifacts/sorted-v3/build.log`).
- Dev server: pre-existing `next dev` (Next.js 16.3.5) on this repo reused at http://localhost:3000 — left running.
- Browser QA (Playwright, external requests blocked): all 11 listed routes return 200; zero page errors; zero missing local assets; zero HTTP errors; no horizontal overflow on any route at 1440 and on the two new pages at 1440/1024/881/768/375/320.
- Interactions: nav active state "What else we do" on desktop + mobile; mobile menu opens/closes with all six links and correct active state; mockup modal opens on "Question 1 of 6"; Escape closes it (after fix); Tab keyboard focus reaches header controls; `/pricing/#included` scrolls to the inclusions section (top=96); reduced-motion context loads homepage cleanly.
- Found and fixed during QA: hero headline's `whitespace-nowrap` clipped ~59px at 320px (hidden by the hero's own overflow-hidden); removed so the phrase wraps. Re-measured — no clipping at 320/375. Also added Escape-to-close on the mockup modal (none existed).
- Console "Failed to load resource: ERR_FAILED" entries are the deliberately blocked external requests (googletagmanager.com, supabase.co, sortedstorage.s3.amazonaws.com) — expected under request blocking, not page defects. /examples and /ops/how-it-works show more of these because they load remote-hosted imagery/video.

## Remaining limitations

- Google reviews rendered via the existing fallback (GOOGLE_PLACES_API_KEY unset for build; dev server uses local env).
- Screenshots: `artifacts/sorted-v3/shot-*.png` (first-screen at 6 widths for / and /what-else-we-do; full-page 1440 for all routes; 375 full-page for the two new pages).
- Full diff of this pass: `artifacts/sorted-v3/full.diff`.

## Rework pass (post lead review)

- `app/page.tsx` — hero H1 now `clamp(3rem,5vw,4.5rem)` with explicit breaks after "Your competitors" and "aren't better." ("They just look better." third line); hero incl. nav measures 664px at 1440. Caption "Same trade. Different website." → "Made for the business."; process paragraph → "You see the direction before you pay. Then we finish the website at one fixed price."; section comments removed.
- `app/what-else-we-do/page.tsx` — script/annotation colours `#b8cf00`/`#a8bf00` → `#687800` for light-background text; analytics card copy replaced; iceberg SVG now decorative (`aria-hidden`) with HTML `<p>`/`<ul>` labels and accessible figcaption; section/SVG comments removed.
- `app/howitworks/page.tsx` — restored pre-existing `{/* NOD badges between cards */}`; inclusions now "Edit your own content" + "Quality checked before launch"; `whitespace-nowrap` dropped from the three paired headings (no overflow at 375/320).
- `app/examples/BeforeAfterVideo.tsx` + `app/examples/[slug]/page.tsx` — `aria-label="School of Skill example website walkthrough"`; section eyebrow "Example walkthrough", H2 "See how we show the work.", copy clarifies screenshots show the case-study business. `[slug]` H1 min size 3.35rem→2.7rem (fixed 320px overflow from unbreakable "Warwickshire"); `/examples` underline `w-[330px] max-w-full` → `w-full max-w-[330px]` (fixed 320px grid overflow).
- Ops honest labels (no numeric/model changes): `app/v2/page.tsx` ResultsBand "What we measure." + example-figures copy; `app/v2/results/page.tsx` "Example reporting figures" + hardcoded-figures note, hero "The work. / And how we measure it."; `app/v2/results/ResultsGrid.tsx` draft-reporting intro; `app/v2/results/_components/TemplatedResultPage.tsx` "Project example — draft reporting" badge; glow-dental results/case-study/reviews + `app/v2/industries/dental-practices/page.tsx` "Illustrative example. Figures and quoted feedback are not verified client results." + illustrative metadata; `app/v2/results-dashboard/ResultsDashboard.tsx` "Example dashboard. Hardcoded demonstration figures..." badge. Reviews impact grid `grid-cols-2 sm:grid-cols-4` (fixed 427px min-content at 320).
- `AGENTS.md` — new scoped section "Public Marketing Design & Voice (V3)": V3 palette/voice apply to public marketing only, internal dashboards stay monochrome, no false inclusion/performance/timing claims.
- `.devin/session-logs/.skip` never existed in this handoff — nothing removed; session summaries preserved.

### Rework verification

- `tsc --noEmit` — exit 0 (`artifacts/sorted-v3/tsc.log`).
- Playwright rework QA — script `artifacts/sorted-v3/playwright-rework.js`, raw log `artifacts/sorted-v3/qa-rework.log` (exit 0): zero page errors; no horizontal overflow on /, /what-else-we-do, /about, /howitworks, /pricing, /examples, /examples/[slug], /website-updates, /partners at 375 and 320; hero 664px at 1440; iceberg labels inside SVG bounds; honest labels confirmed on all eight ops surfaces; mobile nav active state, mockup Escape close, `/pricing#included` anchor (top=96) all pass.
- New screenshots: shot-home/what_else 1440 first+full, 375/320 first+full, ops surfaces at 1440.
- Diffs: `artifacts/sorted-v3/full.diff` (consolidated, 2064 lines) and `artifacts/sorted-v3/rework.diff` (rework-only vs first-pass state reconstructed from the pass-1 production build's source maps, 529 lines).

## Final correction (lead review 2)

- `app/what-else-we-do/page.tsx` — iceberg "Website" label moved `top-[14%]`→`top-[25%]` + `text-[13px]` (was half-unreadable black-on-black at the apex); below-water `<ul>` now `top-[40%] bottom-[5%] flex justify-between leading-none` so all five labels stay inside the drawing at 320 without shrinking fonts.
- Verification upgraded: `artifacts/sorted-v3/playwright-final.js` uses real `node:assert` assertions (response.ok, no local >=400/request failures, no pageerrors, local images complete+naturalWidth>0 after lazy-load scroll, scrollWidth<=clientWidth at all required viewports, iceberg label geometry vs waterline/svg bounds at 1440/375/320, label regexes against lowercase body text + visible locators, modal Escape, menu open/close + active state, `#included` anchor in viewport); external requests and all write methods blocked. Raw log `artifacts/sorted-v3/qa-final.log` → `ALL ASSERTIONS PASSED`, exit 0. `tsc.log` exit 0.
