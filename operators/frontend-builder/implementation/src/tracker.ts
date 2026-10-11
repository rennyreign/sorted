// ─────────────────────────────────────────────────────────────
// Token usage tracker — dependency-free.
// Lives outside claude.ts so importing it never loads the SDK.
// ─────────────────────────────────────────────────────────────

export class TokenTracker {
  private inputTotal = 0;
  private outputTotal = 0;
  private calls = 0;

  record(result: { inputTokens: number; outputTokens: number }): void {
    this.inputTotal += result.inputTokens;
    this.outputTotal += result.outputTokens;
    this.calls++;
  }

  summary(): string {
    const totalTokens = this.inputTotal + this.outputTotal;
    const estimatedCostUSD =
      (this.inputTotal / 1_000_000) * 3 +
      (this.outputTotal / 1_000_000) * 15;
    return [
      `  Calls    : ${this.calls}`,
      `  Tokens   : ${totalTokens.toLocaleString()} (${this.inputTotal.toLocaleString()} in / ${this.outputTotal.toLocaleString()} out)`,
      `  Est. cost: ~$${estimatedCostUSD.toFixed(3)}`,
    ].join('\n');
  }
}
