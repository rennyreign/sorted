# Sorted Updates — System Handoff Document

**Status:** Architecture defined, build not started  
**Last updated:** May 2026  
**Author:** Renaldo Edmondson / Sorted.

---

## What Sorted Updates Is

Sorted Updates is a white-label client portal that allows website owners to administer changes to their site through a conversational AI agent — without needing to contact a developer, raise a ticket, or understand code.

It lives at a dedicated URL on the client's own domain:

```
https://clientsite.com/sorted
```

The experience is intentionally similar to a conversation with an AI assistant (think ChatGPT) — the client types what they want, attaches files or images if needed, and the agent handles the rest. Changes are previewed before going live where appropriate. Safe changes apply automatically. Everything is reversible.

---

## Repository Architecture — Two-Repo Model

Each client deployment uses two separate repositories. This is a deliberate architectural decision made to allow Sorted platform updates to propagate universally without colliding with client-specific website code.

### `rennyreign/sorted-platform`
Owned entirely by Sorted. Contains:
- The portal UI (Next.js — the `clientsite.com/sorted` shell)
- The agent runtime and master orchestrator
- Shared agent logic, policy engine, change execution layer
- The intro wizard component
- All tooling for provisioning new client agents

Updates to this repo propagate to all client portals automatically. Clients never touch this repo.

### `rennyreign/client-{name}` (one per client)
e.g. `rennyreign/client-gbhalesowen`, `rennyreign/client-royemusic`

Contains:
- The client's website code only
- Their per-client agent config (`operator.json`)
- Their brand config, allowed change types, predefined page templates
- A `handoff` git tag marking the exact commit Sorted approved at delivery

The client agent (deployed from `sorted-platform`) reads from and writes to this repo exclusively. Platform updates never touch this repo. Website changes never touch `sorted-platform`.

### Why not a branch model?
A single repo with client branches creates merge conflicts at scale — Sorted UI updates would need to be surgically applied to every client branch without overwriting their site content. At 20+ clients this becomes unmanageable. The two-repo model keeps these concerns completely separated.

---

## Agent Architecture

### Master Orchestrator

A single persistent service running in `sorted-platform`. Responsibilities:

- Manages provisioning when a new client is onboarded
- Monitors all client agents for health, activity, and escalations
- Receives escalations from client agents when a request is outside permitted scope
- Notifies Renaldo via **email + WhatsApp + master dashboard** simultaneously on escalation
- Can approve, reject, or manually action escalated requests from any of the three surfaces
- Has read access to all client configs and conversation histories

### Client Site Agent

One agent deployed per client, scoped entirely to that client's site. Responsibilities:

- Handles the full conversation loop with the site owner
- Classifies requests against that client's permitted change types
- Runs policy checks before any action
- Prepares previews for non-trivial changes
- Applies approved changes via git commit + deploy trigger
- Escalates anything outside permitted parameters to the Master
- Maintains persistent conversation memory across sessions for that client

---

## The Portal Experience

### URL Structure

```
https://clientsite.com/sorted            → Entry point / magic link landing
https://clientsite.com/sorted/chat       → Active conversation with the agent
https://clientsite.com/sorted/history    → Past change requests and their status
https://clientsite.com/sorted/preview    → Staged preview of pending changes
https://clientsite.com/sorted/reset      → Reset failsafe (authenticated, confirmed)
```

### First Login — Intro Wizard

On first login via magic link, the client lands on a lightweight intro wizard built with **Shepherd.js** (or equivalent tour library). It:

- Takes under 60 seconds to complete
- Highlights the key UI elements: chat input, file upload, history, preview, reset
- Sets expectations clearly: what the agent can do, what needs Sorted approval
- Does not require the client to configure anything — it is purely orientating
- Never appears again after completion (stored in session/local state)

After the wizard, the client lands directly in the chat.

### Conversation Interface

1. **Client types a request** in natural language
   _e.g. "Change my opening hours to 9am–6pm Monday to Saturday"_

2. **Agent classifies the request** against permitted change types for that client

3. **One of four outcomes:**
   - ✅ **Safe change** — applied automatically, confirmed in chat
   - 👁 **Preview first** — agent prepares a staged branch, sends preview URL, client approves before merge
   - ❓ **Clarification needed** — agent asks a follow-up in the conversation thread
   - 🔒 **Escalated** — outside permitted scope, Master notified, Renaldo reviews

4. **Client confirms or rejects** — all non-trivial changes require explicit confirmation in chat before applying

5. **Change is applied** — agent commits to client repo, triggers deploy, replies with confirmation and a link to the live change

### Stateful Conversation Memory

Conversations are persistent across sessions. The agent remembers:
- All previous requests and their outcomes for that client
- Current pending or previewed changes
- Client preferences expressed during past sessions
- Site context (last known state of key content areas)

This enables natural follow-ups:
_"Actually, revert those hours back to what they were"_
_"Add another testimonial like the one I sent last week"_

### File & Media Support

The portal supports the following input types in the chat:

| Type | Accepted formats | Use cases |
|---|---|---|
| Images | JPG, PNG, WebP | Gallery updates, headshots, banners, logos |
| Documents | PDF | Menus, price lists, embed/link assets |
| Text paste | Plain text | Bios, testimonials, announcements, copy |
| URLs | Any valid URL | Video embeds, external links, CTA targets |

**Image handling:** All uploaded images are automatically cropped and optimised to match the site's existing image dimensions and aspect ratios. This is intentional — it prevents layout breakage and keeps the site visually consistent. If a client wants a different crop or aspect ratio, they ask the agent explicitly and it's treated as a change request.

---

## Reset Failsafe

Every client site has a reset point established at the moment Sorted manually approves and hands off the finished site.

### How it works

At handoff, Sorted creates a protected git tag in the client repo:

```
git tag -a sorted-handoff -m "Sorted approved handoff — $(date)" && git push origin sorted-handoff
```

This tag is **immutable** — it cannot be overwritten by the client agent under any circumstances.

### Triggering a reset

A reset can be triggered by:
- The **client** via `clientsite.com/sorted/reset` (authenticated, requires explicit typed confirmation)
- **Renaldo** via the master dashboard

Both paths require a confirmation step with a clear warning that post-handoff changes will be removed.

### What is restored

- **Code only** — all site code is reverted to the `sorted-handoff` tag state
- Uploaded media assets added after handoff are **not** retained (cost vs. value decision)
- Conversation history is preserved — the agent notes the reset event in the thread
- A deploy is triggered automatically after reset completes

### Post-reset state

After reset, the agent replies in chat:
_"Your site has been restored to the version Sorted handed off. All changes since then have been removed. Let me know what you'd like to update."_

---

## Change Guardrails

Each client agent operates within a scoped permission set. This is the harness that keeps changes within a reasonable range and ensures the site cannot be broken through the portal.

### Tier 1 — Auto-apply (no preview needed)
- Text copy updates (headings, body, descriptions)
- Contact details (phone, email, address)
- Opening hours and timetables
- Testimonials and reviews
- Announcement banners
- Team member bios
- CTA text and link targets

### Tier 2 — Preview required before applying
- Image updates (gallery, hero, headshots)
- New page additions (from predefined templates)
- Navigation label changes
- Multiple simultaneous changes in one request
- Any change where agent confidence score is below threshold

### Tier 3 — Escalated to Sorted master (never auto-applied)
- Pricing or fee changes
- Payment or checkout integrations
- Legal pages (Privacy Policy, Terms of Service)
- Brand identity (logo, colour palette, typography)
- Page deletions
- New third-party integrations or embeds
- Anything outside the client's `allowed_update_types` config

### Hard limits — never permitted via portal under any circumstances
- Environment variables or secrets
- Deployment configuration
- Database schema or access
- Authentication or access control
- The `sorted-handoff` git tag

---

## Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Portal frontend | Next.js (React) | Deployed from `sorted-platform`, served at `clientsite.com/sorted` |
| Agent runtime | Python | Existing operator codebase is the foundation |
| LLM backbone | Claude (Anthropic) | Function-calling for structured change execution |
| Change execution | Git + GitHub API | Agent opens branch, commits, triggers deploy |
| Preview system | Netlify deploy previews | Branch deploy URL sent to client for approval |
| Conversation memory | Supabase (per client row) | Persistent across sessions |
| Asset storage | Cloudflare R2 or Supabase Storage | Uploaded images/PDFs per client |
| Auth | Magic link (Supabase Auth) | Provisioned by Sorted at onboarding |
| Master service | Persistent Python service | Queue + webhook endpoints + notification dispatch |
| Intro wizard | Shepherd.js | First-login only, never repeats |
| Notifications | Email (Resend) + WhatsApp (Meta API) + Dashboard | All three fire on escalation |

---

## How a Change Gets Applied

```
Client types request in portal chat
        ↓
Client Agent — classify → policy check → tier decision
        ↓
┌──────────────────────────────────────────────────┐
│ Tier 1 (safe)   → commit to client repo          │
│                    trigger Netlify deploy         │
│                    confirm in chat                │
├──────────────────────────────────────────────────┤
│ Tier 2 (preview)→ open branch in client repo     │
│                    trigger Netlify branch deploy  │
│                    send preview URL in chat       │
│                    await client approval          │
│                    merge on approval / discard    │
├──────────────────────────────────────────────────┤
│ Tier 3 (escalate)→ flag to Master Orchestrator   │
│                    notify Renaldo (3 channels)    │
│                    reply in chat: "flagged"       │
│                    await manual approval          │
└──────────────────────────────────────────────────┘
        ↓
Change confirmed in chat thread
Memory updated
```

---

## Self-Serve Client Onboarding

When Sorted is ready to hand off a site, the workflow is:

1. Sorted creates `rennyreign/client-{name}` repo with site code
2. Sorted sets the `sorted-handoff` tag at the approved commit
3. Sorted provisions the client in `sorted-platform` — creates their agent config, magic link, and portal route
4. System sends the client a magic link email: _"Your site is ready. Click to access your portal."_
5. Client clicks link → lands at `clientsite.com/sorted` → Shepherd.js intro wizard plays once
6. Client is in the chat — the agent introduces itself briefly and confirms what it can help with
7. Onboarding complete

No manual setup required from the client. No passwords to create. No forms to fill.

---

## What Exists Today

The following already exists in `operators/sorted-updates/implementation/` and maps to the new architecture:

| Existing file | Role in new system |
|---|---|
| `parser.py` | Foundation of the client agent classifier — extend with LLM |
| `policies.py` | Approval gate logic — maps directly to Tier 2/3 guardrails |
| `router.py` | Routes messages to client config — adapt for portal auth context |
| `replies.py` | Dry-run plan and reply preparation — keep and extend |
| `models.py` | Pydantic data models — extend for portal session and memory |
| `config.py` | Per-client config loader — migrate to two-repo model |
| `api.py` | HTTP server — replace WhatsApp webhook with portal API endpoints |
| `clients/gbhalesowen/` | First client config — template for all future clients |

**What needs to be built:**
- Portal frontend (chat UI, history, preview, reset, intro wizard)
- Magic link auth (Supabase)
- LLM integration replacing rule-based classifier
- Stateful conversation memory (Supabase)
- File/image upload + auto-crop pipeline
- Git-based change execution engine (GitHub API)
- Preview branch + deploy trigger (Netlify API)
- Master orchestrator service
- Escalation notification dispatch (email + WhatsApp + dashboard)
- Client provisioning workflow
- Master dashboard (Renaldo-facing)

---

## Phase Plan

### Phase 1 — Portal Shell
- Build `clientsite.com/sorted` as a Next.js app in `sorted-platform`
- Magic link auth via Supabase
- Chat UI: conversation thread, message input, file upload
- Shepherd.js intro wizard (first login only)
- Connect to existing Python operator backend via REST API

### Phase 2 — Agent Intelligence
- Replace rule-based parser with LLM agent (Claude, function calling)
- Scoped system prompt per client (brand, allowed changes, tone, site context)
- Stateful conversation memory persisted in Supabase
- Confidence scoring and automatic tier assignment
- Escalation logic wired to Master

### Phase 3 — Change Execution
- GitHub API integration — agent opens branch, writes diffs, commits
- Netlify API integration — trigger branch deploy, retrieve preview URL
- Client approval flow in chat (approve/reject preview)
- Change history view (`/sorted/history`)
- Reset failsafe (`/sorted/reset`) — tag-based, code-only restore

### Phase 4 — Master Orchestrator & Scale
- Master orchestrator service with escalation queue
- Notification dispatch (Resend email + Meta WhatsApp + dashboard alert)
- Master dashboard — cross-client view, escalation inbox, client health
- Self-serve provisioning flow (Sorted triggers → client receives magic link)
- Image auto-crop pipeline (Sharp or Cloudflare Images)

---

## Key Design Principles

- **Client never touches code** — all interactions are conversational, changes are applied by the agent
- **Agent never acts without confirmation on non-trivial changes** — Tier 2+ always previews first
- **Guardrails are config-driven** — permitted changes are defined per client in `operator.json`, not hardcoded
- **Sorted is always in the loop** — escalations surface to Renaldo across three channels, nothing sensitive goes unreviewed
- **Everything is reversible** — git-based execution means every change can be rolled back; the handoff tag is a permanent safety net
- **The portal feels like a person** — agent replies are clear, direct, and human in tone; no jargon, no error codes shown to clients
- **Images are safe by default** — auto-crop enforces visual consistency; clients opt into flexibility, not into constraint
- **Platform updates ship universally** — `sorted-platform` changes reach all portals; client site code is never touched by platform deploys
