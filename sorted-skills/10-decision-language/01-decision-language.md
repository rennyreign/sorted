# Decision Language

## Purpose

The Decision Language turns business understanding into assembly selection.

It is the operating system of the site compiler.

It does not design. It decides.

It answers:

- Which hero assembly should this business use?
- Which trust assembly should prove the trust gap?
- Which services assembly should present the offer?
- Which proof assembly should show the work?
- Which CTA assembly should drive the conversion?

Without a Decision Language, the Assembly Library becomes a catalogue. With it, the library becomes a manufacturing system.

---

## Core principle

Creativity moves upstream.

The renderer does not invent.
The renderer assembles.

The AI decides which pre-validated assemblies to use and how to configure them. The AI does not invent layouts, spacing, or structure from scratch.

---

## Inputs

Read these in order before deciding:

1. `sorted-skills/00-foundations/01-human-psychology.md`
2. `sorted-skills/00-foundations/02-trust-engine.md`
3. `sorted-skills/00-foundations/03-visual-hierarchy.md`
4. `sorted-skills/01-brand/01-brand-doctrine.md`
5. `sorted-skills/02-visual-language/01-vl-editorial.md`
6. `sorted-skills/02-visual-language/02-vl-utility.md`
7. `sorted-skills/02-visual-language/03-vl-lifestyle.md`
8. `sorted-skills/02-visual-language/04-vl-architectural.md`
9. `sorted-skills/07-colour-language/01-cl-utility.md`
10. `sorted-skills/08-typography-language/01-tl-utility.md`
11. `sorted-skills/09-material-language/01-material-doctrine.md`
12. `sorted-skills/11-assembly-library/INDEX.md`

---

## Decision dimensions

Every decision is derived from these dimensions:

| Dimension | Question | Examples |
|---|---|---|
| `business_class` | What kind of business is this? | emergency_trade, local_service, beauty, hospitality, professional_service, fitness, ecommerce, booking_led |
| `trust_gap` | What is the visitor's biggest uncertainty? | speed, quality, expertise, price, safety, result, comfort |
| `brand_personality` | What personality should the business project? | reliable_local, premium_specialist, fast_emergency, family_business, luxury_boutique, technical_authority |
| `visual_language` | Which visual language communicates the personality? | utility, editorial, lifestyle, architectural |
| `primary_conversion` | What action should the visitor take? | call_now, book_intro, request_quote, visit_shop, join_class, whatsapp, order_online |
| `content_richness` | How much content is available? | minimal, standard, rich |
| `photography_strength` | How strong is the photography? | weak, work_evidence, portrait, lifestyle, rich |

---

## Decision rules

### Hero assembly

| Condition | Default assembly | Override |
|---|---|---|
| emergency_trade + call_now | hero-utility-phone | strong work photography → hero-utility-split |
| local_service + call_now | hero-utility-split | minimal content → hero-utility-centered |
| professional_service + book_intro | hero-editorial-centered | authority focus → hero-editorial-split |
| beauty + book_intro | hero-lifestyle-fullbleed | premium positioning → hero-editorial-centered |
| hospitality + visit_shop | hero-lifestyle-fullbleed | venue photography → hero-lifestyle-split |
| fitness + join_class | hero-utility-split | community focus → hero-lifestyle-fullbleed |
| ecommerce + order_online | hero-utility-centered | product focus → hero-editorial-split |

Rule: the hero must match the primary conversion. A phone-forward business must show the phone in the hero. A booking-led business must show the booking action.

### Trust assembly

| Trust gap | Default assembly | Override |
|---|---|---|
| speed | trust-stat-strip | local proof strong → trust-badges-local |
| quality | trust-reviews-strip | accreditation strong → trust-badges-accreditation |
| expertise | trust-badges-credentials | experience long → trust-stat-years |
| price | trust-pricing-promise | reviews strong → trust-reviews-strip |
| local coverage | trust-badges-local | stats impressive → trust-stat-strip |

Rule: the trust assembly must prove the specific trust gap, not generic trust.

### Services assembly

| Business class | Default assembly | Override |
|---|---|---|
| emergency_trade | services-3-cards | few services → services-2-featured |
| local_service | services-3-cards | broad range → services-list-accordion |
| beauty | services-2-featured | many services → services-3-cards-lifestyle |
| hospitality | services-2-featured | menu-like → services-list-cards |
| professional_service | services-3-cards | complex → services-accordion |
| fitness | services-3-cards | class-based → services-timetable |

Rule: if the business has 3 clear services, use 3 cards. If it has 2 distinct offerings, use 2 featured cards. If it has many, use a list or accordion.

### Proof / work assembly

| Photography strength | Default assembly | Override |
|---|---|---|
| weak | proof-stat-block | no photos → proof-guarantee |
| work_evidence | proof-gallery-2 | rich photos → proof-gallery-3 |
| portrait | proof-portrait-credentials | work photos available → proof-gallery-2 |
| lifestyle | proof-gallery-3 | before/after possible → proof-before-after |
| rich | proof-case-study | simple business → proof-gallery-2 |

Rule: proof must show the actual result. Never use a proof assembly that does not match the available photography.

### Process assembly

| Business class | Default assembly | Override |
|---|---|---|
| emergency_trade | process-steps-3 | complex service → process-timeline |
| local_service | process-steps-3 | reassurance needed → process-steps-4 |
| beauty | process-steps-3 | booking-heavy → process-booking-flow |
| professional_service | process-timeline | simple service → process-steps-3 |
| hospitality | process-booking-flow | walk-in → process-steps-3 |

Rule: process is a compressed section. It should never be the visual climax of the page.

### About assembly

| Business class | Default assembly | Override |
|---|---|---|
| emergency_trade | about-split-credentials | family business → about-split-team |
| local_service | about-split-credentials | heritage → about-centered-story |
| beauty | about-centered-story | team → about-split-team |
| hospitality | about-centered-story | venue → about-split-venue |
| professional_service | about-split-credentials | personal → about-centered-story |
| fitness | about-split-team | coach-led → about-centered-story |

Rule: about should prove the people behind the business.

### Testimonials assembly

| Content richness | Default assembly | Override |
|---|---|---|
| minimal | testimonial-single | 2+ reviews → testimonials-cards-3 |
| standard | testimonials-featured | one standout review → testimonials-featured |
| rich | testimonials-featured | many reviews → testimonials-carousel |

Rule: if one review is clearly strongest, use a featured testimonial. If all reviews are similar, use equal cards.

### CTA assembly

| Primary conversion | Default assembly | Override |
|---|---|---|
| call_now | cta-band-phone | urgent → cta-sticky-phone |
| book_intro | cta-band-book | premium → cta-split-book |
| request_quote | cta-band-form | simple → cta-band-phone |
| visit_shop | cta-band-location | directions → cta-split-location |
| join_class | cta-band-book | timetable → cta-split-timetable |
| whatsapp | cta-band-whatsapp | urgent → cta-sticky-phone |
| order_online | cta-band-shop | menu → cta-split-shop |

Rule: the final CTA must repeat the primary conversion from the hero. Never introduce a new action at the bottom of the page.

---

## Output format

The Decision Language produces an `assembly_selection` object that becomes part of the composition:

```json
{
  "assembly_selection": {
    "reason": "Emergency trade with speed trust gap. Phone-forward conversion. Strong work evidence available.",
    "assemblies": {
      "nav": "nav-standard",
      "hero": "hero-utility-split",
      "trust": "trust-stat-strip",
      "services": "services-3-cards",
      "proof": "proof-gallery-2",
      "process": "process-steps-3",
      "about": "about-split-credentials",
      "testimonials": "testimonials-featured",
      "cta": "cta-band-phone",
      "footer": "footer-standard"
    }
  }
}
```

Each assembly ID must exist in the Assembly Library INDEX.

---

## Validation rules

Before finalizing the assembly selection, check:

- [ ] Every assembly ID exists in the Assembly Library INDEX
- [ ] The hero assembly matches the primary conversion
- [ ] The trust assembly directly addresses the trust gap
- [ ] No two adjacent sections use the same visual weight
- [ ] The CTA assembly repeats the primary conversion
- [ ] The assembly selection can be justified by the business analysis alone
- [ ] No assembly was selected purely because it looks good

---

## Relationship to other layers

- The Website Analyser provides the inputs.
- The Decision Language selects the assemblies.
- The Design Language governs the visual treatment of the selected assemblies.
- The Assembly Library provides the renderable components.
- The Site Composer maps content and assets to the selected assemblies.
- The Frontend Builder renders the assemblies.
- The QA operator validates the rendered output.
- The Design Review produces patches to the Decision Language, Design Language, or Assembly Library.
