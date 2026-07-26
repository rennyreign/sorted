# Sorted Studio CMS Doctrine

**Status:** Active doctrine  
**Applies to:** SortedUpdates / Stage 2 CMS on all Sorted client sites

---

## Principle

Sorted client sites use **Sorted Studio** as the client-facing CMS.

Decap remains the content backend, local filesystem proxy, Git Gateway, and emergency fallback. Clients should not be sent into the stock Decap interface during ordinary editing.

The client owns content. Sorted owns structure, layout, section order, publishing discipline, and reset state.

---

## Required Shape

Every Stage 2 CMS must provide:

- `public/cms/index.html` — Sorted Studio shell, not stock Decap
- `public/cms/studio.css` — Studio UI styling
- `public/cms/studio.js` — Studio adapter and local save behavior
- `public/cms/studio-manifest.json` — page, section, field, file, and preview map
- `public/cms/studio-content.json` — generated snapshot for static fallback
- `public/cms/decap.html` — stock Decap fallback, not linked from Studio client UI
- `scripts/build-studio-content.mjs` — snapshot generator
- `public/cms/config.yml` — Decap backend configuration

`npm run build` must regenerate the Studio snapshot before `next build`.

---

## Studio UX Rules

The Studio interface must be clean, client-safe, and limited to real use cases.

- Show only workflows the client can actually use.
- Do not show placeholder controls.
- Do not show add-section, reorder, section settings, design-token, media-library, form-builder, SEO, or publish controls unless they are fully wired.
- Do not link clients to stock Decap from Studio.
- Do not expose structural editing. Clients edit existing content only.
- Keep the UI focused on pages, existing sections, content fields, save state, and live preview.
- Use the Sorted wordmark: black `Sorted` with fluorescent green dot `#cfe900` or matching brand token.
- Section rows should have purposeful icons, not drag handles or gear icons unless those actions exist.

---

## Content Editing Rules

Studio must expose every visible content field from the live site.

- One content JSON file per logical section remains the standard.
- `studio-manifest.json` maps each section to its `content/**/*.json` file.
- Simple text, textarea, URL, colour, and image path fields are directly editable.
- Existing list items are editable inline.
- Clients do not add, remove, or reorder list items unless that behavior is explicitly implemented and tested.
- Properties may expose safe fields inline, but deep structural fields such as galleries, amenities, IDs, widget code, and reviews require deliberate UI design before client exposure.

---

## Save And Publish Rules

Runtime Studio edits must not trigger Netlify deploys automatically.

Local behavior:
- `npm run cms` starts `decap-server` on port `8081`.
- Studio uses `POST /api/v1` local backend actions such as `getEntry` and `persistEntry`.
- `Save draft` writes local JSON files only.
- The live preview may patch same-origin iframe DOM immediately for fast feedback.

Production behavior:
- Publishing is a deliberate Sorted-managed Git/Netlify step unless a dedicated publish workflow is built.
- Do not imply that runtime edits are live immediately.
- Do not create a UI that can cause a deployment spike through frequent writes to `main`.

---

## QA Standard

Before review or handoff:

- [ ] Studio loads at `/cms/`
- [ ] Stock Decap remains available at `/cms/decap.html` for Sorted fallback only
- [ ] No links to `/cms/decap.html` appear in the Studio UI
- [ ] Every Studio nav item has a real destination and use case
- [ ] Every listed section opens an editor with at least one editable control
- [ ] Existing list sections such as trust strips and benefit cards are editable inline
- [ ] Save draft writes the intended JSON file through the local backend
- [ ] Test edits are restored before commit
- [ ] Live preview updates or the limitation is clearly stated in the UI
- [ ] Desktop and mobile layouts have no horizontal overflow
- [ ] `npm run build` passes
- [ ] Focused CMS smoke tests pass

---

## Fleet Rollouts

Sorted Studio is versioned product code. Client repos receive upgrades through the Sorted template and upgrade script, not by ad hoc copying.

Canonical files live in:

- `templates/sorted-studio/`
- `scripts/upgrade-sorted-studio.mjs`
- `clients/sites.json`

Rollout rules:

- Create a feature branch in each client repo, e.g. `chore/studio-v0.3.0`.
- Run the upgrade script from the Sorted repo:

```bash
npm run studio:upgrade -- --target ../client-repo --slug client-slug
```

- Preserve `content/` and `public/cms/studio-manifest.json` unless intentionally migrating the client content model.
- Run `npm run build`, focused Studio smoke tests, and a browser QA pass.
- Review the deploy preview before merging or pushing production.
- Never bulk-push Studio upgrades directly to every client `main` branch.

The client registry should record the current Studio version, local path, repo, and CMS URL for every active client.

---

## Non-Negotiables

- Studio is the default client CMS surface.
- Decap is infrastructure, not the client experience.
- Client CMS controls must have purpose, need, and use case.
- Do not expose controls that are not implemented.
- Do not let CMS UX create unnecessary Netlify builds.
