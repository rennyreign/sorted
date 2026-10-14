# Rework QA Summary — second pass

Preview server: **http://localhost:3000** (`npm run dev`, left running). All checks headless Chromium, Supabase traffic stubbed/aborted — no real reads or mutations.

## Critical fix: dialog/modal visibility inside mounted-but-hidden mobile menu

**Pre-fix reproduction:** the native chooser `<dialog>` rendered inside the hidden menu container resolved to `open` but **invisible** — an element inside a `display:none` subtree cannot paint even in the top layer. Same for the plain-div `MockupModal`.

**Fix:** both the chooser `<dialog>` and `MockupModal` now render through `createPortal` into `document.querySelector(".sorted-sites-shell") ?? document.body` — escaping the hidden ancestor while keeping the marketing font variables (portal target is the `<main class="sorted-sites-shell">` that carries `--font-sites-*`).

## Interaction evidence (post-fix, `qa-rework.log` + focused reruns)

- **P1 home @390**: menu → CTA → Winning customers → website preview → mockup **visible** (390×844 box), question 1 shown, answering "Local service business" advances to Q2; scroll locked during preview, restored on Escape; focus returns to hamburger.
- **P2 /pricing @390** and **P3 /sites @390**: menu → direct website CTA → mockup visible; close/Escape → hamburger focus + scroll restored.
- **Desktop handoff**: chooser → preview keeps `body overflow:hidden` through the handoff (no double-lock flicker), restored after mockup close, focus back on the ImprovementButton trigger; Escape/Back/reopen reset confirmed.
- Deterministic handoff via `openingMockupRef` — the chooser's `close` handler skips scroll/focus restore exactly once when handing off to the mockup.
- `returnFocusRef` prop added to `ImprovementButton` + `MockupButton`; mobile menu CTAs return focus to the hamburger button.

## Overflow/clipping fixes

| Page | Issue | Fix |
|---|---|---|
| `/howitworks` | `aspect-[4/3]` + `min-h` forced 427px min-width (pre-existing) | `min-h-[200px]` base |
| `/sites` | reviews card + `whitespace-nowrap` MockupButton stretched single-col grid | `min-w-0` columns, `w-full sm:w-auto sm:whitespace-nowrap` button |
| `/sites` | GoogleReviews pill anchor 282px min-content | `max-sm:flex-wrap max-sm:w-full` |
| `/ops` FinalCta | `w-[340px]` underline + `sm:flex-row` buttons stretched band → clipped text | `w-full max-w-[340px]`, `sm:flex-row md:flex-col`, footer button `max-sm:` shrink |
| `CtaBand` (v2) | `w-72` underline + `[1fr_auto]` buttons clipped at 320/768 | `w-full max-w-72`, `lg:grid-cols-[1fr_auto]` |

`/examples` flagged images live inside the intentional horizontal scroll rail (`overflow-x-auto`) — expected, not clipped permanently.

## Verified after fixes

- `/sites` @1440/390/320 no overflow; accessible H1 = `Your competitors aren't better. They just look better.` (script span inside the `<h1>`).
- No non-scroll-container clipping at 320/768 on `/`, `/about`, `/pricing`, `/what-else-we-do`, `/howitworks`, `/sites`, `/ops`, `/ops/pricing`.
- OG exact: `/about` og:title/url + description; `/sites` og:title/url + description.
- `npx tsc --noEmit` clean. `npm run build` was **not** re-run per lead instruction (build.log from previous pass stands; only CSS-class/JSX/copy changes since).
- Screenshots refreshed with scroll-through lazy-load, zero broken image URLs: `home-desktop.png`, `home-mobile.png`, `sites-desktop.png`, `mobile-preview-from-menu.png`, `dialog-*.png`, `mockup-modal.png`, `capability-desktop.png`, `about-desktop.png`, `pricing-desktop.png`.

## Other rework items

- Copy: growth body, portfolio intro, About mission (aspirational framing), CustomersPanel Sites-inclusion clarification — all applied verbatim.
- Font sizes: `heroKicker` 11→12px, footer supporting line 11→12px, About mission kicker 11→12px.
- Ops: `RoutineFinderButton` default + all visible labels → "Explore a possible improvement"; disclaimer → "A starting point for discussion, not a confirmed solution or quote."; V2Header/CtaBand/V2Footer/local v2 footer primary → `BookDiscoveryButton`, questionnaire secondary.
- brand-voice §8 restored to "Copy architecture for Sorted Sites".
- Focus ring added to shared `buttonClass` base (all marketing CTAs).

## Known residual limitation (reported, not fixed)

- `/v2` untouched subpages still carry unverified metrics (£/hr/% claims) and use `RoutineFinderButton` default styling — now benefit from the new default label but not individually reviewed. Flagged previously; deeper Ops cleanup is a follow-up.
