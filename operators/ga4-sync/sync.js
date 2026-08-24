/**
 * GA4 Weekly Metrics Sync
 *
 * Pulls weekly website metrics from the GA4 Data API and writes them into
 * the `ga4_weekly_metrics` table in Supabase via the operator_upsert_ga4_weekly
 * RPC.  Runs as a GitHub Action on a weekly cron.
 *
 * Metrics pulled:
 *   - website_sessions        (total sessions)
 *   - mockup_page_views       (pageviews on /review/* paths)
 *   - unique_mockup_visitors  (distinct users on /review/* paths)
 *   - cta_conversions         (cta_click + thank_you_view + booking_completed events)
 *   - leads_from_ga4          (form_submit + thank_you_view events)
 *
 * Required environment variables:
 *   GA4_PROPERTY_ID           — e.g. "properties/123456789"
 *   GA4_SERVICE_ACCOUNT_JSON  — JSON key file contents for a service account
 *   SUPABASE_URL              — Supabase project URL
 *   SUPABASE_SERVICE_KEY      — Supabase service role key
 *   OPERATOR_API_TOKEN        — Operator token for the upsert RPC
 *
 * The service account must be created in Google Cloud Console and the
 * GA4 property must be shared with the service account email.
 */

const { BetaAnalyticsDataClient } = require("@google-analytics/data")
const { JWT } = require("google-auth-library")

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const GA4_SERVICE_ACCOUNT_JSON = process.env.GA4_SERVICE_ACCOUNT_JSON
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const OPERATOR_API_TOKEN = process.env.OPERATOR_API_TOKEN

function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() || 7 // Sunday = 7
  d.setDate(d.getDate() - day + 1) // Monday
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

async function run() {
  if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_JSON || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPERATOR_API_TOKEN) {
    console.error("Missing required environment variables")
    process.exit(1)
  }

  const credentials = JSON.parse(GA4_SERVICE_ACCOUNT_JSON)
  const authClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  })

  const analyticsDataClient = new BetaAnalyticsDataClient({
    auth: authClient,
  })

  // Sync the most recent complete week (last week) and the current week
  const today = new Date()
  const thisWeekStart = getWeekStart(today)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const weeksToSync = [lastWeekStart, thisWeekStart]

  for (const weekStart of weeksToSync) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd > today) weekEnd.setTime(today.getTime()) // don't query future dates

    const startDate = formatDate(weekStart)
    const endDate = formatDate(weekEnd)
    const weekStartStr = formatDate(weekStart)

    console.log(`\nSyncing GA4 metrics for week ${startDate} to ${endDate}`)

    // ── 1. Total sessions ─────────────────────────────────────────────────────
    const [sessionResponse] = await analyticsDataClient.runReport({
      property: GA4_PROPERTY_ID,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "sessions" }],
    })
    const websiteSessions = parseInt(sessionResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0", 10)
    console.log(`  Website sessions: ${websiteSessions}`)

    // ── 2. Mockup page views + unique mockup visitors (/review/* paths) ───────
    const [mockupResponse] = await analyticsDataClient.runReport({
      property: GA4_PROPERTY_ID,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/review/" },
        },
      },
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
      ],
    })
    let mockupPageViews = 0
    let uniqueMockupVisitors = 0
    if (mockupResponse.rows) {
      for (const row of mockupResponse.rows) {
        mockupPageViews += parseInt(row.metricValues?.[0]?.value ?? "0", 10)
        uniqueMockupVisitors += parseInt(row.metricValues?.[1]?.value ?? "0", 10)
      }
    }
    console.log(`  Mockup page views: ${mockupPageViews}`)
    console.log(`  Unique mockup visitors: ${uniqueMockupVisitors}`)

    // ── 3. CTA conversions (cta_click + thank_you_view + booking_completed) ──
    const [ctaResponse] = await analyticsDataClient.runReport({
      property: GA4_PROPERTY_ID,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        orGroup: {
          filterExpressions: [
            { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } },
            { filter: { fieldName: "eventName", stringFilter: { value: "thank_you_view" } } },
            { filter: { fieldName: "eventName", stringFilter: { value: "booking_completed" } } },
          ],
        },
      },
    })
    const ctaConversions = parseInt(ctaResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0", 10)
    console.log(`  CTA conversions: ${ctaConversions}`)

    // ── 4. Leads from GA4 (form_submit + thank_you_view) ──────────────────────
    const [leadsResponse] = await analyticsDataClient.runReport({
      property: GA4_PROPERTY_ID,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        orGroup: {
          filterExpressions: [
            { filter: { fieldName: "eventName", stringFilter: { value: "form_submit" } } },
            { filter: { fieldName: "eventName", stringFilter: { value: "thank_you_view" } } },
          ],
        },
      },
    })
    const leadsFromGa4 = parseInt(leadsResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0", 10)
    console.log(`  Leads from GA4: ${leadsFromGa4}`)

    // ── 5. Write to Supabase via operator RPC ─────────────────────────────────
    const rawResponse = {
      week_start: weekStartStr,
      date_range: { startDate, endDate },
      sessions: websiteSessions,
      mockup_page_views: mockupPageViews,
      unique_mockup_visitors: uniqueMockupVisitors,
      cta_conversions: ctaConversions,
      leads_from_ga4: leadsFromGa4,
    }

    const rpcResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/operator_upsert_ga4_weekly`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_operator_token: OPERATOR_API_TOKEN,
        p_week_start: weekStartStr,
        p_website_sessions: websiteSessions,
        p_mockup_page_views: mockupPageViews,
        p_unique_mockup_visitors: uniqueMockupVisitors,
        p_cta_conversions: ctaConversions,
        p_leads_from_ga4: leadsFromGa4,
        p_raw_response: rawResponse,
      }),
    })

    if (!rpcResp.ok) {
      const text = await rpcResp.text()
      throw new Error(`Failed to upsert GA4 metrics for ${weekStartStr}: ${rpcResp.status} ${text}`)
    }
    console.log(`  ✓ Written to ga4_weekly_metrics for ${weekStartStr}`)
  }

  // ── 6. Save scorecard snapshot ──────────────────────────────────────────────
  const thisWeekStr = formatDate(thisWeekStart)
  console.log(`\nSaving scorecard snapshot for ${thisWeekStr}`)

  const snapshotResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/operator_get_scorecard`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_operator_token: OPERATOR_API_TOKEN,
      p_week_start: thisWeekStr,
    }),
  })

  if (!snapshotResp.ok) {
    const text = await snapshotResp.text()
    console.error(`Failed to get scorecard: ${snapshotResp.status} ${text}`)
    return
  }

  const scorecardJson = await snapshotResp.json()

  const saveResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/operator_save_scorecard_snapshot`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_operator_token: OPERATOR_API_TOKEN,
      p_week_start: thisWeekStr,
      p_snapshot: scorecardJson,
    }),
  })

  if (!saveResp.ok) {
    const text = await saveResp.text()
    throw new Error(`Failed to save scorecard snapshot for ${thisWeekStr}: ${saveResp.status} ${text}`)
  }
  console.log(`✓ Scorecard snapshot saved for ${thisWeekStr}`)
}

run().catch((err) => {
  console.error("GA4 sync failed:", err)
  process.exit(1)
})
