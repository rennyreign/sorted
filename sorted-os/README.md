# Sorted OS

The operating system for Sorted — a business modernisation company that makes modern business infrastructure accessible to small and independent businesses, because stronger local businesses build a stronger economy.

This directory is the structured source of truth for Sorted's doctrine, strategy, market, operations, and governance. It is written to be read by operators, agents, partners, and anyone who needs to understand how Sorted works and why.

Start with `00-company/` for the foundational context, then move into the relevant section for your work.

---

## Two Entry Points

Sorted currently operates through two public entry points. They are structurally independent — each is a complete, valuable offer in its own right — and they may one day operate as separate businesses. Today they share a factory, a doctrine, and a relationship model.

### Sorted Sites

**What it is:** A website manufacturing service that builds high-quality websites for local businesses using a reversed product cycle — the prospect sees the finished site before being asked to pay.

**Who it's for:** Real, active local businesses whose digital presence understates the quality of the underlying business. The core signal is: the business is better than its website.

**What it delivers:** A complete, launched website — design, build, hosting, and the SortedUpdates content layer. The client owns editable content; Sorted retains the design, code, and reset key.

**How it works:** Build -> Inspect -> Nod -> Fixed Price -> Content Setup -> QA -> Launch -> Proof

**Commercial model:** Build first, charge second. Circulation pricing during the current phase — the objective is to maximise profitable deployment of high-quality finished websites while discovering market-clearing price through real Nod conversations.

**Strategic role:** Sites is Sorted's primary acquisition engine. It creates the relationship and earns the proximity to understand where the business genuinely needs help. It is a strong standalone business, not merely a lead magnet for Ops.

**Full documentation:** `03-sites/`

### Sorted Ops

**What it is:** An operational improvement service that removes repetitive work, recovers capacity, and improves business performance for revenue-generating small businesses.

**Who it's for:** Revenue-generating small businesses with real operational activity — customers, enquiries, follow-up, booking, quoting, reminders, administration. Revenue is the qualification signal because it indicates that repetitive work, pain, and the ability to fund improvement are present.

**What it delivers:** Installed systems that close identified operational gaps. Current outcome areas:
- **Trust:** website, reviews, branding, reputation
- **Enquiries:** forms, AI receptionist, CRM, lead routing, missed calls
- **Customers:** follow-up, promotions, referrals, reactivation, reporting

**How it works:** Inspect -> Diagnose -> Install -> Integrate -> Improve. Start with one costly gap, install one working fix, measure the change, then decide what to improve next.

**Commercial model:** Focused one-system installation (£2,500 one-off) or ongoing operational partnership (£750/month). No lock-in contracts.

**Strategic role:** Ops expands the value of an existing relationship. It follows the business outcomes of trust, enquiries, and customers — driven by observed need, not aggressive upselling. Ops may also be entered directly by businesses that already know they have an operational gap.

**Full documentation:** `04-ops/`

### How They Relate Today

```
SITES                    OPS
  |                        |
  |  creates relationship  |
  |  earns proximity       |
  |  reveals gaps          |
  |          |             |
  +----------+-------------+
             |
             v
     EXPANSION ENGINE
     observe gap -> install fix -> measure -> repeat
```

Sites creates the relationship. Ops expands it. The expansion is governed by the Trust Loop: delivered value creates trust, trust creates access, access reveals the next costly gap, solving that gap creates more value.

Sites does not exist to feed Ops. Sites is a complete business. Ops does not depend on Sites. Ops is a complete business. They share a factory, a doctrine, and a relationship model, and they compound together — but each could stand alone.

---

## Directory Map

| Directory | Purpose | Start here |
|---|---|---|
| `00-company/` | Vision, strategy, business model, terminology | `vision.md`, then `strategy.md` |
| `01-doctrine/` | Foundational principles that govern all decisions | `economic-thesis.md`, then `law-of-substance.md` |
| `02-market/` | Positioning, ideal customers, offers, pricing | `positioning.md`, then `offers.md` |
| `03-sites/` | Sorted Sites operational documentation | `sites-overview.md` |
| `04-ops/` | Sorted Ops operational documentation | `ops-overview.md` |
| `05-partners/` | Partner model, commissions, partner sales | `partner-model.md` |
| `06-operating-system/` | Planning cadence, reviews, constraint solving | `factory-review.md` |
| `07-operators/` | Individual operator specifications | `operator-standard.md` |
| `08-metrics/` | Measurement framework, scorecard, unit economics | `scorecard.md` |
| `09-governance/` | Decision log, change protocol | `change-protocol.md` |

---

## Governing Hierarchy

```
Economic Thesis
    -> Law of Substance
        -> Rooted Decision Tree
            -> Trust Loop
                -> Sorted OS
                    -> Business-unit doctrine
                        -> Operator instruction
                            -> Task
```

The **Economic Thesis** decides why Sorted exists and who it serves. The **Law of Substance** decides how Sorted behaves. The **Rooted Decision Tree** decides whether an opportunity deserves commercialisation. The **Trust Loop** explains how delivered value compounds. The Sorted OS then governs execution.

See `00-company/strategy.md` for the full hierarchy and `01-doctrine/` for each doctrine document.

---

## Relationship to AGENTS.md

`AGENTS.md` (in the repository root) is the primary operating brief for any agent working in the Sorted repository. It is the authoritative source for agent behaviour.

This directory (`sorted-os/`) is the structured operating system that backs AGENTS.md. Where AGENTS.md is the brief, sorted-os is the system. They are kept consistent; when doctrine changes, both are updated.
