import { evaluateMockupFidelity } from '../operators/factory-orchestrator/dist/mockup-fidelity.js';

try {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/manufacturing-mockup-gate.mjs <job-directory>');
  const decision = evaluateMockupFidelity(process.argv[2]);
  console.log(JSON.stringify(decision, null, 2));
  process.exitCode = decision.fidelity_passed ? 0 : 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
