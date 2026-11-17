# Operator Contracts — {{CLIENT_NAME}} {{LINE_NAME}}

Write this before the interface. Every operator is a bounded job with a schema and a validator, not an agent.

## Contract shape

```yaml
id: op-00-name
purpose: one sentence
trigger: state change | due sweep | inbound event | manual
preconditions:
  - ...
input_schema: {}
output_schema: {}
validator: lib/rules/<file>.ts
permitted_transitions: []
idempotency_key: "<entity>:<step>"
retry: { max_attempts: 2, backoff: fixed }
exception_route: review_task | outbox_blocked | none
```

## Operators

| ID | Purpose | Trigger | Idempotency key |
| --- | --- | --- | --- |
| op-01 | | | |
| op-02 | | | |

## Handoff rule

Operators communicate through persisted state. No operator calls another operator directly to "continue the flow"; the state change is the trigger.

## Write authority

| Operator | May write | Must never write |
| --- | --- | --- |
| | | |

## Validation and exceptions

| Condition | Route | Client-visible result |
| --- | --- | --- |
| Ambiguous identity | review task | "Needs review" |
| Ambiguous product | review task | "Needs review" |
| Ambiguous date | review task, field left null | "Date unknown" |
| Transport unavailable | blocked outbox item | "Simulated" / "Not sent" |

## Hard-won rules

These cost a cycle to learn. Check them before writing the first operator.

1. **Ambiguity before keywords.** A label like “Not named in DMs – likely Retinol Cycling Duo” must hit the ambiguity guard before any `duo` keyword match, or the system confidently guesses wrong.
2. **Idempotency must survive state changes.** If a job changes the state it keys on, the second call computes a different key. Key the job to the entity and reuse the queued item, not to the current eligibility decision.
3. **Confirmation must survive revalidation.** A server action that revalidates the route can unmount the component holding your success message. Use a URL flash (`?accepted=1`), a server-rendered banner, or persistent server state.
4. **Every displayed count needs a filter route.** A KPI link to `?filter=content` that no page reads is a silent reconciliation failure.
5. **Seed activity needs backdated timestamps.** Otherwise every seeded record appears in the activity feed at the same second and the demo looks synthetic.
6. **One table column for identity + contact.** Separate handle/contact columns push the columns that matter (evidence, next action) off-screen at 1440px.

## Audit

Every accepted proposal records: source message, proposed facts, supporting excerpts, validator outcome, actor, timestamp. Rejections are retained with a reason.
