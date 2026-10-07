# Stage 1 - Internal Page Direction Confirmation

Apply this rule to every new or resumed client-site build before the client has confirmed the homepage direction. It applies during Frontend Build (Op 4), before automated QA (Op 5) and the human review handoff (Op 5b).

## Purpose

Build the homepage first so the client can judge the visual direction. Keep every advertised internal-page destination navigable, without prematurely designing the rest of the site or presenting unfinished pages as finished work.

The reference implementation is `murraymartin/components/PendingPage.tsx`, used by its About, Services and Support routes. Reuse the behavior, not Murray Martin's branding, prices or approval status.

## Routing Rule

- Home and the brand link return to `/`.
- Every advertised but unbuilt business/content page has its intended route, such as `/about/`, `/services/`, `/advice/`, `/testimonials/` or `/contact/`.
- Each of these routes renders one shared, client-branded `PendingPage` component with a page-specific name.
- Link to these routes consistently from desktop navigation, mobile navigation, dropdowns, service cards, homepage page CTAs and the footer.
- Do not replace an internal-page link with a homepage anchor, unrelated email action, expandable fragment, `href="#"` or broken destination simply because that page has not been built.
- Genuine in-page jumps remain anchors when their label clearly describes an in-page action. Business conversion actions remain functional: phone, email, WhatsApp, supplied booking links and working quote/callback actions must not be intercepted.
- Legal/privacy routes and other explicitly approved, implemented utility pages may remain real pages. Do not overwrite completed pages when resuming a build.
- Do not create pages that the brief or mockup does not advertise merely to populate navigation.

## Shared Confirmation Page

Use a server component with the interface `PendingPage({ pageName }: { pageName: string })`, with the current client's branding and review contact configured in that component. Wrap it with the site's existing navigation, footer and page-transition treatment.

Display:

- Status: `Homepage ready for review`.
- Heading: `The {pageName} page is waiting on your design approval.`
- Explanation: `Once you're happy with the homepage direction, we'll carry this visual system through the remaining pages so the whole site feels consistent and unmistakably {businessName}.`
- A primary action labelled `Confirm the design direction`, linking to the client's workspace Next Steps screen: `https://sortmydigital.site/workspace/<workspace-slug>/next-steps`. The workspace slug is the prospect's `review_slug`, which may differ from the site's project slug. Next Steps carries the deposit payment, question drawer and call booking — it is the lowest-friction confirm path.
- Explain that the action takes the client to their Sorted workspace, where they can approve the direction, pay the deposit or ask a question.
- When no workspace exists for the client yet, fall back to `mailto:hello@sortmydigital.site?subject=` plus an encoded, client-specific subject such as `{businessName} - design direction feedback`, and explain that the action opens an email; it does not automatically record approval.
- A secondary action labelled `Return to the homepage`, linking to `/`.

Use accessible contrast, visible focus states, responsive spacing and the client's established typography. Pending-route metadata should describe a design-review page, not advertise completed services that the route does not contain. Mark pending pages `noindex, nofollow`.

Do not copy a price, deposit amount, quote promise or payment link from another client. Include those details only when explicitly supplied for this client. Do not invent a functioning approval backend, submit a real approval, update CRM/build status, or advance any gate merely because the confirmation page or mailto link exists.

## Intentional Review State, Not Generic Filler

This is an explicit exception to the ban on empty placeholder pages and generic "Coming soon" copy. It is a useful, functioning review destination with a clear next step. It does not count as a finished internal page, does not complete Op 10, and does not authorise CMS work.

After the client confirms the direction, replace pending business pages through the internal-page build stage using approved content and the agreed visual system. Do not infer client confirmation from automated QA or an agent's visual review.

## Link QA Before Human Review

- Inventory internal-page links in the header, mobile menu, dropdowns, homepage cards/CTAs and footer.
- Confirm every advertised destination exports successfully, loads directly and returns HTTP 200.
- Confirm each pending route names the correct page and client, explains the direction-confirmation step and links back to the homepage.
- Exercise internal links on desktop and mobile; ensure mobile navigation closes after selecting a route.
- Confirm the review action points to the client's workspace `/next-steps` route (or the Sorted email fallback when no workspace exists), without sending a message or recording approval.
- Confirm phone/email/booking conversion actions still use their real destinations.
- Confirm intentional homepage anchors resolve and legal/utility exceptions remain intact.
- Record pending routes as awaiting client direction in build artifacts; leave human/client approval gates pending.

Launch QA must reject any advertised business page that still renders this direction-confirmation state. A ready-to-review homepage is not a launch-ready site.
