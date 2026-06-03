import { AIChatAgent } from 'agents-sdk';
import type { QuoteAgentState, QuoteStage, IntakeData, ProposalOutput } from './types';
import { GitHubClient, formatRepoContext } from './github';
import { buildChatPrompt } from './prompts';

// Environment interface
export interface Env {
  GITHUB_TOKEN: string;
  OPENAI_API_KEY?: string;
  AI: Ai;
  QUOTE_AGENT: DurableObjectNamespace<QuoteAgent>;
  QUOTE_CACHE?: KVNamespace;
}

// Wise payment details (from environment or hardcoded defaults)
const WISE_PAYMENT = {
  bankName: 'Wise',
  accountName: 'Renaldo Lee Edmondson',
  iban: 'BE42 9671 7255 2454',
  bankAddress: 'Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium'
};

export class QuoteAgent extends AIChatAgent<Env> {
  // Agent state stored in SQLite via this.sql
  private state: QuoteAgentState = {
    clientSlug: '',
    stage: 'intake',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    intake: {},
    proposal: {},
    conversationHistory: []
  };

  // Initialize agent on first request
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const clientSlug = url.pathname.split('/').pop() || 'unknown';
    
    // Load existing state if available
    await this.loadState();
    
    // If new agent, initialize
    if (!this.state.clientSlug) {
      this.state.clientSlug = clientSlug;
      
      // Fetch repo context for new agents
      const github = new GitHubClient(this.env.GITHUB_TOKEN);
      try {
        const context = await github.fetchRepoContext();
        this.state.repoContext = {
          ...context,
          fetchedAt: new Date().toISOString()
        };
      } catch (e) {
        console.error('Failed to fetch repo context:', e);
        // Continue without context - will use fallback prompts
      }
      
      await this.saveState();
    }

    return super.onRequest(request);
  }

  // Handle incoming chat messages
  async onChatMessage(connection: WebSocket, message: string): Promise<void> {
    // Reload state to get latest
    await this.loadState();
    
    // Add user message to history
    this.state.conversationHistory.push({ role: 'user', content: message });
    
    // Process message and determine next state
    const response = await this.processMessage(message);
    
    // Add assistant response to history
    this.state.conversationHistory.push({ role: 'assistant', content: response.content });
    
    // Update stage if changed
    if (response.stage) {
      this.state.stage = response.stage;
    }
    
    // Update proposal data if provided
    if (response.proposalDelta) {
      this.mergeProposalDelta(response.proposalDelta);
    }
    
    this.state.updatedAt = new Date().toISOString();
    await this.saveState();
    
    // Send response back to client
    connection.send(JSON.stringify({
      type: 'response',
      content: response.content,
      stage: this.state.stage,
      isComplete: this.state.stage === 'complete'
    }));
  }

  // Core message processing logic
  private async processMessage(message: string): Promise<{
    content: string;
    stage: QuoteStage;
    proposalDelta?: Partial<ProposalOutput>;
  }> {
    const currentStage = this.state.stage;
    
    // Stage transition detection (simple keyword-based)
    const lowerMessage = message.toLowerCase();
    
    // Check for stage transitions based on content and current stage
    let nextStage = currentStage;
    
    if (currentStage === 'intake' && this.isIntakeComplete()) {
      nextStage = 'outline';
    } else if (currentStage === 'outline' && (lowerMessage.includes('yes') || lowerMessage.includes('looks good'))) {
      nextStage = 'quote';
    } else if (currentStage === 'quote' && (lowerMessage.includes('review') || lowerMessage.includes('ready'))) {
      nextStage = 'review';
    } else if (currentStage === 'review' && message.length > 3 && !lowerMessage.includes('?')) {
      // Assume name entry if non-question text provided
      nextStage = 'sign';
      this.state.proposal.signerName = message.trim();
      this.state.proposal.signedAt = new Date().toISOString();
    } else if (currentStage === 'sign') {
      nextStage = 'complete';
    }

    // Extract intake data during intake stage
    if (currentStage === 'intake') {
      this.extractIntakeData(message);
    }

    // Build AI prompt
    const messages = buildChatPrompt(
      nextStage,
      this.state.repoContext || { fetchedAt: '', agentsMd: '', doctrineMd: '', pricingTs: '', proposalExamples: [] },
      this.state.intake,
      this.state.conversationHistory
    );

    // Get AI response
    const aiResponse = await this.callAI(messages);
    
    return {
      content: aiResponse,
      stage: nextStage
    };
  }

  // Call AI model (Workers AI or OpenAI)
  private async callAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    // Prefer OpenAI if key available, otherwise use Workers AI
    if (this.env.OPENAI_API_KEY) {
      return this.callOpenAI(messages);
    }
    return this.callWorkersAI(messages);
  }

  private async callOpenAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // Cheap, fast, capable
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    
    return data.choices[0]?.message?.content || 'I apologize, I had trouble generating a response.';
  }

  private async callWorkersAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    // Use llama-4-scout (fast, cheap, good for structured tasks)
    const response = await this.env.AI.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
      messages,
      max_tokens: 500
    });

    return response.response || 'I apologize, I had trouble generating a response.';
  }

  // Check if all intake fields are collected
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

  // Extract structured data from conversation during intake
  private extractIntakeData(message: string): void {
    const lowerMsg = message.toLowerCase();
    
    // Simple extraction patterns (can be enhanced with AI in v2)
    if (!this.state.intake.clientName && message.length < 50 && !message.includes('@')) {
      this.state.intake.clientName = message.trim();
    } else if (!this.state.intake.email && message.includes('@')) {
      const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        this.state.intake.email = emailMatch[0];
      }
    } else if (!this.state.intake.projectType) {
      if (lowerMsg.includes('shopify') || lowerMsg.includes('shop') || lowerMsg.includes('store')) {
        this.state.intake.projectType = 'ecommerce';
      } else if (lowerMsg.includes('cms') || lowerMsg.includes('edit')) {
        this.state.intake.projectType = 'cms-addon';
      } else if (lowerMsg.includes('website') || lowerMsg.includes('site')) {
        this.state.intake.projectType = 'website';
      }
    }
    
    // Store as scope description if longer message and no scope yet
    if (!this.state.intake.scopeDescription && message.length > 20) {
      this.state.intake.scopeDescription = message.trim();
    }
  }

  // Merge proposal updates
  private mergeProposalDelta(delta: Partial<ProposalOutput>): void {
    if (delta.content?.deliverables) {
      this.state.proposal.deliverables = delta.content.deliverables;
    }
    if (delta.content?.investment) {
      this.state.proposal.pricing = {
        total: delta.content.investment.total,
        currency: delta.content.investment.currency as 'GBP' | 'EUR' | 'USD',
        depositPercent: delta.content.investment.deposit.percent
      };
    }
  }

  // SQLite state persistence
  private async loadState(): Promise<void> {
    try {
      const result = await this.sql`SELECT state FROM agent_state WHERE id = ${this.ctx.id.toString()}`;
      if (result.length > 0) {
        this.state = JSON.parse(result[0].state as string);
      }
    } catch (e) {
      // Table might not exist yet, ignore
    }
  }

  private async saveState(): Promise<void> {
    // Ensure table exists
    await this.sql`CREATE TABLE IF NOT EXISTS agent_state (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`;
    
    // Upsert state
    await this.sql`
      INSERT INTO agent_state (id, state, updated_at) 
      VALUES (${this.ctx.id.toString()}, ${JSON.stringify(this.state)}, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET 
        state = ${JSON.stringify(this.state)},
        updated_at = ${new Date().toISOString()}
    `;
  }

  // HTTP API for getting proposal data
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // API endpoint: GET /api/quote/:id
    if (url.pathname.startsWith('/api/quote/')) {
      await this.loadState();
      
      if (request.method === 'GET') {
        return new Response(JSON.stringify(this.generateProposalOutput()), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // WebSocket upgrade for chat
    return super.fetch(request);
  }

  // Generate final proposal output
  private generateProposalOutput(): ProposalOutput {
    const i = this.state.intake;
    const p = this.state.proposal;
    
    return {
      meta: {
        clientSlug: this.state.clientSlug,
        clientName: i.clientName || '',
        businessName: i.businessName || '',
        createdAt: this.state.createdAt,
        status: this.state.stage === 'complete' ? 'signed' : 'draft'
      },
      content: {
        salutation: `${i.clientName || 'Client'}`,
        openingLetter: [
          `Following our conversation about your ${i.projectType || 'website'} project, I've put together a straightforward proposal.`,
          `The goal is simple: a clean, modern ${i.projectType === 'ecommerce' ? 'store' : 'site'} that works smoothly and doesn't require technical knowledge to manage.`
        ],
        deliverables: p.deliverables || [],
        timeline: p.timeline || [],
        investment: {
          total: p.pricing?.total || 0,
          currency: p.pricing?.currency || 'GBP',
          deposit: {
            percent: 50,
            amount: (p.pricing?.total || 0) * 0.5,
            due: 'On project commencement'
          },
          balance: {
            percent: 50,
            amount: (p.pricing?.total || 0) * 0.5,
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
        notIncluded: p.notIncluded || [
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
      signature: p.signedAt ? {
        name: p.signerName || '',
        signedAt: p.signedAt
      } : undefined
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
    // POST /api/quote with JSON body { clientSlug: '...' }
    if (url.pathname === '/api/quote' && request.method === 'POST') {
      const body = await request.json() as { clientSlug: string };
      const clientSlug = body.clientSlug || `quote-${Date.now()}`;
      
      // Create/get durable object instance
      const id = env.QUOTE_AGENT.idFromName(clientSlug);
      const agent = env.QUOTE_AGENT.get(id);
      
      // Return connection info
      return new Response(JSON.stringify({
        clientSlug,
        websocketUrl: `/agents/quote-agent/${clientSlug}`,
        apiUrl: `/api/quote/${clientSlug}`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Route to agent instance
    const match = url.pathname.match(/^\/agents\/quote-agent\/(.+)$/);
    if (match) {
      const clientSlug = match[1];
      const id = env.QUOTE_AGENT.idFromName(clientSlug);
      const agent = env.QUOTE_AGENT.get(id);
      return agent.fetch(request);
    }
    
    // API routes for specific agents
    const apiMatch = url.pathname.match(/^\/api\/quote\/(.+)$/);
    if (apiMatch) {
      const clientSlug = apiMatch[1];
      const id = env.QUOTE_AGENT.idFromName(clientSlug);
      const agent = env.QUOTE_AGENT.get(id);
      return agent.fetch(request);
    }
    
    return new Response('Not found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;
