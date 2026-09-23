// Sorted Tracking v1 — GA4 report function (legacy Lambda handler).
// Auth: Netlify-verified Identity JWT via context.clientContext.user.
// Env (server-side secrets, never committed):
//   GA4_PROPERTY_ID          numeric GA4 property id
//   GA4_SERVICE_ACCOUNT_JSON service account JSON string
// Nonsecret per-client config: tracking-config.json next to this file.

const ALLOWED_DAYS = new Set([7, 30, 90])

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(body),
  }
}

// Metadata numerics only — lenient parse for rowCount/sampling fields.
function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Report row metrics: missing/empty values must not silently become zero.
function metric(row, index) {
  const raw = row?.metricValues?.[index]?.value
  if (raw === undefined || raw === null || raw === '') throw new Error("malformed metric value")
  const n = Number(raw)
  if (!Number.isSafeInteger(n) || n < 0) throw new Error("malformed metric value")
  return n
}

function dimension(row, index) {
  const v = row && row.dimensionValues && row.dimensionValues[index] && row.dimensionValues[index].value
  if (typeof v !== "string") throw new Error("malformed dimension value")
  return v
}

// Spec-fixed request shapes A–F. Do not alter.
function buildRequests(days, eventNames) {
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "yesterday" }]
  const eventFilter = { filter: { fieldName: "eventName", inListFilter: { values: eventNames } } }
  return {
    totals: { dateRanges, metrics: [{ name: "totalUsers" }, { name: "sessions" }] },
    dailyTraffic: {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      limit: 10000,
    },
    channels: {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 1000,
    },
    outcomeTotals: {
      dateRanges,
      metrics: [{ name: "totalUsers" }, { name: "eventCount" }],
      dimensionFilter: eventFilter,
    },
    dailyConversions: {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter,
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      limit: 10000,
    },
    eventBreakdown: {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter,
      limit: 1000,
    },
  }
}

// Per-query integrity flags. Throws partial_data when GA4 reports more rows
// than were fetched.
function inspectResponse(response, warnings, label) {
  if (!response || typeof response !== "object") throw Object.assign(new Error("absent response"), { code: "malformed" })
  const rows = Array.isArray(response.rows) ? response.rows : []
  const rowCount = num(response.rowCount)
  if (rowCount !== null && rowCount > rows.length) {
    throw Object.assign(new Error(`${label} rowCount ${rowCount} exceeds fetched ${rows.length}`), { code: "partial_data" })
  }
  const metadata = (response && response.metadata) || {}
  if (metadata.subjectToThresholding === true) {
    warnings.push(`GA4 applied privacy thresholding to the ${label} report; some values may be withheld.`)
  }
  const sampling = Array.isArray(metadata.samplingMetadatas) ? metadata.samplingMetadatas : []
  let sampleFraction = null
  for (const s of sampling) {
    const read = num(s && s.samplesReadCount)
    const space = num(s && s.samplingSpaceSize)
    if (read !== null && space !== null && space > 0) {
      const f = read / space
      if (f < 1 && (sampleFraction === null || f < sampleFraction)) sampleFraction = f
    }
  }
  if (sampleFraction !== null) {
    warnings.push(`The ${label} report is sampled (${(sampleFraction * 100).toFixed(1)}% of data); figures are estimates, not exact counts.`)
  }
  return {
    rows,
    thresholded: metadata.subjectToThresholding === true,
    otherRow: metadata.dataLossFromOtherRow === true,
    sampled: sampleFraction !== null,
    sampleFraction,
    timeZone: typeof metadata.timeZone === "string" ? metadata.timeZone : null,
  }
}

// Completed property-calendar bounds: start = today - days, end = today - 1,
// in the GA4 property timezone. Returns nulls when timezone is unavailable.
function propertyDateRange(days, timeZone) {
  const label = `Last ${days} complete days ending yesterday (GA4 property timezone)`
  if (!timeZone) return { startDate: null, endDate: null, timeZone: null, label }
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date())
    const get = (t) => parts.find((p) => p.type === t).value
    const todayUtc = Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day")))
    const ymd = (ms) => new Date(ms).toISOString().slice(0, 10)
    return {
      startDate: ymd(todayUtc - days * 86400000),
      endDate: ymd(todayUtc - 86400000),
      timeZone,
      label,
    }
  } catch {
    return { startDate: null, endDate: null, timeZone: null, label }
  }
}

function createHandler(deps) {
  return async function handler(event, context) {
    if (!event || event.httpMethod !== "GET") return json(405, { error: "method_not_allowed" })
    if (!context || !context.clientContext || !context.clientContext.user) {
      return json(401, { error: "unauthorized" })
    }

    const propertyId = deps.env.GA4_PROPERTY_ID || ""
    const serviceAccountJson = deps.env.GA4_SERVICE_ACCOUNT_JSON || ""
    if (!/^[0-9]+$/.test(propertyId) || !serviceAccountJson) return json(503, { error: "not_configured" })

    const daysParam = event.queryStringParameters && event.queryStringParameters.days
    const days = daysParam === undefined || daysParam === "" ? 30 : Number(daysParam)
    if (!ALLOWED_DAYS.has(days)) return json(400, { error: "invalid_days" })

    const requests = buildRequests(days, deps.config.eventNames)
    let responses
    try {
      const keys = Object.keys(requests)
      const results = await Promise.all(
        keys.map((k) => deps.runReport(Object.assign({ property: `properties/${propertyId}` }, requests[k])))
      )
      responses = {}
      keys.forEach((k, i) => {
        responses[k] = results[i] && results[i][0]
      })
    } catch {
      return json(502, { error: "report_unavailable" })
    }

    const warnings = []
    const inspected = {}
    try {
      for (const key of Object.keys(requests)) {
        inspected[key] = inspectResponse(responses[key], warnings, key)
      }
    } catch (e) {
      if (e && e.code === "partial_data") return json(502, { error: "partial_data" })
      return json(502, { error: "malformed_response" })
    }

    try {
      // A — totals (empty rows are valid: zero traffic for the whole period)
      const totalsRow = inspected.totals.rows[0]
      const visitors = totalsRow ? metric(totalsRow, 0) : 0
      const sessions = totalsRow ? metric(totalsRow, 1) : 0

      // B — daily traffic
      const dailyRows = inspected.dailyTraffic.rows.map((row) => ({
        date: dimension(row, 0),
        visitors: metric(row, 0),
        sessions: metric(row, 1),
      }))

      // C — channels
      const channels = inspected.channels.rows.map((row) => ({
        channel: dimension(row, 0),
        sessions: metric(row, 0),
      }))

      // D — outcome totals (unique converted users + event count across period)
      const outcomeRow = inspected.outcomeTotals.rows[0]
      const convertedUsers = outcomeRow ? metric(outcomeRow, 0) : 0
      const eventCount = outcomeRow ? metric(outcomeRow, 1) : 0
      const conversionRate = visitors > 0 ? (convertedUsers / visitors) * 100 : null
      const anomaly = convertedUsers > visitors
      if (anomaly) warnings.push("Source anomaly: GA4 reports more converted users than total users for this period.")
      if (visitors > 0 && eventCount === 0) {
        warnings.push("No recorded bookings in this period. If bookings occurred, verify booking_completed tracking is firing.")
      }

      // E — daily conversions, left-joined into daily traffic
      const conversionByDate = new Map()
      for (const row of inspected.dailyConversions.rows) {
        conversionByDate.set(dimension(row, 0), metric(row, 0))
      }
      const daily = dailyRows.map((row) => ({ ...row, bookings: conversionByDate.get(row.date) || 0 }))

      // F — event breakdown
      const events = inspected.eventBreakdown.rows.map((row) => ({
        name: dimension(row, 0),
        count: metric(row, 0),
      }))

      let thresholded = false
      let otherRow = false
      let sampled = false
      let sampleFraction = null
      let timeZone = null
      for (const key of Object.keys(inspected)) {
        const f = inspected[key]
        thresholded = thresholded || f.thresholded
        otherRow = otherRow || f.otherRow
        sampled = sampled || f.sampled
        if (f.sampleFraction !== null && (sampleFraction === null || f.sampleFraction < sampleFraction)) {
          sampleFraction = f.sampleFraction
        }
        if (!timeZone && f.timeZone) timeZone = f.timeZone
      }
      if (otherRow) {
        warnings.push("GA4 aggregated some rows into an '(other)' bucket in this period.")
      }

      return json(200, {
        client: deps.config.clientName,
        source: "ga4",
        sample: false,
        days,
        dateRange: propertyDateRange(days, timeZone),
        totals: { visitors, sessions },
        daily,
        channels,
        outcomes: { convertedUsers, eventCount, conversionRate, anomaly },
        events,
        meta: {
          partial: thresholded || otherRow || sampled,
          thresholded,
          otherRow,
          sampled,
          sampleFraction,
          warnings,
          generatedAt: new Date().toISOString(),
        },
      })
    } catch {
      return json(502, { error: "malformed_response" })
    }
  }
}

let gaClient = null
const lazyRunReport = (request) => {
  if (!gaClient) {
    const { BetaAnalyticsDataClient } = require("@google-analytics/data")
    gaClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON || ""),
    })
  }
  return gaClient.runReport(request)
}

// Auth and method checks run before config/client initialisation so missing
// credentials can never leak ahead of a 401.
exports.handler = async function (event, context) {
  if (!event || event.httpMethod !== "GET") return json(405, { error: "method_not_allowed" })
  if (!context || !context.clientContext || !context.clientContext.user) {
    return json(401, { error: "unauthorized" })
  }
  let config
  try {
    config = require("./tracking-config.json")
    if (!config || typeof config.clientName !== "string" || !Array.isArray(config.eventNames) || config.eventNames.length === 0) {
      throw new Error("bad config")
    }
  } catch {
    return json(503, { error: "not_configured" })
  }
  return createHandler({ env: process.env, runReport: lazyRunReport, config })(event, context)
}

exports.createHandler = createHandler
