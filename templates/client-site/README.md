# Client Site Scaffold

A Next.js static site template derived from the Gracie Barra Halesowen build — the first working application of Sorted design skills.

## Purpose

This scaffold provides the **framework and patterns** for building new client sites. It is not a finished design — it is the starting point that gets customized for each client's brand, content, and requirements.

## Workflow: Template → Client Repo

### 1. Copy this template to a new repo

```bash
# Create new client repo on GitHub
cd ~/Projects
mkdir newclient-site
cd newclient-site

# Copy scaffold contents
cp -r ~/Projects/sorted/templates/client-site/* .
rm -rf .git  # Remove template git history

# Initialize and push
git init
git add -A
git commit -m "init: client site from sorted scaffold"
git remote add origin https://github.com/rennyreign/newclient-site.git
git push -u origin main
```

### 2. Reference skills during build

During development, reference these skill files from the `sorted` repo:

| Skill | Location | Purpose |
|-------|----------|---------|
| **visual-hierarchy** | `sorted/.agents/skills/visual-hierarchy/SKILL.md` | Spacing, type scale, layout principles |
| **feedback-patterns** | `sorted/.agents/skills/feedback-patterns/SKILL.md` | Button states, transitions, micro-interactions |
| **micro-interaction-spec** | `sorted/.agents/skills/micro-interaction-spec/SKILL.md` | Animation timing, easing curves |
| **color-system** | `sorted/.agents/skills/color-system/SKILL.md` | Palette generation, accessibility |
| **sorted-local-site-refresh** | `sorted/.agents/skills/sorted-local-site-refresh/SKILL.md` | Component patterns, section structures |

### 3. Customize for the client

**Required changes on first copy:**

1. **Update `package.json`** — change name, add any client-specific deps
2. **Update `client/brief.md`** — fill in actual client details
3. **Customize `app/layout.tsx`** — client name, meta description, favicon
4. **Customize `components/Nav.tsx`** — client logo, nav links, brand colors
5. **Customize `components/Footer.tsx`** — client info, legal links
6. **Add client assets** — images to `public/`, design files to `client/`

### 4. Build specific pages

Replace/modify the starter pages:

- `app/page.tsx` — homepage (customize for client offer)
- `app/about/page.tsx` — about/story page
- Add sections as needed: `app/services/`, `app/contact/`, `app/programs/`, etc.

### 5. Learnings flow back

After each client build, update this template with:

- New component patterns that worked well
- Better starter structures
- Improved animation patterns
- Cleaner TypeScript patterns

```bash
cd ~/Projects/sorted
git add templates/client-site/
git commit -m "chore: update scaffold from [client-name] learnings"
```

## Template Structure

```
templates/client-site/
├── README.md                 # This file
├── package.json              # Dependencies (Next.js 16, Tailwind v4, React 19)
├── tsconfig.json             # TypeScript config with @/* paths
├── next.config.mjs           # Static export config
├── postcss.config.mjs        # Tailwind v4 PostCSS setup
├── .gitignore                # Standard Next.js ignores
├── next-env.d.ts             # Next.js types
├── client/                   # Client context (not deployed)
│   ├── brief.md              # Client brief template
│   ├── notes.md              # Build notes placeholder
│   └── assets/               # Design files, reference images
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with fonts
│   ├── globals.css           # Tailwind v4 base + animations
│   ├── page.tsx              # Homepage starter
│   └── about/
│       └── page.tsx          # About page starter
├── components/               # Reusable components
│   ├── Nav.tsx               # Navigation with mobile menu
│   ├── Footer.tsx            # Footer component
│   └── PageTransition.tsx    # Page load animation wrapper
└── public/                   # Static assets
    └── .gitkeep              # Images, fonts, etc.
```

## Key Patterns (from GB Halesowen)

### 1. Root-level routes

Sites live at the root — no `/clientname/` prefixing:
- `/` — homepage
- `/about` — about page
- `/services` — services page
- etc.

### 2. Client-specific layout

Each site has its own `layout.tsx` with:
- Client brand colors
- Client fonts (if different from default)
- Client-specific metadata

### 3. Responsive navigation

`Nav.tsx` provides:
- Sticky header with backdrop blur
- Desktop pill navigation
- Mobile hamburger menu with full-screen overlay
- WhatsApp icon link (customize per client preference)

### 4. Animation system

From `globals.css`:
- `page-enter` — subtle fade-in on page load
- `fade-in` — scroll-triggered content reveal
- `scroll-progress` — top-of-page progress bar

### 5. Tailwind v4 setup

- `@import "tailwindcss"` — new v4 syntax
- `@theme` block for CSS variables
- Custom animations in `@layer base`

## Skills Reference Quick Guide

When building a new client site, keep these skill principles in mind:

### From visual-hierarchy
- **Section spacing**: 5rem (80px) mobile, 8rem (128px) desktop
- **Type scale**: Use `clamp()` for fluid sizing
- **Max-width**: `1400px` for main containers
- **Grid gap**: 32px (2rem) default

### From feedback-patterns
- **Button hover**: `hover:bg-[#2a2a2a]` for primary buttons
- **Link transitions**: `transition-colors duration-200`
- **Focus states**: ensure visible focus rings

### From micro-interaction-spec
- **Page enter**: `0.55s cubic-bezier(0.32, 0.72, 0, 1)`
- **Fade in**: `0.4s cubic-bezier(0.32, 0.72, 0, 1)`
- **Arrow icons**: translate on hover `group-hover:translate-x-0.5`

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build static export to ./out/
```

## Deployment

The scaffold is configured for **static export** (`output: "export"` in next.config.mjs). Deploy the `out/` folder to:

- Hostinger (FTP upload)
- Netlify (drag & drop or git integration)
- Vercel (though static export disables some features)

## Updating This Template

This is a **living document**. After each client build:

1. Identify patterns that worked well
2. Copy improved components back to this template
3. Update this README with new learnings
4. Commit to `sorted` with message: `chore: update client-site scaffold from [client]`

---

**Current template version**: Derived from Gracie Barra Halesowen (May 2026)  
**Skills reference**: `sorted/.agents/skills/`  
**Questions**: Reference sorted project context or ask Cascade
