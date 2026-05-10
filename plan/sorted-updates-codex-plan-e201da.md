# Sorted Updates — Codex Build Plan

Maximise Codex's 5-hour usage window by building the complete `operators/sorted-updates` core scaffold inside the existing `rennyreign/sorted` repo, then hand remaining work to Cascade.

---

## Context

- **Repo:** `rennyreign/sorted` (Next.js 15 / Tailwind / TypeScript)
- **Client site in-scope:** `app/gbhalesowen` (Gracie Barra Halesowen) — lives in-place for now; repo split deferred to a dedicated Cascade session post-build
- **Build target:** Python operator system under `operators/sorted-updates/`
- **Delivery mode:** Dry-run only — no live file writes, no real WhatsApp/GitHub API calls

---

## What Codex Builds (5-hour window)

### Phase 1 — Scaffold & Config (Priority: ship this first)

| Task | Output |
|---|---|
| Create full `operators/sorted-updates/` directory tree | Matches spec below |
| `operator.py` — CLI entrypoint | Accepts `--client`, `--message`, `--input` |
| `config.py` — config loader | Reads `clients/*/operator.json` |
| `router.py` — client router | Maps phone number / client_id to operator |
| `models.py` — Pydantic models | `InboundMessage`, `UpdateRequest`, `DryRunPlan` |
| `policies.py` — safety policy | Approval-gate logic, unsupported request handler |
| `.env.example`, `requirements.txt`, `Makefile` | `make setup`, `make test`, `make run MESSAGE="..."` |

### Phase 2 — GB Halesowen Client Operator

| Task | Output |
|---|---|
| `clients/gbhalesowen/operator.json` | Full config (brand, routes, allowed updates, approval gates) |
| `clients/gbhalesowen/memory.json` | Seed memory (aliases, preferred style, frequent updates) |
| `clients/gbhalesowen/rules.md` | Human-readable operating rules |
| `clients/gbhalesowen/templates/pages/*.md` | beginners, kids-classes, timetable, event, privacy, terms |
| `clients/gbhalesowen/templates/components/announcement-banner.md` | Banner component template |

### Phase 3 — JSON Schemas

| File | Purpose |
|---|---|
| `schemas/inbound_message.schema.json` | Validates incoming WhatsApp message shape |
| `schemas/update_request.schema.json` | Validates classified update request |
| `schemas/client_operator.schema.json` | Validates `operator.json` config files |
| `schemas/dry_run_plan.schema.json` | Validates dry-run output |

### Phase 4 — Classifier

Deterministic keyword classifier inside `operator.py` / `router.py`:

- Maps message text → `contact_update`, `testimonial_update`, `timetable_update`, `announcement_banner`, `predefined_page_addition`, `gallery_update`, `cta_update`
- Maps approval-gated keywords → `approval_required: true`
- Maps unknown intent → `status: unsupported`
- Page-type detection: `beginners`, `kids-classes`, `womens-classes`, `timetable`, `event`, `privacy`, `terms`
- Generates `target_route` (`/gbhalesowen/[slug]`) and `target_files` (`app/gbhalesowen/[slug]/page.tsx`)

### Phase 5 — Example Inbound Messages

```
examples/inbound_messages/
  gbhalesowen_timetable.json
  gbhalesowen_beginners_page.json
  gbhalesowen_pricing_request.json
```

### Phase 6 — Tests

```
tests/
  test_router.py
  test_gbhalesowen_operator.py
  test_policy.py
  test_parser.py
```

8 required cases:
1. Route known GBH phone → GBH operator
2. Classify "add a beginners page" → `predefined_page_addition`
3. Classify timetable update
4. Pricing request → `approval_required: true`
5. Unsupported request → `status: unsupported`
6. Client config loads correctly
7. Dry-run plan includes `suggested_whatsapp_reply`
8. Target route/file generated correctly for predefined pages

### Phase 7 — Documentation

```
operators/sorted-updates/
  README.md          (what it is, how to run locally, how to add clients/pages)
  brief.md           (copy from plan/SortedUpdates Project.md codex brief section)
  docs/
    operator-pattern.md     (shared intake → router → operator pattern diagram)
    experience-artifact.md  (intended user experience narrative)
```

---

## Directory Tree (Full Target)

```
operators/
  sorted-updates/
    README.md
    brief.md
    implementation/
      operator.py
      config.py
      router.py
      models.py
      policies.py
      requirements.txt
      Makefile
      .env.example
      clients/
        gbhalesowen/
          operator.json
          memory.json
          rules.md
          templates/
            pages/
              beginners-page.md
              kids-classes-page.md
              timetable-page.md
              event-page.md
              privacy-page.md
              terms-page.md
            components/
              announcement-banner.md
      schemas/
        inbound_message.schema.json
        update_request.schema.json
        client_operator.schema.json
        dry_run_plan.schema.json
      tests/
        test_router.py
        test_gbhalesowen_operator.py
        test_policy.py
        test_parser.py
      examples/
        inbound_messages/
          gbhalesowen_timetable.json
          gbhalesowen_beginners_page.json
          gbhalesowen_pricing_request.json
    docs/
      operator-pattern.md
      experience-artifact.md
```

---

## Codex Verification Commands

Codex must run all of these before responding "Build Complete":

```bash
cd operators/sorted-updates/implementation
make setup
make test
make run MESSAGE="Can you add a beginners page to the site?"
make run MESSAGE="Change Saturday kids class to 10am"
make run MESSAGE="Add £89 membership pricing"
```

All must produce structured JSON output with no errors.

---

## Out of Scope for Codex

- Real WhatsApp API integration
- Real GitHub branch creation or PRs
- Modifying any live `app/gbhalesowen` files
- Unnecessary third-party packages
- Secrets in committed files

---

## Codex Completion Response Format

```markdown
## Build Complete: Sorted Updates Core Scaffold

### What was built
### Files created
### Verification evidence
### Example dry-run outputs
### Known gaps
### Recommended next build
```

---

## Deferred — Post-Codex (Cascade Session)

| Item | Reason deferred |
|---|---|
| **gbhalesowen repo split** — extract `app/gbhalesowen` into `rennyreign/gbhalesowen` | Preserves all 5hrs for operator scaffold; safe to split cleanly afterwards |
| **Level 2: Preview branch** — GitHub branch + PR creation per update request | Needs real GitHub API integration; out of scope for dry-run phase |
| **Level 3: Live update** — merge + Netlify deploy trigger | Requires full approval flow + deploy pipeline wiring |
| **WhatsApp webhook endpoint** — `POST /api/whatsapp/inbound` in Next.js | Wire up after core operator is verified locally |
| **Memory auto-update** — patterns written back to `memory.json` after requests | Only useful once request volume exists |

---

## Notes

- **Naming:** Codex must use `Sorted Updates`, `WhatsApp Intake`, `Client Router`, `Client Website Operator`, `GB Halesowen Operator` — not generic names
- **No real phone numbers** in committed files — placeholder `+447000000000` only
- **gbhalesowen repo referenced in-place** — operator config points to `app/gbhalesowen` paths within `rennyreign/sorted`; split happens in a later session

---

## Post-Codex Status — May 10, 2026

Codex completed the dry-run core scaffold under:

```txt
operators/sorted-updates/
```

Completed and verified:

- Python CLI entrypoint: `operators/sorted-updates/implementation/operator.py`
- Pydantic models: `models.py`
- Config loader: `config.py`
- Client Router: `router.py`
- Deterministic classifier and dry-run planner: `parser.py`
- Safety policy: `policies.py`
- GB Halesowen Operator config, memory, rules, and templates
- JSON schemas
- Example inbound messages
- 8 required tests
- README, brief, operator pattern docs, and experience artifact

Verification run from `operators/sorted-updates/implementation`:

```bash
make setup
make test
make run MESSAGE="Can you add a beginners page to the site?"
make run MESSAGE="Change Saturday kids class to 10am"
make run MESSAGE="Add £89 membership pricing"
```

Result:

- `make setup` completed after network approval for `pydantic` and `pytest`
- `make test` passed with `8 passed`
- all three `make run` commands returned structured JSON

No live `app/gbhalesowen` files were modified.

---

## Cascade Next Steps

### Locked Decisions From Renaldo — May 10, 2026

These decisions supersede the open questions below:

- **WhatsApp provider direction:** cheapest viable option first. Recommended implementation target is direct Meta WhatsApp Cloud API, because it avoids Twilio's per-message platform fee and 360dialog's monthly per-number fee. Twilio remains the fallback if Meta onboarding slows the build down.
- **Runtime:** local prototype first, as long as it supports the dry-run and auto-reply workflow.
- **Reply behaviour:** automatic WhatsApp replies once provider integration exists.
- **GitHub target:** keep GB Halesowen inside `rennyreign/sorted` for now to preserve build time.
- **GitHub auth:** use a fine-scoped Personal Access Token for preview branch/PR automation. Never commit the token.
- **Preview/deploy source:** Netlify previews.
- **Netlify status:** repo is already connected to Netlify previews.
- **Approval owner:** Renaldo approves pricing, legal, payment, integration, brand identity, and deletion requests.
- **Content source of truth:** the current live/in-repo GB Halesowen website content is accurate. Operator templates should be created within the existing GBH design system and should not introduce a separate content source.
- **Booking URL:** keep current booking link for now. Renaldo will update or replace it later.
- **WhatsApp number:** use a new dedicated WhatsApp number for Sorted Updates.
- **Meta access:** Renaldo has Meta Business access.

### Step 1 — Commit Scope Cleanup

Goal: prepare the Codex scaffold for a clean commit/PR.

Do:

- Include `operators/sorted-updates/**`
- Include `.gitignore` Python cache additions
- Exclude unrelated `.DS_Store`, `assets/`, and any unrelated local plan noise unless Renaldo explicitly wants them committed
- Re-run:

```bash
cd operators/sorted-updates/implementation
make test
```

Decision needed:

- Whether the local `plan/` folder should be committed or kept as working notes only

### Step 2 — Add Local HTTP Dry-Run Endpoint

Goal: turn CLI dry-runs into a local HTTP endpoint without real WhatsApp API dependency.

Build:

```txt
operators/sorted-updates/implementation/api.py
```

Suggested endpoint:

```txt
POST /whatsapp/inbound
```

Behaviour:

- Accept normalized inbound JSON matching `schemas/inbound_message.schema.json`
- Route via `Client Router`
- Return `DryRunPlan` JSON
- Do not write files
- Do not call WhatsApp APIs yet
- Do not call GitHub APIs yet

Use standard library `http.server` for the first prototype unless FastAPI is explicitly approved later.

Add:

```txt
make serve
```

Verify:

```bash
curl -X POST http://127.0.0.1:8787/whatsapp/inbound \
  -H "Content-Type: application/json" \
  --data @examples/inbound_messages/gbhalesowen_beginners_page.json
```

### Step 3 — Prepare Auto-Reply Contract

Goal: define exactly when the system sends an automatic WhatsApp reply.

Behaviour:

- For allowed dry-run requests, send `suggested_whatsapp_reply`
- For approval-gated requests, send the approval-required reply
- For unsupported requests, send the manual-review reply
- Treat owner-initiated messages as the cheapest path: reply inside the open customer service window with free-form text
- Do not start outbound conversations unless templates and costs have been explicitly approved
- Do not send multiple replies for the same `message_id`
- Persist enough local state to prevent duplicate auto-replies during testing

Add tests for:

- beginners page inbound request
- timetable update
- pricing approval gate
- unknown sender/client
- unsupported request
- duplicate `message_id` no-op

### Step 4 — Direct Meta WhatsApp Cloud API Adapter Spike

Goal: map Meta webhook payloads into the internal inbound schema and prepare outbound auto-replies.

Build:

```txt
implementation/adapters/
  meta_whatsapp.py
```

The first adapter should support:

- webhook verification challenge
- inbound text message normalization
- outbound text reply payload construction
- environment variables for token, phone number id, verify token, and app secret
- no secrets committed

Twilio should only be implemented as a fallback if direct Meta setup takes too long.

Do not commit secrets.

### Step 5 — Netlify Preview Branch Design

Goal: design Level 2 before implementing it.

Prepare a doc:

```txt
operators/sorted-updates/docs/preview-branch-design.md
```

It should define:

- branch naming
- PR title/body template
- allowed target files
- approval gates
- Netlify preview URL source
- WhatsApp reply when preview is ready
- rollback/no-op behaviour

Do not implement live GitHub mutations until this is reviewed.

### Step 6 — Keep GB Halesowen In-Repo For First Production Path

Current operator config points to in-place paths:

```txt
app/gbhalesowen
public/gbhalesowen
client/gbhalesowen
```

Decision:

- Keep `gbhalesowen` inside `rennyreign/sorted` through the first webhook, auto-reply, and Netlify preview branch build.
- Defer repo split until the operator flow is working end to end.

### Step 7 — Template From Existing GBH Design System

Goal: ensure generated page/component previews feel native to the current GBH site.

Rules:

- Treat current `app/gbhalesowen` content as source of truth
- Derive page templates from existing routes/components
- Preserve existing CTA language, layout rhythm, palette, typography, and image treatment
- Do not invent new timetable data, booking links, legal copy, or pricing
- If requested content is not present on the current website, ask for clarification or require approval

---

## Needed From Renaldo

### Resolved Decisions

- Meta Business access exists.
- WhatsApp should use a new dedicated number.
- GitHub auth should use a fine-scoped PAT.
- Netlify previews are connected.
- Renaldo is the approval owner.
- Current GBH website content is source of truth.
- Current booking URL stays until Renaldo updates it.

### Still Needed Before Direct Meta WhatsApp Work

1. New WhatsApp number details once provisioned:

- phone number ID
- WhatsApp Business Account ID
- display phone number for local runtime only

2. Meta app credentials for local `.env` only:

- access token
- verify token
- app secret, if signature verification is implemented in this phase

Do not paste these into chat or commit them.

3. Test sender identity:

- use only a fake placeholder in repo
- keep the real phone number in local `.env` or provider dashboard only

4. Auto-reply wording sign-off:

- confirm the current `suggested_whatsapp_reply` style is acceptable for automatic replies
- current assumption: approval-gated requests auto-reply immediately with an approval-required message and do not apply changes

Recommendation:

- auto-reply for dry-run, approval-required, and unsupported states, but do not auto-apply file changes

### Still Needed Before Preview Branch / PR Automation

5. GitHub PAT for local `.env` only:

- create a fine-scoped token with the minimum repository permissions needed to create branches and PRs
- do not paste it into chat
- do not commit it

6. Netlify project details:

- confirm where preview URLs appear: GitHub check, Netlify dashboard, or both
- provide Netlify site ID only if the preview automation needs direct Netlify API lookup

7. Approval policy mechanics:

- Renaldo is the approver
- decide whether approval happens by WhatsApp reply, GitHub PR approval, or both

### Still Needed For GB Halesowen Content

8. Booking CTA link:

- no action needed now
- keep current `https://cal.com/adxengine/free-intro?theme=light`
- Renaldo will replace/update in due time

9. Legal page posture:

- placeholder draft pages only
- or owner-supplied privacy/terms copy

Recommendation:

- keep generated legal pages as draft placeholders until owner supplies approved copy

10. Timetable/content source of truth:

- confirmed assumption: current website content is source of truth
- templates must be derived from the existing GBH design system

---

## Recommended Immediate Cascade Build

Build the local HTTP dry-run wrapper and auto-reply contract first:

```txt
operators/sorted-updates/implementation/api.py
operators/sorted-updates/implementation/adapters/meta_whatsapp.py
```

Keep provider calls disabled behind environment variables until Meta credentials exist.

Codex continued this slice by adding:

- `api.py`: local HTTP WhatsApp Intake
- `replies.py`: duplicate-safe auto-reply contract
- `adapters/meta_whatsapp.py`: Meta webhook normalization and outbound text payload construction
- `preview.py`: safe Netlify preview branch planner with path validation
- `docs/preview-branch-design.md`: Level 2 design

All provider sends and GitHub mutations remain disabled.

---

## Provider Cost Notes

Current cheapest direction is direct Meta WhatsApp Cloud API.

Reasoning:

- Twilio adds a `$0.005/message` platform fee for inbound or outbound WhatsApp messages, plus Meta template fees where applicable.
- 360dialog's regular WhatsApp API plan is `€49` per number per month plus Meta WhatsApp messaging fees.
- Direct Meta should avoid those provider markup/monthly fees, though Meta setup and compliance may take more manual work.
- Keep the first production behaviour owner-initiated only. Outbound template conversations can add cost and should be approval-gated.

Use Twilio only if direct Meta setup blocks progress and the extra per-message fee is acceptable for speed.

References checked May 10, 2026:

- Twilio WhatsApp pricing: https://www.twilio.com/en-us/whatsapp/pricing
- 360dialog WhatsApp API pricing: https://360dialog.com/pricing
- Meta WhatsApp pricing docs: https://developers.facebook.com/docs/whatsapp/pricing/

Suggested first command for Cascade:

```bash
cd operators/sorted-updates/implementation
make test
```

Then add:

```bash
make serve
```

And verify:

```bash
curl -X POST http://127.0.0.1:8787/whatsapp/inbound \
  -H "Content-Type: application/json" \
  --data @examples/inbound_messages/gbhalesowen_beginners_page.json
```
