import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const REQUIRED_CHECKS = ["content", "tests", "build", "browser", "links", "responsive", "keyboard", "visual", "video"];
const SECTIONS = ["purpose", "business", "players", "workflow", "boundaries", "walkthrough"];
const PLAYER_FIELDS = ["id", "name", "goal", "contribution", "authority", "incentive", "tension", "safeguard"];
const text = value => typeof value === "string" && value.trim().length > 0;
const localRoute = value => text(value) && /^\/(?!\/)[^\s\\]*$/.test(value);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);

export function validate(record, repo) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const fields = (value, names, label) => {
    for (const name of names) require(text(value?.[name]), `${label}.${name} must be nonempty text`);
  };
  const list = (value, label) => {
    require(Array.isArray(value) && value.length > 0, `${label} must be a nonempty array`);
    return Array.isArray(value) ? value : [];
  };
  const file = (value, label) => {
    if (!text(value)) {
      errors.push(`${label} must name an existing file`);
      return null;
    }
    const resolved = path.resolve(repo, value);
    if (!existsSync(resolved) || !statSync(resolved).isFile()) {
      errors.push(`${label} file not found: ${value}`);
      return null;
    }
    return resolved;
  };

  if (!object(record)) return { valid: false, errors: ["record must be an object"] };
  require(record.operator_id === "op-app-overview", "operator_id must be op-app-overview");
  require(record.schema_version === 1, "schema_version must be 1");
  require(record.status === "verified", "record is not verified; keep incomplete work as draft");
  fields(record.app, ["name"], "app");
  require(localRoute(record.app?.route), "app.route must be a local route");
  require(Array.isArray(record.open_questions) && record.open_questions.every(text), "open_questions must be an array of nonempty strings");

  for (const [index, source] of list(record.sources, "sources").entries()) {
    fields(source, ["reason"], `sources[${index}]`);
    file(source?.path, `sources[${index}].path`);
  }
  fields(record.business, ["value", "gap", "observable_improvement"], "business");
  for (const name of ["in_scope", "out_of_scope", "not_claimed"]) {
    for (const value of list(record.business?.[name], `business.${name}`)) {
      require(text(value), `business.${name} entries must be nonempty text`);
    }
  }
  fields(record.sections, SECTIONS, "sections");

  const players = list(record.players, "players");
  require(players.length >= 2, "players must identify at least two operating roles");
  const ids = new Set();
  for (const [index, player] of players.entries()) {
    const label = `players[${index}]`;
    fields(player, PLAYER_FIELDS, label);
    require(player?.kind === "human" || player?.kind === "system", `${label}.kind must be human or system`);
    require(player?.entry_point === null || localRoute(player?.entry_point), `${label}.entry_point must be a local route or null`);
    require(!ids.has(player?.id), `${label}.id must be unique`);
    ids.add(player?.id);
  }

  const video = record.video;
  require(video?.state === "not_supplied" || video?.state === "configured", "video.state must be not_supplied or configured");
  if (video?.state === "not_supplied") {
    require(video.source === null && video.captions === null, "unsupplied video must not claim a source or captions");
  } else if (video?.state === "configured") {
    fields(video, ["source", "captions"], "video");
  }

  const implementationPaths = new Set();
  for (const [index, item] of list(record.implementation, "implementation").entries()) {
    const label = `implementation[${index}]`;
    const resolved = file(item?.path, `${label}.path`);
    require(!implementationPaths.has(resolved), `${label}.path must be unique`);
    implementationPaths.add(resolved);
    require(typeof item?.sha256 === "string" && /^[a-f0-9]{64}$/.test(item.sha256), `${label}.sha256 must be a SHA-256 digest`);
    if (resolved && text(item?.sha256)) {
      const actual = createHash("sha256").update(readFileSync(resolved)).digest("hex");
      require(actual === item.sha256, `${label} changed since verification; rerun affected checks`);
    }
  }

  const checks = new Set();
  for (const [index, verification] of list(record.verification, "verification").entries()) {
    const label = `verification[${index}]`;
    require(REQUIRED_CHECKS.includes(verification?.check), `${label}.check is not a recognised gate`);
    require(!checks.has(verification?.check), `${label}.check must be unique`);
    checks.add(verification?.check);
    require(verification?.status === "passed", `${label} has not passed`);
    for (const [evidenceIndex, evidence] of list(verification?.evidence, `${label}.evidence`).entries()) {
      fields(evidence, ["summary"], `${label}.evidence[${evidenceIndex}]`);
      file(evidence?.path, `${label}.evidence[${evidenceIndex}].path`);
    }
  }
  for (const check of REQUIRED_CHECKS) require(checks.has(check), `missing verification gate: ${check}`);
  return { valid: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [recordPath, flag, repo] = process.argv.slice(2);
  if (!recordPath || flag !== "--repo" || !repo || process.argv.length !== 5) {
    console.error("Usage: node validate.mjs <record.json> --repo <client-repo>");
    process.exitCode = 2;
  } else {
    try {
      const result = validate(JSON.parse(readFileSync(recordPath, "utf8")), path.resolve(repo));
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.valid ? 0 : 1;
    } catch (error) {
      console.error(`Validation failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
