# Results Dashboard Measurement Model

This document defines the data, formulas, and tracking tools needed to power the Sorted V2 client results dashboard.

The dashboard should be useful before it is technically perfect. Every number must be explainable in plain English and traceable to a source system, even when the number is an estimate.

---

## Core Model

Every measurable result needs three parts:

1. **Baseline** — what happened before Sorted.
2. **Current state** — what happens now.
3. **Volume** — how often the routine happens.

Core formula:

```text
Impact = (Before cost - After cost) × Volume
```

For money:

```text
Revenue recovered = Recovered opportunities × estimated value per opportunity
```

For ROI:

```text
Net value = estimated value created - Sorted investment
ROI % = net value / investment × 100
```

---

## Minimum Tracking Stack

Every client dashboard needs a lightweight tracking stack. The exact tools can vary, but the roles should not.

| Tracking need | Tool type | Examples | Captures |
|---|---|---|---|
| Enquiries and customer records | CRM | HubSpot, Pipedrive, GoHighLevel, Airtable, Notion CRM | Lead source, status, owner, follow-up, conversion |
| Website enquiries | Form tool | Tally, Typeform, Jotform, native website form, Netlify Forms | Form submissions, service interest, source page |
| Bookings | Booking tool | Cal.com, Calendly, Acuity, Fresha, built-in booking system | Booked calls, appointments, no-shows, conversion |
| Calls and missed calls | Call tracking / phone log | CallRail, Twilio, Aircall, WhatsApp Business, phone provider logs | Missed calls, callbacks, text-backs, call source |
| Review requests | Review management | Google review link, NiceJob, GatherUp, Trustpilot, GoHighLevel | Requests sent, reviews completed, rating |
| Website behaviour | Analytics | Google Analytics, Plausible, Fathom, PostHog | Visitors, pages, events, source attribution |
| Workflow events | Automation log | Zapier, Make, n8n, Airtable automations, custom logs | System actions, timestamps, failures |
| Revenue data | Payments / sales records | Stripe, Square, Xero, QuickBooks, CRM deal value | Closed work, order value, revenue recovered |
| Dashboard storage | Reporting database | Airtable, Supabase, Google Sheets, Postgres | Monthly dashboard snapshots |

Minimum viable setup:

```text
Website form or booking form
CRM or structured lead table
Review request tracker
Call / missed enquiry tracker
Monthly dashboard snapshot table
```

---

## 1. Time Returned

Time returned measures admin or routine time saved.

### Data Needed

| Field | Description |
|---|---|
| routine_name | The routine being measured |
| before_minutes_per_task | Time taken before Sorted |
| after_minutes_per_task | Time taken after Sorted |
| monthly_volume | Number of times the routine happened |
| owner | Person or role previously handling it |
| source_system | Where the volume came from |

### Formula

```text
Time saved per task = before_minutes_per_task - after_minutes_per_task
Total minutes saved = time saved per task × monthly_volume
Hours returned = total minutes saved / 60
```

### Example

```text
Manual follow-up before Sorted: 6 minutes
System-assisted follow-up after Sorted: 1 minute
Time saved per follow-up: 5 minutes
Follow-ups this month: 180

180 × 5 minutes = 900 minutes
900 / 60 = 15 hours returned
```

### Tools Needed

| Tool | Purpose |
|---|---|
| CRM | Count follow-ups, owner changes, lead status changes |
| Automation log | Count system-handled actions |
| Booking form | Count appointments or intro calls created |
| Form tool | Count incoming enquiries |
| Time estimate sheet | Store agreed before/after task timings |

### Dashboard Breakdown

```text
Routine                 Before   After   Volume   Time returned
Enquiry follow-up        6 min    1 min    180      15 hrs
Missed call response     8 min    2 min     81       8.1 hrs
Review request           3 min    0.5 min  312      13 hrs
Booking confirmation     5 min    1 min     94       6.3 hrs
Customer update          4 min    1 min    220      11 hrs
```

Dashboard total:

```text
Total time returned = sum of all routine time returned
```

---

## 2. Customers And Enquiries

This measures whether more opportunities are being captured and moved through the business.

### Data Needed

| Field | Description |
|---|---|
| enquiry_id | Unique enquiry |
| source | Website, Google, WhatsApp, social, referral, phone |
| received_at | When enquiry arrived |
| first_response_at | When first response was sent |
| booked_at | When appointment/call was booked |
| converted_at | When enquiry became a customer |
| status | New, replied, followed-up, booked, won, lost |
| estimated_value | Expected value of customer or booking |

### Funnel

```text
417 enquiries received
389 replied to
214 followed up
94 booked
34 became customers
```

### Formulas

```text
Reply rate = replied / enquiries
Booking rate = booked / enquiries
Customer conversion = customers / enquiries
```

Example:

```text
Reply rate = 389 / 417 = 93%
Booking rate = 94 / 417 = 23%
Customer conversion = 34 / 417 = 8%
```

### Tools Needed

| Tool | Purpose |
|---|---|
| CRM | Lead stages, conversion status, owner |
| Website form | Captures website enquiries |
| Booking form | Captures bookings and appointment outcomes |
| WhatsApp Business | Captures WhatsApp enquiries |
| Call tracking | Captures missed calls and callbacks |
| Analytics | Captures source attribution |

### Source Breakdown

```text
Website: 148 enquiries
Google: 122 enquiries
WhatsApp: 73 enquiries
Social: 48 enquiries
Referrals: 26 enquiries

Total enquiries = 417
```

---

## 3. Response Time

Response time measures speed improvement.

### Data Needed

| Field | Description |
|---|---|
| enquiry_id | Unique enquiry |
| received_at | Time enquiry arrived |
| first_response_at | Time first response was sent |
| response_channel | Email, SMS, WhatsApp, call, form |
| automated_or_manual | Whether system or person replied |

### Formula

```text
Response time = first_response_at - received_at
Average response time = sum(response times) / number of enquiries
Improvement = (before average - after average) / before average × 100
```

Example:

```text
Before: 18 hrs
After: 3 min
Improvement: 99.7%
```

### Tools Needed

| Tool | Purpose |
|---|---|
| CRM | Stores enquiry and response timestamps |
| Form tool | Provides received timestamp |
| Email/SMS/WhatsApp tool | Provides response timestamp |
| Automation log | Confirms automated acknowledgement was sent |

---

## 4. Missed Call Recovery

Missed call recovery measures missed calls that now receive a response and create opportunities.

### Data Needed

| Field | Description |
|---|---|
| missed_call_id | Unique missed call |
| call_time | When the call happened |
| text_back_sent | Whether an automated reply was sent |
| customer_replied | Whether the customer replied |
| booking_created | Whether a booking resulted |
| estimated_booking_value | Expected value of booking |

### Example

```text
Missed calls: 81
Text-backs sent: 81
Customer replies: 46
Bookings created: 12
Estimated value per booking: £70
```

Revenue:

```text
12 bookings × £70 = £840 recovered
```

Time returned:

```text
Manual callback process before: 8 min
System-assisted process after: 2 min
Time saved: 6 min
81 missed calls × 6 min = 486 min = 8.1 hrs
```

### Tools Needed

| Tool | Purpose |
|---|---|
| Call tracking | Counts missed calls |
| SMS / WhatsApp automation | Sends text-back |
| CRM | Tracks reply, booking, and outcome |
| Booking form | Tracks booked appointments |
| Revenue estimate sheet | Stores value per booking |

---

## 5. Review Growth

Review growth measures reputation and local proof.

### Data Needed

| Field | Description |
|---|---|
| starting_review_count | Reviews before Sorted |
| current_review_count | Current reviews |
| review_requests_sent | Number of requests sent |
| reviews_completed | Number of new reviews completed |
| average_rating | Current rating |
| request_trigger | When review request was sent |

### Formulas

```text
Review growth = current reviews - starting reviews
Completion rate = reviews completed / requests sent
```

Example:

```text
Reviews before: 14
Reviews now: 214
Net new reviews: 200
Review requests sent: 312
Reviews completed: 214

214 - 14 = 200 new reviews
214 / 312 = 69% completion rate
```

### Tools Needed

| Tool | Purpose |
|---|---|
| Google Business Profile | Source of current review count |
| Review request tool | Tracks requests sent and completion |
| CRM | Triggers review request after completed job |
| Booking/payment system | Confirms customer had a completed service |
| Dashboard snapshot | Stores monthly review count |

---

## 6. Revenue Recovered

Revenue recovered measures estimated commercial value from recovered opportunities.

### Data Needed

| Field | Description |
|---|---|
| recovery_category | Missed call, booking, review-led enquiry, follow-up |
| recovered_count | Number recovered |
| estimated_value_each | Value per recovered opportunity |
| confidence_level | Low, medium, high |
| source_system | CRM, booking tool, payment system |

### Formula

```text
Revenue recovered = recovered_count × estimated_value_each
```

Example:

```text
Missed call bookings: 12 × £70 = £840
Website bookings: 16 × £70 = £1,120
Review-led enquiries: 8 × £65 = £520
Follow-up wins: 6 × £70 = £420

Total = £2,900 recovered this month
```

### Tools Needed

| Tool | Purpose |
|---|---|
| CRM | Tracks recovered leads and won opportunities |
| Booking form | Tracks bookings created |
| Payment/accounting tool | Confirms actual revenue where available |
| Call tracking | Attributes missed call recovery |
| Analytics | Attributes review/website source |
| Revenue assumptions sheet | Stores estimated customer/booking values |

Revenue should be labelled as **estimated** unless tied directly to payment data.

---

## 7. Estimated Value Created

Estimated value created combines time value and recovered revenue.

### Data Needed

| Field | Description |
|---|---|
| hours_returned | Total hours returned |
| hourly_value | Agreed value of owner/team time |
| revenue_recovered | Estimated or actual recovered revenue |
| other_savings | Optional savings |

### Formula

```text
Time value = hours returned × hourly value
Estimated value created = time value + revenue recovered + other savings
```

Example:

```text
Hours returned this month: 286
Estimated value per hour: £35
Time value = 286 × £35 = £10,010

Revenue recovered = £2,900

Total estimated value this month = £12,910
```

### Tools Needed

| Tool | Purpose |
|---|---|
| Dashboard calculation table | Combines values |
| CRM | Source of volumes |
| Booking/payment tools | Source of revenue |
| Assumptions sheet | Stores hourly value and value-per-lead |

---

## 8. Investment And ROI

Investment compares value created against what the client paid.

### Data Needed

| Field | Description |
|---|---|
| sorted_investment_to_date | Total paid to Sorted |
| estimated_value_created | Value created |
| net_value | Value after investment |
| roi_percent | Return percentage |

### Formula

```text
Net value = estimated value created - investment
ROI % = net value / investment × 100
```

Example:

```text
Investment: £6,000
Estimated value created: £18,420
Net value: £18,420 - £6,000 = £12,420
ROI: £12,420 / £6,000 × 100 = 207%
```

### Tools Needed

| Tool | Purpose |
|---|---|
| Invoice/payment record | Tracks Sorted investment |
| Dashboard calculation table | Calculates ROI |
| Monthly dashboard snapshot | Stores period values |
| Assumptions sheet | Makes estimates transparent |

---

## 9. Performance Score

The performance score is a presentation layer built from thresholds.

Example scoring:

```text
Time savings:
A+ = 200+ hrs/month
A = 100-199 hrs/month
B = 50-99 hrs/month

Customer response:
A+ = under 5 min average response
A = under 30 min
B = under 2 hrs

Reviews:
A+ = 50+ new reviews/month
A = 20-49
B = 5-19

Lead recovery:
A+ = 75%+ follow-up rate
A = 50-74%
B = 25-49%
```

Overall score:

```text
Overall score = average of category scores
```

### Tools Needed

| Tool | Purpose |
|---|---|
| Dashboard calculation table | Applies thresholds |
| CRM | Response and conversion inputs |
| Review tool | Review growth inputs |
| Automation logs | Time and system performance inputs |

---

## 10. Systems Driving Results

Each system needs its own mini dataset.

### Example: Missed Call Text-Back

```text
System: Missed Call Text-Back
Volume: 81 missed calls
Responses sent: 81
Replies received: 46
Bookings created: 12
Time saved: 8.1 hrs
Revenue recovered: £840
```

### Example: Review Generation

```text
System: Review Generation
Requests sent: 312
Reviews completed: 214
Time saved: 13 hrs
Review growth: +200
Estimated trust impact: qualitative / not monetised
```

### Tools Needed

| Tool | Purpose |
|---|---|
| CRM | Links system actions to customer records |
| Automation platform | Logs actions run by each system |
| Booking tool | Tracks bookings created by systems |
| Review tool | Tracks review system output |
| Dashboard table | Aggregates by system |

---

## Recommended Data Tables

The dashboard can be powered from a small set of tables.

### clients

```text
client_id
client_name
industry
sorted_start_date
plan_name
investment_to_date
hourly_value_assumption
average_customer_value_assumption
```

### reporting_periods

```text
period_id
client_id
period_start
period_end
created_at
published_at
```

### routines

```text
routine_id
client_id
routine_name
system_name
before_minutes_per_task
after_minutes_per_task
monthly_volume
source_system
```

### enquiries

```text
enquiry_id
client_id
period_id
source
received_at
first_response_at
status
booked_at
converted_at
estimated_value
```

### review_metrics

```text
client_id
period_id
starting_review_count
current_review_count
review_requests_sent
reviews_completed
average_rating
```

### revenue_recovery

```text
client_id
period_id
category
recovered_count
estimated_value_each
actual_value
confidence_level
source_system
```

### system_metrics

```text
client_id
period_id
system_name
actions_run
successful_actions
time_saved_hours
revenue_recovered
primary_metric_label
primary_metric_value
```

### dashboard_snapshots

```text
client_id
period_id
hours_returned
enquiries_received
reviews_added
revenue_recovered
estimated_value_created
investment_to_date
net_value
roi_percent
performance_score
```

---

## Implementation Standard

Every dashboard number should be stored with:

```text
value
source
calculation
confidence
last_updated
```

Example:

```text
Metric: Revenue recovered
Value: £2,900
Source: CRM + booking form
Calculation: recovered bookings × estimated booking value
Confidence: medium
Last updated: 2025-04-30
```

This keeps the dashboard credible. Sorted should never present estimated figures as exact financial truth unless they come from payment or accounting data.
