# Sorted Studio Template

Canonical client-facing CMS shell for SortedUpdates.

**Current version:** `0.4.0`  
**Reference implementation:** `warwickshire-str`

## What's in this template

| File | Purpose |
|------|---------|
| `public/cms/index.html` | Three-column Studio shell with auth overlay, topbar, workspace, status bar |
| `public/cms/studio.css` | Studio design system — warm off-white, fluorescent green accent, Inter font, responsive three-column grid |
| `public/cms/studio.js` | Studio adapter — dual-mode save (local + Git Gateway), manifest-driven rendering, property editor, live preview, toast notifications |
| `public/cms/studio-manifest.example.json` | Example manifest with placeholder tokens |
| `public/cms/decap.html` | Stock Decap fallback for Sorted only — not linked from Studio |
| `scripts/build-studio-content.mjs` | Snapshot generator — reads manifest + content files, writes `studio-content.json` |

## Key features in v0.4.0

- **Three-column workspace:** page nav (300px) | editor (460px) | live preview (min 520px)
- **Auth overlay:** full-screen login card with site identity, shown on production only
- **Dual-mode save:** local mode saves drafts via `decap-server`; production mode publishes via Git Gateway with Netlify Identity JWT
- **Property list editor:** collapsible cards with nested gallery, amenities, highlights, and reviews editors
- **Field grouping:** fields organised by `group` property (Content, Buttons, Media, Brand, Contact, Integrations)
- **Desktop/mobile preview toggle:** full-width iframe or 390px rounded mobile frame
- **Toast notifications:** immediate feedback for save/publish success and failure
- **Design tokens:** `--studio-bg: #fafaf7`, `--studio-accent: #dfff00`, `--studio-text: #0b0b0b`, Inter font
- **Image upload:** file → base64 → Git Gateway PUT (production) or local proxy (dev)

## Usage

This template is copied into client site repos by:

```bash
npm run studio:upgrade -- --target ../client-repo --slug client-slug
```

Preview the file operations first:

```bash
npm run studio:upgrade -- --target ../client-repo --slug client-slug --dry-run
```

## Rules

- `/cms/` is Sorted Studio.
- `/cms/decap.html` is stock Decap fallback for Sorted only.
- Client `content/` and `public/cms/studio-manifest.json` are preserved by default.
- `scripts/build-studio-content.mjs` is copied into the client repo.
- Client `package.json` is patched so `npm run build` regenerates `studio-content.json` before `next build`.
- `studio.css` and `studio.js` are canonical product files — copy them, do not hand-write them.
- The manifest is the single source of truth — if a field is not in the manifest, it is not in the Studio UI.

## Placeholder tokens

The template uses these tokens, replaced by the upgrade script:

| Token | Replaced with |
|-------|---------------|
| `__CLIENT_NAME__` | Client business name (e.g. "Warwickshire Short Stays") |
| `__CLIENT_INITIAL__` | First letter of client name (e.g. "W") |
| `__CLIENT_DOMAIN__` | Client domain (e.g. "warwickshireshortstays.co.uk") |
