# QA Summary — Business Modernisation positioning migration

Preview server: `npm run dev` on **http://localhost:3000** (port 3100 was in use by another repo, edgbaston-tuition-site — not reused).

## Build

- `npm run build` → clean, 135 static pages, zero errors/warnings. Log: `artifacts/positioning/build.log`.

## Browser QA (Playwright, headless Chromium)

Scripts: `/tmp/playwright-qa-positioning.js`, `/tmp/playwright-qa-positioning2.js`.
Supabase traffic was routed/stubbed during QA — no real reads or mutations.

### Structural sweep — all PASS

- Homepage @ 1440 / 1024 / 768 / 390 / 320: exact H1 (`We make good businesses more capable.` across three visual lines), supporting + benefits sentences, kicker, single H1, **no horizontal overflow at any width**.
- `/about`, `/pricing`, `/examples`, `/what-else-we-do`, `/howitworks`, `/sites`, `/ops`, `/ops/pricing` @ 1440 + 390: single H1, title + meta description present, canonical + og:url emitted, no horizontal overflow.
- One real defect found and fixed: `/howitworks` image containers used `aspect-[4/3]` + `min-h-[320/280px]`, forcing min-width ~427/373px and overflowing 390px viewports (pre-existing bug, not introduced by this migration). Reduced mobile `min-h` to 240px.
- Internal links on homepage: all resolve < 400.

### Interaction checks — 22/22 PASS (see `qa-interactions.log`)

- Chooser opens with labelled heading; Back resets to chooser; reopen resets state.
- Customers panel: "Get your free website preview" closes the native `<dialog>` *before* mounting the existing `MockupModal` (no nested dialogs); question 1 of 6 shows. Focus returns to the trigger after mockup close.
- Ops + Unsure panels: discovery links → `https://cal.com/sortmydigital/discovery`; no website-modal detour.
- Focus stays trapped inside the dialog across 30 Tab presses; Escape closes; trigger focus + body scroll restored.
- Mobile (390): menu CTA opens the chooser and the menu closes. Found and fixed a **pre-existing bug**: the menu closed by unmounting the CTA component, which destroyed its dialog; the menu now stays mounted-but-hidden so both `ImprovementButton` and the legacy `MockupButton` modals survive.
- `/pricing` market selector (`header select`): UK → £3,000 total / £1,500 deposit; US → $3,500 / $1,750; no GBP leak after switching.

## Screenshots

`home-desktop.png`, `home-mobile.png`, `dialog-choose.png`, `dialog-customers.png`, `dialog-ops.png`, `mockup-modal.png`, `capability-desktop.png`, `about-desktop.png`, `pricing-desktop.png`.

## Known residual contradictions (reported, not fixed — out of scope)

- `/v2` Ops subpages (`results-dashboard`, `industries/*`, `problems/*`, `case-studies/*`, `brand`) still present unverified metric/outcome claims (£8,400/mo recovered, hours returned, conversion %s). Left untouched per brief; they read as a ready-made-results catalogue alongside the new scoped-Ops positioning.
- `/v2` main page still contains "example results" metrics — labelled illustrative, but review whether they survive the no-unverified-outcomes bar.
- QA note: the first sweep run logged test-side selector failures (CSS `uppercase` text vs case-sensitive asserts, hidden desktop CTA matched before visible mobile one). All were test bugs, not app bugs; the corrected suite passes 22/22.
