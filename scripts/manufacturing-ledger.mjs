import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const phases = new Set([
  "intake", "asset-registry", "frontend-build", "visual-qa", "human-vision-qa",
  "pixel-correction", "ui-systemisation", "design-system", "core-build-qa",
  "human-assessment", "workspace-build", "internal-pages", "cms-integration",
  "cms-qa", "analytics", "launch-qa", "deployment",
])
const milestones = new Set(["stage1", "workspace", "launch"])
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex")

function readRecords(file) {
  if (!fs.existsSync(file)) return []
  if (!fs.lstatSync(file).isFile()) throw new Error("Ledger must be a regular file")
  const records = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line))
  const starts = new Map()
  const finished = new Set()
  for (const record of records) {
    if (record.schema_version !== 1 || !record.job_id || !Number.isFinite(Date.parse(record.at)) ||
        !/^[a-f0-9]{64}$/.test(record.input_sha256 ?? "") || !/^[a-f0-9]{64}$/.test(record.source_revision ?? "")) {
      throw new Error("Malformed ledger metadata; repair explicitly before deriving measurements")
    }
    if (record.event === "start") {
      if (!record.attempt_id || starts.has(record.attempt_id) || !phases.has(record.phase) || !record.tool) throw new Error("Malformed/duplicate attempt start")
      starts.set(record.attempt_id, record)
    } else if (record.event === "finish") {
      const start = starts.get(record.attempt_id)
      if (!start || finished.has(record.attempt_id) || record.input_sha256 !== start.input_sha256 ||
          record.phase !== start.phase || !["passed", "failed", "interrupted"].includes(record.result)) {
        throw new Error("Malformed/duplicate attempt finish")
      }
      const elapsed = (Date.parse(record.at) - Date.parse(start.at)) / 1000
      if (elapsed < 0 || elapsed !== record.elapsed_seconds) throw new Error("Inconsistent attempt duration")
      for (const key of ["human_minutes", "billed_cost_usd", "estimated_cost_usd", "input_tokens", "output_tokens"]) {
        if (record[key] !== null && (typeof record[key] !== "number" || !Number.isFinite(record[key]) || record[key] < 0)) throw new Error("Invalid recorded measurement")
      }
      finished.add(record.attempt_id)
    } else if (record.event === "accept") {
      if (!milestones.has(record.kind) || !record.accepted_by || !Array.isArray(record.evidence) || !record.evidence.length) {
        throw new Error("Malformed milestone acceptance")
      }
    } else {
      throw new Error("Unknown ledger event")
    }
  }
  return records
}

function number(value, label, integer = false) {
  if (value === undefined) return null
  const n = Number(value)
  if (String(value).trim() === "" || !Number.isFinite(n) || n < 0 || (integer && !Number.isInteger(n))) {
    throw new Error(`${label} must be a nonnegative ${integer ? "integer" : "number"}`)
  }
  return n
}

function parse(argv) {
  const [command, jobDir, ...rest] = argv
  const flags = {}
  for (let i = 0; i < rest.length; i += 2) {
    if (!rest[i]?.startsWith("--") || !rest[i + 1] || rest[i + 1].startsWith("--")) {
      throw new Error("Options require --name value")
    }
    const key = rest[i].slice(2)
    if (Object.hasOwn(flags, key)) throw new Error(`Duplicate option: ${key}`)
    flags[key] = rest[i + 1]
  }
  return { command, jobDir, flags }
}

function required(flags, key) {
  if (!flags[key]?.trim()) throw new Error(`Missing --${key}`)
  return flags[key].trim()
}

async function revision(jobDir) {
  const modulePath = path.join(root, "operators/factory-orchestrator/dist/revision.js")
  if (!fs.existsSync(modulePath)) throw new Error("Compile the factory before using the ledger")
  const { fingerprintSource } = await import(pathToFileURL(modulePath).href)
  return fingerprintSource(jobDir)
}

function localFile(jobDir, relative) {
  if (!relative || path.isAbsolute(relative)) throw new Error("Evidence path must be relative to the job")
  const resolved = path.resolve(jobDir, relative)
  if (!resolved.startsWith(jobDir + path.sep)) throw new Error("Evidence path escapes the job")
  if (!fs.lstatSync(resolved).isFile() || fs.realpathSync(resolved) !== resolved) {
    throw new Error("Evidence must be a regular file inside the job")
  }
  return resolved
}

function validateMilestone(jobDir, state, kind, sourceRevision, inputSha) {
  const requiredOps = kind === "stage1"
    ? ["frontend-build", "visual-qa", "human-vision-qa", "core-build-qa"]
    : kind === "workspace"
      ? ["human-vision-qa", "core-build-qa", "human-assessment", "workspace-build"]
      : ["human-vision-qa", "core-build-qa", "human-assessment", "internal-pages", "cms-integration", "cms-qa", "analytics", "launch-qa"]
  const evidence = []
  for (const id of requiredOps) {
    const op = state.operators?.[id]
    if (op?.status !== "passed") throw new Error(`Milestone requires ${id} passed`)
    const file = localFile(jobDir, op.artifact_path)
    const artifact = JSON.parse(fs.readFileSync(file, "utf8"))
    // Build evidence can precede systemisation; the independent gates must be current.
    const currentRequired = ["visual-qa", "human-vision-qa", "core-build-qa", "human-assessment", "workspace-build", "launch-qa"].includes(id)
    if (currentRequired && (artifact.source_revision !== sourceRevision || artifact.input_sha256 !== inputSha)) {
      throw new Error(`Stale ${id} evidence`)
    }
    if (id === "frontend-build" && artifact.build_passed !== true) throw new Error("Build did not pass")
    if (["visual-qa", "human-vision-qa"].includes(id) && (artifact.passed !== true || artifact.blocker_count !== 0)) {
      throw new Error(`${id} has not independently passed`)
    }
    if (["core-build-qa", "workspace-build", "cms-qa"].includes(id) && artifact.overall_passed !== true) {
      throw new Error(`${id} has not passed`)
    }
    if (id === "human-assessment" && artifact.decision !== "approved") throw new Error("Human approval is absent")
    if (id === "launch-qa" && !["PASS", "PASS_WITH_WARNINGS"].includes(artifact.status)) throw new Error("Launch QA failed")
    evidence.push({ path: path.relative(jobDir, file), sha256: hash(fs.readFileSync(file)) })
  }
  return evidence
}

export function summarise(records, currentRevision, inputSha) {
  const starts = records.filter((r) => r.event === "start" && r.input_sha256 === inputSha)
  const finishes = records.filter((r) => r.event === "finish" && r.input_sha256 === inputSha)
  const completed = starts.map((s) => ({ start: s, finish: finishes.find((f) => f.attempt_id === s.attempt_id) }))
  const finished = completed.filter((a) => a.finish)
  const incomplete = completed.filter((a) => !a.finish).length
  const total = (key) => finished.reduce((sum, a) => sum + (a.finish[key] ?? 0), 0)
  const unknown = (key) => finished.filter((a) => a.finish[key] === null || a.finish[key] === undefined).length
  const validAcceptances = records.filter((r) =>
    r.event === "accept" && r.input_sha256 === inputSha && r.source_revision === currentRevision
  )
  const accepted = Object.fromEntries([...milestones].map((kind) => [
    kind, validAcceptances.filter((r) => r.kind === kind).at(-1) ?? null,
  ]))
  return {
    source_revision: currentRevision,
    input_sha256: inputSha,
    attempts: starts.length,
    finished_attempts: finished.length,
    incomplete_attempts: incomplete,
    failed_attempts: finished.filter((a) => a.finish.result === "failed").length,
    interrupted_attempts: finished.filter((a) => a.finish.result === "interrupted").length,
    recorded_elapsed_seconds: total("elapsed_seconds"),
    human_minutes: incomplete || unknown("human_minutes") ? null : (finished.length ? total("human_minutes") : null),
    known_human_minutes: total("human_minutes"),
    unknown_human_time_attempts: unknown("human_minutes") + incomplete,
    billed_cost_usd: incomplete || unknown("billed_cost_usd") ? null : (finished.length ? total("billed_cost_usd") : null),
    known_billed_cost_usd: total("billed_cost_usd"),
    unknown_billed_cost_attempts: unknown("billed_cost_usd") + incomplete,
    estimated_cost_usd_recorded: total("estimated_cost_usd"),
    unknown_estimated_cost_attempts: unknown("estimated_cost_usd") + incomplete,
    accepted,
    warning: "Recorded elapsed durations are summed service time, not wall-clock lead time or human labour. Historical acceptance is excluded after source/input changes; summary additionally revalidates evidence.",
  }
}

async function main(argv) {
  const { command, jobDir: dir, flags } = parse(argv)
  if (!["start", "finish", "accept", "summary"].includes(command) || !dir) {
    throw new Error("Usage: node scripts/manufacturing-ledger.mjs start|finish|accept|summary <job-dir> [--name value]")
  }
  const allowed = {
    start: ["phase", "tool", "model", "note"],
    finish: ["attempt", "result", "human-minutes", "billed-cost-usd", "estimated-cost-usd", "input-tokens", "output-tokens", "reason", "correction-origin", "evidence"],
    accept: ["kind", "by"],
    summary: [],
  }
  for (const key of Object.keys(flags)) {
    if (!allowed[command].includes(key)) throw new Error(`Unknown option: --${key}`)
  }
  const jobDir = fs.realpathSync(path.resolve(dir))
  const state = JSON.parse(fs.readFileSync(path.join(jobDir, "state/build-state.json"), "utf8"))
  if (state.schema_version !== 2) throw new Error("Reconcile the job's factory state before recording attempts")
  const inputSha = hash(fs.readFileSync(localFile(jobDir, "artifacts/input-contract.json")))
  const sourceRevision = await revision(jobDir)
  const artifacts = path.join(jobDir, "artifacts")
  if (fs.realpathSync(artifacts) !== artifacts) throw new Error("Artifacts directory cannot be a symlink")
  const ledger = path.join(artifacts, "attempts.jsonl")
  if (command === "summary") {
    const records = readRecords(ledger)
    if (records.some((r) => r.job_id !== state.build_id)) throw new Error("Ledger belongs to a different job")
    const result = summarise(records, sourceRevision, inputSha)
    for (const kind of milestones) {
      if (!result.accepted[kind]) continue
      try {
        const current = validateMilestone(jobDir, state, kind, sourceRevision, inputSha)
        if (JSON.stringify(current) !== JSON.stringify(result.accepted[kind].evidence)) {
          throw new Error("Accepted evidence files have changed")
        }
      } catch (error) {
        result.accepted[kind] = null
        result.warning += ` ${kind} acceptance invalidated: ${error.message}.`
      }
    }
    console.log(JSON.stringify({ job_id: state.build_id, ...result }, null, 2))
    return
  }
  const lock = path.join(artifacts, "attempts.lock")
  const fd = fs.openSync(lock, "wx")
  try {
    const records = readRecords(ledger)
    if (records.some((r) => r.job_id !== state.build_id)) throw new Error("Ledger belongs to a different job")
    const base = { schema_version: 1, job_id: state.build_id, input_sha256: inputSha, source_revision: sourceRevision, at: new Date().toISOString() }
    let record
    if (command === "start") {
      const phase = required(flags, "phase")
      if (!phases.has(phase)) throw new Error("Unknown manufacturing phase")
      const active = records.find((r) => r.event === "start" && !records.some((f) => f.event === "finish" && f.attempt_id === r.attempt_id))
      if (active) throw new Error(`Finish or record interruption of active attempt ${active.attempt_id} first`)
      record = { ...base, event: "start", attempt_id: crypto.randomUUID(), phase, tool: required(flags, "tool"), model: flags.model ?? null, note: flags.note ?? null }
    } else if (command === "finish") {
      const attemptId = required(flags, "attempt")
      const start = records.find((r) => r.event === "start" && r.attempt_id === attemptId)
      if (!start || records.some((r) => r.event === "finish" && r.attempt_id === attemptId)) throw new Error("Attempt missing or already finished")
      if (start.input_sha256 !== inputSha) throw new Error("Input changed during attempt; reconcile before recording completion")
      const result = required(flags, "result")
      if (!["passed", "failed", "interrupted"].includes(result)) throw new Error("Invalid result")
      const elapsed = (Date.parse(base.at) - Date.parse(start.at)) / 1000
      if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error("Invalid attempt clock")
      const evidencePath = flags.evidence ? localFile(jobDir, flags.evidence) : null
      if (result === "passed" && !evidencePath) throw new Error("A passed attempt requires --evidence")
      if (result !== "passed" && !flags.reason) throw new Error("Failed/interrupted attempt requires --reason")
      record = {
        ...base, event: "finish", attempt_id: attemptId, phase: start.phase, result, elapsed_seconds: elapsed,
        human_minutes: number(flags["human-minutes"], "human-minutes"),
        billed_cost_usd: number(flags["billed-cost-usd"], "billed-cost-usd"),
        estimated_cost_usd: number(flags["estimated-cost-usd"], "estimated-cost-usd"),
        input_tokens: number(flags["input-tokens"], "input-tokens", true),
        output_tokens: number(flags["output-tokens"], "output-tokens", true),
        reason: flags.reason ?? null, correction_origin: flags["correction-origin"] ?? null,
        evidence: evidencePath ? { path: flags.evidence, sha256: hash(fs.readFileSync(evidencePath)) } : null,
      }
    } else {
      const kind = required(flags, "kind")
      if (!milestones.has(kind)) throw new Error("Unknown milestone")
      const evidence = validateMilestone(jobDir, state, kind, sourceRevision, inputSha)
      record = { ...base, event: "accept", kind, accepted_by: required(flags, "by"), evidence }
    }
    fs.appendFileSync(ledger, JSON.stringify(record) + "\n", { flag: "a" })
    console.log(JSON.stringify(record, null, 2))
  } finally {
    fs.closeSync(fd)
    fs.unlinkSync(lock)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
