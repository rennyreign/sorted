# CMS Template Infrastructure Guide

> Standardized setup for Decap CMS + Next.js + Playwright

## Quick Start

```bash
# Create new site from template
/new-site type=property name=my-site
```

## Template Structure

All templates include:

```
├── app/                    # Next.js App Router pages
├── components/            # Shared React components
├── content/               # CMS-managed JSON content
│   ├── admin/
│   ├── homepage/
│   ├── about/
│   ├── contact/
│   └── site/
├── lib/
│   └── content.ts        # CMS loaders & types
├── public/
│   └── cms/              # Decap CMS (index.html, config.yml)
├── tests/                # Playwright test suite
│   └── cms/
│       └── smoke.spec.js
├── dev-server.js         # Reliable dev server wrapper
├── playwright.config.ts  # Test configuration
└── package.json
```

## NPM Scripts

```bash
npm run dev:safe    # Start dev server (with cleanup)
npm run cms         # Start CMS proxy
npm test            # Run all tests
npm run test:cms    # Run CMS tests only
```

## Dev Server

Use `dev-server.js` for reliable local development:

```bash
./dev-server.js
# or
node dev-server.js
```

Features:
- Auto-cleans port 3000
- Graceful shutdown
- No SIGHUP issues

## CMS Access

```bash
# Terminal 1 - Dev server
npm run dev:safe

# Terminal 2 - CMS proxy
npm run cms

# Browser
http://localhost:3000/cms/
```

## Testing

```bash
# All tests
npm test

# Just CMS
npm run test:cms

# With UI
npm run test:ui
```

## Template Types

| Template | Use Case | Collections |
|----------|----------|-------------|
| `property-site` | Rentals, short stays | Properties, Benefits, About, Contact, Site |
| `gym-site` | Martial arts, fitness | Programs, Instructors, Schedule, About, Contact |
| `base-site` | Simple brochure sites | Homepage, About, Contact |

## New Template Creation

1. Copy from existing template
2. Customize `config.yml` collections
3. Update content JSON files
4. Adjust page components
5. Test with Playwright

## Workflows Available

- `/new-site` - Create complete site from template
- `/start-dev` - Start dev server reliably
