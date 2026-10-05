import { test } from "node:test"
import assert from "node:assert/strict"
import {
  applyDiscoverFilters,
  buildTodayQueue,
  contactChannel,
  EMPTY_DISCOVER_FILTERS,
  discoverSort,
  fetchAllProspects,
  findDuplicateIds,
  hasReply,
  isCandidate,
  isDueToday,
  isLegacyScore,
  needsResearch,
  isReadyToContact,
  isValidScore,
  mergeActivity,
  scoreLabel,
  scoreLabelFor,
  TODAY_LIMIT,
} from "./finderModel.ts"

function p(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 1e9),
    name: "Test Co",
    crm_status: "new",
    status: "prospect",
    email: null,
    phone: null,
    owner_email: null,
    owner_email_status: null,
    mockup_url: null,
    review_slug: null,
    email_replied_at: null,
    email_bounced_at: null,
    email_opted_out_at: null,
    outreach_status: null,
    outreach_sent_at: null,
    contacted_at: null,
    qualified_lead: null,
    analysed_at: null,
    prospect_score: null,
    site_score: null,
    qualified: false,
    first_seen_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}

function w(overrides = {}) {
  return {
    prospect_id: 0,
    shortlisted_at: "2026-01-01T00:00:00Z",
    next_action_type: "follow_up",
    next_action_at: null,
    next_action_note: null,
    research_status: "unreviewed",
    scout_decision: "undecided",
    scout_priority: null,
    decision_reason: null,
    reviewed_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}

const NOW = new Date("2026-06-15T12:00:00")

const readyBase = { qualified_lead: true, email: "a@b.co", mockup_url: "m.png" }

test("reply is prioritised over ready rows", () => {
  const ready = p({ id: 1, ...readyBase, prospect_score: 9 })
  const reply = p({ id: 2, email_replied_at: "2026-01-01", email: "r@b.co" })
  const queue = buildTodayQueue([ready, reply])
  assert.equal(queue[0].prospect.id, 2)
  assert.equal(queue[0].kind, "reply")
  assert.deepEqual(queue.map((i) => i.kind), ["reply", "ready"])
})

test("outreach_status REPLIED counts as a reply", () => {
  assert.equal(hasReply(p({ outreach_status: "REPLIED" })), true)
})

test("reply rows still surface with no usable channel (review only)", () => {
  assert.equal(hasReply(p({ email_replied_at: "x" })), true)
})

test("terminal statuses excluded from replies and ready", () => {
  for (const crm of ["lost", "na", "paid"]) {
    assert.equal(hasReply(p({ crm_status: crm, email_replied_at: "x" })), false)
    assert.equal(isReadyToContact(p({ crm_status: crm, ...readyBase })), false)
  }
})

test("ready requires machine qualification (qualified_lead === true)", () => {
  assert.equal(isReadyToContact(p({ email: "a@b.co", mockup_url: "m" })), false)
  assert.equal(isReadyToContact(p({ qualified_lead: false, email: "a@b.co", mockup_url: "m" })), false)
  assert.equal(isReadyToContact(p({ qualified_lead: null, email: "a@b.co", mockup_url: "m" })), false)
  assert.equal(isReadyToContact(p(readyBase)), true)
  // review_slug alone is not enough without qualification
  assert.equal(isReadyToContact(p({ email: "a@b.co", review_slug: "abc" })), false)
})

test("ready requires a workspace asset and a contact channel", () => {
  assert.equal(isReadyToContact(p({ qualified_lead: true, email: "a@b.co" })), false)
  assert.equal(isReadyToContact(p({ qualified_lead: true, mockup_url: "m" })), false)
  assert.equal(isReadyToContact(p(readyBase)), true)
  assert.equal(isReadyToContact(p({ qualified_lead: true, phone: "0121", review_slug: "abc" })), true)
  assert.equal(isReadyToContact(p({ ...readyBase, email_bounced_at: "x" })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, outreach_status: "OPTED_OUT" })), false)
})

test("qualified untouched candidates without an asset need research", () => {
  const candidate = p({ qualified_lead: true, prospect_score: 8 })
  assert.equal(needsResearch(candidate, undefined), true)
  assert.equal(needsResearch(candidate, w({ research_status: "researching" })), true)
  assert.equal(needsResearch(candidate, w({ research_status: "reviewed" })), false)
  assert.equal(needsResearch(candidate, w({ scout_decision: "pass" })), false)
  assert.equal(needsResearch(p({ qualified_lead: true, mockup_url: "m" }), undefined), false)
  assert.equal(needsResearch(p({ qualified_lead: true, outreach_sent_at: "x" }), undefined), false)
})

test("today queue puts research after due work and before ready outreach", () => {
  const due = p({ id: 1 })
  const researchLow = p({ id: 2, qualified_lead: true, prospect_score: 9 })
  const researchHigh = p({ id: 3, qualified_lead: true, prospect_score: 4 })
  const ready = p({ id: 4, ...readyBase })
  const workflows = new Map([
    [1, w({ prospect_id: 1, next_action_at: "2026-06-15T09:00:00Z" })],
    [2, w({ prospect_id: 2, scout_priority: 2 })],
    [3, w({ prospect_id: 3, scout_priority: 5 })],
  ])
  const queue = buildTodayQueue([ready, researchLow, due, researchHigh], { workflows, now: NOW })
  assert.deepEqual(queue.map((item) => item.kind), ["due", "research", "research", "ready"])
  assert.deepEqual(queue.map((item) => item.prospect.id), [1, 3, 2, 4])
})

test("ready excludes any prior outreach activity", () => {
  assert.equal(isReadyToContact(p({ ...readyBase, outreach_sent_at: "x" })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, contacted_at: "x" })), false)
  for (const s of ["QUEUED", "SENDING", "SENT", "FAILED_TEMPORARY", "REPLIED", "NOT_READY"]) {
    assert.equal(isReadyToContact(p({ ...readyBase, outreach_status: s })), false, s)
  }
  assert.equal(isReadyToContact(p({ ...readyBase, outreach_status: "READY" })), true)
})

test("null crm_status treated as new", () => {
  assert.equal(isReadyToContact(p({ crm_status: null, ...readyBase })), true)
})

test("rows with no site may still have email and be ready", () => {
  assert.equal(
    isReadyToContact(p({ website: null, website_exists: false, ...readyBase, review_slug: "abc" })),
    true
  )
})

test("contactChannel trims blanks; owner email status governs owner email only", () => {
  assert.equal(contactChannel(p({ email: "  " })), null)
  assert.equal(contactChannel(p({ owner_email: "o@b.co" }))?.value, "o@b.co")
  assert.equal(contactChannel(p({ owner_email: "o@b.co", owner_email_status: "invalid" })), null)
  assert.equal(contactChannel(p({ email: "e@b.co", owner_email: "o@b.co" }))?.value, "e@b.co")
  assert.equal(contactChannel(p({ email: "  ", owner_email: " o@b.co " }))?.value, "o@b.co")
  assert.equal(contactChannel(p({ phone: " 0121 " }))?.value, "0121")
})

test("null scores are pending, not zero; out-of-range is legacy", () => {
  assert.equal(scoreLabel(null), "Pending analysis")
  assert.equal(scoreLabel(0), "0")
  assert.equal(scoreLabel(7), "7")
  assert.equal(scoreLabel(-0.2), "Legacy score")
  assert.equal(scoreLabel(12), "Legacy score")
  assert.equal(isValidScore(-0.2), false)
  assert.equal(isValidScore(0), true)
  assert.equal(isValidScore(10), true)
  assert.equal(isValidScore(10.1), false)
})

test("in-range backfilled scores still count as legacy when unqualified", () => {
  // Old-model backfill: qualified_lead never ran, scores within 0–10
  const legacy = p({ prospect_score: 8, site_score: 6, opportunity_score: 9, analysed_at: "2025-01-01" })
  assert.equal(isLegacyScore(legacy), true)
  assert.equal(scoreLabelFor(legacy, legacy.prospect_score), "Legacy")
  assert.equal(scoreLabelFor(legacy, legacy.site_score), "Legacy")
  // legacy regardless of analysed_at
  assert.equal(isLegacyScore(p({ prospect_score: 8 })), true)
  assert.equal(isLegacyScore(p({ site_score: 6 })), true)
  assert.equal(isLegacyScore(p({ opportunity_score: 9 })), true)
  // no scores at all → not "legacy", just pending
  assert.equal(isLegacyScore(p({})), false)
})

test("new-model rows (qualified_lead set) keep valid numeric scores", () => {
  const rejected = p({ qualified_lead: false, prospect_score: 8, site_score: 6 })
  const accepted = p({ qualified_lead: true, prospect_score: 9 })
  assert.equal(isLegacyScore(rejected), false)
  assert.equal(isLegacyScore(accepted), false)
  assert.equal(scoreLabelFor(rejected, 8), "8")
  assert.equal(scoreLabelFor(accepted, 9), "9")
})

test("qualified_lead === true gates candidates, not legacy qualified", () => {
  assert.equal(isCandidate(p({ qualified_lead: true })), true)
  assert.equal(isCandidate(p({ qualified_lead: false, qualified: true })), false)
  assert.equal(isCandidate(p({ qualified: true })), false)
  assert.equal(isCandidate(p({ qualified_lead: null })), false)
})

test("terminal records are never candidates", () => {
  for (const crm of ["lost", "na", "paid"]) {
    assert.equal(isCandidate(p({ qualified_lead: true, crm_status: crm })), false, crm)
  }
  assert.equal(isCandidate(p({ qualified_lead: true, crm_status: "new" })), true)
})

test("discover hides archived (terminal) records by default", () => {
  const active = p({ id: 1, name: "Active Co" })
  const archived = p({ id: 2, name: "Gone Co", crm_status: "na" })
  const out = applyDiscoverFilters([active, archived], EMPTY_DISCOVER_FILTERS)
  assert.deepEqual(out.map((x) => x.id), [1])
})

test("discover shows archived records when archived filter is 'show'", () => {
  const active = p({ id: 1, name: "Active Co" })
  const archived = p({ id: 2, name: "Gone Co", crm_status: "na" })
  const lost = p({ id: 3, name: "Lost Co", crm_status: "lost" })
  const out = applyDiscoverFilters([active, archived, lost], {
    ...EMPTY_DISCOVER_FILTERS,
    archived: "show",
  })
  assert.deepEqual(out.map((x) => x.id), [1, 2, 3])
})

test("queue dedupes: a replied prospect is not also listed as ready", () => {
  const both = p({ id: 5, email_replied_at: "x", ...readyBase })
  const queue = buildTodayQueue([both, both])
  assert.equal(queue.length, 1)
  assert.equal(queue[0].kind, "reply")
})

test("ready rows sorted by prospect_score descending", () => {
  const low = p({ id: 1, ...readyBase, prospect_score: 3 })
  const high = p({ id: 2, ...readyBase, prospect_score: 9 })
  const none = p({ id: 3, ...readyBase, prospect_score: null })
  const queue = buildTodayQueue([low, none, high])
  assert.deepEqual(queue.map((i) => i.prospect.id), [2, 1, 3])
})

test("today queue capped at limit", () => {
  const rows = Array.from({ length: 30 }, (_, i) => p({ id: i, ...readyBase }))
  assert.equal(buildTodayQueue(rows).length, TODAY_LIMIT)
  assert.equal(buildTodayQueue(rows, { limit: 5 }).length, 5)
})

test("due items: only persisted shortlisted non-terminal next_action_at <= end of local day", () => {
  const prospect = p({ id: 1 })
  const dueW = w({ prospect_id: 1, next_action_at: "2026-06-15T09:00:00Z" }) // earlier today
  const map = new Map([[1, dueW]])
  assert.equal(isDueToday(prospect, dueW, NOW), true)

  // future action (tomorrow) is not due
  const future = w({ prospect_id: 1, next_action_at: "2026-06-20T09:00:00Z" })
  assert.equal(isDueToday(prospect, future, NOW), false)

  // overdue included
  const overdue = w({ prospect_id: 1, next_action_at: "2026-06-01T09:00:00Z" })
  assert.equal(isDueToday(prospect, overdue, NOW), true)

  // not shortlisted → never due
  assert.equal(isDueToday(prospect, w({ prospect_id: 1, shortlisted_at: null, next_action_at: "2026-06-15T09:00:00Z" }), NOW), false)
  // no scheduled action → not due
  assert.equal(isDueToday(prospect, w({ prospect_id: 1 }), NOW), false)
  // terminal crm → not due
  assert.equal(isDueToday(p({ id: 1, crm_status: "lost" }), dueW, NOW), false)
  // missing workflow → not due
  assert.equal(isDueToday(prospect, undefined, NOW), false)

  const q = buildTodayQueue([prospect], { workflows: map, now: NOW })
  assert.equal(q[0].kind, "due")
})

test("queue priority replies > due > ready with dedup", () => {
  const replyDue = p({ id: 1, email_replied_at: "x" })
  const dueOnly = p({ id: 2 })
  const ready = p({ id: 3, ...readyBase })
  const workflows = new Map([
    [1, w({ prospect_id: 1, next_action_at: "2026-06-15T09:00:00Z" })],
    [2, w({ prospect_id: 2, next_action_at: "2026-06-15T09:00:00Z" })],
  ])
  const q = buildTodayQueue([ready, dueOnly, replyDue], { workflows, now: NOW })
  assert.deepEqual(q.map((i) => i.prospect.id), [1, 2, 3])
  assert.deepEqual(q.map((i) => i.kind), ["reply", "due", "ready"])
  // replied+due prospect appears once
  assert.equal(q.filter((i) => i.prospect.id === 1).length, 1)
})

test("mergeActivity merges logged rows with factual milestones, newest first", () => {
  const prospect = p({
    email_replied_at: "2026-06-10T00:00:00Z",
    outreach_sent_at: "2026-06-05T00:00:00Z",
  })
  const rows = [
    { id: 1, prospect_id: 1, event_type: "note", note: "spoke to owner", created_at: "2026-06-12T00:00:00Z" },
    { id: 2, prospect_id: 1, event_type: "shortlisted", note: null, created_at: "2026-06-11T00:00:00Z" },
  ]
  const ev = mergeActivity(prospect, rows)
  assert.equal(ev[0].label, "Note")
  assert.equal(ev[0].source, "recorded")
  assert.equal(ev[1].label, "Shortlisted")
  assert.equal(ev[2].label, "Reply received")
  assert.equal(ev[2].source, "record")
  assert.equal(ev[3].label, "Outreach email sent")
  assert.equal(ev[4].label, "Added to finder")
  // cap respected
  const many = Array.from({ length: 60 }, (_, i) => ({ id: i, prospect_id: 1, event_type: "note", note: null, created_at: `2026-06-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z` }))
  assert.ok(mergeActivity(prospect, many).length <= 50)
})

test("fetchAllProspects pages beyond 500 with deterministic ordering", async () => {
  const total = 1200
  const calls = []
  const fetchPage = async (from, to) => {
    calls.push([from, to])
    const rows = Array.from({ length: Math.max(0, Math.min(to, total - 1) - from + 1) }, (_, i) => p({ id: from + i }))
    return { data: rows, error: null }
  }
  const res = await fetchAllProspects(fetchPage, { pageSize: 500, cap: 5000 })
  assert.equal(res.count, 1200)
  assert.equal(res.truncated, false)
  assert.deepEqual(calls, [[0, 499], [500, 999], [1000, 1499]])
  assert.equal(res.prospects[1199].id, 1199)
})

test("fetchAllProspects surfaces errors", async () => {
  await assert.rejects(
    fetchAllProspects(async () => ({ data: null, error: { message: "boom" } })),
    /boom/
  )
})

test("fetchAllProspects flags truncation at cap", async () => {
  const fetchPage = async (from, to) => ({
    data: Array.from({ length: to - from + 1 }, (_, i) => p({ id: from + i })),
    error: null,
  })
  const res = await fetchAllProspects(fetchPage, { pageSize: 500, cap: 1000 })
  assert.equal(res.count, 1000)
  assert.equal(res.truncated, true)
})

test("discoverSort ranks current-model score first, then intake_priority", () => {
  const analysed = p({ id: 1, qualified_lead: false, prospect_score: 3.2, intake_priority: 9 })
  const freshHigh = p({ id: 2, intake_priority: 8 })
  const freshLow = p({ id: 3, intake_priority: 2 })
  const unranked = p({ id: 4 })
  const legacyScored = p({ id: 5, prospect_score: 9.9, intake_priority: 7 }) // legacy → intake tier
  const out = discoverSort([unranked, freshLow, legacyScored, freshHigh, analysed])
  assert.deepEqual(out.map((x) => x.id), [1, 2, 5, 3, 4])
})

test("findDuplicateIds flags same normalized name+postcode across place_ids", () => {
  const a = p({ id: 1, name: "Acme Ltd", postcode: " e1 1aa ", place_id: "AAA" })
  const b = p({ id: 2, name: "acme ltd", postcode: "E1 1AA", place_id: "BBB" })
  const samePlace = p({ id: 3, name: "acme ltd", postcode: "E1 1AA", place_id: "AAA" })
  const other = p({ id: 4, name: "Other Co", postcode: "E1 1AA", place_id: "CCC" })
  const noPostcode = p({ id: 5, name: "acme ltd", postcode: null, place_id: "DDD" })
  const ids = findDuplicateIds([a, b, samePlace, other, noPostcode])
  assert.deepEqual([...ids].sort(), [1, 2, 3])
})
