# Sorted Updater

Absolutely. Your instinct is better than a generic switchboard model.

The best pattern is:

> **One WhatsApp front door. One dedicated operator per client. Shared operator template underneath.**
> 

Like a hotel: one reception desk, but each guest has their own room key, preferences, and service rules.

## 1. Exact Codex brief

Copy this into Codex.

```markdown
# Build Brief: Sorted Updates Operator Core Scaffold

## Mission

Build the core scaffold for the first Sorted Updates Operator system.

This system allows small business owners to send website update requests via WhatsApp. The system identifies the client, routes the request to that client’s dedicated website update operator, classifies the requested change, checks it against the client’s allowed update menu, and produces a safe dry-run update plan.

The first dedicated client operator is for Gracie Barra Halesowen.

Do not build full WhatsApp production integration yet. Build the core operator architecture, client routing, request classification, safety policy, dry-run output, and GB Halesowen client operator scaffold.

## Repository Context

This is for the `rennyreign/sorted` repository.

Relevant existing project files:

- `client/gbhalesowen/brief.md`
- `client/gbhalesowen/handoff.md`
- `app/gbhalesowen`
- `app/gbhalesowen/components`
- `public/gbhalesowen`

The GB Halesowen site is a Next app route at `/gbhalesowen`.

The Sorted business model is deliberately constrained, fast, standardised, local, and low-pressure. The operator must preserve that spirit. It should not feel like a general AI assistant. It should feel like a reliable maintenance worker for a specific client website.

## Core Architecture

Create this structure:

```txt
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

## Important Naming Model

This is not one generic website updater.

It is a shared Sorted Updates system with dedicated client operators.

Use this language in docs and code comments:

- `Sorted Updates` = overall service/system
- `WhatsApp Intake` = front door
- `Client Router` = identifies which client operator receives the request
- `Client Website Operator` = dedicated worker for one client site
- `GB Halesowen Operator` = first dedicated client website operator

## Core Flow

Implement this dry-run flow:

```
Inbound WhatsApp-style message
↓
Normalise inbound message
↓
Identify client from sender phone number or explicit client id
↓
Load dedicated client operator config
↓
Classify request
↓
Apply client-specific safety rules
↓
Generate dry-run update plan
↓
Return suggested WhatsApp response
```

## Inbound Message Shape

Create an example inbound message format:

```json
{
  "source": "whatsapp",
  "message_id": "wamid_example_001",
  "from_phone": "+447000000000",
  "from_name": "GB Halesowen Owner",
  "received_at": "2026-05-10T12:00:00Z",
  "body": "Can you add a beginners page to the site?",
  "attachments": []
}
```

## Update Request Shape

Every inbound message must become a structured update request:

```json
{
  "request_id": "upd_example_001",
  "client_id": "gbhalesowen",
  "operator_id": "gbhalesowen-website-operator",
  "source": "whatsapp",
  "raw_message": "Can you add a beginners page to the site?",
  "classification": {
    "type": "predefined_page_addition",
    "confidence": 0.9,
    "requires_approval": false,
    "requires_clarification": false
  },
  "intent": {
    "page_type": "beginners",
    "target_route": "/gbhalesowen/beginners",
    "target_files": [
      "app/gbhalesowen/beginners/page.tsx"
    ],
    "missing_information": []
  },
  "status": "dry_run_ready"
}
```

## Dry Run Plan Shape

The operator should output a dry-run plan like:

```json
{
  "status": "dry_run_ready",
  "client_id": "gbhalesowen",
  "operator_id": "gbhalesowen-website-operator",
  "request_type": "predefined_page_addition",
  "summary": "Add a new beginners page for Gracie Barra Halesowen.",
  "approval_required": false,
  "clarification_required": false,
  "target_files": [
    "app/gbhalesowen/beginners/page.tsx"
  ],
  "proposed_actions": [
    "Create beginners page using approved GB Halesowen page template.",
    "Reuse existing site CTA language: Book a free intro.",
    "Preserve existing navy, red, white, and cool grey visual system."
  ],
  "blocked_reasons": [],
  "suggested_whatsapp_reply": "Sorted — I can add a beginners page using the existing site style. I’ll prepare the update as a preview first."
}
```

## GB Halesowen Dedicated Operator Config

Create:

```
operators/sorted-updates/implementation/clients/gbhalesowen/operator.json
```

With this shape:

```json
{
  "client_id": "gbhalesowen",
  "operator_id": "gbhalesowen-website-operator",
  "business_name": "Gracie Barra Halesowen",
  "site_route": "/gbhalesowen",
  "repo": "rennyreign/sorted",
  "site_paths": {
    "app_root": "app/gbhalesowen",
    "components": "app/gbhalesowen/components",
    "public_assets": "public/gbhalesowen",
    "client_context": "client/gbhalesowen"
  },
  "brand": {
    "palette": ["navy", "red", "white", "cool grey"],
    "tone": "supportive, local, confident, beginner-friendly",
    "primary_cta": "Book a free intro",
    "secondary_cta": "View timetable"
  },
  "allowed_update_types": [
    "contact_update",
    "copy_update",
    "testimonial_update",
    "timetable_update",
    "announcement_banner",
    "predefined_page_addition",
    "gallery_update",
    "cta_update"
  ],
  "predefined_pages": [
    "kids-classes",
    "beginners",
    "womens-classes",
    "timetable",
    "privacy",
    "terms",
    "event"
  ],
  "approval_required_for": [
    "pricing",
    "legal",
    "payments",
    "medical_claims",
    "new_integrations",
    "brand_identity_change",
    "delete_page"
  ],
  "known_contacts": [
    {
      "name": "GB Halesowen Owner",
      "phone": "+447000000000",
      "role": "owner"
    }
  ]
}
```

Use placeholder phone numbers only. Do not commit real private phone numbers.

## Client Memory File

Create:

```
operators/sorted-updates/implementation/clients/gbhalesowen/memory.json
```

Initial shape:

```json
{
  "client_id": "gbhalesowen",
  "learned_preferences": {
    "preferred_update_style": "preview_first",
    "default_cta": "Book a free intro",
    "tone": "supportive and beginner-friendly"
  },
  "common_requests": [],
  "approved_phrases": [
    "Book a free intro",
    "View timetable"
  ],
  "restricted_phrases": [],
  "last_updated": null
}
```

Memory should not automatically change production behaviour yet. It is for future pattern learning only.

## Classification Rules

Implement a simple deterministic classifier first.

Classify messages containing:

- “phone”, “number”, “email”, “address” as `contact_update`
- “testimonial”, “review” as `testimonial_update`
- “timetable”, “class time”, “schedule”, days of week + time as `timetable_update`
- “banner”, “notice”, “announcement” as `announcement_banner`
- “page”, “add a page”, “landing page” as `predefined_page_addition`
- “photo”, “image”, “gallery” as `gallery_update`
- “button”, “CTA”, “link” as `cta_update`

Approval-gated keywords:

- “price”, “pricing”, “membership”, “£”
- “privacy”, “terms”, “legal” unless page type is simply generating placeholder draft legal pages
- “payment”, “checkout”, “stripe”
- “guarantee”, “injury”, “safe”, “medical”
- “delete”, “remove page”
- “new booking system”, “integration”

Unsupported requests should return:

```json
{
  "status": "unsupported",
  "approval_required": true,
  "suggested_whatsapp_reply": "I can help, but this falls outside the approved update menu for this site. I’ll flag it for manual review."
}
```

## Page Type Detection

For predefined pages:

- “beginner”, “beginners” → `beginners`
- “kids”, “children” → `kids-classes`
- “women”, “ladies”, “female” → `womens-classes`
- “timetable”, “schedule” → `timetable`
- “privacy” → `privacy`
- “terms” → `terms`
- “camp”, “seminar”, “event”, “open day” → `event`

Target route format:

```
/gbhalesowen/[page-slug]
```

Target file format:

```
app/gbhalesowen/[page-slug]/page.tsx
```

## Safety Policy

The system must never auto-apply:

- pricing updates
- legal/policy content beyond draft page scaffolds
- payment features
- medical/safety claims
- integrations
- brand identity changes
- page deletion

For these, generate a dry-run plan with:

```json
{
  "approval_required": true,
  "status": "approval_required"
}
```

## CLI Behaviour

Implement `make run` so this works:

```bash
make run MESSAGE="Can you add a beginners page to the site?"
```

Expected output: JSON dry-run plan.

Also support:

```bash
python operator.py --client gbhalesowen --message "Change Saturday kids class to 10am"
python operator.py --input examples/inbound_messages/gbhalesowen_beginners_page.json
```

## Tests Required

Create tests for:

1. Routing known GBH phone/client id to GBH operator.
2. Classifying beginners page request.
3. Classifying timetable update.
4. Pricing request requires approval.
5. Unsupported request returns unsupported/manual review.
6. Client config loads correctly.
7. Dry-run plan contains suggested WhatsApp reply.
8. Target route/file generated correctly for predefined pages.

## Documentation Required

README must explain:

- what Sorted Updates is
- what a dedicated client operator is
- how WhatsApp intake will eventually connect
- how to run dry-run locally
- how to add a new client operator
- how to add a new predefined page template
- what is approval-gated

`docs/operator-pattern.md` must explain the reusable pattern:

```
Shared WhatsApp Intake
↓
Client Router
↓
Dedicated Client Website Operator
↓
Client Rules + Memory + Templates
↓
Dry Run / Preview / Apply
```

## Out of Scope For This Build

Do not implement real WhatsApp API calls yet.

Do not implement real GitHub branch creation yet.

Do not modify the live GB Halesowen site files yet unless separately instructed.

Do not install unnecessary packages.

Do not commit secrets.

Do not build a general-purpose AI agent.

This build is the core scaffold and dry-run engine only.

## Verification

From:

```bash
cd operators/sorted-updates/implementation
```

Run:

```bash
make setup
make test
make run MESSAGE="Can you add a beginners page to the site?"
make run MESSAGE="Change Saturday kids class to 10am"
make run MESSAGE="Add £89 membership pricing"
```

All should complete and produce structured JSON output.

## Completion Response

When complete, respond with:

```markdown
## Build Complete: Sorted Updates Core Scaffold

### What was built

### Files created

### Verification evidence

### Example dry-run outputs

### Known gaps

### Recommended next build
```

```

## 2. How WhatsApp actions technically work

You’ve got the model right.

It should be:

```txt
WhatsApp
↓
Sorted Updates Intake
↓
Client Router
↓
Dedicated Client Operator
↓
Website Project Adapter
↓
GitHub branch / PR / deploy
↓
WhatsApp confirmation
```

### The front door

A business owner messages a Sorted WhatsApp number.

Technically, this usually means either:

- **Meta WhatsApp Cloud API**
- **Twilio WhatsApp API**
- **360dialog**
- another WhatsApp Business API provider

The provider sends your app a webhook whenever a message arrives.

Example inbound webhook:

```json
{
  "from": "+447...",
  "text": "Can you update the timetable?",
  "message_id": "wamid_xyz",
  "timestamp": "2026-05-10T10:00:00Z"
}
```

That webhook hits your endpoint:

```
POST /api/whatsapp/inbound
```

The endpoint does not “think.” It just receives, logs, and passes the message into the Sorted Updates system.

### The switchboard layer

The switchboard should be thin.

Its job:

```
Who sent this?
Which client does this belong to?
Which operator should receive it?
```

It checks:

```json
{
  "+447000000000": {
    "client_id": "gbhalesowen",
    "operator_id": "gbhalesowen-website-operator"
  }
}
```

Then it routes the message to the GBH operator.

This is like reception saying:

> “That’s not a general request. That’s for the Gracie Barra Halesowen website worker.”
> 

### The client operator layer

The GBH operator then loads its own world:

```
clients/gbhalesowen/operator.json
clients/gbhalesowen/memory.json
clients/gbhalesowen/rules.md
clients/gbhalesowen/templates/
client/gbhalesowen/brief.md
client/gbhalesowen/handoff.md
app/gbhalesowen/
```

It knows:

- the route is `/gbhalesowen`
- the design style is navy/red/white/cool grey
- primary CTA is “Book a free intro”
- supported pages include beginners, kids, timetable, event
- pricing needs approval
- legal needs approval
- new integrations need approval

So the WhatsApp message becomes:

```
"Can you add a beginners page?"
```

Then:

```json
{
  "client_id": "gbhalesowen",
  "operator_id": "gbhalesowen-website-operator",
  "type": "predefined_page_addition",
  "page_type": "beginners",
  "target_file": "app/gbhalesowen/beginners/page.tsx",
  "approval_required": false
}
```

### The action layer

There are three levels of action.

### Level 1: Dry run

No files changed.

The operator replies:

> Sorted — I can add a beginners page using the existing site style. I’ll prepare it as a preview first.
> 

This is what Codex should build first.

### Level 2: Preview branch

The operator creates a GitHub branch:

```
updates/gbhalesowen/beginners-page-2026-05-10
```

Then it commits the generated page and opens a PR.

WhatsApp reply:

> Sorted — I’ve prepared the beginners page preview. You can review it here: [preview link]
> 

### Level 3: Live update

After approval, it merges/deploys.

WhatsApp reply:

> Done — the beginners page is now live.
> 

For Sorted, I’d avoid fully automatic live updates at first. Start with preview-first. It’s safer, and small business owners like confidence more than wizardry.

## 3. Operator per client vs one universal operator

Your idea is the right architecture.

Do **not** build one big brain that updates every site.

Build this:

```
Shared Template
↓
Dedicated Client Operator
↓
Client-Specific Rules
↓
Client-Specific Memory
↓
Client-Specific Site Adapter
```

So every client gets their own “permanent worker.”

Example:

```
operators/
  sorted-updates/
    implementation/
      clients/
        gbhalesowen/
          operator.json
          memory.json
          rules.md
          templates/
        palacebarns/
          operator.json
          memory.json
          rules.md
          templates/
        local-plumber/
          operator.json
          memory.json
          rules.md
          templates/
```

### Why this is better

It gives you **vertical isolation**.

If GBH needs a special timetable structure, you change only:

```
clients/gbhalesowen/
```

You don’t risk breaking Palace Barns, a plumber, a dentist, or whoever joins later.

It also makes every operator easier to understand:

> “This is the GBH worker. It knows GBH.”
> 

Not:

> “This is the universal monster robot. Please pray before editing.”
> 

### What each client operator should contain

Each dedicated operator should have:

```
operator.json
```

Hard config. Routes, paths, allowed update types, approval gates.

```
rules.md
```

Human-readable operating rules.

Example:

```markdown
- Always keep beginner copy reassuring.
- Never describe the academy as intimidating or fight-focused.
- Prefer "Book a free intro" as the main CTA.
- Timetable changes should always be previewed before going live.
```

```
memory.json
```

Learned patterns over time.

Example:

```json
{
  "common_requests": [
    "holiday timetable updates",
    "kids class changes",
    "event pages"
  ],
  "preferred_approval_style": "preview_first",
  "owner_prefers_short_replies": true
}
```

```
templates/
```

Client-specific reusable page/component templates.

### Does learning the client intake matter?

Yes — but not in the spooky “the AI learns everything” way.

It matters as operational memory.

Useful learning:

- owner always sends timetable updates in messy shorthand
- owner prefers preview before live
- owner says “kids jits” but means kids BJJ class
- most requests are event pages
- certain phrases are approved
- certain claims should be avoided
- certain images are preferred
- owner likes short confirmations

Not useful yet:

- overfitting on tone
- trying to predict future requests
- building a giant memory system before you have volume

Start simple.

The first version of memory should be mostly manual or semi-automatic:

```json
{
  "aliases": {
    "kids jits": "kids classes",
    "intro": "free intro booking CTA",
    "nogi": "No-Gi programme"
  },
  "preferred_replies": {
    "confirmation_style": "short",
    "approval_style": "preview_first"
  },
  "frequent_updates": [
    "timetable",
    "events",
    "kids classes"
  ]
}
```

That’s valuable without becoming a science project in a lab coat.

## Best final architecture

This is the model I’d lock in:

```
Sorted Updates System
│
├── WhatsApp Intake
│   └── receives all owner messages
│
├── Client Router
│   └── maps sender/client to dedicated operator
│
├── Client Website Operators
│   ├── gbhalesowen-website-operator
│   ├── palacebarns-website-operator
│   └── future-client-website-operator
│
├── Shared Operator Template
│   └── parser, policy, dry-run, GitHub, WhatsApp response patterns
│
└── Client-Specific Layer
    └── rules, memory, templates, routes, allowed actions
```

Your core product becomes:

> “Every client gets a dedicated website update worker, reachable through WhatsApp.”
> 

That is much stronger than:

> “We have a chatbot that updates websites.”
> 

The first sounds like Sorted.

The second sounds like a SaaS pitch wearing skinny jeans.