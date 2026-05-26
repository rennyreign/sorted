---
description: Add Decap CMS to a Sorted client site
---

# SortedUpdates — CMS Installation Workflow

Use this workflow whenever a new Sorted client site needs SortedUpdates wired up.
All Sorted client sites use Decap CMS with Netlify Identity + Git Gateway.

**Reference implementation:** `rennyreign/savannah-villegas` — the most complete and up-to-date example of this full stack. Study `public/cms/`, `lib/content.ts`, and `content/` in that repo before starting.

---

## Prerequisites

- Site is deployed on Netlify (Decap requires Netlify — do not use on Hostinger sites)
- Netlify Identity is enabled: Site settings → Identity → Enable
- Git Gateway is enabled: Identity → Services → Enable Git Gateway
- Registration set to **Invite Only** before sending client access
- Site is a Next.js project with a `public/` folder and a `lib/content.ts` pattern

---

## Step 1 — package.json

Add the `cms` script and `decap-server` dev dependency:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "cms": "npx decap-server"
},
"devDependencies": {
  "decap-server": "^3.7.0"
}
```

Run `npm install` after editing.

---

## Step 2 — Create `public/cms/` folder

Four files required: `index.html`, `config.yml`, `cms.css`, `tutorial.json`.
Copy Sorted favicon assets from `rennyreign/sorted/public/favicon.png` and `favicon.svg` into `public/cms/sorted-favicon.png` and `public/cms/sorted-favicon.svg`.

### `public/cms/index.html`

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

### `public/cms/cms.css`

```css
.deploy-notice {
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 10px 20px;
  text-align: center;
}
```

### `public/cms/preview-templates.js`

Create a file that registers Decap CMS preview templates for each collection.
See `rennyreign/savannah-villegas/public/cms/preview-templates.js` for the complete reference implementation including:
- `imageOrPlaceholder()` helper — shows a placeholder instead of broken images during upload delay
- Site CSS variables injected into the preview iframe
- One `CMS.registerPreviewTemplate()` call per collection file

---

## Step 3 — `public/cms/config.yml`

```yaml
backend:
  name: git-gateway
  branch: main

logo_url: /cms/sorted-favicon.png

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
          - { name: "name", label: "Name", widget: "string" }
          - { name: "phone", label: "Phone", widget: "string" }
          - { name: "email", label: "Email", widget: "string" }
          - { name: "tagline", label: "Tagline", widget: "string" }
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

---

## Step 4 — Content splitting pattern

Each page gets its own subfolder under `content/`. Each logical section gets its own JSON file.

```
content/
  homepage/
    hero.json        ← heading, subheading, image
    intro.json       ← intro section copy
    contact.json     ← contact section copy + image
  about/
    hero.json        ← hero banner
    philosophy.json  ← body copy sections
    human-first.json ← closing section + image
    content.json     ← value pillars (shared if used on multiple pages)
  site/
    general.json     ← name, email, phone, tagline, handoffSha, handoffDate
```

**Rules:**
- One JSON file per page section — not one file per page
- File names match their CMS collection file `name` field
- Populate JSON files with current hardcoded values as seed data
- `content/site/general.json` must always include `handoffSha` and `handoffDate`

---

## Step 5 — `lib/content.ts` loader pattern

```typescript
import { readFileSync } from "fs"
import { join } from "path"

function loadJSON<T>(relativePath: string, defaults: T): T {
  try {
    const file = readFileSync(join(process.cwd(), "content", relativePath), "utf-8")
    return { ...defaults, ...JSON.parse(file) }
  } catch {
    return defaults
  }
}

export type HeroContent = {
  heroImage: string
  heading: string
  subheading: string
}

export function loadHeroContent(): HeroContent {
  return loadJSON<HeroContent>("homepage/hero.json", {
    heroImage: "/default-hero.jpg",
    heading: "Default heading",
    subheading: "Default subheading",
  })
}
```

**Rules:**
- Always spread `defaults` first, then JSON — ensures missing fields never crash
- One type + one loader per JSON file
- Fallback defaults must match the original approved content exactly (this IS the factory reset state)
- Icon keys stored as strings in JSON, mapped to components in the page file — never import React components into JSON

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

Use in page components: `imgSrc(hero.heroImage, { w: 1400, fit: "cover" })`

Wrap all `<img>` tags and background-image style strings with `imgSrc()`. This gives automatic WebP conversion and resizing via Netlify Image CDN at no extra cost.

---

## Step 7 — Wire page components

```tsx
import { loadHeroContent } from "@/lib/content"
import { imgSrc } from "@/lib/image"

export default function Page() {
  const hero = loadHeroContent()
  return (
    <section style={{ backgroundImage: `url('${imgSrc(hero.heroImage, { w: 1400 })}')` }}>
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

---

## Step 11 — Verify checklist

- [ ] `/cms/` loads login screen with Sorted `s.` favicon in browser tab
- [ ] Sorted logo mark appears in CMS nav bar top-left
- [ ] Tutorial panel appears bottom-right after login
- [ ] All collections present in logical order — Tutorial first, Site Settings last
- [ ] Every image field has a hint with recommended dimensions
- [ ] Editing and saving creates a GitHub commit
- [ ] Netlify builds and reflects change within ~60 seconds
- [ ] `imgSrc()` wrapping applied to all images
- [ ] No hardcoded copy remains in page components
- [ ] Site builds clean with `npm run build`
- [ ] Factory reset script created and handoff SHA tagged
- [ ] Netlify Identity set to Invite Only
- [ ] Client invited and confirmed login

---

## Reference implementations

- **`rennyreign/savannah-villegas`** — most complete. Full split content pattern, tutorial panel, factory reset, image CDN, preview templates. Use as primary reference.
- `templates/gym-site/` — gym/martial arts site pattern
- `templates/property-site/` — property/STR site pattern

## Important constraints

- Decap CMS requires Netlify hosting. Do not apply to Hostinger-hosted sites.
- Every Sorted client site is Netlify-hosted specifically because of this dependency.
- The factory reset tag (`handoff/[client-slug]`) must be pushed before handing off.
