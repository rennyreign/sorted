# Sorted diagnostic booking follow-up

Immediate bookings start at confirmation. Request-first bookings use the request branch until confirmed. Queue reminders only for the current confirmed appointment version.

Check current state and dedupe atomically before dispatch. Cancel queued reminders for old versions on rescheduling. Cancellation and channel suppression stop the applicable sends. Route replies to a human and pause request chasing. A staff-owned delay becomes an internal task. Use customer-owned nudges only if the scheduling link is available. Require an explicit no-show event before rebooking outreach.

Map the logical events and confirm the Europe/London timezone, working calendar, booking model, sender and reply inbox. Business days use the configured local calendar. Templates use double-brace variables. Escape text and URL attribute values in HTML, validate HTTPS and mailto URL fields before substitution, and block any send with unresolved variables. Never send synthetic preview data.

Email sequence is draft pending live bindings and preview QA.
