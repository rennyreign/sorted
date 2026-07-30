# Sorted V2 + Sorted Sites Handoff

Date: 2026-07-21

This note records where the two current experimental Sorted surfaces live, what source material they are based on, and the main implementation decisions to preserve.

## Sorted V2

Sorted V2 is the separate repositioned Sorted site focused on business modernisation, repetitive-work removal, operational diagnostics, and measurable capacity returned.

Primary route:

- `/v2`

Implementation files:

- `app/v2/page.tsx` — homepage
- `app/v2/_components/V2Primitives.tsx` — shared layout, header, footer, CTA bands, metric band, font loading
- `app/v2/_components/RoutineFinder.tsx` — "Start the diagnostic" modal/flow
- `app/v2/brand/page.tsx` — V2 design system page
- `app/v2/how-it-works/page.tsx`
- `app/v2/problems-we-solve/page.tsx`
- `app/v2/problems/we-lose-customers/page.tsx`
- `app/v2/problems/we-lose-customers/ProblemRoutineAccordion.tsx`
- `app/v2/results/page.tsx`
- `app/v2/results/ResultsGrid.tsx`
- `app/v2/results/glow-dental/page.tsx`
- `app/v2/reviews/glow-dental/page.tsx`
- `app/v2/case-studies/glow-dental/page.tsx`
- `app/v2/pricing/page.tsx`
- `app/v2/about/page.tsx`
- `app/v2/systems/enquiry-follow-up/page.tsx`
- `app/v2/industries/dental-practices/page.tsx`

Source planning and mockups:

- `plan/sortedRevised/sortedv2-copy.md`
- `plan/sortedRevised/sortedNewPages.md`
- `plan/sortedRevised/SiteChanges.md`
- `plan/sortedRevised/gpt-responsse.md`
- `plan/sortedRevised/pages/`

Assets:

- `public/v2/`
- Shared fonts in `public/fonts/`

Current design decisions:

- Keep this as a separate version from the active/root Sorted site.
- Do not overwrite the existing active site while iterating V2.
- Primary proposition: Sorted removes repetitive work so businesses get capacity back for the work that matters.
- Main CTA language is "Start the diagnostic"; secondary CTA can be "Book a discovery call".
- The homepage footer capture point should keep the "YOU ALREADY KNOW WHAT'S ANNOYING." direction with "Let's fix it." included.
- Uppercase marker/felt headings use `cc-ask-for-mercy.ttf`.
- Lowercase or mixed highlighter-style text uses the Sans Andreas font.
- Accent/highlighter color is the fluorescent Sorted green, currently `#dfff00`.
- Avoid generic AI-looking headings such as isolated all-caps page labels when they feel decorative rather than useful.
- Problem-detail routine lists should behave as accordions. The `we-lose-customers` page already has this functionality.
- The `we-lose-customers` hero image is the mockup reference image from `plan/sortedRevised/pages/lose-customers-bg.png`, copied into `public/v2/lose-customers-bg.png`.

## Sorted Sites

Sorted Sites is the separate sub-offer/site surface for website mockups and builds. It carries the Sorted V2 visual language with subtle offer-specific upgrades.

Primary route:

- `/sites`

Alias route:

- `/sorted-sites`

Implementation files:

- `app/sites/page.tsx` — homepage
- `app/sites/_components/SitesPrimitives.tsx` — shared layout, header, footer, logo, cards, font loading
- `app/sites/_components/SitesMockupModal.tsx` — "Get your free mockup" modal/flow
- `app/sites/examples/page.tsx`
- `app/sites/examples/the-yard/page.tsx`
- `app/sites/pricing/page.tsx`
- `app/sites/about/page.tsx`
- `app/sites/updates/page.tsx`

Alias files:

- `app/sorted-sites/page.tsx`
- `app/sorted-sites/examples/page.tsx`
- `app/sorted-sites/examples/the-yard/page.tsx`
- `app/sorted-sites/pricing/page.tsx`
- `app/sorted-sites/about/page.tsx`
- `app/sorted-sites/updates/page.tsx`

The alias files re-export the `/sites` pages. Make content and design changes in `app/sites`, then keep aliases as thin route wrappers.

Source planning and mockups:

- `plan/sortedRevised/sorted-sites/`

Assets:

- `public/sorted-sites/home-herobg.png`
- `public/sorted-sites/sorted-sites-logo.png`
- `public/sorted-sites/sorted-sites-logo-white.png`
- Shared fonts in `public/fonts/`

Current design decisions:

- Main homepage hero uses `home-herobg.png`.
- Header logo uses `sorted-sites-logo.png`.
- Footer logo uses `sorted-sites-logo-white.png`.
- The hero marker currently uses `Fave-ScriptPro.ttf` for the large "Sorted." word. A normal bold "Sorted." was tested and reverted because the previous scripted state looked stronger.
- Footer area follows the `home-bottom.png` mockup direction: dark section, testimonial panel, white capture strip, and Sorted Sites footer links.
- The modal should feel like the V2 diagnostic modal but ask website/mockup-specific questions.
- Sorted Sites remains separate from Sorted V2 and the current active site until repo structure is deliberately reorganised.

## Verification Notes

- Local dev server has been used at `http://localhost:3000`.
- `npm run build` compiles the Next app but currently fails later on an unrelated Supabase Deno type issue in `supabase/functions/resend-webhook/index.ts`:
  - `Cannot find name 'Deno'`
- Do not treat that Supabase failure as evidence that Sorted V2 or Sorted Sites pages failed to compile.

## Next Maintainer Guidance

- Preserve route separation:
  - Sorted V2: `app/v2`
  - Sorted Sites: `app/sites`
  - Sorted Sites alias: `app/sorted-sites`
- Use the mockups in `plan/sortedRevised/pages/` and `plan/sortedRevised/sorted-sites/` as the visual source of truth.
- When testing visual work, use Playwright screenshots on desktop and mobile and check for horizontal overflow.
- Keep edits scoped. The active/root site should not be overwritten while these versions are still being developed.
