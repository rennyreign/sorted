# Sorted Studio CMS Doctrine

**Status:** Active doctrine  
**Applies to:** SortedUpdates / Stage 2 CMS on all Sorted client sites  
**Reference implementation:** `warwickshire-str` — the most complete and current expression of this doctrine

---

## Principle

Sorted client sites use **Sorted Studio** as the client-facing CMS.

Decap remains the content backend, local filesystem proxy, Git Gateway, and emergency fallback. Clients should not be sent into the stock Decap interface during ordinary editing.

The client owns content. Sorted owns structure, layout, section order, publishing discipline, and reset state.

---

## Required Shape

Every Stage 2 CMS must provide:

- `public/cms/index.html` — Sorted Studio shell, not stock Decap
- `public/cms/studio.css` — Studio UI styling (design system below)
- `public/cms/studio.js` — Studio adapter, dual-mode save, live preview, property editor
- `public/cms/studio-manifest.json` — page, section, field, file, and preview map
- `public/cms/studio-content.json` — generated snapshot for static fallback
- `public/cms/decap.html` — stock Decap fallback, not linked from Studio client UI
- `public/cms/config.yml` — Decap backend configuration
- `public/cms/tutorial.json` — walkthrough video URL and helper text
- `scripts/build-studio-content.mjs` — snapshot generator
- `lib/content.ts` — TypeScript types and disk-reading loaders

`npm run build` must regenerate the Studio snapshot before `next build`.

---

## Studio Layout Architecture

The Studio interface is a three-column workspace inside a single-page app. No routing — everything is driven by `studio-manifest.json` and rendered client-side.

### Three-column workspace

```
┌─────────────────────────────────────────────────────────────┐
│  Topbar: Sorted•  [W] Site Name  ● Published    ▣ ▯  ∞  Save │
├──────────┬──────────────────┬───────────────────────────────┤
│          │                  │                               │
│  Pages   │  Editor          │  Live Preview                 │
│  Sections│  (form fields)   │  (iframe of live site)        │
│  Nav     │                  │                               │
│  300px   │  460px           │  min 520px / 1fr              │
│          │                  │                               │
├──────────┴──────────────────┴───────────────────────────────┤
│  Status bar: ✓ All changes saved  ·  Draft saves locally...  │
└─────────────────────────────────────────────────────────────┘
```

### Left column — page navigation (300px)

- **Nav items:** Pages | Site settings (two top-level views)
- **Page tabs:** One button per page from the manifest (Home, Properties, About, Stay Types, Contact)
- **Section list:** Sections within the selected page, each with an icon box, title, and summary line
- **Active state:** Left border accent + white background; icon box inverts to black
- **Breadcrumb:** Back button + page name + section name in a pill

### Middle column — editor (460px)

- **Section title:** H1 + section ID pill + "Active" pill
- **Editor note:** Contextual info box explaining local vs production mode
- **Form:** Fields grouped by `group` property from manifest (Content, Buttons, Media, Brand, Contact, Integrations)
- **Field types:** `text`, `textarea`, `image`, `list`, `property-list`, `color`, `number`
- **List editor:** Inline cards with summary fields, add/remove items
- **Property editor:** Collapsible cards with full nested field editing (gallery, amenities, highlights, reviews)

### Right column — live preview (min 520px)

- **Preview toolbar:** "Live preview" label + URL input + open-in-new-tab + refresh button
- **Desktop/mobile toggle:** Desktop shows full-width iframe; mobile wraps iframe in 390px rounded frame
- **Preview iframe:** Loads the live site URL from the section's `previewPath`
- **Preview patch:** After save, Studio patches the iframe DOM in-place for instant feedback before full reload
- **Live patching is diff-based, not original-based.** `applyPreviewPatch` must diff `state.previewContent` (the snapshot of what the iframe DOM currently shows) against `state.content`, then update `previewContent` to match. Never diff `originalContent` → `content`: after the first keystroke the original string no longer exists in the DOM, so every subsequent patch silently no-ops and the preview appears frozen. Reset `previewContent` to `originalContent` whenever the iframe reloads (fresh page renders original content).
- **Text-node replacement must tolerate whitespace differences.** The DOM may collapse or re-break whitespace vs the JSON string. Match on normalized text, but replace via exact `indexOf` first, then a whitespace-flexible regex (`oldText.split(" ").join("\\s+")`) as fallback.
- **Never index-diff arrays of different lengths.** Add/remove shifts indices; per-index string patching then writes wrong values into wrong nodes (e.g. `[A,B,C]→[B,C]` yields `B,C,C`). Skip patching that field until the preview reloads — stale is better than corrupt.
- **Cache the text node per field.** Once a field's node is found, reuse it (verify `isConnected`). Never re-search by substring alone — as the user shortens a value, it can collide with unrelated nodes elsewhere in the document and patch the wrong text. Prefer exact whole-node matches over substring matches.
- **Expect hydration to stomp patches.** Framework hydration (Next.js/React) can run — or selectively complete — after Studio starts patching. When it detects a text mismatch it re-renders the node back to server-rendered content, wiping the patch. A MutationObserver inside the iframe must watch for external DOM mutations and run a debounced resync: any field whose assumed text is no longer in the DOM re-baselines to `originalContent` and re-patches. This heals stomps whenever hydration happens, not just at fixed timers.
- **Refresh must force a real reload.** Assigning `iframe.src` to the same URL (fragment included) is a same-document navigation — no reload, no `load` event. Use `iframe.contentWindow.location.reload()` and re-bind the load handler so edits re-patch onto the fresh DOM.

### Top bar

- **Left:** Sorted wordmark (black "Sorted" + fluorescent green dot) + site initial mark (circle with letter) + site name + green status dot + "Published"
- **Right:** Desktop preview toggle | Mobile preview toggle | "Preview" link (opens live site) | Save/Publish button

### Status bar

- **Left:** Save status with tone (success/warn/error)
- **Right:** Mode-aware note: "Draft saves locally. Publishing is handled by Sorted." (local) or "Publishing commits to Git. Netlify rebuilds the live site in about 60 seconds." (production)

### Auth overlay (production only)

- Full-screen card centered on studio background
- Site initial mark (64px circle) + site name + "Sign in to edit and publish site content." + Sign in button
- Triggers Netlify Identity login widget
- Hidden automatically when user is already authenticated
- Identity errors surface inside the auth card (`#auth-error`), not only the hidden status bar

#### Auth path requirements (non-negotiable)

Netlify Identity has three failure modes that every Studio install must neutralise —
all handled by canonical `studio.js`/`studio.css` plus the layout redirect:

1. **Dead invite landing.** Identity emails link to the site root (`/#invite_token=…`) where
   no widget runs — nothing consumes the token. Fix: the root-layout token redirect
   (workflow Step 9) forwards token hashes to `/cms/`, and the branded email templates
   deep-link to `/cms/` directly.
2. **Modal behind overlay.** The widget's modal is a fixed iframe at `z-index: 99`, below the
   auth overlay (200) — Sign in appears to do nothing. Fix: `studio.css` forces
   `#netlify-identity-widget` to `z-index: 9000`.
3. **Stale-token error loop.** The widget leaves the token in the URL hash; every refresh
   re-verifies the consumed/expired token and opens an error modal. Fix: `studio.js` strips
   the hash via `history.replaceState` only after `login`, `signup`, or widget `close`.
   Never strip on a zero-delay timer after `init()` — recovery/invite handling is asynchronous,
   so early removal turns valid reset links into the generic sign-in modal.

Additionally: bind both `login` and `signup` events (invite acceptance fires `signup`), and
use `afterInteractive` for the layout redirect script — `beforeInteractive` emits a raw
`<script>` into React's render tree and throws if hydration falls back to client render.

**Bind all auth controls and Identity listeners before checking `currentUser()`.** Returning
sessions resolve synchronously. An early `onLogin(existingUser); return;` before event binding
leaves the visible Sign out button inert and omits the `logout` listener. Register Sign in,
Sign out, `init`, `login`, `signup`, `close`, `logout`, and `error` handlers first; only then
call `onLogin(existingUser)`. Guard `startApp()` so overlapping `init`/`login` callbacks cannot
initialise and bind the Studio twice. Sign out must disable itself, show `Signing out...`, call
`netlifyIdentity.logout()`, reload on the `logout` event, and visibly recover on rejection.

---

## Design System

### Colour tokens

```css
--studio-bg: #fafaf7;        /* warm off-white background */
--studio-surface: #ffffff;    /* card/panel surfaces */
--studio-muted: #f4f4ef;      /* muted backgrounds, pills */
--studio-text: #0b0b0b;       /* primary text — near-black */
--studio-soft: #686868;       /* secondary text, labels */
--studio-border: #e7e7e1;     /* hairline borders */
--studio-accent: #dfff00;     /* fluorescent green — active states, publish */
--studio-success: #48b02c;    /* status dots, success toasts */
--studio-shadow: 0 22px 80px rgba(15, 18, 16, 0.08);
```

### Typography

- **Font:** Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Wordmark:** 32px, weight 950, letter-spacing -0.045em — black "Sorted" with `#cfe900` green dot span
- **Nav labels:** 14px, weight 750
- **Panel headings:** 11px, weight 800-900, letter-spacing 0.12em, uppercase
- **Field labels:** 12px, weight 800
- **Body/inputs:** 13px, line-height 1.35

### Component patterns

- **Buttons:** 42px min-height, 10px border-radius, 1px border. Primary = black bg + white text. Ghost = surface bg + border. Publish = accent green bg.
- **Panels:** 1px border, 10px border-radius, surface background, subtle shadow
- **Pills:** 999px border-radius, 24px min-height, muted background, 11px weight 800
- **Active states:** Left border accent (3px solid black) + white background for section items; gradient accent for nav items
- **Inputs:** 1px border, 8px radius, 12px padding, 13px text
- **Toasts:** Fixed bottom-right, 420px max-width, tone-coloured background, 0.25s fade+slide transition

### Responsive behaviour

- **> 1180px:** Full three-column (300px / 400px / 1fr)
- **980–1180px:** Compressed three-column (240px / 400px / 360px+)
- **< 980px:** Single column stack — topbar wraps, workspace becomes 1fr, preview gets min-height 680px

---

## Manifest Schema

`studio-manifest.json` is the single source of truth for the Studio UI. It drives every page tab, section, field, and preview path.

```json
{
  "site": {
    "id": "client-slug",
    "name": "Client Name",
    "domain": "client.co.uk",
    "productionUrl": "https://client.co.uk",
    "accent": "#dfff00",
    "initial": "C"
  },
  "pages": [
    {
      "id": "home",
      "title": "Home",
      "path": "/",
      "sections": [
        {
          "id": "homepage-hero",
          "title": "Hero",
          "collection": "homepage",
          "entry": "hero",
          "file": "/content/homepage/hero.json",
          "previewPath": "/",
          "summary": "Main headline, introduction, image and calls to action",
          "fields": [
            { "name": "heading", "label": "Heading", "type": "text", "group": "Content" },
            { "name": "subheading", "label": "Subheading", "type": "textarea", "group": "Content" },
            { "name": "image", "label": "Background image", "type": "image", "group": "Media" }
          ]
        },
        {
          "id": "homepage-trust",
          "title": "Trust Strip",
          "collection": "homepage",
          "entry": "trust",
          "file": "/content/homepage/trust.json",
          "previewPath": "/",
          "summary": "Four proof points below the hero",
          "fields": [
            { "name": "items", "label": "Trust points", "type": "list", "group": "Content", "summaryFields": ["title", "copy"] }
          ]
        }
      ]
    }
  ]
}
```

### Field types

| Type | Behaviour |
|------|-----------|
| `text` | Single-line input |
| `textarea` | Multi-line input, vertical resize |
| `image` | Media field: thumbnail + path input + upload button |
| `color` | Colour picker input |
| `number` | Numeric input |
| `list` | Inline card list with `summaryFields` for collapsed preview; add/remove items |
| `property-list` | Full property editor: collapsible cards with nested fields (gallery, amenities, highlights, reviews, Tokeet IDs) |

### Field groups

Fields are grouped by their `group` property. Groups render as labelled sections within the editor form. Common groups: `Content`, `Buttons`, `Media`, `Brand`, `Contact`, `Integrations`, `Links`, `Forms`.

### Site settings page

The final page in the manifest is always `settings`. It contains:
- **Site Settings section:** site name, logo, primary colour, tagline, phone, email, WhatsApp, social links, integration fields
- **Footer section:** description, quick links list, credits text

---

## Dual-Mode Save Architecture

Studio operates in two modes depending on environment. This is detected automatically by hostname.

### Local mode (`localhost`, `127.0.0.1`, `[::1]`)

- **Save button label:** "Save draft"
- **Save mechanism:** `POST http://localhost:8081/api/v1` with `action: "persistEntry"` — writes directly to local content JSON files via `decap-server`
- **Status note:** "Draft saves locally. Publishing is handled by Sorted."
- **Editor note:** "Editing local content files. Save draft writes to your local content file; publish stays a separate Git/Netlify step."
- **No deploy trigger:** Local saves never touch Git or Netlify

### Production mode (any other hostname)

- **Save button label:** "Publish"
- **Save mechanism:** Git Gateway using Decap's Git Data transaction — `GET /branches/:branch` for the head SHA → `POST /git/blobs` → `POST /git/trees` with `base_tree` → `POST /git/commits` with the head as parent → `PATCH /git/refs/heads/:branch` with `force: false`. Every request uses the refreshed Netlify Identity JWT.
- **Never publish through `PUT /.netlify/git/github/contents/:path`.** GitHub's direct Contents API supports this, but Netlify Git Gateway rejects `PUT` at the edge with `405 Method not allowed`. The blob/tree/commit/ref transaction is the proven Decap write path and preserves non-force conflict protection.
- **Auth required:** Auth overlay shows until Netlify Identity login completes
- **Status note:** "Publishing commits to Git. Netlify rebuilds the live site in about 60 seconds."
- **Editor note:** "Editing live site content. Click Publish to commit changes to Git and trigger a Netlify deploy."
- **Image uploads:** Files converted to base64 and committed to `public/uploads/` through the same Git Data transaction

### Preview patching

After a successful save in either mode, Studio patches the preview iframe DOM in-place for instant visual feedback. A full refresh is available via the refresh button.

---

## Content Loading Pattern

`lib/content.ts` reads JSON fresh from disk on every call. No defaults are spread — the JSON files are the source of truth.

```typescript
import fs from "fs"
import path from "path"

const contentDir = path.join(process.cwd(), "content")

function loadJSON<T>(relativePath: string): T {
  const filePath = path.join(contentDir, relativePath)
  const content = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(content) as T
}

export type HeroContent = {
  heading: string
  subheading: string
  image: string
  imageAlt: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

export function loadHeroContent(): HeroContent {
  return loadJSON<HeroContent>("homepage/hero.json")
}
```

**Rules:**
- One TypeScript type + one loader per JSON file
- Types are explicit — every field typed, no `any`
- Icon keys stored as strings in JSON (`IconName` union type), mapped to Lucide components in the page file
- The JSON files themselves are the factory reset state — keep them matching the approved build exactly

---

## Content Splitting Rules

- One JSON file per logical section — not one file per page
- File names match their manifest `entry` field
- Folders mirror site structure: `content/homepage/`, `content/about/`, `content/properties/`, etc.
- `content/site/general.json` must always include `handoffSha` and `handoffDate`
- Populate JSON files with current hardcoded values as seed data

```
content/
  homepage/
    hero.json        ← heading, subheading, CTAs, image
    trust.json       ← trust strip items
    audiences.json   ← who-we-help cards
    cta.json         ← enquiry CTA
  properties/
    list.json        ← all property listings
  benefits/
    list.json        ← why-stay-with-us items
  about/
    content.json     ← about page all sections
  business-stays/
    content.json     ← business stays page
  relocation-stays/
    content.json     ← relocation stays page
  contact/
    info.json        ← contact page content
  footer/
    content.json     ← footer content
  site/
    general.json     ← global settings, brand, integrations
```

---

## Studio UX Rules

The Studio interface must be clean, client-safe, and limited to real use cases.

- Show only workflows the client can actually use.
- Do not show placeholder controls.
- Do not show add-section, reorder, section settings, design-token, media-library, form-builder, SEO, or publish controls unless they are fully wired.
- Do not link clients to stock Decap from Studio.
- Do not expose structural editing. Clients edit existing content only.
- Keep the UI focused on pages, existing sections, content fields, save state, and live preview.
- Use the Sorted wordmark: black `Sorted` with fluorescent green dot `#cfe900`.
- Section rows should have purposeful icons, not drag handles or gear icons unless those actions exist.
- Field groups improve scannability — group related fields under labelled headings.
- Toast notifications provide immediate feedback for save/publish success or failure.
- The auth overlay must show the client's site identity (initial mark + name), not a generic login.

---

## Content Editing Rules

Studio must expose every visible content field from the live site.

- One content JSON file per logical section remains the standard.
- `studio-manifest.json` maps each section to its `content/**/*.json` file.
- Simple text, textarea, URL, colour, and image path fields are directly editable.
- Existing list items are editable inline with summary field previews.
- Clients do not add, remove, or reorder list items unless that behavior is explicitly implemented and tested.
- Properties may expose safe fields inline, but deep structural fields such as galleries, amenities, IDs, widget code, and reviews require deliberate UI design before client exposure.
- Property cards are collapsible — collapsed shows name + location summary, expanded shows all fields including nested gallery, amenities, highlights, and reviews editors.

---

## Save And Publish Rules

Runtime Studio edits must not trigger Netlify deploys automatically in local mode.

Local behavior:
- `npm run cms` starts `decap-server` on port `8081`.
- Studio uses `POST /api/v1` local backend actions such as `getEntry` and `persistEntry`.
- `Save draft` writes local JSON files only.
- The live preview patches same-origin iframe DOM immediately for fast feedback.

Production behavior:
- Publishing is a deliberate action — the client clicks "Publish" and Studio commits directly to Git via Git Gateway.
- Netlify auto-deploys from the Git commit (this is expected and desired in production mode).
- The status bar and toast make the deploy consequence clear before and after publishing.
- Do not create a UI that can cause a deployment spike through frequent writes — the button is disabled when there are no unsaved changes.

---

## QA Standard

Before review or handoff:

- [ ] Studio loads at `/cms/` with three-column layout
- [ ] Auth overlay appears on production (not on localhost)
- [ ] Sorted wordmark with green dot appears in topbar
- [ ] Site initial mark and site name appear in topbar
- [ ] Stock Decap remains available at `/cms/decap.html` for Sorted fallback only
- [ ] No links to `/cms/decap.html` appear in the Studio UI
- [ ] Every page tab opens and shows its sections
- [ ] Every section opens an editor with at least one editable control
- [ ] Fields are grouped logically (Content, Buttons, Media, etc.)
- [ ] Existing list sections such as trust strips and benefit cards are editable inline
- [ ] Property list editor supports add, remove, collapse/expand, and nested field editing
- [ ] Save draft writes the intended JSON file through the local backend
- [ ] Publish commits to Git via Git Gateway on production
- [ ] Toast notifications appear on save/publish success and failure
- [ ] Desktop and mobile preview toggles work
- [ ] Live preview iframe loads and refreshes
- [ ] Test edits are restored before commit
- [ ] Desktop and mobile layouts have no horizontal overflow
- [ ] `npm run build` passes and regenerates `studio-content.json`
- [ ] Focused CMS smoke tests pass

---

## Fleet Rollouts

Sorted Studio is versioned product code. Client repos receive upgrades through the Sorted template and upgrade script, not by ad hoc copying.

Canonical files live in:

- `templates/sorted-studio/`
- `scripts/upgrade-sorted-studio.mjs`
- `clients/sites.json`

Rollout rules:

- Create a feature branch in each client repo, e.g. `chore/studio-v0.4.0`.
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
- Do not let CMS UX create unnecessary Netlify builds in local mode.
- The three-column layout (nav | editor | preview) is the standard Studio shape.
- The design tokens (warm off-white, fluorescent green accent, Inter font) are the Studio brand — do not deviate without explicit approval.
- The manifest is the single source of truth — if a field is not in the manifest, it is not in the Studio UI.
