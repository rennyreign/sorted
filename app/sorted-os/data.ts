export type HandbookSection = {
  id: string
  chapter: string
  eyebrow: string
  title: string
  summary: string
  takeaway?: string
  content: string[]
  bullets?: string[]
  steps?: string[]
}

export const chapters = [
  { id: "start", label: "Start here", items: ["vision", "model", "engines"] },
  { id: "doctrine", label: "Doctrine", items: ["manufacturing", "nods", "intelligence"] },
  { id: "market", label: "Market", items: ["market", "offers"] },
  { id: "sites", label: "Sites", items: ["sites", "pipeline", "quality"] },
  { id: "ops", label: "Ops", items: ["ops", "outcomes"] },
  { id: "partners", label: "Partners", items: ["partners"] },
  { id: "operating", label: "Operating system", items: ["gap", "actions", "review"] },
] as const

export const sections: HandbookSection[] = [
  {
    id: "vision", chapter: "Start here", eyebrow: "01 / Direction", title: "The destination sets the standard", summary: "Sorted exists to become an international business modernisation partner for major infrastructure and industry, particularly in the developing world.", takeaway: "Every system exists to close the distance between today's business and that destination.", content: ["The current work is not separate from the long arc. A website, an operator, a sales routine, or a quality gate is useful when it develops the repeatable capability needed for that destination."]
  },
  {
    id: "model", chapter: "Start here", eyebrow: "02 / Business model", title: "Acquire the relationship. Expand the value.", summary: "Sorted acquires businesses through high-value, low-friction digital products, then expands those relationships by manufacturing the systems they need to operate better.", takeaway: "Sorted Sites creates the relationship. Sorted Ops expands the value of the relationship.", content: ["Sites must be a strong standalone business. It earns permission to understand adjacent problems such as enquiries, reviews, booking, CRM, offers, follow-up, and reporting. Expansion follows observed business need, not aggressive upselling."]
  },
  {
    id: "engines", chapter: "Start here", eyebrow: "03 / Strategy", title: "Four engines, one compounding system", summary: "Each engine makes the next one stronger. Together, they turn individual customer work into a better factory.", content: ["The flywheel is deliberate: more prospects create more websites; more websites create more relationships; more relationships reveal more operating gaps; more Ops deployments create data; and better data improves operators, cost, quality, capacity, price, and reach."], steps: ["Acquisition: find a business, create proof, generate a Nod, acquire the customer.", "Manufacturing: turn a requirement into an artifact, production, QA, and deployment.", "Expansion: observe gaps after the website and deploy the right Ops product.", "Improvement: turn volume and data into better operators, lower cost, higher quality, and capacity."]
  },
  {
    id: "manufacturing", chapter: "Doctrine", eyebrow: "04 / Doctrine", title: "Manufacture capability, do not sell bespoke labour", summary: "Sorted is a digital manufacturing company, not a traditional web agency.", takeaway: "Put intelligence in protocols, schemas, and infrastructure rather than individuals.", content: ["Work is decomposed into small, deterministic operators with explicit inputs, outputs, quality gates, and handoffs. A process must be independently testable and resumable, with artifacts validated before downstream work begins.", "The default execution mode is an orchestration agent completing a build end to end. At scale, the same skills become stateless CLI operators coordinated by a job queue. The doctrine and artifact contracts remain the same."], bullets: ["Specialise tasks instead of relying on one broad prompt or one person.", "Make every operator independently testable and resumable.", "Validate artifacts before the next step begins."]
  },
  {
    id: "nods", chapter: "Doctrine", eyebrow: "05 / Doctrine", title: "Build first. Charge second.", summary: "Sorted reverses the conventional agency cycle: Build, Show, Quote, Charge, Deliver.", takeaway: "Clients approve something real at each gate, so the engagement never rests on a leap of faith.", content: ["A high-fidelity mockup creates the pull. A working static build proves execution. The quote follows two approvals, when questions are grounded in something tangible. Payment unlocks handoff, including CMS access and the reset capability."], steps: ["Nod 1: approve the high-fidelity mockup and the direction.", "Nod 2: approve the working static build; Stage 2 CMS work may begin.", "Nod 3: approve the quote, price, and delivery terms.", "Nod 4: payment unlocks delivery, CMS access, and handoff."]
  },
  {
    id: "intelligence", chapter: "Doctrine", eyebrow: "06 / Doctrine", title: "System intelligence is the asset", summary: "System intelligence is the accumulated capability held in Sorted workflows, schemas, validation, content models, quality gates, and operator skills.", content: ["Skills are the canonical written specification for a job. Operators are the compiled, stateless runtime implementation. Artifacts on disk are the source of truth between steps, and schema validation blocks malformed output from cascading through the factory."], bullets: ["Reduce founder dependency through documented work.", "Enforce repeatable quality through the process, not memory.", "Use every completed unit to make autonomous fulfilment more realistic."]
  },
  {
    id: "market", chapter: "Market", eyebrow: "07 / Market", title: "Modernisation begins where the business is already real", summary: "The strongest prospect is an active business whose digital presence understates the quality of the underlying business.", takeaway: "The core signal: the business is better than its website.", content: ["Primary customers are local and service businesses needing modernisation. Ops focuses on revenue-generating businesses with customers, enquiries, follow-up, booking, quoting, reminders, and administration. Revenue is the qualification signal: it shows pain, repetition, and capacity to fund improvement.", "Newly incorporated businesses can be a Sites customer when credible digital infrastructure is needed. Distribution customers include organisations that serve SMEs, such as chambers, business networks, governments, financial or service providers, and strategic partners."]
  },
  {
    id: "offers", chapter: "Market", eyebrow: "08 / Market", title: "Two entry points. One relationship model.", summary: "Sorted has two public offers, each with a clear job and a shared economic logic.", content: ["Sorted Sites shows a finished website concept before the client buys. Delivery includes design, build, hosting, and the SortedUpdates content layer after Nod 2. The client owns editable content; Sorted retains design, code, and the reset key.", "Sorted Ops starts with a diagnostic: inspect operational friction, diagnose the most valuable gap, install and integrate a system, then measure what changed. It can be a focused installation or an ongoing operational partnership."], bullets: ["Sites: trust and enquiry generation.", "Ops: systems that remove repetitive work, recover capacity, and improve performance.", "Use operational language: operators, systems, execution, infrastructure, and modernisation."]
  },
  {
    id: "sites", chapter: "Sites", eyebrow: "09 / Sites", title: "Lead with proof, then run a disciplined factory", summary: "The purpose of a site is practical: make a business easier to trust, understand, contact, and buy from.", content: ["Acquisition identifies active businesses with a clear digital gap. Prospect Finder gathers local-business data, Website Analyser scores viability, a human reviews the ranked list, and outreach leads to a live review page. The review makes the gap visible; the mockup supplies the tangible outcome.", "After Nod 1, the build chain moves from Mockup Deconstructor to Asset Generator to Frontend Builder. Each step writes a canonical artifact that becomes a resumable checkpoint. A failed step is diagnosed and rerun at that checkpoint rather than restarting the chain."], steps: ["Find the active business and diagnose its digital gap.", "Show a personalised concept and gain Nod 1.", "Manufacture the static build and pass QA for Nod 2.", "Apply SortedUpdates, present the quote, receive payment, and hand over."]
  },
  {
    id: "pipeline", chapter: "Sites", eyebrow: "10 / Sites", title: "The Nod Pipeline makes progress visible", summary: "The CRM tracks each prospect from discovery to delivery, with a stage model that matches the client approval gates.", content: ["The route is new, outreached, responded, mockup revealed, build, quote, paid, or lost. All movements are manual except mockup revealed, which records automatically when a prospect opens their personalised mockup on the review page."]
  },
  {
    id: "quality", chapter: "Sites", eyebrow: "11 / Sites", title: "Quality gates protect the promise", summary: "Stage 1 is a static build for evaluation. Stage 2 begins only after Nod 2 and adds the content layer, tutorial material, and factory reset capability.", takeaway: "A 375px viewport, correct content, and a clear primary action are baseline quality requirements, not polish.", content: ["Stage 1 cannot pass unless the production build succeeds, approved sections appear in the correct order, assets and copy are real, and the hero and primary CTA are immediate. Stage 2 requires typed content loaders, matching CMS fields, working controls, and restored test edits.", "At launch, enable invite-only access, verify CMS login, record the handoff SHA, commit the reset script, and tag the handoff. The client can change content; Sorted retains structural and reset control."]
  },
  {
    id: "ops", chapter: "Ops", eyebrow: "12 / Ops", title: "Start with one costly gap", summary: "Sorted Ops removes repetitive work, recovers capacity, and improves operational performance for revenue-generating small businesses.", takeaway: "Inspect. Diagnose. Install. Integrate. Improve.", content: ["Start with one costly gap, install one working fix, measure the change, then decide what to improve next. The business owns the operational outcome; Sorted brings systems, integrations, implementation, and measurement."]
  },
  {
    id: "outcomes", chapter: "Ops", eyebrow: "13 / Ops", title: "Trust leads to enquiries. Enquiries lead to customers.", summary: "Operations are organised around three business outcomes rather than a catalogue of disconnected tools.", content: ["Trust makes a business credible and easy to choose through website, reviews, branding, and reputation. Enquiry systems make contact easy and prevent opportunities being lost to slow or inconsistent follow-up. Customer systems turn captured demand into conversion, retention, referrals, reactivation, and useful reporting."], steps: ["Trust: make the business clear, credible, and easy to choose.", "Enquiries: capture, route, acknowledge, and follow each opportunity until it is answered, booked, or closed.", "Customers: identify the routine creating loss, make it owned or automated, and measure improvement."]
  },
  {
    id: "partners", chapter: "Partners", eyebrow: "14 / Partners", title: "Partners open qualified conversations", summary: "Sorted Partners are not traditional closers. They identify businesses with visible improvement potential, introduce useful work, and pass genuine interest to Sorted.", takeaway: "Lead with work, not pressure.", content: ["The wider distribution model includes SME-serving organisations, chambers and networks, government and business-support organisations, and strategic partners that can include Sorted in their offering. These partners extend access to qualified businesses; they do not change the proof-before-purchase standard."], bullets: ["Do not criticise or embarrass owners.", "Do not promise unconfirmed results or unapproved delivery terms.", "Escalate pricing, contracts, feature commitments, CMS, hosting, and broader Ops work to Sorted."]
  },
  {
    id: "gap", chapter: "Operating system", eyebrow: "15 / Operating system", title: "Vision + GAP turns ambition into work", summary: "Vision defines the destination. GAP is the bridge between today and that destination.", content: ["GAP has four linked layers: goals, measurable outcomes for a period; actions, strategic quarterly commitments that serve a goal; projects, discrete work packages that fulfil an action; and a data dashboard, the evidence that the system is moving. Do not add organisational complexity until the organisation becomes complex."], steps: ["Goal: generate over £1m in net profit.", "Period: two years.", "Current status: on track."]
  },
  {
    id: "actions", chapter: "Operating system", eyebrow: "16 / Operating system", title: "Current actions and projects", summary: "The active work is intentionally constrained by the current phase: establish one reliable production cell and remove founder dependency.", content: ["Each quarterly commitment should name its factory constraint, intended artifact or workflow change, owner, quality gate, and evidence of completion."], bullets: ["Active action: build a sales team. Done means a trained sales function consistently produces qualified opportunities.", "Active action: build a predictable customer acquisition pipeline. Done means weekly prospecting, outreach, mockup, and sales rhythm is operating.", "Active action: build a partnership acquisition pipeline. Done means partners are identified, scored, contacted, and generating referrals.", "Current project: create social outreach routine and define its weekly cadence.", "Current project: create LinkedIn outreach routine and draft the first sequence.", "Current project: establish weekly training content and choose the first topic.", "Current project: create partner scoring dashboard / insight and define the scoring criteria."]
  },
  {
    id: "review", chapter: "Operating system", eyebrow: "17 / Operating system", title: "Review the factory, not individual effort", summary: "Factory review examines where work waited, where an artifact failed validation, where defects escaped, and which human dependency can become system intelligence.", takeaway: "A completed unit is incomplete until it has improved the next one.", content: ["Review acquisition and build chains separately. Confirm that each completed step left the required artifact, that the next step consumed the correct input, and that failed work resumed from the relevant checkpoint rather than being recreated.", "Capture recurring prospect patterns, conversion signals, delivery defects, operator failure modes, customer gaps after launch, and opportunities to reduce time or cost without weakening quality. This is the Improvement Engine in practice."]
  },
]

export const canvas = [
  ["Customer segments", "Local and service businesses needing modernisation; newly incorporated businesses; SME-serving organisations; strategic partners."],
  ["Value propositions", "Sites: premium websites, manufactured faster and with proof before purchase. Ops: productised systems that build trust, handle enquiries, and scale customers."],
  ["Channels", "Outbound, personalised mockups, content, referrals, Partners, distribution partnerships, and Sites-to-Ops expansion."],
  ["Customer relationships", "Proof before purchase, the Nod Pipeline, productised delivery, ongoing support, and expansion from observed need."],
  ["Revenue streams", "Website build and recurring infrastructure; Ops setup and recurring services; partner revenue; future productised software and infrastructure."],
  ["Key activities", "Prospecting, mockups, manufacturing, conversion, QA, deployment, partner acquisition, Ops delivery, expansion, and automation."],
  ["Key resources", "Brand, Website Factory, CRM and data, Prospect Finder, Nod Pipeline, component system, operators, code/IP, OS, partners, and human plus AI capability."],
  ["Key partners", "Referral partners, SME organisations, chambers, government support, hosting, AI providers, technology platforms, and future distributors."],
  ["Cost structure", "AI inference, infrastructure, APIs, acquisition, commissions, operations, engineering, payment processing, and administration. Unit cost should fall with volume."],
] as const
