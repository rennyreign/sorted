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
  isChVerified,
  isDueToday,
  isLegacyScore,
  isMachineQualified,
  needsResearch,
  isReadyToContact,
  isValidScore,
  mergeActivity,
  opportunityRank,
  scoreLabel,
  scoreLabelFor,
  TODAY_LIMIT,
  websiteOpportunity,
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
    opportunity_score: null,
    qualified: false,
    website: null,
    website_exists: false,
    site_platform: null,
    site_built_estimate: null,
    ch_status: null,
    ch_match_confidence: null,
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

// Machine qualification is now conditional: a confident, active Companies
// House match plus a website that isn't demonstrably modern. Scores are
// context only — they no longer gate anything.
const chVerified = { ch_match_confidence: "high", ch_status: "active" }
const readyBase = { ...chVerified, email: "a@b.co", mockup_url: "m.png" }

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

test("ready requires machine qualification (CH verified + website opportunity)", () => {
  assert.equal(isReadyToContact(p({ email: "a@b.co", mockup_url: "m" })), false)
  // no CH confidence or dissolved/inactive company → not qualified
  assert.equal(isReadyToContact(p({ ...readyBase, ch_match_confidence: null })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, ch_match_confidence: "low" })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, ch_status: "dissolved" })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, ch_match_confidence: "medium" })), true)
  assert.equal(isReadyToContact(p(readyBase)), true)
  // demonstrably modern site → not qualified even when CH-verified
  assert.equal(isReadyToContact(p({ ...readyBase, website: "https://x.co", website_exists: true, site_platform: "nextjs" })), false)
  // review_slug alone is not enough without qualification
  assert.equal(isReadyToContact(p({ email: "a@b.co", review_slug: "abc" })), false)
})

test("ready requires a workspace asset and a contact channel", () => {
  assert.equal(isReadyToContact(p({ ...chVerified, email: "a@b.co" })), false)
  assert.equal(isReadyToContact(p({ ...chVerified, mockup_url: "m" })), false)
  assert.equal(isReadyToContact(p(readyBase)), true)
  assert.equal(isReadyToContact(p({ ...chVerified, phone: "0121", review_slug: "abc" })), true)
  assert.equal(isReadyToContact(p({ ...readyBase, email_bounced_at: "x" })), false)
  assert.equal(isReadyToContact(p({ ...readyBase, outreach_status: "OPTED_OUT" })), false)
})

test("qualified untouched candidates without an asset need research", () => {
  const candidate = p({ ...chVerified })
  assert.equal(needsResearch(candidate, undefined), true)
  assert.equal(needsResearch(candidate, w({ research_status: "researching" })), true)
  assert.equal(needsResearch(candidate, w({ research_status: "reviewed" })), false)
  assert.equal(needsResearch(candidate, w({ scout_decision: "pass" })), false)
  assert.equal(needsResearch(p({ ...chVerified, mockup_url: "m" }), undefined), false)
  assert.equal(needsResearch(p({ ...chVerified, outreach_sent_at: "x" }), undefined), false)
})

test("today queue puts research after due work and before ready outreach", () => {
  const due = p({ id: 1 })
  const researchLow = p({ id: 2, ...chVerified })
  const researchHigh = p({ id: 3, ...chVerified })
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

test("isChVerified requires confident match on an active company", () => {
  assert.equal(isChVerified(p({})), false)
  assert.equal(isChVerified(p({ ch_match_confidence: "high", ch_status: "active" })), true)
  assert.equal(isChVerified(p({ ch_match_confidence: "medium", ch_status: "active" })), true)
  assert.equal(isChVerified(p({ ch_match_confidence: "low", ch_status: "active" })), false)
  assert.equal(isChVerified(p({ ch_match_confidence: "high", ch_status: "dissolved" })), false)
  assert.equal(isChVerified(p({ ch_match_confidence: "high", ch_status: null })), false)
})

test("websiteOpportunity is a conditional flag, not a score", () => {
  assert.equal(websiteOpportunity(p({})), "none")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true })), "unreviewed")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, opportunity_score: -1 })), "down")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_built_estimate: "pre-2016" })), "weak")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_built_estimate: "2019 or earlier" })), "weak")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_platform: "wix" })), "weak")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_platform: "wordpress" })), "weak")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_platform: "nextjs" })), "modern")
  assert.equal(websiteOpportunity(p({ website: "https://x.co", website_exists: true, site_platform: "framer" })), "modern")
  // modern check wins over weak signals? platform modern short-circuits first
  assert.equal(
    opportunityRank(p({ website: null })) > opportunityRank(p({ website: "https://x.co", website_exists: true })),
    true
  )
})

test("candidates: CH-verified non-terminal with a non-modern site", () => {
  assert.equal(isCandidate(p(chVerified)), true)
  assert.equal(isCandidate(p({ ...chVerified, website: "https://x.co", website_exists: true })), true)
  assert.equal(isCandidate(p({ ...chVerified, website: "https://x.co", website_exists: true, site_platform: "nextjs" })), false)
  assert.equal(isCandidate(p({ ch_match_confidence: "high", ch_status: "dissolved" })), false)
  // legacy qualified flags alone no longer make a candidate
  assert.equal(isCandidate(p({ qualified_lead: true })), false)
  assert.equal(isCandidate(p({ qualified: true })), false)
  assert.equal(isCandidate(p({ qualified_lead: null })), false)
})

test("isMachineQualified ignores scores entirely", () => {
  assert.equal(isMachineQualified(p({ ...chVerified, prospect_score: 1 })), true)
  assert.equal(isMachineQualified(p({ prospect_score: 10 })), false)
})

test("terminal records are never candidates", () => {
  for (const crm of ["lost", "na", "paid"]) {
    assert.equal(isCandidate(p({ ...chVerified, crm_status: crm })), false, crm)
  }
  assert.equal(isCandidate(p({ ...chVerified, crm_status: "new" })), true)
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

test("ready rows sorted by website-opportunity flag, not score", () => {
  const unreviewed = p({ id: 1, ...readyBase, website: "https://x.co", website_exists: true, prospect_score: 9 })
  const noSite = p({ id: 2, ...readyBase })
  const weak = p({ id: 3, ...readyBase, website: "https://x.co", website_exists: true, site_platform: "wix" })
  const queue = buildTodayQueue([unreviewed, weak, noSite])
  assert.deepEqual(queue.map((i) => i.prospect.id), [2, 3, 1])
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

test("discoverSort ranks machine-qualified first by opportunity flag, then intake_priority", () => {
  const noSite = p({ id: 1, ...chVerified })
  const unreviewedSite = p({ id: 2, ...chVerified, website: "https://x.co", website_exists: true })
  const freshHigh = p({ id: 3, intake_priority: 8 })
  const freshLow = p({ id: 4, intake_priority: 2 })
  const unranked = p({ id: 5 })
  const legacyScored = p({ id: 6, prospect_score: 9.9, intake_priority: 7 }) // score doesn't qualify it
  const out = discoverSort([unranked, freshLow, legacyScored, unreviewedSite, freshHigh, noSite])
  assert.deepEqual(out.map((x) => x.id), [1, 2, 3, 6, 4, 5])
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
