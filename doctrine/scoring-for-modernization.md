# Scoring for Modernization

**Status:** Active doctrine
**Parent:** Operator Chain
**Purpose:** Define how the Website Analyser scores prospects, explain the weighting rationale, and specify the two outputs the analyser produces.

---

## The Scoring Formula

```
prospect_score = (opportunity_score x 0.6) + (business_quality_score x 0.4)
```

Both component scores are on a 0-10 scale. The resulting `prospect_score` is also 0-10.

On the review page, the score is displayed multiplied by 10, presented out of 100.

Example: a `prospect_score` of 6.4 displays as 64/100.

---

## The Two Component Scores

### opportunity_score (weight: 0.6)

Measures how poor the current website is and how much room there is to improve it.

High opportunity = bad website. The worse the site, the more compelling the pitch.

What drives a high opportunity score:

- No mobile optimisation
- Slow load times
- Outdated design (pre-2018 aesthetic, Flash-era layouts, no modern typography)
- No clear call to action
- Buried or missing contact information
- No social proof (testimonials, reviews, trust signals)
- Poor navigation
- Low-quality or stock photography that does not represent the business
- No SSL or broken security indicators

### business_quality_score (weight: 0.4)

Measures how viable and active the underlying business is. A strong business with a bad website is the ideal target. A weak business with a bad website is not worth approaching.

What drives a high business quality score:

- Active Google Maps presence with recent reviews
- High review volume and rating
- Clear evidence of trading (recent activity, photos, responses to reviews)
- Established business (not just opened)
- Real premises or clear service area
- Evidence of demand in the category

---

## Why Opportunity Is Weighted Higher

The old formula was:

```
prospect_score = (business_quality_score x 0.6) + (opportunity_score x 0.4)
```

That formula prioritised strong businesses. The problem: a strong business with an already-decent website is a harder sell. They may not feel the pain.

The new formula reverses the emphasis:

```
prospect_score = (opportunity_score x 0.6) + (business_quality_score x 0.4)
```

The website gap is the primary signal. A poor website is the pain. The business quality check is there to filter out businesses that are not worth approaching even if they have a bad website. But website quality drives the sort order.

In plain terms: we want businesses that are real and trading, but whose digital presence is letting them down. Those are the businesses most likely to feel the gap when they see their score and their review page.

---

## What the Score Is Not

The score is not the product.

The score is the diagnosis.

Business owners do not wake up wanting a website audit. They wake up wanting more customers, more trust, and to stop looking amateur compared to bigger competitors.

The score creates awareness of a problem they may not have articulated. The review page and mockup create the desire to fix it. The score is the rational justification. The mockup is the emotional pull.

This is why the score is introduced in the cold email as a curiosity hook, not a product offer.

Example email register:

```
[Business name]

Website Score: 43/100

We reviewed your website and built a modernisation concept.

View your review ->
```

The score creates the click. The review page creates the conversation.

---

## The Two Analyser Outputs

The Website Analyser produces two distinct outputs for every prospect.

### Output A: `site_analysis` (internal)

A full structured breakdown of the website. Used by the operator to understand the prospect and inform the outreach approach. Not shown to the prospect.

Contains:

- `opportunity_score` (0-10)
- `business_quality_score` (0-10)
- `prospect_score` (0-10, computed)
- `outreach_angle` — the single most compelling hook for the cold email
- `weaknesses[]` — specific failure points in plain English
- Full technical analysis (navigation, mobile, speed, trust signals, conversion infrastructure, local search presence)

### Output B: `review_summary` (prospect-facing)

Sales copy written for the business owner. This is what appears on their review page at `sortmydigital.site/review/[slug]`.

Rules for the `review_summary`:

- Second-person voice. Speak directly to the business owner.
- Plain English throughout. No jargon.
- No em-dashes.
- Advisory tone. Not critical. Not patronising. The posture is: "Here is what we found, and here is what it is costing you."
- Translate weaknesses into business impact, not technical descriptions.
- End with a clear forward motion: what a modernised website would change for them.

Example of correct register:

> "Your website is hard to use on a phone, and most of your customers are looking you up on their phones before they call. The contact button is buried and the text is too small to read comfortably. People who find you on Google are likely leaving before they get in touch. A modern site that works well on mobile, shows your work clearly, and makes it obvious how to contact you would convert more of that traffic into actual enquiries."

Example of incorrect register:

> "Mobile UX is suboptimal. CTA placement is below the fold. Trust signal density is low. Navigation architecture requires restructuring."

The `review_summary` should read like an advisor talking to a business owner, not like an audit report.

---

## Score Display on the Review Page

The review page shows:

- Business name
- Score as `[prospect_score x 10] / 100`
- Weaknesses in plain business-owner language (not technical descriptions)
- The `review_summary`
- A blurred mockup that reveals on click

When the prospect clicks "Reveal your new website", the mockup un-blurs and `crm_status` updates to `mockup_revealed` automatically.

Full review page spec: `doctrine/operator-chain.md` (Chain 1, Step 5)

---

## The Modernisation Gap

Every business operates within one of two states.

**Modernised:** easy to find, easy to trust, easy to contact, easy to buy from.

**Unmodernised:** creates friction at every touchpoint. Most owners cannot see where those opportunities are being lost.

The scoring system exists to surface that gap. A poor score is not a design criticism. It is a business diagnosis. Each weak category represents opportunity leakage: visitors who left, enquiries that never came, competitors who looked more credible and got the job.

The review page makes that gap visible. The mockup makes the fix tangible. Together they create the conditions for a conversation.

---

## After Delivery — Rescoring

After a client site is delivered, the business can be rescored using the same formula.

The before and after scores demonstrate measurable modernisation. The conversation shifts from "we built you a website" to "we improved your business by a quantifiable amount."

This is the foundation of the Sorted proof of work.
