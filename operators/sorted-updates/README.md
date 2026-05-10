# Sorted Updates

Sorted Updates is the maintenance operator layer for small business website updates. The current build is dry-run only: it receives WhatsApp-style messages, routes them to a dedicated Client Website Operator, classifies the request, applies safety rules, and returns a structured preview plan.

The first Client Website Operator is the GB Halesowen Operator for `app/gbhalesowen`.

## Pattern

```txt
WhatsApp Intake
-> Client Router
-> Client Website Operator
-> Client Rules + Memory + Templates
-> Dry Run Plan
```

## Run Locally

```bash
cd operators/sorted-updates/implementation
make setup
make test
make run MESSAGE="Can you add a beginners page to the site?"
```

Direct CLI usage is also supported:

```bash
python operator.py --client gbhalesowen --message "Change Saturday kids class to 10am"
python operator.py --input examples/inbound_messages/gbhalesowen_beginners_page.json
```

## Run Local WhatsApp Intake

The local HTTP intake accepts normalized inbound JSON and Meta-style webhook payloads. It prepares automatic reply text but does not send provider network calls without a future enabled sender step.

Create a local `.env` from `.env.example` when provider credentials are available. The server loads `.env` automatically and `.env` is already ignored by git.

```bash
cd operators/sorted-updates/implementation
make serve
```

Then verify:

```bash
curl -X POST http://127.0.0.1:8787/whatsapp/inbound \
  -H "Content-Type: application/json" \
  --data @examples/inbound_messages/gbhalesowen_beginners_page.json
```

## WhatsApp Intake

The future WhatsApp provider webhook should stay thin. It should normalize provider payloads into `InboundMessage`, then pass them into the Client Router. No real WhatsApp API calls are implemented in this scaffold.

The selected provider direction is direct Meta WhatsApp Cloud API first. Provider credentials belong in a local `.env` file or deployment secret manager, never in git.

## Add A New Client Operator

1. Create `implementation/clients/[client_id]/operator.json`.
2. Add placeholder contacts only. Do not commit private phone numbers.
3. Create `memory.json`, `rules.md`, and any page/component templates.
4. Add example inbound messages.
5. Add routing, config, and dry-run tests for the new client.

## Add A Predefined Page Template

1. Add the page slug to `predefined_pages` in the client operator config.
2. Create a Markdown template in `templates/pages/`.
3. Add page-type detection keywords in `parser.py`.
4. Add a test covering the target route and target file.

## Approval-Gated Work

Sorted Updates must not auto-apply pricing, legal/policy content beyond draft scaffolds, payment features, medical or safety claims, integrations, brand identity changes, or page deletion.

## Preview Branch Design

The first Netlify preview branch design is documented in [docs/preview-branch-design.md](docs/preview-branch-design.md).

The implementation currently includes a preview planner in `implementation/preview.py`. It validates approved dry-runs, checks target files against the client operator paths, and returns deterministic branch/PR metadata. It does not create GitHub branches or pull requests yet.
