# Skill: Website Analyser

**When to use:** When asked to score, analyse, or assess a prospect's existing website — either from a URL or a screenshot — as part of the Sorted acquisition pipeline.

---

## What this skill does

Analyses an existing business website and produces:
1. A site quality score (1–10, where LOW = more opportunity for Sorted)
2. A written analysis of the site's current state
3. A list of specific weaknesses
4. An outreach angle — the hook for the cold email

---

## Scoring model

Six dimensions, each 0–2. Total normalised to 1–10.

| Dimension | Measures |
|---|---|
| `design_quality` | Does it look credible and current in 2024? |
| `primary_cta` | Can a visitor work out what to do in 5 seconds? |
| `mobile_readiness` | Does it clearly work on a phone? |
| `content_quality` | Is the copy real and specific to this business? |
| `trust_signals` | Reviews, testimonials, photos, credentials |
| `contact_clarity` | Phone/email/address easy to find? |

**Score interpretation:**
- 1–3 = Excellent prospect — site badly needs Sorted
- 4–6 = Good prospect — clear room for improvement
- 7–9 = Weak prospect — decent site, harder sell

---

## Steps

### 1. Get a screenshot

If a screenshot is provided, use it directly.

If only a URL is provided, capture the above-the-fold view at 1280px viewport width. The goal is what a visitor sees first — not the whole page.

### 2. Score each dimension

Look at the screenshot carefully. Score each of the six dimensions 0–2:

**design_quality:**
- 0: Pre-2015 aesthetics, broken layout, clipart, or genuinely embarrassing
- 1: Functional but generic or dated — nothing offensive but nothing impressive
- 2: Clean, modern, intentional — looks professionally designed

**primary_cta:**
- 0: No clear call-to-action visible anywhere in the viewport
- 1: CTA exists but buried, weak phrasing, or below the fold
- 2: Obvious, prominent, above fold — phone number / book now / get quote / call us

**mobile_readiness:**
- 0: Clearly not mobile-responsive — desktop-only layout at any viewport
- 1: Probably works but awkward — not designed with mobile in mind
- 2: Clearly responsive or mobile-first design

**content_quality:**
- 0: Lorem ipsum, completely empty sections, or generic template filler
- 1: Some real content but thin — vague descriptions, missing key information
- 2: Real, specific, credible copy — tells you exactly what they do and for whom

**trust_signals:**
- 0: Nothing — no proof this is a real, legitimate business
- 1: One or two weak signals — a logo strip, a single line mention
- 2: Multiple strong signals — real testimonials, photos of the business/team, star ratings

**contact_clarity:**
- 0: No contact information visible in the main viewport
- 1: Contact exists somewhere but you'd have to look for it
- 2: Immediately obvious — in the header, hero, or top of page

### 3. Calculate site_score

`site_score = max(1, round((sum_of_dimensions / 12) * 10))`

### 4. Write the analysis

`site_analysis`: 2–3 sentences. Be specific — name the actual problems visible. No vague generalities like "the site looks old."

Good: "The homepage has no phone number or booking CTA visible above the fold. The hero is a stock photo with no connection to the business. On mobile, the text overlaps the navigation."

Bad: "The site looks a bit dated and could be improved."

`site_weaknesses`: A list of specific problem strings. Each one should be actionable enough that a designer knows what to fix.

Examples:
- "No phone number visible in header or hero"
- "Hero image is generic stock — no photos of the actual business"
- "No testimonials or reviews visible"
- "Contact page exists but not linked from homepage"
- "Font sizes too small on mobile"
- "Navigation has 9 items — too cluttered"

`outreach_angle`: One sentence. The hook for Renaldo's cold email. Written from Sorted's perspective. Should reference a specific visible problem. Human and direct — never use "elevate", "seamless", "transform", "next-gen".

Good: "Your site doesn't show visitors how to book — we redesigned it so they can in one click."
Good: "We noticed your site doesn't have a phone number on the homepage — we fixed that in the new version."
Bad: "We can help transform your digital presence with a seamless new website."

---

## Output format

```json
{
  "dimensions": {
    "design_quality": 1,
    "primary_cta": 0,
    "mobile_readiness": 1,
    "content_quality": 1,
    "trust_signals": 0,
    "contact_clarity": 1
  },
  "site_score": 3,
  "site_analysis": "The site is built on a generic Wix template from around 2017. There is no phone number or booking link visible above the fold — visitors have to scroll to a contact page to find any contact information. The hero section uses a stock image with no connection to the actual business.",
  "site_weaknesses": [
    "No phone number visible in header or hero",
    "No booking or contact CTA above the fold",
    "Hero uses generic stock photography",
    "No customer reviews or testimonials",
    "Contact information only on a separate contact page"
  ],
  "outreach_angle": "We noticed your site doesn't make it easy for new customers to get in touch — we built you a version that puts your number front and centre.",
  "business_type": "hair salon",
  "opportunity_summary": "Strong opportunity — dated site with no CTA, no social proof, and weak mobile experience."
}
```

---

## Rules

- Be specific. Vague outputs are useless.
- Score conservatively. If unsure between 1 and 2, give 1.
- The outreach_angle must sound like a human wrote it — not a sales robot.
- If the site appears to be a parked domain, error page, or blank: set site_score to -1 and note it.
- A score of 1–3 is a great prospect. A score of 7+ is likely not worth Renaldo's time.
