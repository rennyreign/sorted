# Assembly Library Index

## Purpose

This is the catalogue of all approved, renderable assemblies.

Each assembly in this index has been:

- Visually validated at 1280px and 390px
- Checked against the spacing system
- Checked against the token system
- Verified to have no placeholder content
- Tested in a real build

Do not add assemblies to this index without validation.

---

## Assembly naming convention

```
[family]-[variant]-[modifier]
```

- `family`: hero, trust, services, proof, process, about, testimonials, cta, nav, footer
- `variant`: the core layout or purpose
- `modifier`: optional theme or size variant

Examples:

- `hero-utility-split`
- `trust-stat-strip`
- `services-3-cards`
- `proof-gallery-2`
- `testimonials-featured`

---

## Hero assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `hero-utility-split` | Two-column hero with text left and large image right | trades, local services | utility |
| `hero-utility-phone` | Hero with phone number as primary visual element | emergency trades | utility |
| `hero-utility-centered` | Centered text with CTA above a supporting image | simple local services | utility |
| `hero-editorial-centered` | Large centered headline over minimal image | professional services | editorial |
| `hero-editorial-split` | Split layout with large type and editorial image | premium professional | editorial |
| `hero-lifestyle-fullbleed` | Full-bleed image with text overlay | beauty, hospitality, venues | lifestyle |
| `hero-lifestyle-split` | Split layout with lifestyle photography | family businesses, food | lifestyle |

## Trust assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `trust-stat-strip` | Horizontal row of 3–4 stat blocks | speed, response, coverage | utility |
| `trust-badges-local` | Local area + years + family badges | local credibility | utility, lifestyle |
| `trust-badges-accreditation` | Credentials and certification badges | expertise trust gap | editorial, utility |
| `trust-reviews-strip` | Star rating + review count + platform | quality trust gap | all |
| `trust-pricing-promise` | Pricing guarantee + fair quote promise | price trust gap | utility |
| `trust-stat-years` | Years experience + jobs completed | expertise | utility, editorial |

## Services assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `services-3-cards` | Three equal cards with image, title, description | 3 clear services | utility |
| `services-2-featured` | One large featured service + one supporting | 2 distinct services | editorial, lifestyle |
| `services-list-accordion` | Expandable list of services | many services | utility |
| `services-3-cards-lifestyle` | Three cards with lifestyle photography | beauty, hospitality | lifestyle |
| `services-accordion` | Accordion list with detailed descriptions | complex professional | editorial |
| `services-timetable` | Class or session timetable | fitness, classes | utility |

## Proof / work assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `proof-gallery-2` | Two large work images with captions | work evidence | utility |
| `proof-gallery-3` | Three work images in a grid | rich work photography | utility, lifestyle |
| `proof-portrait-credentials` | Portrait + credentials list | people-focused trust | editorial, lifestyle |
| `proof-before-after` | Before and after image pair | visible results | utility, lifestyle |
| `proof-case-study` | One detailed result story | premium services | editorial |
| `proof-stat-block` | Numbers and guarantees without photos | weak photography | utility |
| `proof-guarantee` | Warranty and guarantee statement | no photography | utility |

## Process assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `process-steps-3` | Three numbered steps in a row | simple service journey | utility |
| `process-steps-4` | Four numbered steps in a row | services with more stages | utility |
| `process-timeline` | Vertical timeline with stages | complex professional services | editorial |
| `process-booking-flow` | Call → book → confirm flow | booking-led businesses | utility, lifestyle |

## About assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `about-split-credentials` | Split image + credentials text | trades, local services | utility |
| `about-split-team` | Split image + team introduction | team-focused businesses | lifestyle |
| `about-centered-story` | Centered text with single image | story-led businesses | lifestyle, editorial |
| `about-split-venue` | Venue image + details | hospitality, venues | lifestyle, architectural |

## Testimonials assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `testimonials-featured` | One large featured quote + two supporting | one standout review | all |
| `testimonials-cards-3` | Three equal testimonial cards | similar reviews | all |
| `testimonials-single` | One large testimonial | minimal content | all |
| `testimonials-carousel` | Multiple reviews in a carousel | rich testimonials | all |

## CTA assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `cta-band-phone` | Full-width dark band with phone CTA | call_now | utility |
| `cta-sticky-phone` | Sticky bottom bar with phone number | urgent call_now | utility |
| `cta-band-book` | Full-width band with booking CTA | book_intro | utility, lifestyle |
| `cta-split-book` | Split layout with booking form | premium booking | editorial |
| `cta-band-form` | Full-width band with quote form | request_quote | utility |
| `cta-band-location` | Full-width band with address/directions | visit_shop | utility |
| `cta-split-location` | Map + contact details | visit_shop | editorial |
| `cta-band-whatsapp` | Full-width band with WhatsApp CTA | whatsapp | utility |
| `cta-band-shop` | Full-width band with shop button | order_online | utility |
| `cta-split-shop` | Products + shop button | order_online | editorial |

## Nav assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `nav-standard` | Logo + links + phone + CTA | most sites | all |
| `nav-pill` | Centered pill navigation with phone | modern local services | utility, lifestyle |
| `nav-transparent` | Transparent over hero, solid on scroll | full-bleed heroes | lifestyle, editorial |

## Footer assemblies

| ID | Description | Best for | Visual language |
|---|---|---|---|
| `footer-standard` | Multi-column with links and contact | most sites | all |
| `footer-minimal` | Logo + contact + legal | simple sites | editorial, minimal |

---

## Adding a new assembly

To add an assembly:

1. Create a real component file in `11-assembly-library/[family]/[assembly-id]/component.tsx`
2. Create a manifest in `11-assembly-library/[family]/[assembly-id]/manifest.json`
3. Add the assembly to this INDEX
4. Validate the assembly in a real build at 1280px and 390px
5. Add the assembly to the Decision Language decision trees if applicable
6. Document the patch in `operators/skills/design-patch-notes.md`

---

## Manifest format

```json
{
  "id": "services-3-cards",
  "family": "services",
  "description": "Three equal service cards with image, title, description, and contact link.",
  "visual_languages": ["utility"],
  "intensity": "medium",
  "slots": {
    "title": "string",
    "subtitle": "string",
    "services": [
      {
        "title": "string",
        "description": "string",
        "image": "asset_id",
        "link": "string"
      }
    ]
  },
  "validation": [
    "Exactly 3 services",
    "Each service has a real image",
    "Title is left-aligned",
    "Cards use standard card padding"
  ]
}
```
