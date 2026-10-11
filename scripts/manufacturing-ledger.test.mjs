import test from "node:test"
import assert from "node:assert/strict"
import { summarise } from "./manufacturing-ledger.mjs"

const start = (id, revision = "v1", input = "pack") => ({
  event: "start", attempt_id: id, source_revision: revision, input_sha256: input,
})
const finish = (id, result = "passed", extras = {}) => ({
  event: "finish", attempt_id: id, input_sha256: "pack", result,
  elapsed_seconds: 10, human_minutes: null, billed_cost_usd: null, ...extras,
})

test("unknown labour and billed cost do not become zero; estimates remain separate", () => {
  const result = summarise([start("a"), finish("a", "passed", { estimated_cost_usd: 0.2 })], "v1", "pack")
  assert.equal(result.human_minutes, null)
  assert.equal(result.billed_cost_usd, null)
  assert.equal(result.estimated_cost_usd_recorded, 0.2)
  assert.equal(result.unknown_billed_cost_attempts, 1)
})

test("all recorded attempts, including older correction revisions, contribute to accepted-job cost", () => {
  const result = summarise([
    start("a"), finish("a", "failed", { human_minutes: 3, billed_cost_usd: 0.25 }),
    start("b", "v2"), finish("b", "passed", { human_minutes: 2, billed_cost_usd: 0.5 }),
  ], "v2", "pack")
  assert.equal(result.attempts, 2)
  assert.equal(result.failed_attempts, 1)
  assert.equal(result.human_minutes, 5)
  assert.equal(result.billed_cost_usd, 0.75)
  assert.equal(result.recorded_elapsed_seconds, 20)
})

test("unfinished work prevents claiming complete labour/cost coverage", () => {
  const result = summarise([
    start("a"), finish("a", "passed", { human_minutes: 3, billed_cost_usd: 0 }),
    start("b"),
  ], "v1", "pack")
  assert.equal(result.incomplete_attempts, 1)
  assert.equal(result.human_minutes, null)
  assert.equal(result.billed_cost_usd, null)
  assert.equal(result.known_human_minutes, 3)
})

test("old input attempts and changed-source acceptance do not count for current milestone", () => {
  const accept = { event: "accept", kind: "stage1", input_sha256: "pack", source_revision: "v1" }
  const result = summarise([start("a", "v1", "old-pack"), accept], "v2", "pack")
  assert.equal(result.attempts, 0)
  assert.equal(result.accepted.stage1, null)
})

test("repeated acceptance is one milestone, not multiple completed websites", () => {
  const record = { event: "accept", kind: "stage1", input_sha256: "pack", source_revision: "v1" }
  const result = summarise([record, { ...record, accepted_by: "second-reviewer" }], "v1", "pack")
  assert.equal(result.accepted.stage1.accepted_by, "second-reviewer")
  assert.equal(result.accepted.workspace, null)
  assert.equal(result.accepted.launch, null)
})
