# Client Site Scaffold

A Next.js static site template for building principled, flexible client sites. This scaffold embodies the **Sorted design system** — principled in concept, flexible in execution.

## Design Philosophy

This template is built on a **cascading skill hierarchy**:

```
Foundational Principles          Concrete Application
         ↓                              ↓
┌─────────────────────┐        ┌─────────────────────────┐
│   taste-skills      │   →    │ sorted-local-site-refresh│
│                     │        │                         │
│ • visual-hierarchy  │        │ Component patterns      │
│ • color-system      │        │ Section structures      │
│ • typography-scale  │        │ Layout templates          │
│ • feedback-patterns │        │ Page types                │
│ • micro-interaction │        └─────────────────────────┘
└─────────────────────┘                 ↓
                                         ↓
                              ┌─────────────────────┐
                              │   Your Client Site  │
                              │                     │
                              │ • Brand-customized  │
                              │ • Content-specific    │
                              │ • Purpose-built       │
                              └─────────────────────┘
```

**The principle:** Start from foundational taste skills, apply through `sorted-local-site-refresh` patterns, then customize freely for the client's specific needs. The skills provide guardrails, not constraints.

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

### 2. Apply the skill cascade

Build using this decision hierarchy:

#### Level 1: Foundation (taste-skills)
These are the **principles** — always reference first (https://github.com/rennyreign/taste-skill):
- `skills/visual-hierarchy/` — spacing, type scale, layout
- `skills/color-system/` — palette, accessibility
- `skills/typography-scale/` — font relationships
- `skills/feedback-patterns/` — button states, transitions
- `skills/micro-interaction-spec/` — animation timing

#### Level 2: Application (sorted-local-site-refresh) ⭐ CENTERPIECE
This is the **pattern library** — your primary reference:
- https://github.com/rennyreign/taste-skill/tree/main/skills/sorted-local-site-refresh
- Component patterns derived from GB Halesowen
- Section templates (hero, feature grids, CTAs)
- Page type structures

#### Level 3: Implementation (your build)
**Customize freely** within the principles:
- Brand colors override defaults
- Content drives layout choices
- Client-specific features added
- New patterns invented as needed

**Rule of thumb:** If a design decision isn't covered by Level 1 or 2, make the call that serves the client best. The skills are guardrails, not shackles.

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

Reference these in order when making design decisions:

### Level 1: Principles (taste-skills)
These constrain the **how** — the mechanics of good design:

| Principle | Key Rules |
|-----------|-----------|
| **visual-hierarchy** | Section spacing: 5rem→8rem; Max-width: 1400px; Grid gap: 2rem |
| **color-system** | Accessible contrast; semantic palette mapping |
| **typography-scale** | Fluid sizing with `clamp()`; max 3 weights per page |
| **feedback-patterns** | Hover: 200ms transitions; Focus: visible rings |
| **micro-interaction-spec** | Page enter: 0.55s `cubic-bezier(0.32, 0.72, 0, 1)` |

### Level 2: Patterns (sorted-local-site-refresh) ⭐
These provide the **what** — tested component structures:

| Pattern | Use When |
|---------|----------|
| **Hero section** | Homepage above-fold, needs strong value prop |
| **Feature grid** | 3-4 value propositions, equal hierarchy |
| **Split content** | Text + image, narrative sections |
| **CTA block** | Conversion moment, dark background preferred |
| **Pill navigation** | 4-6 nav items, sticky header required |

*Reference: https://github.com/rennyreign/taste-skill/tree/main/skills/sorted-local-site-refresh*

### Level 3: Your Call
When patterns don't fit, decide based on:
1. Client brand voice (what feels right for them?)
2. Content needs (what serves the information best?)
3. User context (what will visitors actually need?)

**Examples of valid deviations:**
- Using a sidebar nav instead of pill (content-heavy site)
- Adding video backgrounds (brand calls for it)
- Inventing new card patterns (client has unique offering)
- Changing color system completely (brand has established palette)

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

**Design System**: Principled → Flexible  
**Skills repo**: https://github.com/rennyreign/taste-skill  
**Foundation**: taste-skills — visual-hierarchy, color-system, typography-scale, feedback-patterns, micro-interaction-spec  
**Application**: sorted-local-site-refresh — component patterns, section structures  
**Provenance**: Derived from Gracie Barra Halesowen (May 2026)  
**Questions**: Reference sorted project context or ask Cascade
