# Sorted Studio CMS Skill

Use this skill when installing, upgrading, QAing, or repairing SortedUpdates CMS on a client site.

Primary doctrine: `doctrine/sorted-studio-cms.md`

## Operating Standard

Build the client CMS as Sorted Studio:

1. Keep Decap as backend infrastructure.
2. Put the client-facing Studio at `/cms/`.
3. Move stock Decap to `/cms/decap.html` as a Sorted fallback.
4. Do not link to Decap from the Studio UI.
5. Expose existing content fields only; do not expose structure changes unless fully implemented.
6. Use a manifest-driven editor: pages → sections → fields → JSON file → preview path.
7. Use local Decap proxy saves during development; avoid deploy-triggering writes for runtime editing.

## Required Files

- `public/cms/index.html`
- `public/cms/decap.html`
- `public/cms/studio.css`
- `public/cms/studio.js`
- `public/cms/studio-manifest.json`
- `public/cms/studio-content.json`
- `scripts/build-studio-content.mjs`
- `public/cms/config.yml`

## UX Rules

- The UI must be clean and purposeful.
- Show only real client workflows.
- Remove placeholder links, dead nav, switches, add-section controls, reorder controls, gears, and drag handles unless implemented.
- Existing list content should be editable inline.
- Section icons are encouraged when they improve scanning.
- Use the Sorted wordmark with fluorescent green dot.

## QA Loop

Run a complete QA loop before closing:

- Visit every page tab and every section.
- Confirm each section has editable fields.
- Confirm no Studio link points to `/cms/decap.html`.
- Confirm at least one nested list edit can preview, save, and restore.
- Confirm `Save draft` writes JSON through `npm run cms`.
- Confirm `npm run build` passes.
- Confirm focused CMS Playwright smoke tests pass.
- Confirm desktop/mobile layout has no horizontal overflow.

If any control has no purpose, need, and use case, remove it.
