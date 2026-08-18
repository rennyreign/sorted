---
description: Add Decap CMS to a Sorted client site
---

# SortedUpdates — Studio CMS Installation Workflow

> **Stage 2 of 2 — Apply after client approves the build (Nod 2).**
>
> Stage 1 is building the static site. The client sees and approves that first.
> This workflow runs only after the client has confirmed they are happy with the build.
> Do not apply the CMS before Nod 2. The client should evaluate a clean site, not one with a CMS toolbar.

Use this workflow whenever a new Sorted client site needs SortedUpdates wired up.
All Sorted client sites use **Sorted Studio** as the client-facing CMS, backed by Decap CMS with Netlify Identity + Git Gateway.

Mandatory doctrine: `doctrine/sorted-studio-cms.md`
Operator skill: `operators/skills/sorted-studio-cms.md`

Decap is infrastructure. `/cms/` must be Sorted Studio. Stock Decap may remain at `/cms/decap.html` as a Sorted fallback, but it must not be linked from the Studio client UI.

**Reference implementation:** `warwickshire-str` — the most complete and current example of this full stack. Study `public/cms/`, `lib/content.ts`, and `content/` in that repo before starting.

---

## Prerequisites

- Site is deployed on Netlify (Decap requires Netlify — do not use on Hostinger sites)
- Netlify Identity is enabled: Site settings → Identity → Enable
- Git Gateway is enabled: Identity → Services → Enable Git Gateway
- Registration set to **Invite Only** before sending client access
- Site is a Next.js project with a `public/` folder and a `lib/content.ts` pattern

---

## Step 1 — package.json

Add the `cms` script, `decap-server` dev dependency, and the studio-content build hook:

```json
"scripts": {
  "dev": "next dev",
  "build": "node scripts/build-studio-content.mjs && next build",
  "cms": "npx decap-server"
},
"devDependencies": {
  "decap-server": "^3.7.0"
}
```

Run `npm install` after editing.

The `build` script regenerates `public/cms/studio-content.json` from the manifest + content files before every `next build`. This ensures the static fallback snapshot is always current.

---

## Step 2 — Create `public/cms/` folder

Required files: `index.html`, `decap.html`, `studio.css`, `studio.js`, `studio-manifest.json`, `studio-content.json`, `config.yml`, `tutorial.json`.

Copy Sorted favicon assets from `rennyreign/sorted/public/favicon.png` and `favicon.svg` into `public/cms/sorted-favicon.png` and `public/cms/sorted-favicon.svg`.

`index.html` is the Sorted Studio shell. `decap.html` is the stock Decap fallback. Do not send clients to `decap.html`.

### Studio shell: `public/cms/index.html`

The Studio shell is a static HTML page with three-column layout scaffolding. All interactivity is in `studio.js`. The shell provides:

- **Auth overlay** — full-screen login card (hidden on localhost, shown on production until authenticated)
- **Topbar** — Sorted wordmark, site initial mark, site name, status dot, desktop/mobile preview toggles, preview link, save/publish button
- **Workspace** — three-column grid: page nav (300px) | editor (460px) | live preview (min 520px)
- **Status bar** — save status + mode-aware publish note

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sorted Studio - [Client Name]</title>
  <link rel="stylesheet" href="/cms/studio.css" />
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <div id="auth-overlay" class="auth-overlay" style="display:none;">
    <div class="auth-card">
      <span class="auth-mark">[INITIAL]</span>
      <h1>[Client Name]</h1>
      <p>Sign in to edit and publish site content.</p>
      <button id="login-button" class="primary-button" type="button">Sign in</button>
    </div>
  </div>

  <div id="studio-app" class="studio-app" data-loading="true">
    <main class="studio-main">
      <header class="studio-topbar">
        <div class="topbar-site">
          <span class="studio-wordmark" aria-label="Sorted">Sorted<span>.</span></span>
          <span class="site-mark">[INITIAL]</span>
          <strong id="top-site-name">[Client Name]</strong>
          <span class="status-dot"></span>
          <span>Published</span>
        </div>
        <div class="topbar-actions">
          <button class="icon-button is-active" id="desktop-preview" type="button" aria-label="Desktop preview">▣</button>
          <button class="icon-button" id="mobile-preview" type="button" aria-label="Mobile preview">▯</button>
          <a class="ghost-button" id="open-preview" href="/" target="_blank" rel="noreferrer">∞ Preview</a>
          <button class="primary-button" id="save-section" type="button">Save draft</button>
        </div>
      </header>

      <section class="workspace">
        <div class="page-column">
          <div class="crumb">
            <button class="back-button" type="button" id="back-to-pages">←</button>
            <span id="crumb-page">Home</span>
            <span>/</span>
            <strong id="crumb-section">Hero</strong>
          </div>

          <div class="panel section-panel">
            <div class="panel-heading">
              <p>Sections</p>
            </div>
            <nav class="studio-nav" aria-label="Studio navigation">
              <button class="nav-item is-active" type="button" data-view="pages" aria-pressed="true">□ <span>Pages</span></button>
              <button class="nav-item" type="button" data-view="settings" aria-pressed="false">⚙ <span>Site settings</span></button>
            </nav>
            <div id="page-tabs" class="page-tabs"></div>
            <div id="section-list" class="section-list"></div>
          </div>
        </div>

        <section class="panel editor-panel">
          <div class="editor-title">
            <div>
              <h1 id="editor-title">Hero</h1>
              <span id="editor-id" class="pill">homepage-hero</span>
              <span class="pill is-live">Active</span>
            </div>
          </div>
          <p class="editor-note" id="editor-note">This Studio view edits the local content files through the Decap local backend. Publishing stays separate so Netlify only builds when you choose to push.</p>
          <form id="editor-form" class="editor-form"></form>
        </section>

        <section class="preview-column">
          <div class="preview-toolbar">
            <strong>ϟ Live preview <span class="status-dot"></span></strong>
            <input id="preview-url" type="text" readonly value="/" />
            <a id="open-preview-toolbar" href="/" target="_blank" rel="noreferrer">↗</a>
            <button type="button" id="refresh-preview">↻ Refresh</button>
          </div>
          <div class="preview-frame-shell">
            <iframe id="site-preview" title="Website preview" src="/"></iframe>
          </div>
        </section>
      </section>

      <footer class="status-bar">
        <span id="save-status">✓ All changes saved</span>
        <span id="publish-note">Draft saves locally. Publishing is handled by Sorted.</span>
      </footer>
    </main>
  </div>

  <script src="/cms/studio.js"></script>
</body>
</html>
```

Replace `[INITIAL]` with the client's first letter and `[Client Name]` with their business name.

### Studio styling: `public/cms/studio.css`

Copy from `templates/sorted-studio/public/cms/studio.css` or the reference implementation. The stylesheet defines:

- **Design tokens** on `:root` — warm off-white background (`#fafaf7`), fluorescent green accent (`#dfff00`), near-black text (`#0b0b0b`), Inter font stack
- **Three-column workspace grid** — `300px 460px minmax(520px, 1fr)` with responsive breakpoints at 1180px and 980px
- **Component styles** — topbar, status bar, nav items, page tabs, section items with icon boxes, editor form, field groups, media fields, list cards, property cards (collapsible), preview toolbar, preview frame (desktop + mobile), auth overlay, toast notifications

Do not hand-write `studio.css` — copy the canonical file and adjust only the accent colour if the client brand requires it.

### Studio adapter: `public/cms/studio.js`

Copy from `templates/sorted-studio/public/cms/studio.js` or the reference implementation. The adapter provides:

- **Dual-mode detection** — `isLocal()` checks hostname; local mode uses `decap-server` proxy, production mode uses Git Gateway
- **Manifest-driven rendering** — fetches `studio-manifest.json` and `studio-content.json`, renders page tabs, section lists, and editor forms from the manifest
- **Field rendering** — supports `text`, `textarea`, `image`, `color`, `number`, `list`, and `property-list` field types
- **List editor** — inline cards with `summaryFields` preview, add/remove items
- **Property editor** — collapsible cards with nested gallery, amenities, highlights, and reviews editors; add/remove properties
- **Image upload** — file → base64 → Git Gateway PUT (production) or local proxy (dev)
- **Save/publish** — local: `POST /api/v1` `persistEntry`; production: `GET` SHA + `PUT` via Git Gateway with Netlify Identity JWT
- **Preview** — iframe loads `previewPath`, desktop/mobile toggle, refresh button, post-save DOM patch
- **Auth** — Netlify Identity init, auth overlay show/hide, JWT retrieval for Git Gateway
- **Toast notifications** — success/error/warn feedback for save/publish operations

Do not hand-write `studio.js` — copy the canonical file. It is framework-free vanilla JS in an IIFE.

### Studio manifest: `public/cms/studio-manifest.json`

The manifest is the single source of truth for the Studio UI. Build it from the site's actual content structure:

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
            { "name": "primaryCtaLabel", "label": "Primary button text", "type": "text", "group": "Buttons" },
            { "name": "primaryCtaHref", "label": "Primary button link", "type": "text", "group": "Buttons" },
            { "name": "image", "label": "Background image", "type": "image", "group": "Media" },
            { "name": "imageAlt", "label": "Image description", "type": "text", "group": "Media" }
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
    },
    {
      "id": "settings",
      "title": "Settings",
      "path": "/",
      "sections": [
        {
          "id": "site-settings",
          "title": "Site Settings",
          "collection": "site",
          "entry": "general",
          "file": "/content/site/general.json",
          "previewPath": "/",
          "summary": "Business details, social links, colour and booking settings",
          "fields": [
            { "name": "siteName", "label": "Site name", "type": "text", "group": "Brand" },
            { "name": "logo", "label": "Logo", "type": "image", "group": "Brand" },
            { "name": "primaryColor", "label": "Primary colour", "type": "color", "group": "Brand" },
            { "name": "phoneDisplay", "label": "Phone display", "type": "text", "group": "Contact" },
            { "name": "email", "label": "Email", "type": "text", "group": "Contact" }
          ]
        },
        {
          "id": "footer-content",
          "title": "Footer",
          "collection": "footer",
          "entry": "content",
          "file": "/content/footer/content.json",
          "previewPath": "/",
          "summary": "Footer description, quick links and credit text",
          "fields": [
            { "name": "description", "label": "Description", "type": "textarea", "group": "Content" },
            { "name": "quickLinks", "label": "Quick links", "type": "list", "group": "Links", "summaryFields": ["label", "href"] },
            { "name": "credits", "label": "Credits text", "type": "text", "group": "Content" }
          ]
        }
      ]
    }
  ]
}
```

**Manifest rules:**
- `site.initial` is a single capital letter — used in the topbar and auth overlay site mark
- `site.accent` defaults to `#dfff00` — change only if the client brand requires a different accent
- Pages are ordered to mirror site navigation. Settings page is always last.
- Each section has `id`, `title`, `collection`, `entry`, `file`, `previewPath`, `summary`, and `fields`
- Field `group` controls visual grouping in the editor (Content, Buttons, Media, Brand, Contact, Integrations, Links, Forms)
- `list` fields use `summaryFields` to show collapsed previews of each item
- `property-list` fields render the full collapsible property card editor

### Snapshot generator: `scripts/build-studio-content.mjs`

```javascript
import fs from "fs"
import path from "path"

const root = process.cwd()
const manifestPath = path.join(root, "public/cms/studio-manifest.json")
const outputPath = path.join(root, "public/cms/studio-content.json")

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
const sections = manifest.pages.flatMap((page) => page.sections)

const content = {}

for (const section of sections) {
  const relativeFile = section.file.replace(/^\/content\//, "")
  const sourcePath = path.join(root, "content", relativeFile)

  try {
    content[section.id] = JSON.parse(fs.readFileSync(sourcePath, "utf8"))
  } catch (error) {
    content[section.id] = {
      _error: `Could not load ${section.file}: ${error.message}`,
    }
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), content }, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, outputPath)} with ${sections.length} sections`)
```

This runs automatically as part of `npm run build`. It reads every content file mapped in the manifest and writes a single `studio-content.json` snapshot. Studio loads this as a fallback when the Decap backend is unavailable.

### Legacy Decap fallback: `public/cms/decap.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Client Name] Content Manager</title>
  <link rel="icon" type="image/png" href="/cms/sorted-favicon.png" />
  <link rel="icon" type="image/svg+xml" href="/cms/sorted-favicon.svg" />
  <script>
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      document.write('<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"><\/script>');
    }
  </script>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script src="/cms/preview-templates.js"></script>
  <script>
    /* Preview iframe scroll fix */
    function fixPreviewScroll() {
      var iframes = document.querySelectorAll('iframe');
      iframes.forEach(function(iframe) {
        iframe.style.height = '100%';
        iframe.style.minHeight = '100%';
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc && doc.body) {
            doc.documentElement.style.overflowY = 'auto';
            doc.body.style.overflowY = 'auto';
          }
        } catch(e) {}
      });
    }
    var scrollObserver = new MutationObserver(function() { fixPreviewScroll(); });
    scrollObserver.observe(document.body, { childList: true, subtree: true });
    setInterval(fixPreviewScroll, 1500);
  </script>
  <script>
    /* Tutorial welcome panel */
    var TUTORIAL_JSON = '/cms/tutorial.json';
    var PANEL_ID = 'sv-welcome-panel';

    function injectWelcomePanel(videoUrl, title, body) {
      if (document.getElementById(PANEL_ID)) return;
      var panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;width:340px;background:#fff;border:1px solid #e5e0da;box-shadow:0 8px 32px rgba(0,0,0,0.12);border-radius:4px;font-family:ui-sans-serif,system-ui,sans-serif;overflow:hidden';
      var isYoutube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
      var embedUrl = '';
      if (isYoutube) {
        var videoId = videoUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
        embedUrl = videoId ? 'https://www.youtube.com/embed/' + videoId[1] : '';
      }
      var isVimeo = videoUrl && videoUrl.includes('vimeo.com');
      if (isVimeo) {
        var vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/);
        embedUrl = vimeoId ? 'https://player.vimeo.com/video/' + vimeoId[1] : '';
      }
      var videoHTML = '';
      if (embedUrl) {
        videoHTML = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;"><iframe src="' + embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>';
      } else if (videoUrl) {
        videoHTML = '<video src="' + videoUrl + '" controls style="width:100%;display:block;background:#111;"></video>';
      }
      panel.innerHTML = '<div style="background:#191713;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:#d7c5b2;font-weight:600;">' + (title || 'How to update your site') + '</span><button onclick="document.getElementById(\'' + PANEL_ID + '\').remove()" style="background:none;border:none;color:#d7c5b2;cursor:pointer;font-size:1.1rem;line-height:1;padding:0 2px;">&times;</button></div>' + (videoHTML || '<div style="padding:16px;font-size:0.8rem;color:#6f675d;">Video not set — add a URL in CMS Settings → Tutorial.</div>') + '<div style="padding:12px 16px;border-top:1px solid #f0ece6;"><p style="font-size:0.75rem;line-height:1.6;color:#6f675d;margin:0;">' + (body || 'Watch the walkthrough above to learn how to update text, images, and more.') + '</p></div>';
      document.body.appendChild(panel);
    }

    function tryInjectPanel() {
      fetch(TUTORIAL_JSON).then(function(r) { return r.ok ? r.json() : {}; }).catch(function() { return {}; }).then(function(data) {
        injectWelcomePanel(data.videoUrl || '', data.title || '', data.body || '');
      });
    }

    var panelObserver = new MutationObserver(function() {
      if (document.querySelector('[class*="App_app"], [class*="AppMainContainer"], main')) {
        panelObserver.disconnect();
        setTimeout(tryInjectPanel, 1200);
      }
    });
    panelObserver.observe(document.body, { childList: true, subtree: true });
  </script>
</body>
</html>
```

### `public/cms/tutorial.json`

```json
{
  "title": "How to update your site",
  "videoUrl": "",
  "body": "Watch the walkthrough above to learn how to update text, images, and more. Changes go live automatically after you hit Publish."
}
```

> Add the YouTube/Vimeo URL after recording the client walkthrough video. This is editable from inside the CMS under the Tutorial collection.

### `public/cms/preview-templates.js`

Create a file that registers Decap CMS preview templates for each collection.
See the reference implementation including:
- `imageOrPlaceholder()` helper — shows a placeholder instead of broken images during upload delay
- Site CSS variables injected into the preview iframe
- One `CMS.registerPreviewTemplate()` call per collection file

---

## Step 3 — `public/cms/config.yml`

```yaml
backend:
  name: git-gateway
  branch: main

local_backend:
  url: http://localhost:8081/api/v1
  allowed_hosts: ['localhost', '127.0.0.1']

media_folder: public/uploads
public_folder: /uploads

collections:
  # Mirror site navigation order. Most-edited first. Site Settings last.

  - name: "tutorial"
    label: "🎓 Tutorial"
    files:
      - name: "walkthrough"
        label: "Walkthrough Video"
        file: "public/cms/tutorial.json"
        fields:
          - { name: "title", label: "Panel Title", widget: "string" }
          - { name: "videoUrl", label: "Video URL", widget: "string", hint: "YouTube, Vimeo, or direct MP4 URL." }
          - { name: "body", label: "Helper Text", widget: "text" }

  # [Add page collections here — see Step 4]

  - name: "site"
    label: "⚙️ Site Settings"
    files:
      - name: "general"
        label: "General"
        file: "content/site/general.json"
        fields:
          - { name: "siteName", label: "Site Name", widget: "string" }
          - { name: "logo", label: "Logo", widget: "image", required: false }
          - { name: "primaryColor", label: "Primary Brand Color", widget: "color", required: false }
          - { name: "phoneDisplay", label: "Phone Display", widget: "string" }
          - { name: "phoneHref", label: "Phone Link", widget: "string" }
          - { name: "email", label: "Email", widget: "string" }
          - { name: "tagline", label: "Tagline", widget: "text" }
          - { name: "handoffSha", label: "Factory State (Git SHA)", widget: "string", hint: "Do not edit. Used by Sorted for factory reset." }
          - { name: "handoffDate", label: "Handoff Date", widget: "string", hint: "Do not edit." }

custom_css: "/cms/cms.css"
```

**Rules:**
- `logo_url` is top-level (not under `backend`) — displays Sorted mark in CMS nav
- Tutorial collection always first so client sees it immediately
- Site Settings always last
- Every image field needs a `hint` with recommended dimensions and file size
- No emojis inside dropdown option labels — top-level labels only
- Site Settings should include `primaryColor` (color widget) and `logo` (image widget) for brand control
- Integration fields (e.g. Tokeet IDs, booking domains) go in Site Settings under a clear group

---

## Step 4 — Content splitting pattern

Each page gets its own subfolder under `content/`. Each logical section gets its own JSON file.

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
    general.json     ← name, email, phone, tagline, brand, integrations, handoffSha, handoffDate
```

**Rules:**
- One JSON file per page section — not one file per page
- File names match their CMS collection file `name` field
- Populate JSON files with current hardcoded values as seed data
- `content/site/general.json` must always include `handoffSha` and `handoffDate`

---

## Step 5 — `lib/content.ts` loader pattern

The content loader reads JSON fresh from disk on every call. No defaults are spread — the JSON files are the source of truth.

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
- Icon keys stored as strings in JSON (`IconName` union type), mapped to Lucide components in the page file — never import React components into JSON
- The JSON files themselves are the factory reset state — keep them matching the approved build exactly

---

## Step 6 — Netlify Image CDN helper

Create `lib/image.ts`:

```typescript
export function imgSrc(
  path: string,
  opts: { w?: number; fit?: string; position?: string } = {}
): string {
  if (!path) return ""
  const params = new URLSearchParams()
  if (opts.w) params.set("w", String(opts.w))
  if (opts.fit) params.set("fit", opts.fit)
  if (opts.position) params.set("position", opts.position)
  const query = params.toString()
  return `/.netlify/images?url=${encodeURIComponent(path)}${query ? "&" + query : ""}`
}
```

Use in page components: `imgSrc(hero.image, { w: 1400, fit: "cover" })`

Wrap all `<img>` tags and background-image style strings with `imgSrc()`. This gives automatic WebP conversion and resizing via Netlify Image CDN at no extra cost.

---

## Step 7 — Wire page components

```tsx
import { loadHeroContent } from "@/lib/content"
import { imgSrc } from "@/lib/image"

export default function Page() {
  const hero = loadHeroContent()
  return (
    <section style={{ backgroundImage: `url('${imgSrc(hero.image, { w: 1400 })}')` }}>
      <h1>{hero.heading}</h1>
    </section>
  )
}
```

---

## Step 8 — Factory reset setup

After the first clean build:

```bash
# Record the handoff SHA
git log --oneline -1
# Copy the SHA into content/site/general.json as handoffSha
# Copy today's date as handoffDate

# Create reset script
cp /path/to/sorted/templates/scripts/reset.sh scripts/reset.sh
# Edit HANDOFF_SHA and CLIENT variables in reset.sh

# Tag the handoff commit
git tag handoff/[client-slug] [sha]
git push origin --tags
```

See `doctrine/factory-reset.md` for the full reset standard.

---

## Step 9 — Netlify Identity — client access

1. Netlify → Identity → Registration → **Invite Only** (do this before sending client anything)
2. Identity → Invite users → client email
3. Client receives invite, sets password, logs in

See `doctrine/client-onboarding.md` for the full onboarding standard and handoff message template.

---

## Step 10 — Test locally

Two terminals required:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run cms
```

Access CMS at `http://localhost:3000/cms/index.html` (not `/cms/` — Next.js intercepts the bare path).

In local mode:
- Auth overlay is hidden — Studio loads directly
- Save button reads "Save draft"
- Saves write to local content files via `decap-server` on port 8081
- No Git commits, no Netlify deploys

---

## Step 11 — Verify checklist

- [ ] `/cms/` loads three-column Studio layout with Sorted wordmark + green dot in topbar
- [ ] Site initial mark and site name appear in topbar
- [ ] Auth overlay appears on production, hidden on localhost
- [ ] All page tabs present in logical order — Settings last
- [ ] Every section opens an editor with grouped fields (Content, Buttons, Media, etc.)
- [ ] List fields show inline cards with summary previews and add/remove
- [ ] Property list editor (if applicable) supports collapsible cards and nested field editing
- [ ] Image fields show thumbnail + path input + upload button
- [ ] Colour fields render a colour picker
- [ ] Desktop and mobile preview toggles work
- [ ] Live preview iframe loads the section's `previewPath`
- [ ] Save draft writes JSON through `npm run cms` local backend
- [ ] Publish commits to Git via Git Gateway on production
- [ ] Toast notifications appear on save/publish success and failure
- [ ] `imgSrc()` wrapping applied to all images
- [ ] No hardcoded copy remains in page components
- [ ] Site builds clean with `npm run build` (regenerates `studio-content.json`)
- [ ] Factory reset script created and handoff SHA tagged
- [ ] Netlify Identity set to Invite Only
- [ ] Client invited and confirmed login

---

## Reference implementations

- **`warwickshire-str`** — most complete and current. Full three-column Studio, dual-mode save (local + Git Gateway), property list editor with collapsible cards, field grouping, toast notifications, desktop/mobile preview, auth overlay, brand colour control, Tokeet integration fields. Use as primary reference.
- `templates/sorted-studio/` — canonical template files copied by the upgrade script
- `templates/gym-site/` — gym/martial arts site pattern
- `templates/property-site/` — property/STR site pattern

## Important constraints

- Decap CMS requires Netlify hosting. Do not apply to Hostinger-hosted sites.
- Every Sorted client site is Netlify-hosted specifically because of this dependency.
- The factory reset tag (`handoff/[client-slug]`) must be pushed before handing off.
- Studio `studio.css` and `studio.js` are canonical product files — copy them, do not hand-write them.
- The manifest is the single source of truth — if a field is not in the manifest, it is not in the Studio UI.
