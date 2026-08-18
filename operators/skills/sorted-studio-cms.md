# Sorted Studio CMS Skill

Use this skill when installing, upgrading, QAing, or repairing SortedUpdates CMS on a client site.

Primary doctrine: `doctrine/sorted-studio-cms.md`  
Installation workflow: `.devin/workflows/add-decap-cms.md`  
Reference implementation: `warwickshire-str` — study `public/cms/`, `lib/content.ts`, `content/` before starting

## Operating Standard

Build the client CMS as Sorted Studio:

1. Keep Decap as backend infrastructure.
2. Put the client-facing Studio at `/cms/`.
3. Move stock Decap to `/cms/decap.html` as a Sorted fallback.
4. Do not link to Decap from the Studio UI.
5. Expose existing content fields only; do not expose structure changes unless fully implemented.
6. Use a manifest-driven editor: pages → sections → fields → JSON file → preview path.
7. Use local Decap proxy saves during development; Git Gateway publishing in production.

## Required Files

- `public/cms/index.html` — three-column Studio shell with auth overlay, topbar, workspace, status bar
- `public/cms/decap.html` — stock Decap fallback
- `public/cms/studio.css` — Studio design system (warm off-white, fluorescent green accent, Inter font)
- `public/cms/studio.js` — Studio adapter (dual-mode save, manifest rendering, property editor, preview)
- `public/cms/studio-manifest.json` — page/section/field map (single source of truth for the UI)
- `public/cms/studio-content.json` — generated snapshot for static fallback
- `public/cms/config.yml` — Decap backend configuration
- `public/cms/tutorial.json` — walkthrough video URL and helper text
- `scripts/build-studio-content.mjs` — snapshot generator (runs in `npm run build`)
- `lib/content.ts` — TypeScript types and disk-reading loaders

## Studio Layout

The Studio is a three-column single-page app:

- **Left (300px):** Pages nav | page tabs | section list with icons and summaries
- **Middle (460px):** Editor form with grouped fields (Content, Buttons, Media, Brand, etc.)
- **Right (min 520px):** Live preview iframe with desktop/mobile toggle and refresh

Top bar shows: Sorted wordmark (black + green dot) | site initial mark | site name | status dot | preview toggles | save/publish button.

Status bar shows: save status (success/warn/error) | mode-aware publish note.

Auth overlay (production only): full-screen card with site initial mark, site name, sign-in button. Hidden on localhost.

## Field Types

The manifest supports these field types:

| Type | Behaviour |
|------|-----------|
| `text` | Single-line input |
| `textarea` | Multi-line input, vertical resize |
| `image` | Media field: thumbnail + path input + upload button |
| `color` | Colour picker input |
| `number` | Numeric input |
| `list` | Inline card list with `summaryFields` for collapsed preview; add/remove items |
| `property-list` | Full property editor: collapsible cards with nested fields (gallery, amenities, highlights, reviews, Tokeet IDs) |

Fields are grouped by their `group` property for visual organisation. Common groups: Content, Buttons, Media, Brand, Contact, Integrations, Links, Forms.

## Dual-Mode Save

Studio detects the environment automatically:

**Local mode** (`localhost`, `127.0.0.1`):
- Save button reads "Save draft"
- Saves via `POST http://localhost:8081/api/v1` (`persistEntry`) to local content files
- No Git commits, no Netlify deploys
- Auth overlay hidden

**Production mode** (any other hostname):
- Save button reads "Publish"
- Saves via Git Gateway: `GET` file SHA → `PUT` new content with Netlify Identity JWT
- Triggers Netlify deploy (expected and desired)
- Auth overlay shows until Netlify Identity login completes
- Image uploads: file → base64 → Git Gateway PUT to `public/uploads/`

Toast notifications provide immediate feedback for all save/publish operations.

## UX Rules

- The UI must be clean and purposeful.
- Show only real client workflows.
- Remove placeholder links, dead nav, switches, add-section controls, reorder controls, gears, and drag handles unless implemented.
- Existing list content should be editable inline with summary field previews.
- Property cards are collapsible — collapsed shows name + location, expanded shows all nested fields.
- Section icons are encouraged when they improve scanning.
- Use the Sorted wordmark with fluorescent green dot (`#cfe900`).
- Field groups improve scannability — group related fields under labelled headings.
- The auth overlay must show the client's site identity (initial mark + name), not a generic login.

## QA Loop

Run a complete QA loop before closing:

**Layout:**
- Visit `/cms/` — three-column layout loads with Sorted wordmark + green dot
- Auth overlay appears on production, hidden on localhost
- Site initial mark and site name appear in topbar
- No links to `/cms/decap.html` in the Studio UI

**Navigation:**
- Click every page tab — each shows its sections
- Click every section — each opens an editor with at least one editable control
- Fields are grouped logically (Content, Buttons, Media, etc.)

**Editing:**
- Edit a text field — preview updates or limitation is stated
- Edit a list field — inline cards show summary previews, add/remove works
- If property-list exists: collapse/expand cards, edit nested fields (gallery, amenities, reviews), add/remove properties
- Upload an image — thumbnail updates, path populates

**Save:**
- Local: "Save draft" writes JSON through `npm run cms` — verify file changed on disk
- Production: "Publish" commits to Git via Git Gateway — verify commit appears in repo
- Toast notification appears on success or failure
- Test edits are restored before commit

**Build:**
- `npm run build` passes and regenerates `studio-content.json`
- Focused CMS Playwright smoke tests pass
- Desktop and mobile layouts have no horizontal overflow

If any control has no purpose, need, and use case, remove it.

## Fleet Upgrade Command

Use the Sorted repo upgrade script for repeatable rollouts:

```bash
npm run studio:upgrade -- --target ../client-repo --slug client-slug
```

Default behavior:
- Copies shared Studio shell files (`index.html`, `studio.css`, `studio.js`, `decap.html`, `build-studio-content.mjs`)
- Preserves `public/cms/studio-manifest.json`
- Preserves all client content
- Patches `package.json` build and cms scripts
- Records the applied Studio version in `package.json`

Always branch before running it in a client repo.
