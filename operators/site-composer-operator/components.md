# Sorted Component Library — Site Composer MVP

This library maps **design archetypes** (chosen by the `design-composer`) to **component implementations** (used by the Frontend Builder).

The design-composer thinks in archetypes: *"this hero should be a split hero with a real work image"*. The Site Composer then picks the matching component implementation.

---

## Navigation

### Archetype: `nav_standard`

**Component:** `nav_standard_v1`

Sticky header. Logo left. Minimal links centre or right. Phone and primary CTA far right. Mobile hamburger overlay.

- Variants: `dark`, `light`
- Inputs: logo asset, nav items, primary CTA, phone

---

## Hero

### Archetype: `hero_split`

**Component:** `hero_split_v1`

Two-column layout. Editorial headline left. Full-bleed image right. Primary + secondary CTAs.

- Variants: `dark-standard`, `light-clean`
- Best for: trades, fitness, professional services
- Inputs: headline, subheadline, primary CTA, secondary CTA, hero image

### Archetype: `hero_centered`

**Component:** `hero_centered_v1`

Centred headline, subheadline, CTA over a full-bleed background image.

- Variants: `dark`, `light`
- Best for: food, beauty, venues
- Inputs: headline, subheadline, CTAs, background image

### Archetype: `hero_utility`

**Component:** `hero_utility_v1`

Text left, utility card right (phone, hours, location). Useful for trades with urgent contact needs.

- Variants: `dark`, `light`
- Best for: emergency trades, booking-led
- Inputs: headline, subheadline, contact card details

---

## Trust / Proof

### Archetype: `trust_bar`

**Component:** `trust_bar_v1`

Horizontal row of 3–4 stat blocks. Large number + short label.

- Variants: `minimal-dark`, `minimal-light`, `accent-dividers`
- Best for: any local business with countable credibility
- Inputs: 3-4 stat/label pairs

### Archetype: `logo_strip`

**Component:** `logo_strip_v1`

Row of partner/accreditation logos or trust badges.

- Variants: `dark`, `light`
- Best for: professional services, trades with certifications
- Inputs: badge names or image assets

### Archetype: `why_us`

**Component:** `why_us_v1`

3-4 icon-led benefit cards. More structured than trust_bar.

- Variants: `icon-top`, `icon-left`
- Best for: trades, local services where customers compare options
- Inputs: 3-4 benefit icons, titles, descriptions

---

## Services / Offerings

### Archetype: `service_cards_icon`

**Component:** `service_cards_icon_v1`

Three-column card grid. Icon, title, short description, link. Subtle border and hover lift.

- Variants: `dark-bordered`, `light-bordered`, `accent-hover`
- Best for: local service, fitness, beauty, professional services
- Inputs: 3 service cards with icon, title, body, link

### Archetype: `service_cards_image`

**Component:** `service_cards_image_v1`

Three-column cards with image tops, title, description, link.

- Variants: `image-top`, `image-left`
- Best for: trades, food, hospitality where visuals sell the service
- Inputs: 3 service cards with image, title, body, link

### Archetype: `feature_list`

**Component:** `feature_list_v1`

Two-column list of features with icons and short descriptions.

- Variants: `dark`, `light`
- Best for: trades, services where clarity matters more than visual variety
- Inputs: 4-6 features with icons, titles, descriptions

---

## Process

### Archetype: `process_steps`

**Component:** `process_steps_v1`

Three numbered horizontal steps. Step number in accent colour. Title and description beneath.

- Variants: `accent-numbered`, `minimal-line`
- Best for: fitness, coaching, consulting, booking-led services
- Inputs: 3 steps with number, title, description

---

## About / Credibility

### Archetype: `about_split`

**Component:** `about_split_v1`

Image left, text right. Credentials list. Accent vertical rule on text column.

- Variants: `credentials-focus`, `story-focus`
- Best for: fitness, professional services, trades with a founder face
- Inputs: image, headline, body, credential list

### Archetype: `about_full_bleed`

**Component:** `about_full_bleed_v1`

Full-width image with overlaid text panel.

- Variants: `dark-overlay`, `light-panel`
- Best for: food, venues, businesses with strong physical spaces
- Inputs: background image, text panel content

---

## Testimonials

### Archetype: `testimonial_cards`

**Component:** `testimonial_cards_v1`

Three-card grid. Circular avatar, quote, name, outcome stat.

- Variants: `dark-avatar-top`, `light-avatar-top`, `accent-stat`
- Best for: any business with client outcomes
- Inputs: 3 testimonials with avatar, quote, name, location

### Archetype: `testimonial_quote`

**Component:** `testimonial_quote_v1`

Single large quote with attribution. Full-width accent or dark background.

- Variants: `accent`, `dark`
- Best for: when only one strong testimonial exists
- Inputs: quote, attribution, rating

---

## Gallery / Portfolio

### Archetype: `image_grid`

**Component:** `image_grid_v1`

Even grid of images with consistent aspect ratio.

- Variants: `2-column`, `3-column`, `masonry`
- Best for: beauty, food, venues, trades with portfolio work
- Inputs: 4-9 images

---

## Contact

### Archetype: `contact_panel`

**Component:** `contact_panel_v1`

Two-column layout: contact details (phone, email, hours, address) left, map or form right.

- Variants: `dark`, `light`
- Best for: businesses where location and hours matter
- Inputs: phone, email, address, hours, map embed

---

## Final CTA

### Archetype: `cta_band`

**Component:** `cta_band_v1`

Full-width band. Centred headline, subheadline, single large button.

- Variants: `accent-fill`, `dark-fill`, `light-fill`
- Best for: closing every page with the primary action
- Inputs: headline, subheadline, primary CTA

### Archetype: `cta_split`

**Component:** `cta_split_v1`

Two-column layout with phone/booking details left and form or CTA right.

- Variants: `dark`, `light`
- Best for: when phone and location are the conversion path
- Inputs: contact details left, CTA/form right

---

## Footer

### Archetype: `footer_standard`

**Component:** `footer_standard_v1`

Multi-column footer. Logo, nav links, contact details, social icons, legal links.

- Variants: `dark`, `light`
- Always used.

---

## Business class → default archetype mapping

Mapping derived from the Sorted mockup library. Use as the default starting point.

| Class | Hero | Trust | Services | Process | About | Testimonials | Contact | CTA | Style |
|---|---|---|---|---|---|---|---|---|---|
| food | hero_centered | none | service_cards_image | — | about | none | cta_band | cta_band | premium |
| beauty | hero_centered | none | service_cards_image | — | about | none | cta_band | cta_band | premium |
| hospitality | hero_centered | none | feature_list | — | about | none | cta_split | cta_split | light |
| professional_service | hero_centered | trust_bar | service_cards_image | — | about | testimonial_cards | cta_band | cta_band | light |
| fitness | hero_full_bleed | trust_bar | service_cards_image | process_steps | about | none | cta_band | cta_band | dark |
| local_service | hero_centered | trust_bar | service_cards_image | process_steps | about | testimonial_quote | cta_band | cta_band | light |
| trade | hero_centered | trust_bar | service_cards_image | process_steps | about | testimonial_quote | cta_band | cta_band | light |
| booking-led | hero_utility | trust_bar | service_cards_icon | process_steps | about | testimonial_cards | contact_panel | cta_split | light |
| trust-led | hero_centered | why_us | feature_list | process_steps | about | testimonial_quote | cta_split | cta_split | light |

### Notes

- `process_steps` is only used when the business has a clear sequence (booking-led, fitness, trade).
- `testimonials` are omitted if no real testimonials are available.
- `about` usually precedes `services` in beauty and hospitality when the founder/story is the trust anchor.
- Default full section order: `nav → hero → trust_bar → services → about → testimonials → cta → footer`.

---

## Archetype → component registry

| Archetype | Component | Status |
|---|---|---|
| nav_standard | nav_standard_v1 | Active |
| hero_split | hero_split_v1 | Active |
| hero_centered | hero_centered_v1 | Active |
| hero_utility | hero_utility_v1 | Planned |
| trust_bar | trust_bar_v1 | Active |
| logo_strip | logo_strip_v1 | Active |
| why_us | why_us_v1 | Planned |
| service_cards_icon | service_cards_icon_v1 | Active (was service_cards_v2) |
| service_cards_image | service_cards_image_v1 | Planned |
| feature_list | feature_list_v1 | Active |
| process_steps | process_steps_v1 | Active |
| about_split | about_split_v1 | Active |
| about_full_bleed | about_full_bleed_v1 | Active |
| testimonial_cards | testimonial_cards_v1 | Active (was testimonial_cards_v2) |
| testimonial_quote | testimonial_quote_v1 | Active |
| image_grid | image_grid_v1 | Active |
| contact_panel | contact_panel_v1 | Planned |
| cta_band | cta_band_v1 | Active |
| cta_split | cta_split_v1 | Active |
| footer_standard | footer_standard_v1 | Active |

---

## Expansion rules

- Add a new archetype only when a business class repeatedly fails with the existing set.
- Every new archetype must be documented with purpose, inputs, and component mapping.
- Prefer adding a variant over inventing a new archetype.
- The library grows from real prototype failures, not from speculative completeness.
- If an archetype is listed as "Planned" but the Frontend Builder does not yet implement it, fall back to the nearest active archetype and note the substitution in `build_notes`.
