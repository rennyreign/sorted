# Material Doctrine

## Purpose

Material gives a website physical presence.

It creates depth, texture, and quality without adding decoration.

A flat website feels like a template. A material website feels like a real surface.

---

## Core principle

Material should support the content, not compete with it.

Every surface, shadow, and gradient must earn its place.

---

## Material vocabulary

### Surface

The background plane of a section or component.

- Clean white: clarity, professionalism
- Warm paper: human, approachable
- Soft grey: structure, separation
- Deep charcoal: authority, emphasis

A surface should never be decorative. It should signal a change in content or intensity.

### Texture

Subtle variation within a surface.

- Grain or noise: warmth, organic quality
- Gradient: light, direction, depth
- Pattern: brand texture, very subtle

Texture should be barely visible. If it is obvious, it is too strong.

### Elevation

The perceived height of a component above the surface.

- Resting: no shadow, flat against the surface
- Raised: small shadow, cards and buttons
- Floating: larger shadow, dropdowns, modals, sticky elements

Elevation should feel physical. Larger objects cast larger shadows.

### Borders

Borders define edges without adding weight.

- Hairline borders: subtle separation, premium feel
- Section borders: rhythm and structure
- Decorative borders: only when the visual language calls for it

Default to low-opacity borders. Never use heavy black borders on light backgrounds.

### Shadows

Shadows create depth and focus.

- Small shadows: buttons, inputs, cards at rest
- Medium shadows: cards on hover, dropdowns
- Large shadows: floating CTAs, modals, hero overlays

Shadows should be soft and warm, never harsh.

### Gradients

Gradients create movement and depth.

- Hero gradients: from dark to image, from image to section
- Button gradients: rarely used in utility; acceptable in premium
- Background gradients: very subtle, tonal only

Avoid multi-colour gradients. Use gradients within the same hue family.

### Depth

Depth is the layering of surfaces, images, and text.

- Background image + overlay + text
- Floating card over image
- Sticky nav over content

Depth should guide attention, not create confusion.

### Glass

Frosted glass effect: translucency + blur + subtle border.

- Use for nav bars, floating cards, or overlay panels
- Should not hide important content behind it
- Keep opacity high enough to maintain readability

### Overlay

A semi-transparent layer between an image and text.

- Dark overlay: ensures white text is readable
- Gradient overlay: creates transition from image to surface
- Tinted overlay: adds mood or warmth

Overlays should be just strong enough for readability. Never use black at 80% unless the image is very bright.

### Section contrast

Alternation between light and dark or textured and clean sections creates rhythm.

- Light → light → light feels flat
- Light → dark → light creates drama
- White → warm grey → white creates subtle rhythm

Every section should contrast with the one above it in some way: surface, intensity, or material.

## Section surface alternation

For a standard service site, alternate surfaces to create tactile rhythm:

```
Hero: dark navy or deep image
↓
Trust Strip: warm white or light paper
↓
Services: clean white
↓
Work / Proof: warm grey or paper texture
↓
Process: clean white
↓
About: warm white or light paper
↓
Testimonials: clean white or subtle paper
↓
CTA: dark navy or deep charcoal
```

The alternation should be almost imperceptible but present.

- Warm white: `#FDFCF8` or `#FAFAF9`
- Paper: `#F5F0E8` or `#F2EEE8`
- Stone grey: `#F2F2F0` or `#EAEAE8`
- Navy: `#0F172A` or `#1E293B`
- Off-white: `#F8F8F6`

Never use more than three background colours on one page, plus the dark CTA section.

## Background texture rules

- Texture should be subtle. If a visitor can name it, it is too strong.
- Use a very light grain or noise only on one section if desired.
- Prefer tonal shifts over added texture.
- Dark sections may use a subtle gradient overlay to add depth.

## Material by visual language

| Visual language | Primary material |
|---|---|
| Utility | Clean surfaces, small shadows, subtle gradients, high contrast |
| Editorial | Restrained surfaces, minimal shadows, tonal depth, paper-like |
| Lifestyle | Warm textures, soft shadows, organic gradients, natural light |
| Architectural | Strong grids, flat surfaces, precise borders, material honesty |
| Premium | Rich surfaces, subtle grain, elegant shadows, deep section contrast |
| Minimal | Flat surfaces, no texture, hairline borders, no shadows unless needed |

---

## Rules

- Never use more than one shadow style per component.
- Never use shadows purely for decoration.
- Never use gradients with multiple hues unless the brand specifically calls for it.
- Never use glass effects on busy backgrounds.
- Never use texture that competes with text or photography.
- Always maintain readability across material choices.

---

## Validation

Does the website feel like it has physical weight?

Or does it feel like a flat screen?

Material should make the design feel more real, not more complicated.
