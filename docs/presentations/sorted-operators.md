# Sorted Operators — Meeting Deck

Browser deck: `/ops/infrastructure/presentation` (noindexed). Landing page: `/ops/infrastructure`.

## How to open and control

- Local: open `http://localhost:3001/ops/infrastructure/presentation` with the dev server running.
- Production `https://sortmydigital.site/ops/infrastructure/presentation` is pending deployment —
  these routes are not live yet.
- Navigate: `←` / `→` (also `↑`/`↓`, `PageUp`/`PageDown`), `Home` / `End` for first/last slide,
  the numbered buttons in the control bar, or Back / Next.
- Keyboard shortcuts are ignored while typing in editable fields and when modifier keys are held.
- "Print / Save PDF" calls `window.print()`. "Download PDF" fetches the pre-generated
  `public/presentations/sorted-operators.pdf`. "Exit" returns to the landing page.

## Talk track (per slide)

1. **More capacity. Less overhead.** — Sorted builds the AI-powered infrastructure the business
   doesn't have time to build, one operational improvement at a time.
2. **The capacity problem** — The team runs the business; repetitive work consumes the time; the
   infrastructure that would help becomes another queued project. Sorted supplies the external
   building function.
3. **Agents assist the workflow. Operators take on the job.** — An agent speeds up a task while a person still drives the
   process. An operator takes responsibility for a defined result within agreed rules. This is
   how we scope operators, not a universal industry taxonomy. The comparison is conceptual — no
   timing, staffing or cost outcomes implied.
4. **Scoped responsibility** — Input, permitted actions, required output, exception path. Routine
   execution doesn't need supervision of every step; approvals stay where the business needs them.
5. **A practical first build** — One expensive handoff (illustrative lead-handling example, not a
   client result). Success is measured against an agreed baseline: manual effort, response time,
   exception rate.
6. **Check the campaign before it spends** — Illustrative ecommerce readiness operator (scoped,
   read-only across advertising and store systems; not a real integration or client result). It
   checks the offer against price, stock, links and campaign tags so budget is not spent on
   mismatched or unavailable offers. Output is a defined launch-readiness report; people resolve
   exceptions and approve release. No metrics guaranteed.
7. **The method** — Map the workflow, agree output and permissions, test with approvals and
   monitoring, compare with the baseline. No predefined savings claim; success is agreed before
   building.
8. **Compounding value** — Each build reuses system connections and context. The value is a more
   capable business, not a higher agent count. Agents help design and improve; operators execute.
9. **The question** — Which workflow should no longer need your team to carry it? Next step: an
   Operational Blueprint plus a proposal for one bounded operator. Scope, acceptance criteria and
   costs agreed before development.

**Honesty line for meetings:** there are no published prices, guaranteed savings or fixed
timelines. Every claim on these slides is scoped, illustrative or baseline-measured.

## Regenerating the PDF

Prereq: run from the repo root (`/Users/renaldoedmondson/Projects/sorted`) so the output path
below lands in `public/presentations/`; dev server running on `localhost:3001`; global Playwright at
`/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs`
with Chromium in `~/Library/Caches/ms-playwright`.

```js
// /tmp/export-deck.mjs
import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
// Optional: silence external analytics while offline/testing.
await page.route('**analytics.google.com**', (r) => r.abort());
await page.route('**googletagmanager.com**', (r) => r.abort());
await page.goto('http://localhost:3001/ops/infrastructure/presentation', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: 'public/presentations/sorted-operators.pdf',
  preferCSSPageSize: true,
  printBackground: true,
});
await browser.close();
```

`@page` is set to `13.333in 7.5in` (16:9) with zero margins in
`app/ops/infrastructure/presentation/presentation.module.css`; print styles show all 9 slides,
one per page, and hide controls. Expected result: exactly 9 PDF pages.
