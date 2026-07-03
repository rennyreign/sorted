# ChatGPT Handoff Brief: Sorted Design Skill Library

## Context

Sorted is a website manufacturing line that builds websites for local businesses using a reversed product cycle: build the site first, show the client the finished result, then quote. We are currently building a new **design composition skill library** to replace the manual mockup creation step.

We have already:
- Analysed 45 existing Sorted mockups (food, beauty, professional services, trade, hospitality, fitness)
- Extracted empirical patterns from them
- Built a draft `site-composer` + `design-composer` skill structure
- Generated a first prototype site for a plumbing business (LRT Plumbing)

The problem: the generated site is still visually poor — generic cards, weak typography, no real premium feel. The composition layer is working, but the **taste and aesthetic layer** is not strong enough.

We are moving from a single composition skill to a **layered skill library**.

---

## The layered skill library we need

```
Layer 1: Global taste principles (already exists — visual-hierarchy, color-system, typography-scale, etc.)
Layer 2: Sorted local business framework (already exists — sorted-local-site-refresh)
Layer 3: Business segment design skills (NEED TO BUILD)
Layer 4: Taste / aesthetic preference skills (NEED TO BUILD)
Layer 5: Site composer — selects segment + aesthetic + content → produces composition.json
```

We need your help defining **Layer 3 and Layer 4**.

---

## What we need from you

Define the top-level creative direction for each **business segment** and each **aesthetic preference**. This should be detailed enough that a non-designer agent can read it and build a site that feels as good as your best mockups.

### Business segments to cover

1. **Trade** — plumbers, electricians, builders, heating engineers, cleaners, locksmiths
2. **Beauty** — salons, nail bars, aestheticians, barbers, hair studios
3. **Food** — restaurants, cafes, takeaways, coffee shops, bakeries
4. **Professional services** — accountants, estate agents, solicitors, mortgage brokers, financial advisers
5. **Hospitality** — hotels, B&Bs, venues, pubs
6. **Fitness** — gyms, personal trainers, yoga studios, martial arts

You can merge, split, or add segments if you think it helps.

### Aesthetic preferences to cover

1. **Premium** — refined, expensive, image-led, restrained
2. **Warm** — human, approachable, earthy, soft
3. **Bold** — high-contrast, confident, phone-forward, stat-heavy
4. **Clean** — white space, crisp, straightforward, trustworthy
5. **Minimal editorial** — asymmetric, large type, refined, sparse

Again, feel free to adjust these.

---

## Output format

For each **segment**, produce a section like this:

```markdown
## Segment: [Trade]

### Default aesthetic
Usually [Bold] or [Clean]. Override when the business feels premium (e.g. high-end kitchen fitter → Premium).

### Layout archetype
- Hero: [split / centered / full-bleed / utility] — explain why
- Trust: [trust bar / why us / logo strip / none] — explain when
- Services: [image cards / icon cards / feature list / none] — explain when
- Process: [steps / none] — explain when
- About: [split / centered / full-bleed] — explain when
- Testimonials: [cards / quote / none] — explain when
- Contact: [cta band / cta split / contact panel] — explain when

### Default section order
```
nav → hero → trust → services → process → about → testimonials → cta → footer
```
Explain when to deviate.

### Colour direction
- Background: usually [light / dark / mixed]
- Accent: [specific colour range, e.g. navy blue, deep green, burnt orange]
- Dark sections: [when and why]
- Avoid: [colours that feel wrong for this segment]

### Typography direction
- Heading style: [bold / editorial / elegant / rugged]
- Body style: [readable / refined / technical]
- Scale: [large display / medium / restrained]

### Photography / imagery direction
- Style: [documentary / lifestyle / studio / portrait / product]
- Subjects: [people, tools, spaces, food, etc.]
- Lighting: [natural / dramatic / soft / bright]
- Avoid: [generic stock, posed models, etc.]

### Trust signals (ranked)
1. [most important]
2. [...]

### CTA hierarchy
- Primary: [e.g. Call now]
- Secondary: [e.g. WhatsApp / Book a visit]
- Tertiary: [e.g. View services]

### Copy tone
- [plain, direct, local / reassuring / premium / energetic]
- Words to use: [...]
- Words to avoid: [...]

### Feeling the site should create
[e.g. "This is a competent local trade who will turn up and fix it. Not the cheapest, but reliable."]

### Anti-patterns
- [list of things this segment should never do]
```

For each **aesthetic**, produce a section like this:

```markdown
## Aesthetic: [Premium]

### Definition
What does "premium" mean in a Sorted site?

### Colour rules
- Background: [exact hex or range]
- Accent: [exact hex or range]
- Text: [exact hex or range]
- Dark section colour: [exact hex or range]
- Border: [exact hex or range]
- Number of colours allowed: [e.g. 1 accent + 1 dark + neutrals]

### Typography rules
- Font family: [e.g. Plus Jakarta Sans]
- Heading weight: [e.g. 700]
- Heading scale: [e.g. clamp(3rem, 8vw, 7rem)]
- Body line-height: [e.g. 1.6]

### Spacing rules
- Section padding: [e.g. py-20 md:py-28]
- Card padding: [e.g. p-8]
- Grid gap: [e.g. gap-8]
- Max-width: [e.g. max-w-[1400px]]

### Component rules
- Buttons: [rounded / sharp / with arrow / etc.]
- Cards: [bordered / shadowed / minimal / image-led]
- Hero: [split / centered / full-bleed]
- Trust bar: [with icons / with numbers / etc.]
- CTA band: [full dark / light accent / etc.]

### Motion rules
- Page enter: [e.g. 0.55s cubic-bezier(0.32, 0.72, 0, 1)]
- Hover: [e.g. 200ms, lift 2px]
- Scroll: [e.g. simple reveals only]

### Photography / texture direction
- [specific guidance]

### Feeling
[e.g. "This site feels expensive without being flashy."]

### Anti-patterns
- [list of things that make it look cheap]
```

---

## Constraints

- This is for local UK small businesses, not startups or SaaS.
- Every site must feel: **Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.**
- Avoid: startup language, AI gradients, fake dashboards, excessive motion, generic three-card rows.
- The output will be turned into deterministic skill files and a JSON schema. Be specific enough to be enforceable.

---

## Reference materials

- Taste skills framework: https://github.com/rennyreign/taste-skill/tree/main/skills
- Sorted local business framework: `sorted-local-site-refresh` (same repo)
- Existing mockup analysis: see `/operators/site-composer-operator/mockup-pattern-findings.md` in the Sorted repo
- LRT Plumbing prototype: http://localhost:3100 (currently running)

---

## Success criteria

After this handoff, we should be able to:
1. Pick a business segment and aesthetic
2. Generate a `composition.json` that references the correct segment and aesthetic
3. Have the Frontend Builder produce a site that looks credibly like a Sorted site, not a generic template

Do not worry about code or schema details. Focus on the design rules and the feeling.
