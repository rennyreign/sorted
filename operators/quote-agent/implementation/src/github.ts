// GitHub API client for fetching Sorted repo context

export interface GitHubFile {
  content: string;
  sha: string;
}

export class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  async fetchFile(owner: string, repo: string, path: string): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'sorted-quote-agent'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return ''; // File not found, return empty
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { content: string; encoding: string };
    
    // GitHub returns base64 encoded content
    if (data.encoding === 'base64') {
      return atob(data.content);
    }
    
    return data.content || '';
  }

  async fetchRepoContext(): Promise<{
    agentsMd: string;
    doctrineMd: string;
    pricingTs: string;
    proposalExamples: string[];
  }> {
    const owner = 'rennyreign';
    const repo = 'sorted';

    // Fetch key files in parallel
    const [agentsMd, doctrineMd, pricingTs] = await Promise.all([
      this.fetchFile(owner, repo, 'AGENTS.md'),
      this.fetchFile(owner, repo, 'doctrine/sorted-operating-model.md'),
      this.fetchFile(owner, repo, 'lib/pricing.ts')
    ]);

    // Fetch a couple of proposal examples for reference
    const proposalPaths = [
      'proposals/Party World.md',
      'app/proposals/party-world/page.tsx'
    ];
    
    const proposalExamples = await Promise.all(
      proposalPaths.map(path => this.fetchFile(owner, repo, path))
    );

    return {
      agentsMd: this.truncate(agentsMd, 8000),
      doctrineMd: this.truncate(doctrineMd, 4000),
      pricingTs: this.truncate(pricingTs, 3000),
      proposalExamples: proposalExamples.filter(p => p.length > 0)
    };
  }

  private truncate(content: string, maxChars: number): string {
    if (content.length <= maxChars) return content;
    return content.slice(0, maxChars) + '\n... [truncated]';
  }
}

// Helper to generate context summary for prompts
export function formatRepoContext(context: {
  agentsMd: string;
  doctrineMd: string;
  pricingTs: string;
  proposalExamples: string[];
}): string {
  return `
# Sorted Operating Context

## Business Model
${context.doctrineMd.slice(0, 2000)}

## Tech Stack & Capabilities
${context.agentsMd.slice(0, 3000)}

## Pricing Reference
${context.pricingTs}

## Proposal Format Reference
The following shows typical proposal structure and language:
${context.proposalExamples[0]?.slice(0, 2000) || ''}
`;
}
