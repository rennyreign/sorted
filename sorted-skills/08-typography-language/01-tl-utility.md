# Utility Typography Language

## Purpose

Utility typography exists to communicate quickly and clearly.

It is bold, legible, and free of decoration.

This typography language is used for trades, emergency services, local services, and any business where the visitor must act fast.

---

## Core principle

Type should help the visitor scan, decide, and act.

Never slow down comprehension.

---

## Font stack

- **Display / headings:** One strong sans-serif
  - Recommended: Plus Jakarta Sans, Inter, or Geist
- **Body:** Same family as display, or a slightly more neutral sans-serif
- **Mono / labels:** DM Mono or SF Mono style for phone numbers, response times, and technical details

Use **max two weights** per page: semibold and regular, or bold and medium.

---

## Type scale

- **Hero H1:** `clamp(3.5rem, 9vw, 8rem)` — tight leading, bold or extrabold weight
- **Section H2:** `clamp(2.25rem, 5vw, 4rem)` — bold or semibold, tight leading
- **Card H3:** `text-xl to text-2xl` — semibold
- **Body:** `text-lg leading-relaxed` — regular weight, never smaller than `text-base`
- **Labels / eyebrows:** `text-xs uppercase tracking-[0.12em]` — medium or semibold
- **Numbers / stats:** `text-4xl to text-6xl` — bold, mono or tabular figures

---

## Rules

### Headlines

- Headlines should be short and outcome-focused.
- Avoid decorative serif fonts.
- Avoid excessive line height. Headlines should feel dense and confident.
- Use sentence case, not all caps.
- Utility headings should be bold, not medium. The visitor must feel the hierarchy immediately.
- Hero headlines should dominate the viewport text.

### Body

- Body copy should be short.
- Use `max-w-[60ch]` for comfortable reading length. Tighter than editorial.
- Avoid paragraphs longer than 3–4 lines on mobile.
- Body text should be at least `text-base`, preferably `text-lg`. Small body copy looks apologetic.

### Numbers and labels

- Phone numbers, response times, and stats should use a mono or tabular style.
- This separates functional data from marketing copy.
- Use uppercase tracking for small labels: "AVAILABLE 24/7", "FAST RESPONSE".
- Stats should be large and bold. They are proof, not decoration.

### CTAs

- Button text should be semibold or bold.
- Keep CTA labels short: "Call now", "Book on WhatsApp", "View services".
- CTA buttons should feel slightly larger than body text.

---

## Hierarchy

1. Hero headline — largest, boldest, dominant
2. Section headline — clearly smaller than hero but still bold
3. Card headline — smaller again, semibold
4. Body — readable but visually subordinate, at least `text-base` preferably `text-lg`
5. Labels — smallest, uppercase, tracked

Contrast should be obvious at every level. The jump from body to hero should feel dramatic, not incremental.

---

## Validation

Can a visitor scan the page in 5 seconds and know what to do?

If not, the hierarchy is wrong.
