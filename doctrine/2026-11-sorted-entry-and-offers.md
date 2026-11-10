# Sorted public entry and offers — 10 November 2026

Approved in the current working session. This supersedes older public-entry and website-price guidance where it conflicts; manufacturing, CMS approval, historic agreements and client ownership rules remain intact.

Sorted is one company, expressed conversationally at `/`: “Where’s your business getting stuck?”

- More people finding us → `/websites`, the established black website design, restored to website language. `/sites` is a compatibility alias.
- People look but don’t get in touch → `/what-else-we-do`, customer acquisition and conversion: offer, proof, discovery, contact and tracking. Additional campaign/follow-up work is separately scoped.
- Enquiries arrive but keeping up is difficult → `/v4`, AI automation services and the three operators.
- Agency campaign production remains public at `/agencies` but is a secondary audience link.

The new UK website offer is £999: up to five pages, design and draft copy, one consolidated revision round, contact route, content editing, basic SEO/analytics and launch. First-page preview before commitment. Payment: £499.50 on approval and £499.50 when ready to launch. Extra pages, shops, logins, integrations, campaign creative, paid services, ad spend, follow-up automation and ongoing management are separately quoted. Hosting, domains and tax treatment confirmed in writing.

US pricing remains $3,500. Existing quotes/workspaces retain their agreed figures. `WEBSITE_MARKETING_PRICING` governs new public marketing, while `MARKET_PRICING` remains the historic workspace default. New UK website submissions carry `landing_page: website_999_uk`; only those get the new workspace offer automatically, with checkout inheritance disabled.

Value: Trust through one coherent company and correctly attributed website proof; Enquiries through three recognisable problems and useful destinations; Operations through the separate automation route. Observe entry-card clicks, preview requests and diagnostic bookings using existing analytics infrastructure. No performance guarantee.

The root no longer contains the website review section; shared review links point to `/websites#reviews`. `/sites` uses the website destination’s canonical. Public service URLs are listed in `/sitemap.xml`; client/operator routes are not listed.

## Service navigation (10 November follow-up)

Headers serve the current experience and follow the customer's decision sequence:
- Websites → What we improve → How it works → Our work → Pricing.
- AI automation: Operators → How it works → About us → Pricing.

Header logos return to their own service home; mobile menus mirror the same sequence. Company information and cross-service navigation live in the shared sitemap footer, grouped under Websites, AI automation and Sorted. The footer exposes the switchboard, both services' pricing/process pages, reviews, content editing, company information, partnerships and the agency offer. Maintain `lib/public-navigation.ts` and `components/SiteMapFooter.tsx` as the shared sources; do not add isolated footer/navigation copies per page.

The operator demo is not available yet: keep `/v4/demo` unlisted and noindex, without header/footer/body promotion or a sitemap entry. About us belongs to the automation navigation at `/v4/about` and retains V4Nav. The How It Works hero offers a diagnostic booking instead.
