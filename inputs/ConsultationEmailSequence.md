3# Edgbaston Tuition Centre Consultation Email Sequence

## Goal

Send a useful, calm sequence after a parent books a free consultation through Cal.com. The messages confirm the practical details, explain a little about how ETC teaches, help the parent think about the child's starting point, and remind them just before the appointment. They apply across Academic Excellence and Islamic Studies, Qur'an and Arabic without pretending to know the child's programme.

This is a booking sequence, not a general marketing drip. The timing is relative to the meeting. A parent booking for later today should receive fewer emails than one booking for next week.

## Voice and format

- Send as **Edgbaston Tuition Centre** with a verified domain sender and a monitored reply-to address.
- Sign as **The Edgbaston Tuition Centre team**. Use Ousama's name only if he is actually hosting or personally signing the messages.
- Plain, warm, short and parent-centred. No hard sell, countdown or results claim.
- Include local date, time, timezone and meeting location or join link in each logistical message.
- Use the child's first name only if supplied and appropriate; all templates work without it.
- The consultation is about understanding the child and recommending a starting point. It is not a promise of a free teaching session, a guaranteed result or a fixed learning plan before assessment.

## Dynamic schedule

Let `B` be the confirmed booking time and `M` the meeting start, using timezone-aware timestamps. Schedule from `M`, and make the choice using `M - B` at booking time.

| Time between booking and meeting | Messages to send | Maximum |
| --- | --- | --- |
| 5 days or more | Confirmation immediately; insight at M minus 96 hours; preparation at M minus 24 hours; reminder at M minus 2 hours | 4 |
| 36 hours to under 5 days | Confirmation immediately; preparation at M minus 24 hours; reminder at M minus 2 hours | 3 |
| 6 hours to under 36 hours | Confirmation immediately; reminder at M minus 2 hours | 2 |
| Under 6 hours | Confirmation immediately only | 1 |

The thresholds guarantee at least 24 hours from confirmation to the insight email, at least 12 hours from confirmation to the 24-hour email, and at least 4 hours from confirmation to the 2-hour email. Do not backfill any stage whose send time has passed. Do not send two sequence emails at once.

**Examples:** Book 8 days ahead → 4 messages. Book 3 days ahead → 3. Book tomorrow morning with 18 hours to go → 2. Book a call in 90 minutes → confirmation only.

If Cal.com's own confirmation or reminders remain enabled, disable the overlapping ones for this event type so parents do not receive duplicates. Keep Cal.com's calendar invitation if it is useful; the email sequence should complement it.

## Email 1 — Booking confirmation

**When:** Immediately after a confirmed booking, in every branch.

**Subject:** Your consultation with Edgbaston Tuition Centre is booked

Hi {{parent_first_name}},

Thanks for booking a conversation with Edgbaston Tuition Centre. We look forward to learning a little about {{child_reference}} and what you would like them to achieve.

**Your consultation**  
{{meeting_date}} at {{meeting_time}} {{meeting_timezone}}  
{{meeting_location_or_join_link}}

We'll talk about where your child is now, what is going well, where they may need support, and which starting point makes sense. Our approach begins with understanding the student; good teaching then builds from there.

There is nothing formal to prepare. If you have a recent school report, assessment, or a question you want us to address, feel free to bring it along.

Need to change the time? {{reschedule_link}}  
Need to cancel? {{cancel_link}}

See you soon,  
The Edgbaston Tuition Centre team

## Email 2 — A little about ETC

**When:** Four days before the meeting; only for bookings made at least five days ahead.

**Subject:** A little about how we teach at ETC

Hi {{parent_first_name}},

Before we meet, we thought it might help to explain what sits behind the different classes at Edgbaston Tuition Centre.

Whether a child comes to us for an academic subject or for Qur'an, Arabic or Islamic Studies, we begin by understanding what they can already do. From there, we set a direction, teach in manageable steps, give feedback and review their progress. Moving forward should mean a skill has become secure, rather than simply that another week has passed.

We also want children to feel comfortable asking questions and enjoy coming to learn. Strong teaching and a positive experience belong together.

During your consultation, we'll listen to what matters most to your family and suggest a sensible next step for {{child_reference}}.

**Your consultation:** {{meeting_date}} at {{meeting_time}} {{meeting_timezone}}  
{{meeting_location_or_join_link}}

The Edgbaston Tuition Centre team

## Email 3 — Preparation reminder

**When:** 24 hours before the meeting; only for bookings made at least 36 hours ahead.

**Subject:** Before we speak tomorrow

Hi {{parent_first_name}},

We're looking forward to speaking with you tomorrow at **{{meeting_time}} {{meeting_timezone}}**.

One small thing that can make our conversation more useful: think of a recent moment when {{child_reference}} felt confident in their learning, and one moment when they got stuck. Those examples often tell us more than a broad label such as “good at Maths” or “behind in reading.”

If you know their current school year or learning stage, and have a particular goal in mind, that's helpful too. You don't need to arrive with all the answers; working out the right starting point is part of the conversation.

**Where to meet or join:** {{meeting_location_or_join_link}}

If your plans have changed, you can {{reschedule_link}} or {{cancel_link}}.

See you tomorrow,  
The Edgbaston Tuition Centre team

## Email 4 — Near-term reminder

**When:** Two hours before the meeting; only for bookings made at least six hours ahead.

**Subject:** Your ETC consultation is at {{meeting_time}}

Hi {{parent_first_name}},

A quick reminder that your Edgbaston Tuition Centre consultation is today at **{{meeting_time}} {{meeting_timezone}}**.

{{meeting_location_or_join_link}}

We're looking forward to hearing about {{child_reference}} and helping you identify a useful next step.

If you can no longer make it, please {{reschedule_link}} or {{cancel_link}} so we know not to expect you.

The Edgbaston Tuition Centre team

## Reschedule message

**When:** Immediately after a confirmed reschedule. Replace all pending reminders with a new schedule based on the new meeting time. Do not repeat the insight email if it was already sent for this booking.

**Subject:** Your ETC consultation has a new time

Hi {{parent_first_name}},

Your Edgbaston Tuition Centre consultation has been moved to **{{meeting_date}} at {{meeting_time}} {{meeting_timezone}}**.

{{meeting_location_or_join_link}}

We'll use the conversation to understand {{child_reference}}'s current stage and what you would like them to achieve, then help you decide on a suitable next step.

Need to make another change? {{reschedule_link}}  
Need to cancel? {{cancel_link}}

We look forward to speaking with you,  
The Edgbaston Tuition Centre team

## Cancellation message

**When:** Immediately after a confirmed cancellation; cancel every pending email for that booking.

**Subject:** Your ETC consultation has been cancelled

Hi {{parent_first_name}},

Your consultation with Edgbaston Tuition Centre on **{{meeting_date}} at {{meeting_time}} {{meeting_timezone}}** has been cancelled. You will not receive reminders for this appointment.

If you would like to find another time, you can book here: {{new_booking_link}}

The Edgbaston Tuition Centre team

## Agent implementation instructions

### Data and event handling

1. Accept Cal.com events for booking created/confirmed, rescheduled and cancelled. Start the sequence only when the booking is actually confirmed; account for event types configured to require manual approval. Verify the webhook signature/secret and deduplicate repeated deliveries.
2. Store the booking ID, event type, status, parent name/email, child reference if supplied, meeting start in UTC, display timezone, location/join link, reschedule/cancel links, and each scheduled Resend email ID and stage status.
3. On confirmation, send Email 1 once. Calculate later send times from the confirmed meeting start and the branch table. Render dates/times in the attendee's timezone if reliable, otherwise the explicit event timezone. Include a timezone label in the actual message.
4. On reschedule, cancel pending sends, update the stored meeting data, send the reschedule message once, and schedule remaining eligible stages based on the new start time. Skip stages already sent and any stage that would send too soon after the reschedule message. Never send an old location or time.
5. On cancellation or rejection, cancel all pending sends and suppress the rest of the sequence. Send the cancellation message only for an actual confirmed booking that is cancelled, not for a request that was never accepted.
6. Store a unique key for booking ID plus stage plus booking revision so webhook retries cannot duplicate a send. Ensure a cancellation or reschedule is checked against the current booking state immediately before sending any queued email.
7. For meetings booked more than 30 days out, keep the schedule in the application and hand individual sends to Resend when within its supported scheduling window; do not assume Resend can hold them indefinitely.
8. Use a verified domain sender; set `replyTo` to ETC's monitored Gmail inbox if that remains their chosen response channel. Verify the exact inbox before launch. Resend does not itself create an email inbox.
9. Keep Cal.com's calendar invitation, confirmation and reminder settings in view so parents receive one coherent set of messages. Do not send the insight email after the consultation.
10. Test at least four booking horizons, a reschedule after Email 2, a cancellation after Email 1, a duplicate webhook, an unconfirmed booking, missing child name, and UK daylight-saving changeover.

### Template variables

| Variable | Meaning and fallback |
| --- | --- |
| `{{parent_first_name}}` | Attendee first name; fallback “there”. |
| `{{child_reference}}` | Child's first name if provided, otherwise “your child”. |
| `{{meeting_date}}` | Human-readable date including weekday. |
| `{{meeting_time}}` | Local time, e.g. “3:30 pm”. |
| `{{meeting_timezone}}` | Explicit zone, e.g. “UK time (BST)” or “UK time (GMT)”. |
| `{{meeting_location_or_join_link}}` | Validated physical address and arrival information, or the current online link; never a blank placeholder. |
| `{{reschedule_link}}`, `{{cancel_link}}` | Valid, booking-specific links. |
| `{{new_booking_link}}` | Current consultation booking page. |

Do not show unresolved template tokens to a parent. If a link is missing, omit that line and use a monitored reply address or verified contact route instead.

## Source notes

ETC positioning, parent journey and learning principles follow the September 2026 ETC website integration brief and underlying master and marketing sourcebooks. Product capabilities were checked against Cal.com's webhook documentation and Resend's email scheduling and cancellation documentation. Resend currently documents a 30-day scheduling limit.

- Cal.com webhook events: https://cal.com/docs/api-reference/v2/webhooks/create-a-webhook
- Resend scheduling: https://resend.com/docs/dashboard/emails/schedule-email
- Resend cancelling scheduled sends: https://resend.com/docs/api-reference/emails/cancel-email
