BUILD BRIEF — SORTED AD REVIEW
Version: v1
First implementation: Edgbaston Tuition Centre

OVERVIEW

Build a reusable internal client-facing module called:

Sorted Ad Review

Its purpose is to give clients a simple visual environment where they can review advertising concepts and individual ads exactly as they are intended to appear, then approve, reject or request changes.

This is NOT an Edgbaston-specific application.

Build the underlying system as a reusable Sorted component/module. Client-specific campaigns, ads, branding and assets should be supplied as structured data.

Edgbaston Tuition Centre will be the first implementation.


--------------------------------------------------
1. PRODUCT PRINCIPLE
--------------------------------------------------

Separate:

SYSTEM
from
CLIENT DATA

The system owns:
- Page structure
- Ad preview components
- Campaign navigation
- Concept grouping
- Approval controls
- Review states
- Comment/change-request interface
- Filtering
- Status summaries
- Responsive behaviour

The client instance supplies:
- Client identity
- Brand tokens
- Campaigns
- Concepts
- Ads
- Copy
- Creative assets
- Destination URLs
- Approval state
- Client comments


--------------------------------------------------
2. LOCATION
--------------------------------------------------

The module should live inside the client project as an internal Sorted route.

Preferred route:

/_sorted/ads

Do not add this route to the public website navigation.

Architecture should allow other Sorted modules to eventually exist alongside it:

/_sorted
/_sorted/updates
/_sorted/ads
/_sorted/results
/_sorted/leads

Do not build the wider portal now.

However, avoid architectural decisions that would prevent these modules later becoming one unified Sorted Client Layer.


--------------------------------------------------
3. DATA MODEL
--------------------------------------------------

Ads should NOT exist as an unstructured collection.

Use this hierarchy:

CLIENT
  ↓
CAMPAIGN
  ↓
CONCEPT
  ↓
AD VARIANT


Example:

Edgbaston Tuition Centre

September Parent Acquisition

    Academic Excellence
        AE-001
        AE-002
        AE-003

    Learning How to Learn
        LL-001
        LL-002
        LL-003

    Student Results
        SR-001
        SR-002
        SR-003

    Free Lesson
        FL-001
        FL-002
        FL-003


Each campaign should contain:

- id
- name
- platform
- objective
- status
- created_at
- concepts[]


Each concept should contain:

- id
- name
- strategy
- audience
- proposition
- status
- ads[]


Each ad should contain:

- id
- concept_id
- platform
- placement
- primary_text
- headline
- description
- creative
- CTA
- destination_url
- status
- client_comment
- internal_notes if required


--------------------------------------------------
4. REVIEW STATES
--------------------------------------------------

Support these states:

awaiting_review
approved
changes_requested
rejected

Concepts should ALSO be capable of being approved independently of individual ads.

This distinction matters.

APPROVE AD means:

"The exact creative, copy, CTA and execution are approved."

APPROVE CONCEPT means:

"I approve this strategic direction and Sorted may produce further executions from it."


--------------------------------------------------
5. PAGE HEADER
--------------------------------------------------

Create a restrained internal-product header.

Example:

SORTED
Ad Review

Edgbaston Tuition Centre
September Parent Acquisition

Include summary metrics:

12 Ads
4 Approved
2 Changes Requested
6 Awaiting Review

Also show overall campaign status.

The interface should feel like a professional review application, NOT like another page of the client's marketing website.


--------------------------------------------------
6. FILTERING
--------------------------------------------------

Provide quick filters:

All
Awaiting Review
Approved
Changes Requested
Rejected

Also allow filtering by concept.

Example:

All Concepts
Academic Excellence
Learning How to Learn
Student Results
Free Lesson


--------------------------------------------------
7. CONCEPT SECTIONS
--------------------------------------------------

Ads should be grouped visually by concept.

Each concept begins with a small strategy header.

Example:

ACADEMIC EXCELLENCE

Position Edgbaston Tuition Centre as the high-standard
academic environment for ambitious families.

Audience:
Parents of school-age children around Edgbaston.

Primary argument:
Exceptional results come from exceptional standards.

[Approve Concept]


Then display the ads belonging to that concept.


--------------------------------------------------
8. AD PREVIEW
--------------------------------------------------

Create a reusable:

<AdPreview />

component.

For v1, prioritise Meta/Facebook feed advertisements.

The preview should approximately reproduce the visual hierarchy of a Meta feed advertisement without needing to perfectly clone Meta's current UI.

Structure:

--------------------------------

Edgbaston Tuition Centre
Sponsored · globe

PRIMARY AD TEXT

[CREATIVE]

HEADLINE
Description

[CTA BUTTON]

--------------------------------


The creative should render using its intended aspect ratio.

Primary initial ratios:

4:5
1:1
16:9

4:5 should be treated as the preferred Meta feed format.


--------------------------------------------------
9. REVIEW CONTROLS
--------------------------------------------------

Review controls must sit OUTSIDE the simulated advertisement.

Below each advertisement show:

AD ID: AE-001

[Approve]
[Request Change]
[Reject]

If approved:

✓ APPROVED

If changes requested:

CHANGES REQUESTED

Display the client's comment beneath it.

If rejected:

REJECTED


--------------------------------------------------
10. REQUEST CHANGE FLOW
--------------------------------------------------

Selecting:

Request Change

should reveal a compact comment field.

Prompt:

"What would you like changed?"

Example response:

"Love the direction, but change 'top grades'
to 'academic excellence'."

Actions:

[Submit Request]
[Cancel]

The comment must remain associated with that specific ad ID.


--------------------------------------------------
11. AD DETAIL VIEW
--------------------------------------------------

Clicking an ad should allow the reviewer to inspect its underlying strategy.

Show:

AD
AE-001

CONCEPT
Academic Excellence

AUDIENCE
Parents of children 8–16 around Edgbaston

ANGLE
Academic aspiration

PRIMARY TEXT
...

HEADLINE
Academic Excellence Starts Here

DESCRIPTION
Expert tuition in Edgbaston

CTA
Book Now

DESTINATION
/programmes/gcse-maths

This can be a modal, drawer or expanded card.

Keep it simple.


--------------------------------------------------
12. VISUAL DESIGN
--------------------------------------------------

This is a Sorted product.

Therefore the surrounding review application should use a neutral, polished Sorted interface rather than inheriting the entire visual design of the client's website.

Think:

- White / off-white canvas
- Dark typography
- Subtle grey borders
- Restrained shadows
- Generous spacing
- Compact status chips
- Clear information hierarchy
- High-density enough to review multiple ads efficiently

Client branding should primarily appear INSIDE the advertisements.

Do not allow Edgbaston's navy/orange branding to turn the whole application into an Edgbaston webpage.

The mental model is:

"Sorted is showing me Edgbaston's advertising."

not:

"I am browsing another Edgbaston webpage."


--------------------------------------------------
13. DESKTOP LAYOUT
--------------------------------------------------

Preferred desktop structure:

[HEADER / CAMPAIGN STATUS]

[FILTERS]

CONCEPT
strategy information

[AD]    [AD]    [AD]
review  review  review

CONCEPT

[AD]    [AD]    [AD]


Use a responsive three-column grid where appropriate.

The ad previews should remain large enough that copy and creative can actually be reviewed.


--------------------------------------------------
14. MOBILE
--------------------------------------------------

On mobile:

- Single-column ad stream
- Sticky or easily accessible filters
- Full-width ad previews
- Review controls immediately below each ad
- Strategy/details accessible without excessive scrolling
- No tiny desktop cards squeezed into the viewport


--------------------------------------------------
15. EDGBASTON FIRST IMPLEMENTATION
--------------------------------------------------

Seed the first implementation for:

Edgbaston Tuition Centre

Campaign:

Parent Acquisition

Create four concept groups:

01 — ACADEMIC EXCELLENCE

Core idea:
Edgbaston helps ambitious students achieve exceptional academic standards.

Potential language:

"Academic Excellence Starts Here."

"Exceptional results begin with exceptional standards."


02 — LEARNING HOW TO LEARN

Core idea:
Edgbaston doesn't simply teach subjects.
Students learn how to understand, think, practise and become better learners.

Potential language:

"Don't Just Study Harder. Learn Better."

"Better grades begin with better learning."


03 — RESULTS / PROOF

Core idea:
Use real student improvement, grades, testimonials and case studies as the advertising mechanism.

Potential language:

"From Grade 5 to Grade 8."

"Real Progress. Real Results."

All results claims must eventually use verified client data.


04 — FREE LESSON

Core idea:
Reduce the barrier to experiencing the centre.

Potential language:

"Come and Experience the Difference."

"Start With a FREE Lesson."

Destination should be the appropriate programme detail/conversion page.


--------------------------------------------------
16. COMPONENT ARCHITECTURE
--------------------------------------------------

Prefer reusable components such as:

<AdReview />
<CampaignHeader />
<CampaignSummary />
<ConceptSection />
<ConceptApproval />
<AdGrid />
<AdPreview />
<MetaFeedPreview />
<ReviewControls />
<ChangeRequest />
<StatusBadge />
<AdDetails />


Avoid duplicating markup for each advertisement.

Ads should be generated from structured data.


--------------------------------------------------
17. FUTURE PLATFORM SUPPORT
--------------------------------------------------

Do NOT build all of these now.

However, structure AdPreview so future renderers can be introduced:

<MetaFeedPreview />
<MetaStoryPreview />
<InstagramReelPreview />
<GoogleSearchPreview />
<GoogleDisplayPreview />
<LinkedInPreview />

The underlying advertisement object should therefore be platform-aware.


--------------------------------------------------
18. PERSISTENCE
--------------------------------------------------

Approval state must persist.

At minimum store:

ad_id
status
comment
updated_at

Concept approval should similarly persist:

concept_id
status
updated_at

Choose the simplest persistence mechanism compatible with the existing project architecture.

Do not build unnecessary backend infrastructure purely for v1.


--------------------------------------------------
19. IMPORTANT UX PRINCIPLE
--------------------------------------------------

The client should be able to open this URL and understand what is required WITHOUT Renaldo explaining the interface.

Within approximately 10 seconds they should understand:

1. These are the ads Sorted proposes running.
2. They are grouped by advertising idea.
3. I can approve an idea.
4. I can approve an individual ad.
5. I can request a specific change.
6. Sorted will know exactly what I mean.


--------------------------------------------------
20. FACTORY / SKILL READINESS
--------------------------------------------------

This module will eventually be assembled through a Sorted Skill.

Therefore ensure a future agent can instantiate a new client review board primarily by supplying structured data.

Desired future workflow:

"Create a Sorted Ad Review for BodySharp."

Agent:

1. Reads client brand context.
2. Reads campaign strategy.
3. Generates campaign concepts.
4. Generates ad variants.
5. References/generated creative assets.
6. Creates campaign JSON.
7. Instantiates Sorted Ad Review.
8. Returns /_sorted/ads review URL.

The UI/application itself should require little or no rewriting.


--------------------------------------------------
21. DEFINITION OF DONE — V1
--------------------------------------------------

V1 is complete when:

- /_sorted/ads exists
- Edgbaston campaign data loads from structured data
- Ads are grouped into concepts
- Meta feed previews render correctly
- Client can approve an individual ad
- Client can reject an individual ad
- Client can request a change and leave a comment
- Client can approve a concept
- Status counts update
- Review state persists
- Filters work
- Mobile layout works
- Another client can be instantiated without rebuilding the application


FINAL PRODUCT PRINCIPLE:

Build the machine once.

Each client should provide new strategy, data and creative —
not require a new approval application.