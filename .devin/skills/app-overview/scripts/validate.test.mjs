import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { REQUIRED_CHECKS, validate } from "./validate.mjs";

const repo = mkdtempSync(path.join(os.tmpdir(), "overview-validator-"));
after(() => rmSync(repo, { recursive: true }));
writeFileSync(path.join(repo, "overview.tsx"), "verified implementation");
writeFileSync(path.join(repo, "evidence.log"), "actual verification output");
writeFileSync(path.join(repo, "brief.md"), "client process and authority");

function fixture() {
  return {
    operator_id: "op-app-overview",
    schema_version: 1,
    status: "verified",
    app: { name: "Client workspace", route: "/overview" },
    sources: [{ path: "brief.md", reason: "Purpose and decision owners" }],
    business: {
      value: "Less chasing",
      gap: "Work held in memory",
      observable_improvement: "Missing items have named next actions",
      in_scope: ["Coordination"],
      out_of_scope: ["Payments"],
      not_claimed: ["Measured revenue growth"],
    },
    players: [
      { id: "owner", name: "Owner", kind: "human", goal: "Reliable work", contribution: "Direction", authority: "Approves exceptions", incentive: "Less involvement", tension: "Speed over accuracy", safeguard: "Source review", entry_point: "/inbox" },
      { id: "customer", name: "Customer", kind: "human", goal: "A useful result", contribution: "Information", authority: "Chooses participation", incentive: "Clear follow-through", tension: "Unclear expectations", safeguard: "Explicit agreement", entry_point: null },
    ],
    sections: Object.fromEntries(["purpose", "business", "players", "workflow", "boundaries", "walkthrough"].map(key => [key, key])),
    video: { state: "not_supplied", source: null, captions: null },
    implementation: [{ path: "overview.tsx", sha256: createHash("sha256").update("verified implementation").digest("hex") }],
    verification: REQUIRED_CHECKS.map(check => ({ check, status: "passed", evidence: [{ path: "evidence.log", summary: `${check} observed` }] })),
    open_questions: [],
  };
}

test("accepts a verified two-player app without inventing Creator Hub's four roles", () => {
  assert.deepEqual(validate(fixture(), repo), { valid: true, errors: [] });
});

test("accepts a system role and configured captioned media", () => {
  const record = fixture();
  record.players[1].kind = "system";
  record.video = { state: "configured", source: "/media/tour.mp4", captions: "/media/tour.vtt" };
  assert.equal(validate(record, repo).valid, true);
});

test("draft, blocked checks and missing gates cannot become ready", () => {
  const record = fixture();
  record.status = "draft";
  record.verification[0].status = "blocked";
  record.verification.pop();
  const result = validate(record, repo);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("not verified")));
  assert.ok(result.errors.some(error => error.includes("has not passed")));
  assert.ok(result.errors.some(error => error.includes("missing verification gate")));
});

test("rejects missing source, evidence, implementation and stale code hashes", () => {
  const record = fixture();
  record.sources[0].path = "missing-brief.md";
  record.verification[0].evidence[0].path = "missing.log";
  record.implementation[0].sha256 = "a".repeat(64);
  record.implementation.push({ path: "missing.tsx", sha256: "a".repeat(64) });
  const result = validate(record, repo);
  assert.equal(result.valid, false);
  assert.equal(result.errors.filter(error => error.includes("file not found")).length, 3);
  assert.ok(result.errors.some(error => error.includes("changed since verification")));
});

test("rejects duplicate roles, missing authority and unsupported entry routes", () => {
  const record = fixture();
  record.players[1].id = "owner";
  record.players[0].authority = "";
  record.players[0].entry_point = "//external.test";
  const result = validate(record, repo);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("id must be unique")));
  assert.ok(result.errors.some(error => error.includes("authority")));
  assert.ok(result.errors.some(error => error.includes("entry_point")));
});

test("rejects fake media configuration, absent sections and duplicate evidence gates", () => {
  const record = fixture();
  record.video.source = "/fake.mp4";
  delete record.sections.boundaries;
  record.verification.push(record.verification[0]);
  const result = validate(record, repo);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("unsupplied video")));
  assert.ok(result.errors.some(error => error.includes("sections.boundaries")));
  assert.ok(result.errors.some(error => error.includes("check must be unique")));
});

test("handles malformed records without silently accepting them", () => {
  for (const record of [null, [], {}, { players: [null], sources: [null], implementation: [null], verification: [null] }]) {
    assert.equal(validate(record, repo).valid, false);
  }
});

test("CLI validates records and rejects invalid invocation or malformed JSON", () => {
  const script = path.join(import.meta.dirname, "validate.mjs");
  const file = path.join(repo, "record.json");
  writeFileSync(file, JSON.stringify(fixture()));
  const result = spawnSync(process.execPath, [script, file, "--repo", repo], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).valid, true);
  assert.equal(spawnSync(process.execPath, [script, file]).status, 2);
  writeFileSync(file, "{");
  assert.equal(spawnSync(process.execPath, [script, file, "--repo", repo]).status, 1);
});
