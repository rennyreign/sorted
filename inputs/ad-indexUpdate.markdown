# Sorted Ads — Campaign Ad Index Brief

## Purpose

The Campaign Ad Index is the primary working surface for a single advertising campaign.

It should not behave like a conventional database table, form builder, or nested ad-management dashboard. It should behave more like an **infinite campaign canvas**: every advertising angle in the campaign is grouped sequentially down one scrollable page, with its actual ad variants displayed underneath.

The goal is to let a user understand, compare, review and edit an entire campaign by simply scrolling.

## Core information model

A Campaign contains multiple **Angles**.

Each Angle represents one distinct advertising proposition or persuasion idea.

Each Angle contains exactly three copy-length variants:

- Short
- Medium
- Long

All three variants use the **same underlying creative**. This is intentional. The variable being tested is copy length, so changing the image between Short, Medium and Long would compromise the comparison.

The page therefore follows this repeating structure:

**Campaign**
→ Angle 01
→ Short / Medium / Long ads

→ Angle 02
→ Short / Medium / Long ads

→ Angle 03
→ Short / Medium / Long ads

…and continues vertically for as many angles as the campaign contains.

## Infinite-page principle

Do not attempt to compress the campaign into one viewport.

Vertical length is an advantage here, not a problem.

The browser already provides an extremely familiar navigation mechanism: scrolling. Use it.

Angles should be stacked sequentially down the page and allowed to consume the vertical space their content genuinely requires. A campaign containing six, ten or twenty angles can simply produce a longer page.

Filters and search can reduce what is visible when needed, but the default mental model should remain:

**“This page is the campaign.”**

Avoid pagination and avoid routing each angle or ad to its own page merely to control page length.

## Ads should look like ads

The cards displayed inside each Angle should mimic the structure of the ads as they appear in the destination news feed.

The purpose is not to reproduce every interactive detail of Facebook or Instagram. The purpose is to make the campaign workspace visually representative enough that a separate preview workflow is unnecessary.

For a Meta feed-style ad, preserve the recognisable hierarchy:

1. Advertiser identity
2. Sponsored/platform context
3. Primary text
4. Creative
5. Link / destination context where relevant
6. Headline
7. Description
8. CTA
9. Lightweight feed-action treatment where useful

The user should be looking at something that feels like the ad they are actually going to publish, not a collection of disconnected form fields.

## Preserve real creative dimensions

Do not normalise every creative into the same artificial card ratio just to make the grid visually tidy.

The workspace should demonstrate the creative using its intended feed dimensions/aspect ratio.

Examples may include:

- 1:1
- 4:5
- 16:9
- other supported campaign creative dimensions

If an Angle uses a 4:5 creative, the ad cards should visibly render that creative as 4:5.

If it uses 1:1, show it as 1:1.

The surrounding ad structure should naturally accommodate the media.

This means rows do not need to have identical heights. The Short, Medium and Long ads can also have different total heights because their copy lengths differ.

For each Angle, allow the section to extend to the height required by its tallest variant, then begin the next Angle below it.

Do not sacrifice fidelity merely to create a perfectly aligned dashboard grid.

## Editing principle

The major product advantage is that the preview and editing surface are effectively the same place.

A user should be able to scroll through the campaign, notice something that needs changing, edit it, and continue scrolling.

Do not require:

**view ad → open ad page → edit → save → navigate back → continue review**

Prefer:

**see ad → edit → continue**

Editing must therefore remain **in flow**.

### Preferred editing behaviour

First preference is lightweight in-place editing.

An edit/pencil action on an individual Short, Medium or Long ad may switch that card into an editable state while keeping its overall feed-like structure intact.

Editable properties include:

- Primary text
- Headline
- Description
- CTA

Changes should autosave where practical.

### Acceptable alternative: lightweight editor overlay

If true inline editing creates excessive technical complexity, layout instability, or a poor editing experience, a compact modal/popover/editor overlay is acceptable.

However, it must preserve the user's position and campaign context.

The interaction should feel like:

**click Edit → make change → close/save → remain exactly where you were in the campaign**

It must not become a separate route or full-screen drill-down.

The editor should ideally retain a visible representation of the ad being changed.

The implementation team/model may choose between inline editing and a lightweight overlay based on implementation efficiency, provided the **in-flow editing principle is preserved**.

## Shared creative editing

Creative belongs to the Angle, not to each copy-length variant.

Changing the creative from any Short, Medium or Long ad should therefore change the shared creative used by all three.

The UI should communicate this before committing the change.

For example:

> This creative is shared by Short, Medium and Long. Changing it will update all three variants.

Creative selection may use an asset-picker modal or drawer.

## Angle-level controls

Each Angle should have a compact header above its three ads containing only useful campaign-management information, such as:

- Angle number
- Angle name/proposition
- Short description
- Approval summary
- Collapse/expand
- Angle edit
- Overflow actions

Do not surround the ads with excessive analytics or configuration.

The ads themselves are the dominant objects.

## Review and collaboration

Approval and feedback should also remain close to the ads.

Users and clients should be able to:

- Approve a variant
- Request changes
- Comment
- See current review state

without opening a dedicated internal Review Ad page.

Comments may expand inline or use a temporary drawer/popover.

Client sharing can still use a simplified external review surface, but the internal campaign index remains the canonical operational view.

## Global shell

Use the new Sorted Ads global shell:

- Top navigation
- No persistent left sidebar
- No persistent right sidebar
- Wide centred content canvas
- Campaign actions in the page header
- Filters/search immediately above the Angle list

The recovered horizontal space exists primarily to give the three ad variants enough room to look like real feed ads.

## Decision heuristic

When deciding between interface patterns, optimise for:

**fewer clicks + preserved campaign context + closer resemblance to the published ad.**

The campaign page should feel less like administering records and more like laying the entire campaign out on a very long table and working directly on the finished objects.

The infinite scroll is the table.

The Angle is the grouping.

The feed-style ad is the working object.

Editing happens where the work already is.
