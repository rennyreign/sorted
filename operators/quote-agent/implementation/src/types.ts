// Quote Agent Type Definitions

export type QuoteStage = 'intake' | 'outline' | 'quote' | 'review' | 'sign' | 'complete';

export type ProjectType = 'website' | 'ecommerce' | 'cms-addon' | 'other';

export type TimelineOption = 'asap' | '2-4weeks' | 'flexible';

export type BudgetRange = '<500' | '500-1000' | '1000-2000' | '2000+' | 'discuss';

export interface IntakeData {
  clientName: string;
  businessName: string;
  email: string;
  phone?: string;
  projectType: ProjectType;
  scopeDescription: string;
  hasExistingSite: boolean;
  timeline: TimelineOption;
  budgetRange: BudgetRange;
}

export interface Deliverable {
  num: string;
  title: string;
  body: string;
}

export interface TimelineItem {
  stage: string;
  desc: string;
}

export interface Pricing {
  total: number;
  currency: 'GBP' | 'EUR' | 'USD';
  depositPercent: number;
  breakdown?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  iban?: string;
  accountNumber?: string;
  sortCode?: string;
  bankAddress?: string;
}

export interface ProposalData {
  title: string;
  deliverables: Deliverable[];
  timeline: TimelineItem[];
  pricing: Pricing;
  paymentDetails: PaymentDetails;
  notIncluded: string[];
  afterLaunch: string[];
  openingLetter: string[];
  closingLetter: string[];
  signedAt?: string;
  signerName?: string;
}

export interface RepoContext {
  fetchedAt: string;
  agentsMd: string;
  doctrineMd: string;
  pricingTs: string;
  proposalExamples: string[];
}

export interface QuoteAgentState {
  clientSlug: string;
  stage: QuoteStage;
  createdAt: string;
  updatedAt: string;
  intake: Partial<IntakeData>;
  proposal: Partial<ProposalData>;
  repoContext?: RepoContext;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Output format for generated proposal
export interface ProposalOutput {
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

// WebSocket message types
export interface ClientMessage {
  type: 'message';
  content: string;
}

export interface AgentResponse {
  type: 'response';
  content: string;
  stage: QuoteStage;
  proposalDelta?: Partial<ProposalOutput>;
  isComplete?: boolean;
}

export interface AgentStateUpdate {
  type: 'state';
  state: QuoteAgentState;
}
