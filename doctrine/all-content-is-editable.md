# All Content Is Editable

**Status:** Active doctrine  
**Applies to:** All Sorted client sites

---

## The Principle

Every piece of visible text, every image, and every media asset on a Sorted client site must be editable through the CMS. No exceptions.

This means:
- Hero headings, subheadings, eyebrow labels
- Body copy, pull quotes, paragraphs
- Section headings, CTA labels, button text
- Response notes, signature lines, location badges
- Background photos, portrait images, video URLs, thumbnails
- Value pillars, FAQ questions and answers, service descriptions
- Footer copy, social links, phone, email

If it appears on the page, it lives in a JSON content file, has a corresponding CMS field, and is typed in the content loader.

---

## Why

### 1. Speed from mockup to build
Design with real placeholder content that the client already approved. No content gaps, no "TBC" text. The site is built to the brief from day one.

### 2. Faithful quoting
Move from build to quote with confidence. What the client sees in the mockup is exactly what they get. No renegotiation over content that changed during production.

### 3. Client ownership at the right layer
The client signs off on the design — the placement, the composition, the structure. After handoff, they can change the words and images within that structure. They own the content. Sorted owns the design.

### 4. Factory reset principle
The design is not the images or the words. The design is how things are positioned, proportioned, and composed. A client may change every image and every paragraph — the design remains intact. This is intentional. If they want to change the design itself, that is a new project.

---

## The Assembly Model

Think of this like product manufacturing:

> "You've seen the product, you've signed off on it, and now we're building exactly what you approved. The content slots are yours to fill and change. The structure is ours."

A client who wants to change the hero image should be able to do so without asking Sorted. A client who wants to move the hero image to the right side of the page is asking for a redesign.

CMS editing = content ownership  
Requesting Sorted = design change

---

## Implementation Rules

**For every page component:**
- Zero hardcoded strings that are visible to the end user
- Zero hardcoded image paths
- All visible content sourced from a typed loader function

**For every content loader:**
- Typed with all fields
- Fallback defaults match the original design content exactly
- Fallbacks serve as the factory reset state

**For every CMS config:**
- Every loader field has a corresponding CMS widget
- Labels are plain English (not variable names)
- Hints provided where format matters (e.g. video URLs, icon names)

**For every JSON content file:**
- Populated at build time with approved design content
- Serves as the client's editable source of truth

---

## Audit Checklist

Before a site is considered complete, run this audit:

- [ ] Every page component imports content from loaders only — no hardcoded visible strings
- [ ] Every image path is a loader field with a CMS `image` widget
- [ ] Every text section has a corresponding CMS field
- [ ] CMS config includes all loader fields
- [ ] All JSON content files are populated with approved content
- [ ] Playwright smoke tests confirm every page renders content from JSON
- [ ] CMS preview templates are registered for all collections

---

## What Is Never CMS-Editable

The following are intentionally outside the CMS:
- Layout structure and grid composition
- CSS, spacing, typography scale
- Component logic and interactions
- Navigation structure (changing which pages exist)
- Design system tokens (colours, fonts)

These are the design. Changing them is a Sorted engagement.
