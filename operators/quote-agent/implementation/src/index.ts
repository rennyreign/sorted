import { AIChatAgent } from '@cloudflare/ai-chat';
import type { OnChatMessageOptions } from '@cloudflare/ai-chat';
import { routeAgentRequest } from 'agents';
import { streamText, convertToModelMessages } from 'ai';
import type { StreamTextOnFinishCallback, ToolSet } from 'ai';
import { createWorkersAI } from 'workers-ai-provider';
import { createOpenAI } from '@ai-sdk/openai';
import type { QuoteAgentState, QuoteStage, IntakeData, ProposalOutput } from './types';
import { GitHubClient } from './github';
import { buildSystemPrompt } from './prompts';

// Environment interface
export interface Env {
  GITHUB_TOKEN: string;
  OPENAI_API_KEY?: string;
  AI: Ai;
  QUOTE_AGENT: DurableObjectNamespace<QuoteAgent>;
  QUOTE_CACHE?: KVNamespace;
}

// Wise payment details
const WISE_PAYMENT = {
  bankName: 'Wise',
  accountName: 'Renaldo Lee Edmondson',
  iban: 'BE42 9671 7255 2454',
  bankAddress: 'Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium'
};

// Agent state shape stored via this.setState()
type AgentState = QuoteAgentState & { _initialized?: boolean };

export class QuoteAgent extends AIChatAgent<Env, AgentState> {
  initialState: AgentState = {
    clientSlug: '',
    stage: 'intake',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    intake: {},
    proposal: {},
    conversationHistory: []
  };

  // Initialise repo context on first request
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes before handing off to the base chat handler
    if (url.pathname.startsWith('/api/quote/') && request.method === 'GET') {
      return new Response(JSON.stringify(this.generateProposalOutput()), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Bootstrap state on first visit
    if (!this.state._initialized) {
      const parts = url.pathname.split('/');
      const clientSlug = parts[parts.length - 1] || `quote-${Date.now()}`;

      const patch: Partial<AgentState> = {
        clientSlug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _initialized: true
      };

      // Fetch repo context once
      try {
        const github = new GitHubClient(this.env.GITHUB_TOKEN);
        const context = await github.fetchRepoContext();
        patch.repoContext = { ...context, fetchedAt: new Date().toISOString() };
      } catch (e) {
        console.error('Failed to fetch repo context:', e);
      }

      this.setState({ ...this.state, ...patch });
    }

    return super.onRequest(request);
  }

  // Core chat handler — called by AIChatAgent for each user message
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: OnChatMessageOptions
  ): Promise<Response> {
    // Derive current stage from state
    const currentStage = this.state.stage;

    // Inspect the last user message for stage transitions
    const lastUserMsg = [...this.messages].reverse().find(m => m.role === 'user');
    const userText = lastUserMsg
      ? (lastUserMsg.parts?.find((p: { type: string }) => p.type === 'text') as { type: 'text'; text: string } | undefined)?.text ?? ''
      : '';

    const nextStage = this.resolveNextStage(currentStage, userText);

    // Extract intake fields if still in intake stage
    if (currentStage === 'intake') {
      this.extractIntakeData(userText);
    }

    // Capture signer name in review stage
    if (currentStage === 'review' && userText.length > 2 && !userText.includes('?')) {
      this.setState({
        ...this.state,
        proposal: {
          ...this.state.proposal,
          signerName: userText.trim(),
          signedAt: new Date().toISOString()
        }
      });
    }

    // Advance stage
    if (nextStage !== currentStage) {
      this.setState({ ...this.state, stage: nextStage, updatedAt: new Date().toISOString() });
    }

    // Build system prompt for this stage
    const systemPrompt = buildSystemPrompt(
      nextStage,
      this.state.repoContext ?? { fetchedAt: '', agentsMd: '', doctrineMd: '', pricingTs: '', proposalExamples: [] },
      this.state.intake
    );

    // Call AI model
    if (this.env.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: this.env.OPENAI_API_KEY });
      const result = streamText({
        model: openai('gpt-4.1-mini'),
        system: systemPrompt,
        messages: await convertToModelMessages(this.messages),
        maxOutputTokens: 500,
        onFinish
      });
      return result.toUIMessageStreamResponse();
    }

    // Workers AI fallback
    const workersai = createWorkersAI({ binding: this.env.AI });
    const result = streamText({
      model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
      system: systemPrompt,
      messages: await convertToModelMessages(this.messages),
      maxOutputTokens: 500,
      onFinish
    });
    return result.toUIMessageStreamResponse();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Stage machine
  // ──────────────────────────────────────────────────────────────────────────

  private resolveNextStage(current: QuoteStage, userText: string): QuoteStage {
    const lower = userText.toLowerCase();

    switch (current) {
      case 'intake':
        return this.isIntakeComplete() ? 'outline' : 'intake';
      case 'outline':
        return lower.includes('yes') || lower.includes('looks good') || lower.includes('ok') || lower.includes('sure')
          ? 'quote'
          : 'outline';
      case 'quote':
        return lower.includes('review') || lower.includes('ready') || lower.includes('yes') || lower.includes('ok')
          ? 'review'
          : 'quote';
      case 'review':
        // Non-question text of reasonable length → treat as signature
        return userText.length > 2 && !userText.includes('?') ? 'sign' : 'review';
      case 'sign':
        return 'complete';
      default:
        return current;
    }
  }

  private isIntakeComplete(): boolean {
    const i = this.state.intake;
    return !!(
      i.clientName &&
      i.businessName &&
      i.email &&
      i.projectType &&
      i.scopeDescription &&
      i.timeline &&
      i.budgetRange
    );
  }

  // Simple heuristic extraction during intake conversation
  private extractIntakeData(message: string): void {
    const lower = message.toLowerCase();
    const intake = { ...this.state.intake };
    let changed = false;

    if (!intake.clientName && message.length < 50 && !message.includes('@')) {
      intake.clientName = message.trim();
      changed = true;
    } else if (!intake.email && message.includes('@')) {
      const m = message.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (m) { intake.email = m[0]; changed = true; }
    } else if (!intake.projectType) {
      if (lower.includes('shopify') || lower.includes('shop') || lower.includes('store')) {
        intake.projectType = 'ecommerce'; changed = true;
      } else if (lower.includes('cms') || lower.includes('edit')) {
        intake.projectType = 'cms-addon'; changed = true;
      } else if (lower.includes('website') || lower.includes('site')) {
        intake.projectType = 'website'; changed = true;
      }
    }

    if (!intake.scopeDescription && message.length > 20) {
      intake.scopeDescription = message.trim();
      changed = true;
    }

    if (changed) {
      this.setState({ ...this.state, intake });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Proposal output
  // ──────────────────────────────────────────────────────────────────────────

  private generateProposalOutput(): ProposalOutput {
    const i = this.state.intake;
    const p = this.state.proposal;

    return {
      meta: {
        clientSlug: this.state.clientSlug,
        clientName: i.clientName ?? '',
        businessName: i.businessName ?? '',
        createdAt: this.state.createdAt,
        status: this.state.stage === 'complete' ? 'signed' : 'draft'
      },
      content: {
        salutation: `${i.clientName ?? 'Client'}`,
        openingLetter: [
          `Following our conversation about your ${i.projectType ?? 'website'} project, I've put together a straightforward proposal.`,
          `The goal is simple: a clean, modern ${i.projectType === 'ecommerce' ? 'store' : 'site'} that works smoothly and doesn't require technical knowledge to manage.`
        ],
        deliverables: p.deliverables ?? [],
        timeline: p.timeline ?? [],
        investment: {
          total: p.pricing?.total ?? 0,
          currency: p.pricing?.currency ?? 'GBP',
          deposit: {
            percent: 50,
            amount: (p.pricing?.total ?? 0) * 0.5,
            due: 'On project commencement'
          },
          balance: {
            percent: 50,
            amount: (p.pricing?.total ?? 0) * 0.5,
            due: 'Before final handover'
          }
        },
        paymentDetails: WISE_PAYMENT,
        afterLaunch: [
          'A site you can manage without technical knowledge',
          'Tutorial guidance on making edits',
          'Documentation on managing content',
          'A structure that allows future expansion'
        ],
        notIncluded: p.notIncluded ?? [
          'Professional photography/copywriting',
          'Paid advertising management',
          'Advanced SEO/content marketing',
          'Ongoing maintenance retainers'
        ],
        closingLetter: [
          `The aim is something that feels modern and visually clean, easy to navigate, simple to manage, and ready to grow as your business grows.`,
          `If this looks right, reply to confirm and I'll send over the deposit invoice to get started. Any questions, just ask.`,
          `Renaldo`,
          `Sorted`
        ]
      },
      signature: p.signedAt
        ? { name: p.signerName ?? '', signedAt: p.signedAt }
        : undefined
    };
  }
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Create new quote agent instance
    if (url.pathname === '/api/quote' && request.method === 'POST') {
      const body = await request.json() as { clientSlug?: string };
      const clientSlug = body.clientSlug ?? `quote-${Date.now()}`;

      return new Response(JSON.stringify({
        clientSlug,
        websocketUrl: `/agents/quote-agent/${clientSlug}`,
        apiUrl: `/api/quote/${clientSlug}`
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Delegate all /agents/* routes and DO requests to routeAgentRequest
    const routed = await routeAgentRequest(request, env);
    return routed ?? new Response('Not found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;
