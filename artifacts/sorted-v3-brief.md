# Sorted V3 Public Website Brief

## Approval And Scope

Renaldo approved the new /what-else-we-do route and supplied public marketing palette on 11 October 2026: merge the new and existing directions using judgement. Implement locally only. No packages, network access, deployment changes, root layout edits, commits or pushes. Preserve the dirty worktree, especially workspace, operators and manufacturing files. Pace writes to at most five files per minute.

Runtime state: existing local servers may be running; discover and reuse the Sorted server if appropriate, otherwise start a distinct unused port. Leave the final preview server running and report its URL.

Read the frontend design implementation instructions at /Users/renaldoedmondson/.agents/skills/frontend-design/implementation.md. Use existing Next/React/Tailwind/Lucide/sharp dependencies. Next docs are under node_modules/next/dist/docs/01-app; read page.md and use-client.md before implementation.

## Source And Direction

Read doctrine/sorted-brand-voice.md and both packs in inputs/sortedv3-home and inputs/sortedv3-whatelse (README, design-ir, approved-mockup). Original inputs must remain untouched.

The approved blend is:
- New screenshot composition and section order, existing local fonts and lime identity, existing working mockup request flow.
- Black/white/warm-neutral with lime #D7FF00 on the two new pages; retain existing lime on supporting pages rather than churn every colour literal.
- Use the existing heavy sans treatment, Fave Script for deliberate headline emphasis and Sans Andreas for compact handwritten annotations. No new fonts or package downloads.
- Desktop max width 1220px, strong editorial headings and generous whitespace. Mobile stack deliberately; no clipping, overlap or tiny type.
- Public marketing only; do not impose provocation on internal tools or private client work.

## Homepage /

Replace app/page.tsx, preserving its async review integration and page-local metadata.

1. Navigation: shared SitesHeader, add a dark-at-top variant for the dark hero, with opaque readable light state on scroll. Keep a readable mobile menu, one consistent primary mockup CTA, and real existing destinations.
2. Hero: exact headline "Your competitors aren't better. They just look better." White heavy type, final phrase lime Fave Script with underline. Eyebrow "Websites for local businesses". Body "And that's a problem. Customers judge what they see before they experience what you do." CTA "Get your free mockup", support "No payment. No obligation."
3. Use /sorted-home/hero-image.png as existing local-business photographic backdrop, right aligned with a strong black left gradient. It shows a business owner, not a trades workshop; do not pretend to match missing photography. Overlay a clean HTML/CSS laptop/browser showing an existing real website screenshot (BodySharp or Warwickshire) with accessible caption "Real work. A better first impression." Do not reuse the montage of fictional websites as proof.
4. Four-cell proof strip: "Preview first / See the design before you pay"; "Fixed price / One complete website. GBP 3,000"; "Your decision / No payment. No obligation."; "Content control / Edit your words and images." Render currency normally as the existing site does.
5. Dark benefits band: "A great website isn't a luxury." with script "It's your first impression." Body "Your work has standards. Your website should show them." Three benefits: look good (make genuine quality visible), get enquiries (clear contact and booking routes), turn them into customers (remove friction; follow-ups separately scoped). CTA to /howitworks. Replace missing van photo with existing suitable business photo or real screenshot, not a reference crop.
6. Process: compact intro plus four steps matching the manifest. Explicit commercial sequence: tell us about the business; see a free tailored homepage preview; approve direction and GBP 1,500 deposit; finish the build and GBP 1,500 balance when ready to launch.
7. Portfolio: three cards using actual exampleCaseStudies names, screenshots and routes: Warwickshire Short Stays, Palace Barn & Cottage, BodySharp Fitness. Heading "Good businesses. Better websites." No fabricated BuildSpark client or quantified results.
8. Pricing: black three-column band "One complete website. One fixed price." GBP 3,000. Only current /pricing inclusions: strategy, design, copy, development, content management system, analytics, launch. Show deposit/balance terms. Do not add unlimited hosting, free domains or 30-day support merely because the reference says so. Link to /pricing#included.
9. Testimonials: use getGoogleReviews / existing GoogleReviews, retaining exact sourced quotes and linked attribution. Adapt composition to new page without inventing a third review. If local network is not approved, verification should unset GOOGLE_PLACES_API_KEY to use the existing verified fallback.
10. Lime final CTA "Your business grew up. Has your website?" with "See a better direction before you decide. No payment. No obligation." No hard 24-hour delivery promise.
11. Shared footer; add What else we do.
12. Page metadata and OpenGraph describe the new positioning; no root-layout changes.

## What Else We Do /what-else-we-do

New server page with page-local metadata, shared header/footer and exact section order from supplied IR.

1. Hero "A great website is just the beginning." Intro "Your website makes you look good. The rest helps you get found, handle enquiries and turn them into customers." Supporting "A good first impression only gets you so far. Slow replies, forgotten quotes and awkward bookings can still get in the way." Primary mockup CTA; secondary /howitworks link labelled "See how it works" (no nonexistent 60-second video).
2. Right hero illustration: rebuild a simplified acquisition workspace with actual navigation Overview / Your New Site / Your Ads / Follow-up / Tracking and clearly labelled "Illustrative workspace preview". Use statuses such as "Website preview", "Proposed ads", "Follow-up plan", "Tracking not connected". No fake live numbers, page/blog editors, or features not in actual workspace.
3. Dark iceberg band: "The website is the bit you see." Supporting "Underneath are the ways people find you, get a reply and become customers. We start with the website, then tackle the gap that matters next." Build a simple original faceted blue iceberg SVG with waterline, actual HTML labels website above and advertising/tracking/follow-ups/CRM & bookings/automation below. This schematic is an allowed SVG use. Benefits visibility/enquiries/customers/control with cautious useful wording, no guarantees.
4. Six capability cards, preserve 3x2 layout at desktop and compact HTML illustrations. Section label "The website, and what can come next", heading "Look good. Get enquiries. Don't leave them hanging."
   - Custom website design: "Included in the website" / real design and build.
   - Content management: "Included in the website" / everyday content editing through SortedUpdates after handoff.
   - Analytics & tracking: "Website analytics included" / what is configured and observable; integrations agreed to suit the enquiry path.
   - Ad creatives: "Optional service" / separately scoped creative; ad spend and publishing not automatically included.
   - Follow-up automations: "Optional service" / plan and connect an agreed sequence; preview does not send emails.
   - Bookings & CRM: "Optional service" / agree and implement integrations; no claim of an automatically connected system.
   Prominent plain statement: "The GBP 3,000 price covers the website package. Advertising, follow-up automation and CRM or booking integrations are scoped separately. A workspace preview is not a live campaign or connected system."
5. Flow band "An enquiry isn't a customer. Yet." Website -> Ads -> Tracking -> Follow-ups -> Customers with short role descriptions. Explain this is a possible connected journey, not all included or all already active.
6. Dark CTA "Start with the bit you can see." / free mockup / no payment, no obligation / wider services agreed separately.
7. Footer. No new unrelated routes for legal pages. Do not create dead links or pretend missing privacy/terms pages are live.

## Shared Components

Keep SitesPage compatible with every existing consumer. Add optional header tone prop with default light and ActivePage "whatelse", propagate through SitesPrimitives.
Use lg or wider breakpoint for full navigation to fit six links; mobile menu includes new page with correct active state.
Header labels: How it works, Examples, Pricing, What's included (/pricing#included), What else we do, About. Existing /website-updates remains discoverable through footer and inclusion content.
Footer brand line "Brilliant websites for good local businesses." Include direct email/WhatsApp, real navigation and corporate identity. Do not invent socials/legal documents.
FeatureBar and DarkCta defaults must stop hard timing promises and ambiguous "everything included". Use "See it first. Then decide." / free mockup / no obligation. Limit changes to these actual shared seams.

## Supporting Copy Changes Settled By Lead Audit

Apply focused copy-only changes, preserving layouts and business facts:
- /about: replace abstract economic-infrastructure hero with "Good at the job. / Your website should / show it." Keep the genuine local-economy motivation farther down, introduce constructive confrontation in the intro: respect the work, call out the presentation gap, show improvement before asking for payment. Link wider capabilities to new page. Preserve named persons and history.
- /howitworks: remove "Nod Mockup System" jargon from customer intro. Explain a free homepage preview, not the entire completed site for free. Replace 48-72-hour delivery, guaranteed rankings and SEO/AEO/XEO buzzwords with plain scope and agreed timing. Process follows current /pricing deposit/balance; remove misleading NOD badges rather than invent a new operating model. Includes matches current pricing; support beyond handoff agreed separately. Timing section says "A short process. Not a rushed website." and explains timing confirmed after reviewing scope.
- /pricing: hero "See the website. / Not a sales pitch." and "GBP 3,000. Fixed." emphasis. Keep prices, deposit/balance, inclusions intact. Change "No extras menu" to explain optional services agreed separately, add id="included" to inclusions section. Add short link to /what-else-we-do, explicitly separate ads/automations/integrations from the website fee.
- /examples: "We don't sell. / We show." Replace the claim every displayed mockup was bought with "Some are live sites. Some are design previews. Look at the work, then decide what your business needs." Remove hard 24-hour CTA promises.
- /examples/[slug]: preserve project goals/screenshots; replace vague "transformation" copy with observable presentation improvements. Existing case-study quotes/stats have no provenance in their data file; do not promote them to verified proof. Remove unsourced quote blocks and timing/performance statistics from these pages; show actual supplied website/design details instead. Verified Google reviews remain on homepage. Do not edit client statements into a sharper voice.
- /website-updates: explain content control in calm plain English. Remove "instantly"/"under a minute" publish guarantees and Decap technical jargon. Describe saving -> site rebuild -> live after publish. No fake working buttons in illustrative CMS; label preview clearly and render display-only controls as noninteractive text. Do not claim page addition/reordering is implemented.
- /partners public landing: replace "world-class" with concrete work; replace hard turnaround claim with agreed turnaround, keep financial rates and partner workflow untouched. No private partner portal changes.
- /ops uses app/v2 implementation. Keep its useful sharper operational voice, layouts, diagnostic CTAs and commercial structure. In app/v2/page.tsx replace guaranteed "No disruption" with planned rollout, "exactly how much" with measuring agreed outcomes. In app/v2/about/page.tsx soften "Closing one every month will [transform]" to "Useful improvements can compound. We measure each one before deciding what comes next." In app/v2/how-it-works/page.tsx replace exact hidden-value claims and zero-disruption promises with evidence-based estimates and agreed rollout. Page titles currently "Sorted V2" should read "Sorted Ops" on public informational pages. Do not rewrite or alter numeric model/dashboard/template data.
- Leave private proposals/agreements/client portals, brand asset pages, operator dashboards, archived/experimental routes and numerical data alone. Record these exclusions rather than claiming a total rewrite.

## Evidence And Verification

Save focused change list and local QA artifacts to artifacts/sorted-v3/; input references and actual departures must be recorded, not scored. Do not author an eval rubric or numerical grading framework.

1. Existing compiler: run node_modules/.bin/tsc --noEmit and report baseline/unrelated failures separately.
2. One final production build via the existing package command, with GOOGLE_PLACES_API_KEY unset; do not install dependencies or fetch assets. If external runtime fetches prevent build, report exact blocker rather than authorising network.
3. Browser checks on /, /what-else-we-do, /about, /howitworks, /pricing, /examples, /website-updates, /partners, /ops, /ops/about, /ops/how-it-works. Block external requests and all live submissions. Capture console errors, missing local assets, horizontal overflow and HTTP errors.
4. New pages at 1440, 768, 375, 320 and reference widths 881/1024. Save full screenshots plus desktop and mobile first-screen screenshots; wait for fonts and images boundedly.
5. Test nav active state, mobile open/close, new route links, /pricing#included anchor, first mockup question, Escape close, keyboard focus and reduced motion. Do not submit Supabase leads.
6. Return exact touched-file list, full diff path, build/typecheck/browser logs, screenshot paths, local URL and any remaining limitations. No commit.
