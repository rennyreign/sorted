# Sorted Mockup Library — Pattern Findings

**Analysis date:** 2026-06-27
**Source:** 45 mockup images in the `Mockups` Supabase storage bucket
**Method:** gpt-4o-mini vision analysis with a structured extraction prompt
**Output:** `mockup-pattern-report.json`

---

## Executive summary

The mockup library is dominated by **food (42%)**, **professional services (20%)**, and **beauty (18%)**. The default Sorted design language is light, image-led, and conversion-focused, with `service_cards_image` as the dominant services pattern and `cta_band` as the dominant closing pattern.

This document is a reference for the `design-composer` skill. Defaults in the skill are derived from these findings.

---

## Business class distribution

| Class | Count | Share | Typical conversion |
|---|---|---|---|
| food | 19 | 42% | book a table / order online |
| professional_service | 9 | 20% | request quote / get in touch |
| beauty | 8 | 18% | book appointment |
| hospitality | 4 | 9% | book a table |
| fitness | 1 | 2% | book intro |
| local_service / trade | 1 | 2% | call now |
| education / other | 3 | 7% | book intro / join class |

---

## Section order

The most common full pattern is:

```
nav → hero → trust_bar → services → about → testimonials → cta → footer
```

Appeared in 11 of 45 mockups (24%).

Other common variants:
- `nav → hero → about → services → testimonials → cta → footer` (11%)
- `nav → hero → services → about → testimonials → cta → footer` (9%)
- `nav → hero → services → cta → footer` (simpler sites, 7%)

---

## Archetype frequencies

| Element | Most common | Frequency | Second most common | Frequency |
|---|---|---|---|---|
| Hero | hero_centered | 70% | hero_full_bleed | 30% |
| Services | service_cards_image | 75% | feature_list | 16% |
| Trust | trust_bar | 50% | none | 40% |
| Testimonials | none | 45% | testimonial_cards | 30% |
| Contact | cta_band | 70% | cta_split | 20% |

---

## Archetype defaults by business class

| Class | Hero | Services | Trust | Testimonials | Contact | Style |
|---|---|---|---|---|---|---|
| food | hero_centered | service_cards_image | none | none | cta_band | premium |
| professional_service | hero_centered | service_cards_image | trust_bar | testimonial_cards | cta_band | light |
| beauty | hero_centered | service_cards_image | none | none | cta_band | premium |
| hospitality | hero_centered | feature_list | none | none | cta_split | light |
| fitness | hero_full_bleed | service_cards_image | trust_bar | none | cta_band | dark |
| local_service / trade | hero_centered | service_cards_image | trust_bar | testimonial_quote | cta_band | light |

---

## Style distribution

| Style | Share |
|---|---|
| light | 40% |
| premium | 30% |
| warm | 20% |
| mixed | 10% |
| dark | 2% |

---

## Trust signals

Ranked by frequency:

1. local_coverage (22)
2. reviews (15)
3. certifications (7)
4. years_experience (2)
5. fair_pricing (2)

---

## Primary CTA labels

| Label | Count | Business class |
|---|---|---|
| BOOK A TABLE | 8 | food |
| ORDER ONLINE | 3 | food |
| Order Now | 3 | food |
| Book a Valuation | 2 | professional_service |
| Book Now | 2 | beauty |
| BOOK APPOINTMENT | 2 | beauty |

---

## Implications for the design-composer skill

1. **Start with `hero_centered`** unless the business is fitness or a trade with a strong founder/vehicle image.
2. **Default services to `service_cards_image`** — image-led cards are the dominant Sorted pattern.
3. **Use `trust_bar` only when there are concrete stats**; otherwise omit the trust section.
4. **Omit testimonials if none are provided** — almost half the mockups have no testimonial section.
5. **Close with `cta_band`** unless the business is hospitality or booking-led, where `cta_split` or `contact_panel` is more common.
6. **Default style should be `premium` or `light`** — dark is rare in the existing library.
7. **CTA labels are highly business-specific** — do not use generic labels like "Contact us" when a class-specific label exists.

---

## Caveats

- The sample is skewed toward food and hospitality because those are common Sorted clients.
- The vision model sometimes misclassifies business class or merges similar categories (e.g. `local_service` vs `trade`).
- Some mockups are variants of the same business (e.g. `beautylounge.png` and `beautylounge2.png`).
- These are defaults, not rules. The business analysis and existing site should override when needed.
