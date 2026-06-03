# Sorted Quote Agent

A semi-deterministic AI agent that conducts client intake conversations and generates structured proposals following the Sorted design pattern.

## What It Does

1. **Intake** — Conversationally gathers: name, business, email, project type, scope, timeline, budget
2. **Outline** — Presents 3-4 clear deliverables based on project type + Sorted capabilities
3. **Quote** — Shows transparent pricing with 50% deposit / 50% balance structure
4. **Review** — Full proposal presentation with "not included" clarity
5. **Sign** — Name capture + timestamp confirmation

## Architecture

Built on **Cloudflare Agents** (Durable Objects + WebSockets):
- Each client conversation = one persistent Agent instance
- SQLite state storage for conversation history and proposal data
- GitHub repo context fetched at initialization
- Supports both Workers AI (llama-4-scout) and OpenAI (gpt-4.1-mini)

## File Structure

```
implementation/
├── src/
│   ├── index.ts      # Agent class + HTTP routes
│   ├── github.ts     # GitHub API for repo context
│   ├── prompts.ts    # Stage-specific system prompts
│   ├── types.ts      # TypeScript interfaces
│   └── frontend.tsx  # React chat component
├── package.json
├── wrangler.toml
├── tsconfig.json
├── Makefile          # Common commands
└── .env.example
```

## Setup

```bash
cd implementation

# Full setup (install + secrets)
make init

# Or step by step:
make setup          # Install dependencies
make secrets        # Set GITHUB_TOKEN (required)
make secrets-openai # Optional: OpenAI instead of Workers AI

# Development & Deploy
make dev            # Local development server
make deploy         # Deploy to Cloudflare
make ship           # Type check + deploy
```

## API

### Create new quote
```bash
POST /api/quote
{ "clientSlug": "party-world" }

Response:
{
  "clientSlug": "party-world",
  "websocketUrl": "/agents/quote-agent/party-world",
  "apiUrl": "/api/quote/party-world"
}
```

### WebSocket chat
Connect to `wss://your-worker.com/agents/quote-agent/:clientSlug`

Messages:
```json
// Send
{ "type": "message", "content": "Hi, I need a website" }

// Receive
{
  "type": "response",
  "content": "Hello! I'd be happy to help...",
  "stage": "intake",
  "isComplete": false
}
```

### Get proposal data
```bash
GET /api/quote/:clientSlug

Response: ProposalOutput JSON
```

## Cost

- ~20 quotes/month: **<$5 total**
- Cloudflare Workers: Free tier (100k/day)
- Durable Objects: $0.12/million requests
- Workers AI (llama-4-scout): ~$0.10-0.50/million tokens

## Integration with Sorted

The generated `ProposalOutput` JSON can be fed directly into the Sorted proposal page template at `app/proposals/[client]/page.tsx`.

Example flow:
1. Agent generates proposal → exports JSON
2. Create page at `app/proposals/[slug]/page.tsx`
3. Import proposal JSON as data source
4. Render with existing Sorted styling

## Roadmap

- [ ] Email notifications on completion
- [ ] PDF generation
- [ ] Follow-up scheduling
- [ ] Auto-create client site repo from template
