# Property Site Template

A Next.js static export template for short-term property rental/accommodation websites.
Built with SortedUpdates (Decap CMS) for client content management.

**Reference implementation:** `rennyreign/warwickshire-str`

---

## Features

- CMS-driven content — all text, images, and listings editable via SortedUpdates
- Property listing system — full detail pages auto-generated per property
- Multi-audience pages — Business Stays, Family Stays, Relocation Stays
- Guest reviews — per-property, CMS-managed
- Direct enquiry — contact page, phone, WhatsApp
- SEO — Next.js App Router with `generateMetadata`
- Responsive — mobile-first
- Fast — static export (`output: 'export'`) hosted on Netlify

---

## Content Collections (CMS)

| Collection | File(s) | Purpose |
|---|---|---|
| Homepage | `content/homepage/` | Hero, trust strip, who we help, CTA |
| Properties | `content/properties/list.json` | All property listings |
| Benefits | `content/benefits/` | Why stay with us section |
| About Page | `content/about/` | About page content |
| Business Stays Page | `content/business-stays/` | Contractor/business traveller page |
| Families & Visitors Page | `content/family-stays/` | Family stays page |
| Relocation Stays Page | `content/relocation-stays/` | Relocation page |
| Contact | `content/contact/` | Contact page |
| Footer | `content/footer/` | Footer content and links |
| Site Settings | `content/site/general.json` | Phone, email, address, social |

---

## Property Object Shape

Each property in `content/properties/list.json`:

```json
{
  "slug": "property-slug",
  "name": "Property Name",
  "location": "Town, County",
  "bedrooms": 3,
  "maxGuests": 6,
  "priceFrom": 95,
  "heroImage": "/images/property.jpg",
  "imageAlt": "Description of property",
  "summary": "One-line description",
  "amenities": ["WiFi", "Parking", "Garden"],
  "highlights": ["Close to motorway", "Fast broadband"],
  "bestFor": ["Business stay", "Relocation stay"],
  "gallery": ["/images/img1.jpg", "/images/img2.jpg"],
  "mapLabel": "Short location label for map",
  "reviews": [
    { "quote": "Great stay.", "name": "Mark T.", "type": "Business stay" }
  ]
}
```

---

## Key Files

```
app/
  page.tsx                    ← Homepage
  properties/
    page.tsx                  ← Property listing page
    [slug]/page.tsx           ← Dynamic property detail page
  business-stays/page.tsx     ← Audience page
  family-stays/page.tsx       ← Audience page
  relocation-stays/page.tsx   ← Audience page
  about/page.tsx
  contact/page.tsx

components/
  Nav.tsx
  Footer.tsx
  PropertyCard.tsx
  PropertyGallery.tsx
  PageTransition.tsx

lib/
  properties.ts               ← Property type + loadProperties()
  content.ts                  ← All other CMS content loaders

content/
  properties/list.json        ← All property listings
  homepage/ benefits/ about/
  business-stays/ family-stays/ relocation-stays/
  contact/ footer/ site/

public/
  cms/
    index.html                ← SortedUpdates CMS shell (tutorial panel included)
    config.yml                ← Decap CMS collection config
    tutorial.json             ← { title, videoUrl, body } — shown in CMS panel
    cms.css                   ← CMS styling
    preview-templates.js      ← Decap preview registrations

tests/
  cms/smoke.spec.js           ← Playwright CMS + frontend smoke tests
```

---

## CMS Setup (SortedUpdates)

After deployment:
1. Enable Netlify Identity on the site (Invite Only)
2. Enable Git Gateway
3. Invite client via Netlify Identity
4. Update `public/cms/tutorial.json` with the walkthrough video URL
5. CMS is live at `[site-url]/cms`

---

## Getting Started

```bash
npm install
npm run dev       # Next.js dev server on :3000
npm run cms       # Decap local proxy on :8081 (run alongside dev)
npm run build     # Production static export → out/
```

---

## Defensive Coding Notes

- All `.map()` calls on CMS arrays must use `|| []` guard: `(p.bestFor || []).some(...)`
- `loadProperties()` re-reads the JSON file at runtime — always use this, not a module-level import
- `generateStaticParams` may import the array directly at build time (safe — no CMS writes during build)
- Property detail page guards: `property.amenities || []`, `property.highlights || []`, `property.gallery || []`

---

## Delivery Checklist (Stage 2 — CMS handoff)

- [ ] `public/cms/tutorial.json` — video URL added
- [ ] Netlify Identity set to Invite Only
- [ ] Client invited via Netlify Identity
- [ ] `scripts/reset.sh` created
- [ ] `git tag handoff/[client-slug]`
- [ ] Client quote page live at `sortmydigital.com/clients/[client-slug]`
- [ ] Quote page password sent to client separately
