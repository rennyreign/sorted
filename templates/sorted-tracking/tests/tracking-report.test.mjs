// Sorted Tracking v1 — function tests. Run: node --test tests/tracking-report.test.mjs
// Asserts the spec-fixed request shapes and response semantics.

import { test } from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { createHandler, handler } = require("../netlify/functions/tracking-report.cjs")

const CONFIG = { clientName: "Test Client", eventNames: ["booking_completed"] }
const ENV = { GA4_PROPERTY_ID: "123456789", GA4_SERVICE_ACCOUNT_JSON: '{"client_email":"x@y.iam"}' }
const AUTH_CTX = { clientContext: { user: { sub: "u1" } } }

const get = (days) => ({ httpMethod: "GET", queryStringParameters: days === undefined ? {} : { days: String(days) } })

function keyOf(req) {
  const dims = (req.dimensions || []).map((d) => d.name).join(",")
  const mets = (req.metrics || []).map((m) => m.name).join(",")
  if (!dims && mets === "totalUsers,sessions") return "totals"
  if (dims === "date" && mets === "totalUsers,sessions") return "dailyTraffic"
  if (dims === "sessionDefaultChannelGroup") return "channels"
  if (!dims && mets === "totalUsers,eventCount") return "outcomeTotals"
  if (dims === "date" && mets === "eventCount") return "dailyConversions"
  if (dims === "eventName") return "eventBreakdown"
  throw new Error(`unrecognised request ${JSON.stringify(req)}`)
}

function makeRunReport(responses, captured = []) {
  return async (req) => {
    captured.push(req)
    const key = keyOf(req)
    const value = typeof responses[key] === "function" ? responses[key](req) : responses[key]
    return [value]
  }
}

const base = {
  totals: { rows: [{ metricValues: [{ value: "500" }, { value: "800" }] }] },
  dailyTraffic: {
    rows: [
      { dimensionValues: [{ value: "20260825" }], metricValues: [{ value: "40" }, { value: "60" }] },
      { dimensionValues: [{ value: "20260826" }], metricValues: [{ value: "40" }, { value: "55" }] },
    ],
  },
  channels: {
    rows: [
      { dimensionValues: [{ value: "Organic Search" }], metricValues: [{ value: "300" }] },
      { dimensionValues: [{ value: "Direct" }], metricValues: [{ value: "200" }] },
    ],
    rowCount: 2,
  },
  outcomeTotals: { rows: [{ metricValues: [{ value: "10" }, { value: "12" }] }] },
  dailyConversions: { rows: [{ dimensionValues: [{ value: "20260826" }], metricValues: [{ value: "3" }] }] },
  eventBreakdown: { rows: [{ dimensionValues: [{ value: "booking_completed" }], metricValues: [{ value: "12" }] }] },
}

const handlerWith = (responses, captured, env = ENV) =>
  createHandler({ env, runReport: makeRunReport(responses, captured), config: CONFIG })

test("entrypoint: unauthenticated 401 even when GA4 configured", async () => {
  const res = await handler(get(), {})
  assert.equal(res.statusCode, 401)
  assert.deepEqual(JSON.parse(res.body), { error: "unauthorized" })
})

test("entrypoint: non-GET returns 405", async () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    const res = await handler({ httpMethod: method, queryStringParameters: {} }, AUTH_CTX)
    assert.equal(res.statusCode, 405)
  }
})

test("entrypoint: loads bundled config and reaches env check after auth", async () => {
  const savedProp = process.env.GA4_PROPERTY_ID
  const savedSa = process.env.GA4_SERVICE_ACCOUNT_JSON
  delete process.env.GA4_PROPERTY_ID
  delete process.env.GA4_SERVICE_ACCOUNT_JSON
  try {
    const res = await handler(get(), AUTH_CTX)
    // config require succeeded (file ships in bundle) -> 503 for missing env, not a crash
    assert.equal(res.statusCode, 503)
    assert.equal(JSON.parse(res.body).error, "not_configured")
  } finally {
    if (savedProp !== undefined) process.env.GA4_PROPERTY_ID = savedProp
    if (savedSa !== undefined) process.env.GA4_SERVICE_ACCOUNT_JSON = savedSa
  }
})

test("401 unauthenticated even when GA4 is configured (injected handler)", async () => {
  const res = await handlerWith(base)(get(), {})
  assert.equal(res.statusCode, 401)
})

test("503 missing credentials only after auth", async () => {
  const h = createHandler({ env: {}, runReport: makeRunReport(base), config: CONFIG })
  const unauth = await h(get(), {})
  assert.equal(unauth.statusCode, 401, "missing credentials must not preempt 401")
  const res = await h(get(), AUTH_CTX)
  assert.equal(res.statusCode, 503)
})

test("days validation: only 7, 30, 90 allowed, default 30", async () => {
  for (const bad of ["1", "14", "0", "abc", "365"]) {
    const res = await handlerWith(base)(get(bad), AUTH_CTX)
    assert.equal(res.statusCode, 400, `days=${bad}`)
  }
  for (const ok of ["7", "30", "90"]) {
    const res = await handlerWith(base)(get(ok), AUTH_CTX)
    assert.equal(res.statusCode, 200, `days=${ok}`)
    assert.equal(JSON.parse(res.body).days, Number(ok))
  }
  const def = await handlerWith(base)(get(undefined), AUTH_CTX)
  assert.equal(JSON.parse(def.body).days, 30)
})

test("exact A–F request shapes", async () => {
  const captured = []
  await handlerWith(base, captured)(get(30), AUTH_CTX)
  assert.equal(captured.length, 6)
  const byKey = {}
  for (const req of captured) byKey[keyOf(req)] = req
  for (const req of captured) {
    assert.equal(req.property, "properties/123456789")
    assert.deepEqual(req.dateRanges, [{ startDate: "30daysAgo", endDate: "yesterday" }])
  }
  assert.deepEqual(byKey.totals.metrics, [{ name: "totalUsers" }, { name: "sessions" }])
  assert.equal(byKey.totals.dimensions, undefined)
  assert.deepEqual(byKey.dailyTraffic.dimensions, [{ name: "date" }])
  assert.deepEqual(byKey.dailyTraffic.orderBys, [{ dimension: { dimensionName: "date" }, desc: false }])
  assert.equal(byKey.dailyTraffic.limit, 10000)
  assert.deepEqual(byKey.channels.dimensions, [{ name: "sessionDefaultChannelGroup" }])
  assert.deepEqual(byKey.channels.orderBys, [{ metric: { metricName: "sessions" }, desc: true }])
  assert.equal(byKey.channels.limit, 1000)
  const filter = { filter: { fieldName: "eventName", inListFilter: { values: ["booking_completed"] } } }
  assert.deepEqual(byKey.outcomeTotals.dimensionFilter, filter)
  assert.deepEqual(byKey.outcomeTotals.metrics, [{ name: "totalUsers" }, { name: "eventCount" }])
  assert.deepEqual(byKey.dailyConversions.dimensionFilter, filter)
  assert.deepEqual(byKey.eventBreakdown.dimensionFilter, filter)
  assert.equal(byKey.eventBreakdown.limit, 1000)
})

test("headline visitors use totals (A), never sum of daily users (B)", async () => {
  const responses = {
    ...base,
    totals: { rows: [{ metricValues: [{ value: "50" }, { value: "115" }] }] },
    dailyTraffic: {
      rows: [
        { dimensionValues: [{ value: "20260825" }], metricValues: [{ value: "40" }, { value: "60" }] },
        { dimensionValues: [{ value: "20260826" }], metricValues: [{ value: "40" }, { value: "55" }] },
      ],
    },
  }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  const body = JSON.parse(res.body)
  assert.equal(body.totals.visitors, 50)
  assert.notEqual(body.totals.visitors, 80)
})

test("conversion rate uses unique converted users (D), not eventCount", async () => {
  const res = await handlerWith(base)(get(), AUTH_CTX)
  const body = JSON.parse(res.body)
  assert.equal(body.outcomes.convertedUsers, 10)
  assert.equal(body.outcomes.eventCount, 12)
  assert.equal(body.outcomes.conversionRate, 2)
})

test("channel rows are labelled sessions, never visitors", async () => {
  const res = await handlerWith(base)(get(), AUTH_CTX)
  assert.deepEqual(JSON.parse(res.body).channels, [
    { channel: "Organic Search", sessions: 300 },
    { channel: "Direct", sessions: 200 },
  ])
})

test("zero users yields null rate; empty totals rows are zero traffic", async () => {
  const responses = { ...base, totals: { rows: [] }, outcomeTotals: { rows: [] } }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.body)
  assert.equal(body.totals.visitors, 0)
  assert.equal(body.outcomes.conversionRate, null)
})

test("rowCount > fetched fails 502 partial_data on ANY query", async () => {
  for (const key of ["totals", "dailyTraffic", "channels", "outcomeTotals", "dailyConversions", "eventBreakdown"]) {
    const responses = { ...base, [key]: { rows: [{ metricValues: [{ value: "1" }, { value: "1" }] }], rowCount: 9999 } }
    const res = await handlerWith(responses)(get(), AUTH_CTX)
    assert.equal(res.statusCode, 502, key)
    assert.equal(JSON.parse(res.body).error, "partial_data", key)
  }
})

test("subjectToThresholding surfaces thresholded flag, not conflated", async () => {
  const responses = {
    ...base,
    dailyTraffic: { ...base.dailyTraffic, metadata: { subjectToThresholding: true } },
  }
  const body = JSON.parse((await handlerWith(responses)(get(), AUTH_CTX)).body)
  assert.equal(body.meta.thresholded, true)
  assert.equal(body.meta.otherRow, false)
  assert.ok(body.meta.warnings.some((w) => /threshold/i.test(w)))
})

test("dataLossFromOtherRow surfaces other-row flag separately", async () => {
  const responses = {
    ...base,
    channels: { ...base.channels, metadata: { dataLossFromOtherRow: true } },
  }
  const body = JSON.parse((await handlerWith(responses)(get(), AUTH_CTX)).body)
  assert.equal(body.meta.otherRow, true)
  assert.equal(body.meta.thresholded, false)
  assert.ok(body.meta.warnings.some((w) => /\(other\)/i.test(w)))
})

test("samplingMetadatas disclosed with fraction", async () => {
  const responses = {
    ...base,
    totals: {
      rows: base.totals.rows,
      metadata: { samplingMetadatas: [{ samplesReadCount: "400", samplingSpaceSize: "1000" }] },
    },
  }
  const body = JSON.parse((await handlerWith(responses)(get(), AUTH_CTX)).body)
  assert.equal(body.meta.sampled, true)
  assert.ok(Math.abs(body.meta.sampleFraction - 0.4) < 1e-9)
  assert.ok(body.meta.warnings.some((w) => /sampl/i.test(w)))
})

test("malformed metric values fail closed 502", async () => {
  const responses = {
    ...base,
    totals: { rows: [{ metricValues: [{ value: "not-a-number" }, { value: "800" }] }] },
  }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  assert.equal(res.statusCode, 502)
})

test("missing metric value fails closed 502 (not silently zero)", async () => {
  const responses = {
    ...base,
    outcomeTotals: { rows: [{ metricValues: [{ value: "10" }] }] }, // eventCount missing
  }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  assert.equal(res.statusCode, 502)
})

test("real zero metric values parse correctly", async () => {
  const responses = {
    ...base,
    outcomeTotals: { rows: [{ metricValues: [{ value: "0" }, { value: "0" }] }] },
    dailyConversions: { rows: [{ dimensionValues: [{ value: "20260825" }], metricValues: [{ value: "0" }] }] },
  }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.body)
  assert.equal(body.outcomes.convertedUsers, 0)
  assert.equal(body.outcomes.eventCount, 0)
  assert.equal(body.daily[0].bookings, 0)
})

test("absent response object fails closed 502", async () => {
  const responses = { ...base, channels: undefined }
  const res = await handlerWith(responses)(get(), AUTH_CTX)
  assert.equal(res.statusCode, 502)
})

test("property timezone drives displayed date range", async () => {
  const responses = {
    ...base,
    totals: { rows: base.totals.rows, metadata: { timeZone: "Europe/London" } },
  }
  const body = JSON.parse((await handlerWith(responses)(get(30), AUTH_CTX)).body)
  assert.equal(body.dateRange.timeZone, "Europe/London")
  assert.match(body.dateRange.startDate, /^\d{4}-\d{2}-\d{2}$/)
  assert.match(body.dateRange.endDate, /^\d{4}-\d{2}-\d{2}$/)
  const span = (new Date(body.dateRange.endDate) - new Date(body.dateRange.startDate)) / 86400000
  assert.equal(span, 29)
})

test("missing timezone yields neutral label, no fabricated dates", async () => {
  const body = JSON.parse((await handlerWith(base)(get(7), AUTH_CTX)).body)
  assert.equal(body.dateRange.startDate, null)
  assert.equal(body.dateRange.endDate, null)
  assert.match(body.dateRange.label, /GA4 property timezone/)
})

test("daily conversions left-join with zero for missing dates", async () => {
  const body = JSON.parse((await handlerWith(base)(get(), AUTH_CTX)).body)
  assert.deepEqual(body.daily, [
    { date: "20260825", visitors: 40, sessions: 60, bookings: 0 },
    { date: "20260826", visitors: 40, sessions: 55, bookings: 3 },
  ])
})

test("no PII, secrets or credentials in response JSON", async () => {
  const res = await handlerWith(base)(get(), AUTH_CTX)
  const text = res.body
  assert.ok(!text.includes("GA4_SERVICE_ACCOUNT_JSON"))
  assert.ok(!text.includes("client_email"))
  assert.ok(!text.includes("x@y.iam"))
  assert.ok(!/Bearer|jwt|token/i.test(text))
  assert.equal(res.headers["Cache-Control"], "no-store")
})
