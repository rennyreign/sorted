# Skill: Design Patch Notes

**Type:** Permanent review-to-skill operator
**Trigger:** After a rendered website is reviewed and scored below the quality target
**Input:** Rendered website, current design language repository, previous iteration, quality target
**Output:** Design Review + Skill Layer Actions + Repository Patches + Recommended New Skills + Iteration Score

---

## Purpose

The Design Patch Notes skill converts subjective design critique into deterministic improvements to the Sorted Design Language.

It exists to ensure every design review permanently improves the repository rather than simply improving one website.

This skill sits immediately after the Design Review process. Every iteration should strengthen the Design Language itself.

Never patch individual websites unless the change also improves the underlying doctrine.

---

## Philosophy

Poor systems fix websites.

Good systems fix skills.

Excellent systems fix the decision-making process.

Every critique should become a repository improvement.

---

## Inputs

- Rendered website
- Sorted Design Language repository
- Previous iteration
- Current quality target

---

## Outputs

- Design Review
- Skill Layer Actions
- Repository Patches
- Recommended New Skills
- Iteration Score

---

## Process

### Step 1 — Review the rendered website

Review the rendered website as an experienced creative director.

Ignore implementation. Judge only the customer experience.

### Step 2 — Identify weaknesses

Look across these areas:

- Typography
- Photography
- Composition
- Colour
- Motion
- Copy
- Components
- Trust
- Narrative
- Hierarchy
- Rhythm
- Materiality
- Depth

### Step 3 — Classify every observation

Each observation must become one of:

- ADD
- MODIFY
- REMOVE
- REPLACE
- NEW SKILL
- NEW DECISION RULE
- NEW COMPONENT

Never leave observations unclassified.

### Step 4 — Locate the owning skill

Every improvement must map to one repository location.

Examples:

| Area | Owning skill layer |
|---|---|
| Photography | `sorted-skills/03-photography/` |
| Typography | `sorted-skills/08-typography-language/` |
| Composition | `sorted-skills/04-composition/` |
| Trust | `sorted-skills/00-foundations/` or `01-brand/` |
| Hero | `sorted-skills/06-components/` |
| Colour | `sorted-skills/07-colour-language/` |
| Materiality | `sorted-skills/09-material-language/` |
| Narrative rhythm | `sorted-skills/04-composition/` |

### Step 5 — Generate deterministic repository patches

Every patch must include:

- Skill
- File
- Action
- Reason
- Rule
- Validation
- Expected improvement

### Step 6 — Estimate quality impact

Estimate how much the patch should improve future renders.

---

## Rules

- Never patch symptoms. Always patch causes.
- Never duplicate doctrine. Modify existing skills whenever possible.
- Create new skills only when responsibility cannot be assigned elsewhere.
- Every patch must be explainable in one sentence.
- Every patch must be testable through a future render.

---

## Success criteria

Every design review should permanently improve the repository.

Future websites should automatically inherit the improvement.

The repository should become progressively more intelligent over time.

---

## Versioning convention

Patches are grouped into releases. A release looks like:

```
Sorted Design Language v0.0.4
- 10 patches
- Average render score: 6.0
- Estimated post-patch score: 7.4
```

Release numbers follow semantic meaning:

- Minor increments: patches that add or refine rules within existing layers
- Major increments: new skill layers, decision trees, or component families

---

## Integration with the build chain

```
Frontend Builder renders site
  ↓
Screenshot + manual review
  ↓
Design Patch Notes skill generates patches
  ↓
Skills are updated in sorted-skills/
  ↓
Art Director loads updated skills
  ↓
Next render inherits improvements
  ↓
Score improves
```

---

## Output format

Each patch must follow this structure:

```markdown
## Patch [NNN]

**Action:** ADD | MODIFY | REMOVE | REPLACE | NEW SKILL | NEW DECISION RULE | NEW COMPONENT

**Skill:** [skill layer]

**File:** [path to file]

**Issue:**
[what looks wrong or generic]

**Reason:**
[why it matters]

**Rule:**
[the deterministic guidance to add]

**Validation:**
[how to verify the next render fixed it]

**Expected improvement:**
[+0.X]
```
