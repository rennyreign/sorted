# Site Composer Operator

## Background

This brief is for **Devin**.

Devin should act as the chief orchestrator for this project, while remaining faithful to the Sorted doctrine and the ADX Engine operating philosophy.

This operator belongs to **Sorted**.

It exists to remove a specific scaling bottleneck inside the Sorted outreach and fulfilment system: the manual production of website mockups before contacting prospects.

Sorted’s outreach workflow depends on showing small businesses what their digital presence could become. The current manual mockup stage creates a compelling sales asset, but it also ties outreach volume directly to founder production capacity.

For example:

- 100 prospect websites per week
- 15 positive responses
- 15 website builds required almost simultaneously

This creates operational congestion immediately after successful outreach.

The objective of this project is therefore **not** to automate website design for its own sake.

The objective is to give Sorted a deterministic composition operator that can generate production-ready websites directly from structured business analysis, without requiring a manually designed mockup beforehand.

The website preview becomes an output of the Sorted system rather than a manual input created before outreach.

---

## Devin Orchestration Context

Sorted workflows primarily use Devin as the chief orchestrator.

For this brief, Devin should not simply build a single prototype and stop there.

Devin should work in two parallel tracks:

1. **Operator framework / prototype**
2. **Skills-based orchestration structure**

The operator framework is the canonical version of the process.

It should define the deterministic operators, inputs, outputs, schemas, validation rules, and handoff artefacts that make the workflow independently runnable and scalable.

The skills-based structure is the Devin-orchestrated version of the same logic.

It should translate the operator framework into a node-driven skills system that Devin can coordinate using its multi-model and sub-agent infrastructure.

This means Devin should create both:

- the underlying operator procedure that could later be plugged into LLMs outside Devin
- the practical skills/node structure that Devin can orchestrate immediately

The skills version should not be a loose prompt collection.

It should be a structured orchestration layer that mirrors the operator framework.

Each skill/node should have:

- a clear responsibility
- defined inputs
- defined outputs
- validation expectations
- handoff rules
- failure conditions
- downstream dependencies

The purpose of this dual-track method is to let Sorted benefit from Devin’s orchestration capabilities now, while preserving an operator-native version of the process that can scale independently later.

In simple terms:

- **Devin orchestrates the work now**
- **The operator framework preserves the scalable system**
- **The skills layer gives Devin a node-driven way to manage the deterministic process**
- **The operator layer allows the same procedures to be run outside Devin when scale requires it**

Devin should therefore treat the Site Composer not only as a product feature, but as a repeatable operating pattern for Sorted.

The prototype should prove both the reasoning structure and the orchestration structure.

---

## Sorted Doctrine Context

This operator must remain faithful to the Sorted doctrine.

Sorted does not sell websites as isolated creative artefacts. Sorted modernises small businesses by improving the visible systems that influence:

- Trust
- Enquiries
- Customers

This is the TEC logic at the centre of Sorted:

**Trust → Enquiries → Customers**

The Site Composer Operator must therefore make decisions in service of commercial clarity, customer confidence, and business modernisation.

It should not behave like a generic web designer.

It should behave like a Sorted operator that translates business analysis into structured website decisions that increase trust, improve enquiry pathways, and make the business easier for customers to choose.

---

## Relationship to ADX Engine Philosophy

There is clear overlap with the ADX Engine philosophy, and that overlap should be made explicit for Sorted agents working on this task.

ADX Engine provides the broader operating philosophy:

- systems over isolated effort
- operators over generalist prompts
- structured artefacts over hidden reasoning
- deterministic handoffs over creative ambiguity
- replaceable components over monolithic workflows
- factory logic over artisan dependency

Sorted applies that philosophy to the specific domain of small business modernisation.

So, for this project:

- **ADX Engine is the operating philosophy**
- **Sorted is the commercial doctrine**
- **The Site Composer is a Sorted operator built using ADX-style architecture**

This distinction matters.

The Site Composer should not drift into abstract AI architecture for its own sake. Its purpose is to help Sorted produce better business websites at scale, while using ADX Engine principles to keep the workflow modular, testable, and deterministic.

---

## Philosophy

The intelligence must not reside inside a single large prompt.

Instead, intelligence should emerge from multiple constrained operators, each producing structured artefacts that become the inputs of downstream operators.

No operator should solve the entire problem.

Every operator should solve one deterministic problem well.

Within Sorted, this means the Site Composer should not try to “make a website”.

It should produce the design doctrine that allows downstream Sorted agents and systems to assemble a website with consistency.

The operator is closer to a Creative Director than a renderer.

Its job is to decide what the website should communicate, how trust should be established, what customer objections must be reduced, and how the page should guide the visitor toward enquiry.

---

## Desired Outcome

Given:

- existing business website
- website analysis
- trust score
- enquiry score
- customer score
- business category
- identified weaknesses
- screenshots
- extracted copy/content

The Sorted system should produce:

- production-ready Next.js website
- generated lifestyle imagery
- rewritten copy
- selected components
- brand direction
- rendered screenshot
- deployable repository

without requiring a manually designed mockup beforehand.

The screenshot becomes an output of the build rather than an input to it.

---

## Proposed Architecture

## Stage 1 — Website Analyzer

Input:

Existing business website

Output:

Structured JSON including:

- trust score
- enquiry score
- customer score
- UX observations
- missing trust signals
- strengths
- weaknesses
- business classification

This stage identifies the commercial and trust-related weaknesses in the current business presence.

It should frame findings through the Sorted lens:

- What is reducing trust?
- What is blocking enquiries?
- What is making customer conversion harder?
- What would make the business look more credible, useful, and ready to serve?

---

## Stage 2 — Site Composer

This is the core operator being prototyped first.

The Site Composer is not responsible for rendering websites.

It is responsible for making structured design and conversion decisions for Sorted.

Output should be structured JSON only.

For example:

- emotional positioning
- trust strategy
- hero strategy
- photography direction
- component family
- CTA hierarchy
- navigation structure
- typography profile
- colour palette
- layout sequencing
- conversion strategy
- objection-reduction strategy
- local credibility strategy
- proof and reassurance strategy

This operator should behave like a Sorted Creative Director.

It should convert business analysis into an executable website doctrine that downstream agents can follow.

It should expose its decisions clearly enough that another Sorted agent can understand why each decision exists and how it supports Trust, Enquiries, or Customers.

---

## Stage 3 — Asset Composer

Consumes Site Composer output.

Produces structured briefs for:

- hero imagery
- lifestyle imagery
- section imagery
- icons
- illustrations
- supporting assets

The implementation should remain model-agnostic.

Initially, GPT image generation is acceptable.

Future implementations may use MidJourney, Flux, or alternative providers.

The architecture should assume asset providers are interchangeable.

For Sorted, asset choices should always support trust and commercial clarity rather than decoration alone.

---

## Stage 4 — Copy Composer

Consumes:

- website analysis
- Site Composer output

Produces:

- headlines
- supporting copy
- CTAs
- trust messaging
- section content
- objection-handling copy
- local credibility copy
- service explanation copy

Output should remain structured.

The Copy Composer should write through the Sorted doctrine.

Its purpose is not to sound clever.

Its purpose is to make the business easier to understand, easier to trust, and easier to contact.

---

## Stage 5 — Layout Composer

Consumes:

- Site Composer output
- Copy Composer output
- Asset Composer output

Produces:

Component tree only.

For example:

Hero01  

↓  

SocialProof03  

↓  

FeatureGrid02  

↓  

OfferBanner01  

↓  

Testimonials02  

↓  

CTA03

No HTML generation should occur at this stage.

The Layout Composer should choose components that support the Site Composer’s trust and conversion strategy.

It should not introduce new creative reasoning that contradicts the Site Composer doctrine.

---

## Stage 6 — Website Renderer

Consumes component tree.

Assembles:

- Next.js pages
- CMS configuration
- design tokens
- assets
- copy

Outputs deployable application.

No creative reasoning should occur here.

Rendering should be deterministic.

The renderer executes the decisions already made by the Sorted operators upstream.

---

## Stage 7 — QA Operator

Performs automated validation.

Checks include:

- accessibility
- spacing
- responsiveness
- missing assets
- missing copy
- CTA visibility
- trust signal coverage
- contrast
- broken layouts
- enquiry path visibility
- mobile usability
- proof and reassurance coverage

No subjective judgement should occur.

The QA Operator should validate whether the output satisfies the structured Sorted doctrine, not whether it personally “likes” the design.

---

## Stage 8 — Preview Generator

Once rendering succeeds, automatically generate:

- desktop screenshot
- mobile screenshot
- outreach assets
- review page

The rendered preview replaces the manually produced mockup.

This allows Sorted to continue using the principle of “we don’t sell, we show” without making the founder manually produce every demonstration asset.

---

## Design Principles

Every operator should:

- have one responsibility
- receive structured inputs
- produce structured outputs
- remain independently replaceable
- remain independently testable
- avoid hidden reasoning
- expose its decision making through JSON artefacts
- support the Sorted TEC logic
- preserve deterministic handoffs between agents

The system should be understandable as a pipeline.

Each operator should leave behind an artefact that another Sorted agent can inspect, validate, and use.

---

## Technical Objective

Prototype the Site Composer first.

Do not optimise for speed.

Optimise for architecture.

The prototype should demonstrate that Sorted website reasoning can be decomposed into explicit operational decisions rather than remaining implicit inside a frontier model.

Devin should build this in tandem as:

- an operator framework/prototype
- a node-driven skills version that Devin can orchestrate

The operator framework should define the portable, scalable procedure.

The skills version should operationalise that procedure inside Devin’s orchestration environment.

These two tracks should remain structurally aligned.

If the Site Composer has an operator stage, the skills layer should have a corresponding skill/node.

If the operator stage produces an artefact, the skills layer should preserve that artefact as a handoff.

If the operator stage has validation rules, the skills layer should expose those rules as execution checks.

This ensures the Devin workflow does not become a one-off implementation. It becomes the first orchestrated version of a system that can later be extracted, scaled, and run through independent LLM/operator infrastructure.

Once proven, the remaining operators can be progressively implemented.

The priority is not simply to generate a good-looking website.

The priority is to prove that Sorted can convert business analysis into a structured website doctrine that downstream operators can execute consistently.

---

## Success Criteria

Success is not measured by visual beauty alone.

Success is measured by whether the architecture:

- removes founder dependency
- scales linearly with compute rather than labour
- produces deterministic handoffs
- allows operators to be upgraded independently
- remains model-agnostic
- converts website analysis into production-ready websites without requiring manual mockup creation
- expresses Sorted doctrine clearly enough for downstream agents to act on it
- improves trust, enquiry potential, and customer conversion clarity
- gives Devin a node-driven skills structure that can orchestrate the workflow immediately
- preserves an operator-native version that can later run outside Devin
- keeps the Devin skills layer and the operator framework structurally aligned

The long-term vision is for the Site Composer to become the operational equivalent of a compiler within Sorted.

It should translate business analysis into a structured design doctrine that downstream operators can execute consistently, regardless of which AI models are used in the future.

In ADX Engine terms, it is an operator inside a modular production system.

In Sorted terms, it is the mechanism that turns small business diagnosis into visible commercial modernisation.

In Devin terms, it is a node-driven orchestration workflow that can coordinate multiple models, sub-agents, and deterministic handoffs while preserving the underlying operator architecture for future scale.