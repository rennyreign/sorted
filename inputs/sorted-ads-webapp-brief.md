Sorted Ads — Build Brief

Sorted Ads is a lightweight campaign creation, collaboration, approval and publishing workspace for Sorted and its small-business clients.

The product exists to make the journey from campaign idea → ads → client approval → publishing → results unusually simple.

This is deliberately not an advertising management dashboard. Do not recreate the complexity of Meta Ads Manager. Sorted handles that complexity underneath the product wherever possible.

Core UX principle

The shortest useful path wins.

Users should be able to see what is happening, make a change and continue without repeatedly navigating into and out of records.

Prefer:

inline editing
expandable content
overlays and drawers
same-page filtering
sensible defaults
automatic saving where safe
contextual actions beside the thing they affect

Avoid creating new pages unless the task genuinely requires a different working environment.

Core advertising structure

A Campaign contains multiple Angles.

An Angle represents one advertising proposition or argument.

Every Angle contains exactly three copy-length variants:

Short / Medium / Long

These are three expressions of the same angle, not three unrelated ads.

Each Angle has one shared creative. The same image or video must be used across Short, Medium and Long.

This is intentional experimental design:

same angle + same creative + different copy length

This allows performance differences to be attributed meaningfully to copy length rather than introducing multiple changing variables.

Placement-specific crops, aspect ratios and platform renditions are publishing concerns. They must not alter this conceptual model.

Primary internal workflow

Campaigns → Campaign → Publishing → Results

Assets exists as a supporting workspace.

Campaign is the primary working surface.

Opening a campaign should expose its angles in one continuous, highly scannable page. Users should be able to expand an angle and edit its Short, Medium and Long variants without navigating to another screen.

Do not create an individual internal “Review Ad” page.

Approval, comments, copy editing and creative replacement should occur from the Campaign workspace wherever practical.

Client collaboration

Clients receive a simplified Share / Review experience.

Their job is deliberately narrow:

look → understand → approve / request changes → comment

They do not need internal navigation, campaign configuration, publishing controls or operational settings.

Feedback submitted through the client view should appear against the relevant campaign/angle/variant inside the internal workspace.

Publishing

Publishing should feel closer to checking your work and pressing go than configuring an advertising platform.

Users select approved ads, confirm schedule/budget/settings and publish.

Do not expose platform complexity unless Sorted genuinely needs the user to make that decision.

Results

Results should answer:

What happened? Which angles worked? Which copy lengths worked? What did results cost?

Prioritise measurable performance metrics, comparisons and percentages.

Do not add AI-generated “key insights”, narrative summaries or dashboard decoration unless explicitly requested.

Design philosophy

Sorted's marketing identity is expressive. The application should be quieter.

Use the Sorted visual language through typography, generous spacing, dark green, warm neutral surfaces, restrained lime accents, rounded geometry and clear hierarchy.

The workspace should feel calm even when a campaign contains many ads.

Do not confuse visual richness with product quality.

Operational screens should prioritise clarity, density and speed.

Implementation authority

Use the supplied materials in this order when making implementation decisions:

1. Product Model — domain rules and relationships
2. Build Brief — UX intent and product philosophy
3. Global Design IR — shared visual/component system
4. Screen Design IR — screen-specific structure and behaviour
5. Reference screenshots — visual composition and appearance

If a screenshot conflicts with a product rule established in the Product Model or brief, follow the Product Model/brief. Some screenshots represent earlier exploration and should not override the final architecture.

Do not invent additional screens, workflows, navigation levels, AI features or dashboard modules merely because they are common in SaaS products.

When uncertain, choose the implementation requiring fewer clicks and less interface while preserving the user's ability to understand and control the campaign.