# Quote Agent Operator — Build Brief

## Objective

Build a semi-deterministic quoting agent that runs on Cloudflare Agents platform. The agent conducts an intake conversation with potential clients, gathers requirements, references project context from the Sorted GitHub repo, and generates a complete proposal following the established Sorted design pattern (outline → quote → bank details → sign).

## Philosophy

This is an **operator**, not a chatbot. It produces a deterministic artifact (a signed proposal) through a guided conversation. The agent should feel like a concise, professional intake process—not open-ended chat.

## Architecture

### Platform: Cloudflare Agents

Use Cloudflare's `AIChatAgent` class with Durable Objects for persistence:
- Each client conversation = one named Agent instance (e.g., `quote-${clientSlug}-${timestamp}`)
- SQLite state storage for conversation history and generated proposal data
- WebSocket or HTTP SSE for real-time interaction
- Scheduled tasks for follow-up reminders (optional v2)

### State Machine

```
[intake] → [outline] → [quote] → [review] → [sign] → [complete]
   ↑         ↑         ↑         ↑         ↑
   └─────────┴─────────┴─────────┴─────────┘ (can restart/go back)
```

1. **intake** — Gather: client name, business name, contact, project type, scope description, timeline, budget range
2. **outline** — Present structured deliverables based on project type + repo context
3. **quote** — Show pricing breakdown (can use pricing.ts from sorted repo)
4. **review** — Present full proposal for client approval
5. **sign** — Capture name + timestamp (no legal weight, just confirmation)
6. **complete** — Generate final proposal data, trigger notification

### GitHub Context Integration

Agent fetches repo context at initialization:
- `rennyreign/sorted/AGENTS.md` — operating model, tech stack, delivery model
- `rennyreign/sorted/doctrine/*.md` — pricing principles, scope boundaries
- `rennyreign/sorted/lib/pricing.ts` — pricing tiers and add-ons
- `rennyreign/sorted/app/proposals/*/page.tsx` — reference proposal structures

Context is cached in Agent state for the session.

## Data Structures

### Agent State (SQLite)

```typescript
interface QuoteAgentState {
  clientSlug: string;
  stage: 'intake' | 'outline' | 'quote' | 'review' | 'sign' | 'complete';
  createdAt: string;
  updatedAt: string;
  
  // Intake data
  intake: {
    clientName: string;
    businessName: string;
    email: string;
    phone?: string;
    projectType: 'website' | 'ecommerce' | 'cms-addon' | 'other';
    scopeDescription: string;
    hasExistingSite: boolean;
    timeline: 'asap' | '2-4weeks' | 'flexible';
    budgetRange: '<500' | '500-1000' | '1000-2000' | '2000+' | 'discuss';
  };
  
  // Generated proposal
  proposal: {
    title: string;
    deliverables: Array<{
      num: string;
      title: string;
      body: string;
    }>;
    timeline: Array<{
      stage: string;
      desc: string;
    }>;
    pricing: {
      total: number;
      currency: 'GBP' | 'EUR' | 'USD';
      depositPercent: number;
      breakdown?: string;
    };
    paymentDetails: {
      bankName: string;
      accountName: string;
      iban?: string;
      accountNumber?: string;
      sortCode?: string;
      bankAddress?: string;
    };
    notIncluded: string[];
    signedAt?: string;
    signerName?: string;
  };
  
  // Repo context (cached)
  repoContext?: {
    fetchedAt: string;
    agentsMd: string;
    pricingTs: string;
    proposalExamples: string[];
  };
}
```

### Output: Proposal JSON

Generated proposal matches the structure used by `app/proposals/[client]/page.tsx`:

```typescript
interface ProposalOutput {
  meta: {
    clientSlug: string;
    clientName: string;
    businessName: string;
    createdAt: string;
    status: 'draft' | 'sent' | 'signed';
  };
  content: {
    salutation: string;
    openingLetter: string[];
    deliverables: Deliverable[];
    timeline: TimelineItem[];
    investment: {
      total: number;
      currency: string;
      deposit: { percent: number; amount: number; due: string };
      balance: { percent: number; amount: number; due: string };
    };
    paymentDetails: PaymentDetails;
    afterLaunch: string[];
    notIncluded: string[];
    closingLetter: string[];
  };
  signature?: {
    name: string;
    signedAt: string;
  };
}
```

## Implementation Structure

```
operators/quote-agent/
├── implementation/
│   ├── package.json              # deps: agents-sdk, hono (optional)
│   ├── wrangler.toml             # Cloudflare config
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Worker entry, Agent class
│   │   ├── github.ts             # GitHub API client
│   │   ├── prompts.ts            # Stage-specific system prompts
│   │   ├── pricing.ts            # Pricing logic (from sorted)
│   │   └── types.ts              # TypeScript interfaces
│   └── .env.example
├── brief.md                      # This file
└── README.md                     # Operator docs
```

## System Prompts (Semi-Deterministic)

The agent uses stage-specific prompts with strict constraints. This keeps it cheap (gpt-4.1-mini or llama-4-scout via Workers AI) and on-rails.

### Stage: Intake

```
You are the Sorted Quote Agent. Your job is to gather project requirements through a focused, professional conversation.

Rules:
- Ask ONE question at a time
- Maximum 6-8 questions total for intake
- Questions: name, business, email, project type, scope (1-2 sentences), timeline, budget range
- Do NOT discuss pricing yet
- Do NOT propose solutions yet
- Acknowledge answers briefly, then move to next question
- Once all intake fields are collected, transition to [outline] stage

Current stage: intake
Collected so far: {{json state.intake}}
```

### Stage: Outline

```
You are presenting a structured proposal outline based on the client's project type and Sorted's capabilities.

Context from Sorted repo:
{{repoContext.agentsMd}}

Deliverable templates for {{projectType}}:
{{deliverableTemplates}}

Rules:
- Present 3-4 numbered deliverables
- Each deliverable has a title and 1-2 sentence description
- Use plain, local business language (no buzzwords)
- Wait for client confirmation before proceeding
- If client requests changes, adjust and re-present

Current stage: outline
```

### Stage: Quote

```
Present pricing based on the scoped deliverables.

Pricing rules from repo:
{{repoContext.pricingTs}}

Rules:
- Show total clearly
- Always show 50% deposit / 50% balance structure
- Include payment details (Wise IBAN from config)
- Be transparent, no hidden fees
- If scope is unclear, suggest "Let's discuss" instead of guessing

Current stage: quote
```

### Stage: Review + Sign

```
Present the complete proposal for final review.

Rules:
- Show summary of all deliverables
- Show pricing breakdown
- Ask: "Ready to proceed? Enter your full name to confirm."
- Capture name and timestamp
- Confirm acceptance clearly

Current stage: review → sign
```

## API Surface

### WebSocket Endpoint

```
GET /agents/quote-agent/:clientSlug
Upgrade: websocket

Messages:
- Client → Agent: { "type": "message", "content": "..." }
- Agent → Client: { 
    "type": "response", 
    "content": "...", 
    "stage": "intake|outline|quote|review|sign|complete",
    "proposalDelta?: Partial<ProposalOutput>
  }
```

### HTTP Endpoints

```
POST /api/quote        # Create new quote agent instance
GET  /api/quote/:id    # Get current proposal state
POST /api/quote/:id/sign # Submit signature
GET  /api/quote/:id/export # Export proposal as JSON
```

## Cost Model

- **Cloudflare Workers**: Free tier (100k requests/day)
- **Durable Objects**: $0.12/million requests + storage
- **Workers AI** (optional): ~$0.10-0.50/million tokens (llama-4-scout is cheap)
- **OpenAI** (alternative): gpt-4.1-mini at ~$0.60/million tokens

For ~20 quotes/month: <$5 total cost.

## V1 Scope (MVP)

- [ ] Basic Agent with 5-stage state machine
- [ ] GitHub repo context fetching
- [ ] Intake conversation (8 questions)
- [ ] Outline generation for 3 project types (website, ecommerce, cms-addon)
- [ ] Quote presentation with fixed pricing tiers
- [ ] Signature capture
- [ ] Proposal JSON export
- [ ] Simple React frontend for chat UI

## V2 Scope (Future)

- [ ] Email notifications (client + Sorted)
- [ ] Proposal PDF generation
- [ ] Follow-up scheduling
- [ ] Integration with SortedUpdates for auto-site-creation
- [ ] MCP tool exposure for other agents

## Success Criteria

1. Agent completes intake in < 5 minutes of conversation
2. Generated proposal matches existing Sorted proposal structure
3. Pricing aligns with sorted/lib/pricing.ts tiers
4. No hallucinated deliverables—only what's in repo context
5. Client can sign with name + see confirmation
6. Proposal JSON is valid and renderable by proposal page template

## Reference Implementations

- Cloudflare Agents: https://github.com/cloudflare/agents/tree/main/examples
- Sorted pricing: `rennyreign/sorted/lib/pricing.ts`
- Proposal pages: `rennyreign/sorted/app/proposals/*/page.tsx`
- Client delivery pages: `rennyreign/sorted/app/clients/*/page.tsx`
