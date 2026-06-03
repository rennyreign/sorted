/**
 * Minimal React frontend for Quote Agent chat
 * 
 * Usage in a Next.js app (or any React app):
 * 
 * import { QuoteAgentChat } from './frontend';
 * 
 * export default function QuotePage() {
 *   return <QuoteAgentChat agentUrl="wss://your-worker.com/agents/quote-agent/party-world" />;
 * }
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  stage?: string;
}

interface QuoteAgentChatProps {
  agentUrl: string;
  apiUrl?: string;
  onComplete?: (proposal: unknown) => void;
}

export function QuoteAgentChat({ agentUrl, apiUrl, onComplete }: QuoteAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState('intake');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket(agentUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'response') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          stage: data.stage
        }]);
        setCurrentStage(data.stage);
        
        if (data.isComplete) {
          setIsComplete(true);
          // Fetch final proposal
          if (apiUrl) {
            fetch(apiUrl)
              .then(r => r.json())
              .then(onComplete)
              .catch(console.error);
          }
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [agentUrl, apiUrl, onComplete]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !wsRef.current || !isConnected) return;

    const message = { type: 'message', content: input.trim() };
    wsRef.current.send(JSON.stringify(message));
    
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    setInput('');
  }, [input, isConnected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Stage indicator labels
  const stageLabels: Record<string, string> = {
    intake: 'Getting Details',
    outline: 'Defining Scope',
    quote: 'Presenting Pricing',
    review: 'Final Review',
    sign: 'Confirmation',
    complete: 'Complete'
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl border border-black/[0.08] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/[0.08] flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-[#0A0A0A] text-lg">Sorted Quote</h2>
          <p className="text-xs text-[#A3A3A3] font-mono">
            {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#525252] font-mono uppercase tracking-wide">
            {stageLabels[currentStage] || currentStage}
          </span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#A3A3A3] text-sm">
              Starting your quote conversation...
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-black/[0.04] text-[#0A0A0A]'
              }`}
            >
              {msg.content}
              {msg.stage && msg.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-black/[0.08]">
                  <span className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-wider">
                    {msg.stage}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-black/[0.08] bg-black/[0.02]">
        {isComplete ? (
          <div className="text-center py-2">
            <p className="text-green-700 text-sm font-medium">
              Proposal complete! Check your email for next steps.
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={!isConnected}
              className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-xl text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !input.trim()}
              className="bg-[#0A0A0A] text-white font-semibold text-sm rounded-xl px-5 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="px-6 py-3 bg-black/[0.02] border-t border-black/[0.06]">
        <div className="flex gap-1">
          {['intake', 'outline', 'quote', 'review', 'sign'].map((stage, idx) => {
            const isActive = stage === currentStage;
            const isPast = ['intake', 'outline', 'quote', 'review', 'sign'].indexOf(currentStage) > idx;
            
            return (
              <div
                key={stage}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  isActive ? 'bg-[#0A0A0A]' : isPast ? 'bg-black/[0.3]' : 'bg-black/[0.08]'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Example standalone page component
export function QuoteAgentPage({ 
  clientSlug,
  workerDomain = 'sorted-quote-agent.your-subdomain.workers.dev'
}: {
  clientSlug: string;
  workerDomain?: string;
}) {
  const [proposal, setProposal] = useState<Record<string, unknown> | null>(null);

  const agentUrl = `wss://${workerDomain}/agents/quote-agent/${clientSlug}`;
  const apiUrl = `https://${workerDomain}/api/quote/${clientSlug}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-3xl tracking-tight mb-2">
            Get Your Quote
          </h1>
          <p className="text-[#737373]">
            A quick conversation to understand your project and provide a clear proposal.
          </p>
        </div>

        <QuoteAgentChat 
          agentUrl={agentUrl} 
          apiUrl={apiUrl}
          onComplete={setProposal}
        />

        {proposal && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="font-semibold text-green-800 mb-2">Proposal Generated</h3>
            <pre className="text-xs text-green-700 overflow-auto">
              {JSON.stringify(proposal, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
