---
name: add-cms
description: Apply SortedUpdates CMS to a client site. Use when the user says "add the CMS", "apply SortedUpdates", "add Sorted Studio", "wire up the CMS", or asks to make a client site editable via Decap/Studio.
---

# Add SortedUpdates CMS

Apply the SortedUpdates CMS to the current client site repo. This is Stage 2 — only proceed if the client has approved the build (Nod 2).

## What to load

Before writing any code, load these files from the sorted repo:

1. **Installation workflow:** `/Users/renaldoedmondson/Projects/sorted/.devin/workflows/add-decap-cms.md` — follow this step by step
2. **Doctrine:** `/Users/renaldoedmondson/Projects/sorted/doctrine/sorted-studio-cms.md` — the standard the CMS must meet
3. **Operator skill:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/sorted-studio-cms.md` — QA loop and operating standard
4. **Reference implementation:** `/Users/renaldoedmondson/Projects/warwickshire-str` — study `public/cms/`, `lib/content.ts`, and `content/` before writing any code
5. **Canonical template files:** `/Users/renaldoedmondson/Projects/sorted/templates/sorted-studio/` — copy `studio.css`, `studio.js`, `build-studio-content.mjs`, `decap.html` from here; do not hand-write them

## Precondition

Confirm Nod 2 before proceeding. The CMS is a delivery mechanism, not part of the product evaluation. If the client has not approved the build, stop and ask.

## What to build

A three-column Sorted Studio CMS at `/cms/` with:

- **Auth overlay** — Netlify Identity login, shown on production only
- **Page nav (left)** — pages + site settings, section list with icons and summaries
- **Editor (middle)** — grouped fields (Content, Buttons, Media, Brand, etc.), list editor, property editor
- **Live preview (right)** — iframe with desktop/mobile toggle and refresh
- **Dual-mode save** — local: "Save draft" via decap-server; production: "Publish" via Git Gateway
- **Toast notifications** — immediate feedback for save/publish
- **Design tokens** — warm off-white (`#fafaf7`), fluorescent green accent (`#dfff00`), Inter font

## After building

Run the full QA loop from the operator skill before considering the task complete. Check:

- Three-column layout loads with Sorted wordmark + green dot
- Auth overlay appears on production, hidden on localhost
- Every page tab and section opens with editable fields
- List/property editors support add/remove and nested editing
- Save draft writes JSON locally; Publish commits to Git
- `npm run build` passes and regenerates `studio-content.json`
- No horizontal overflow on desktop or mobile
- No links to `/cms/decap.html` in the Studio UI
