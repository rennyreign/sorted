# Devin Brief: Deterministic Sorted Outreach Operator

## Objective

Build a deterministic outreach operator inside the existing ADX Engine / Sorted system that automatically sends the approved initial outreach email for any prospect whose completed mockup and review have been added to the CRM.

The operator must remove the current manual process of:

1. Opening each CRM listing.
2. Clicking the scraped email address.
3. Generating the email.
4. Copying the email.
5. Opening the business email sender.
6. Pasting the email.
7. Sending it manually.

The operator should execute this routine through fixed rules and ordinary software. It must not use an LLM, AI agent or probabilistic decision-making at runtime.

---

## Current Operating Context

Renaldo is currently creating and approving mockups manually.

Therefore:

> Any mockup that has successfully entered the CRM should be treated as approved and ready for outreach.
> 

Do not add a separate visual approval stage at this point.

The system should assume that the human quality-control boundary occurs before or during CRM entry.

---

## Core Rule

When a CRM prospect record contains all required outreach data, the system should automatically queue and send the approved email.

Required conditions:

```
prospect email exists
AND
review URL exists
AND
mockup exists in CRM
AND
initial outreach has not already been sent
AND
prospect has not opted out
```

If all conditions are true:

```
compile fixed email template
→ queue email
→ send through configured Sorted business mailbox
→ record result in CRM
```

No model call should occur anywhere in this chain.

---

## Required Workflow

```
Mockup added to CRM
        ↓
System validates required fields
        ↓
Outreach record created
        ↓
Email template compiled
        ↓
Email placed in send queue
        ↓
Email sent through configured provider
        ↓
CRM updated with send result
```

The human should only be responsible for:

```
Create mockup
→ add mockup/review to CRM
```

Everything after that should be automatic.

---

## Initial Outreach Email

Store the email as a fixed, version-controlled template.

### Subject

```
We built something for you
```

### Body

```
Hi,

We reviewed your website and built a completely new version of it.

See your review and compare both versions here:

{{review_url}}

Interested to hear what you think, 

Renaldo
Sorted
```

The only required variable is:

```
{{review_url}}
```

Do not generate or rewrite the email using AI.

Do not add business names, first names or other personalisation unless those fields are already highly reliable and their inclusion is explicitly configured later.

---

## Recommended CRM Fields

Add or confirm the following fields:

```
review_url
mockup_url
outreach_status
outreach_template_id
outreach_queued_at
outreach_sent_at
outreach_provider_message_id
outreach_attempt_count
outreach_last_error
email_delivery_status
email_bounced_at
email_replied_at
email_opted_out_at
```

Use a clear outreach state machine:

```
NOT_READY
READY
QUEUED
SENDING
SENT
FAILED_TEMPORARY
FAILED_PERMANENT
BOUNCED
REPLIED
OPTED_OUT
```

---

## State Logic

A prospect should become `READY` when:

```
email is present
AND
review_url is present
AND
mockup has been added
AND
outreach_status is empty or NOT_READY
```

The sending process should transition records as follows:

```
READY
→ QUEUED
→ SENDING
→ SENT
```

Temporary failures:

```
SENDING
→ FAILED_TEMPORARY
→ QUEUED
```

Permanent failures:

```
SENDING
→ FAILED_PERMANENT
```

Replies:

```
SENT
→ REPLIED
```

Opt-outs:

```
ANY ACTIVE STATE
→ OPTED_OUT
```

---

## Trigger Behaviour

Preferred implementation:

```
Mockup/review added to CRM
→ record becomes READY
→ record is added to the outreach queue
```

The queue worker should then send the email automatically within the configured sending window.

Do not make the CRM request wait for the email provider response. Sending should happen asynchronously through a queue or background job.

If the current system architecture does not yet support event-driven jobs, implement a scheduled worker that checks for `READY` records at a fixed interval.

---

## Sending Controls

Implement deterministic controls for:

### Daily limit

Create a configurable daily send cap.

Initial default:

```
20 emails per working day
```

The value must be stored in configuration rather than hard-coded throughout the system.

### Sending window

Send only during a configurable UK business-hours window.

Initial default:

```
Monday–Friday
09:00–16:30
Europe/London
```

### Queue order

Send emails in deterministic order:

```
oldest READY record first
```

### Send spacing

Use configurable spacing between messages to avoid sending the whole batch simultaneously.

Initial default:

```
one message every 3–5 minutes
```

The spacing may use a fixed value initially. No AI is required.

### Duplicate protection

The system must never send the same initial outreach campaign twice to the same prospect.

Use a unique database constraint or idempotency key based on:

```
prospect_id + campaign_id
```

Example:

```
prospect_123 + sorted_initial_outreach_v1
```

Do not rely only on a UI state or boolean check.

---

## Email Provider Integration

Connect the operator to the configured Sorted business email sender.

Prefer an official provider API over browser automation.

The integration should support:

```
send email
capture provider message ID
capture accepted/rejected response
record delivery failure
record bounce where supported
record reply where supported
```

Keep provider-specific logic behind a small adapter so the email provider can be changed later without rewriting the outreach workflow.

Suggested interface:

```
sendEmail({
  to,
  subject,
  body,
  idempotencyKey
})
```

Expected result:

```
{
  success,
  providerMessageId,
  errorType,
  errorMessage
}
```

---

## Retry Rules

Retries must be code-based and limited.

Retry only temporary failures such as:

```
provider timeout
rate limit
temporary network failure
temporary provider error
```

Do not retry:

```
invalid email address
hard bounce
blocked recipient
opt-out
missing review URL
duplicate campaign send
```

Suggested retry policy:

```
attempt 1: immediate
attempt 2: after 15 minutes
attempt 3: after 2 hours
final attempt: next sending window
```

After the maximum number of attempts, mark the record appropriately and surface it in the CRM.

---

## CRM Interface Changes

Update the pipeline view to expose clear operational states.

Add visible indicators for:

```
Outreach ready
Queued
Sent
Failed
Bounced
Replied
Opted out
```

Add summary counts at pipeline level:

```
Ready to send
Queued
Sent today
Failed
Replies
```

For each prospect, display:

```
outreach status
sent timestamp
provider message ID if useful for debugging
last error
attempt count
```

Do not require Renaldo to open every prospect record to understand the state of the system.

---

## Manual Controls

Although the default flow should be automatic, provide operational controls for exceptions:

```
Pause outreach globally
Resume outreach globally
Retry temporary failures
Cancel queued outreach
Mark opted out
Mark replied
```

Also provide a configuration option to temporarily change the system from:

```
AUTO_SEND
```

to:

```
QUEUE_ONLY
```

In `QUEUE_ONLY` mode, records should compile and queue correctly but wait for a single batch-send action.

This is for testing and emergency control, not the intended long-term workflow.

---

## Audit Logging

Every state change must be logged.

Example:

```
2026-07-14 10:02 — Mockup added
2026-07-14 10:02 — Outreach marked READY
2026-07-14 10:03 — Outreach QUEUED
2026-07-14 10:06 — Send attempt started
2026-07-14 10:06 — Email SENT
```

Each log should include:

```
prospect ID
campaign ID
previous state
new state
timestamp
trigger
provider response where relevant
error where relevant
```

---

## Campaign Versioning

Treat this email as a named campaign:

```
sorted_initial_outreach_v1
```

Store:

```
campaign ID
subject
body template
active status
created date
version
```

Do not overwrite historical campaign content when the wording changes.

A future revision should become:

```
sorted_initial_outreach_v2
```

This ensures previous sends remain auditable.

---

## Deliverability and Compliance Safeguards

Implement:

```
suppression list
opt-out state
hard-bounce suppression
duplicate recipient suppression
daily send cap
provider error logging
```

Do not send to a prospect when:

```
email is on the suppression list
email has hard bounced previously
prospect has opted out
the same campaign has already been sent
```

The operator should fail closed. Missing or ambiguous data should prevent sending rather than trigger a guess.

---

## Runtime Architecture

The runtime should be ordinary deterministic application code.

Preferred structure:

```
CRM/database event
        ↓
outreach eligibility service
        ↓
campaign template compiler
        ↓
send queue
        ↓
email provider adapter
        ↓
CRM status update
```

Do not use Devin as the daily execution engine.

Do not use an LLM to decide whether to send.

Do not use an LLM to write the email.

Do not require MCP for each runtime send.

MCP may be added later as a control surface for actions such as:

```
list ready outreach
pause outreach
resume outreach
retry failures
inspect send status
```

But the underlying workflow should remain normal application code.

---

## Error Handling

The system should surface precise errors such as:

```
MISSING_EMAIL
MISSING_REVIEW_URL
DUPLICATE_CAMPAIGN
RECIPIENT_SUPPRESSED
DAILY_LIMIT_REACHED
OUTSIDE_SENDING_WINDOW
PROVIDER_RATE_LIMIT
PROVIDER_TIMEOUT
HARD_BOUNCE
INVALID_EMAIL
UNKNOWN_PROVIDER_ERROR
```

Do not use generic `FAILED` states without preserving the cause.

---

## Testing Requirements

Create tests for at least the following scenarios:

1. Valid prospect with mockup, review URL and email is queued.
2. Valid queued record is sent.
3. CRM is updated after successful sending.
4. Record without email is not sent.
5. Record without review URL is not sent.
6. Duplicate campaign send is blocked.
7. Opted-out recipient is blocked.
8. Hard-bounced recipient is blocked.
9. Daily send limit is respected.
10. Sending window is respected.
11. Temporary provider failure is retried.
12. Permanent provider failure is not retried.
13. The same queue job can run twice without causing a duplicate email.
14. Pausing outreach prevents sending.
15. Resuming outreach restarts queue processing safely.

---

## Definition of Done

The implementation is complete when Renaldo can:

1. Create a mockup.
2. Add the mockup and review URL to a CRM record.
3. Leave the record without taking any further outreach action.
4. See the system automatically validate, queue and send the approved email.
5. See the CRM update with the correct status and send timestamp.
6. Trust that duplicates, opt-outs, missing data and permanent failures cannot result in an email being sent incorrectly.

The completed workflow should remove the need to open individual records, generate emails, copy messages into the business sender or manually click send.

---

## Architectural Principle

Use AI to create and improve the machinery.

Use deterministic software to execute the routine.

For this workflow, runtime AI usage should be:

```
zero
```