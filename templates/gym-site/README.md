# Gym Site Template

> Decap CMS + Next.js template for gyms, martial arts academies, fitness studios

## Quick Start

```bash
# Copy template to new project
cp -r /path/to/sorted/templates/gym-site ./my-gym-site
cd my-gym-site

# Install dependencies
npm install

# Install CMS proxy
npm install --save-dev decap-server

# Start dev server
npm run dev:safe

# In another terminal - start CMS proxy
npm run cms

# Access CMS
open http://localhost:3000/cms/
```

## CMS Collections

| Collection | Content |
|------------|---------|
| Getting Started | Admin notice/instructions |
| Homepage | Hero, features, CTA |
| Programs | Class/program cards |
| Benefits | Why train with us |
| Testimonials | Member quotes |
| Timetable | Weekly schedule |
| Contact | Info, map, booking |
| Site Settings | Global settings |

## File Structure

```
├── app/                    # Next.js pages
├── components/             # React components
├── content/                # CMS-managed JSON
│   ├── admin/
│   ├── homepage/
│   ├── programs/
│   ├── benefits/
│   ├── testimonials/
│   ├── timetable/
│   ├── contact/
│   └── site/
├── lib/
│   └── content.ts         # CMS loaders
├── public/
│   └── cms/               # Decap CMS
├── tests/                  # Playwright tests
├── dev-server.js          # Reliable dev server
└── playwright.config.ts   # Test config
```

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| dev | `next dev` | Standard dev server |
| dev:safe | `node dev-server.js` | Reliable with cleanup |
| cms | `npx decap-server` | CMS proxy (port 8081) |
| test | `playwright test` | Run tests |
| build | `next build` | Production build |

## Local Development

**⚠️ Requires TWO terminals:**

**Terminal 1:**
```bash
npm run dev:safe
```

**Terminal 2:**
```bash
npm run cms
```

Then open http://localhost:3000/cms/

## Deployment

1. Push to GitHub
2. Connect to Netlify
3. Enable Netlify Identity
4. Enable Git Gateway
5. CMS live at `https://yoursite.com/cms/`

## Customization

- Edit `content/site/general.json` for site name/contact
- Update `public/cms/config.yml` for new collections
- Modify `lib/content.ts` for new content types
- Add pages in `app/(site)/`
