// Local development fixture for /tracking/ — only reachable when the site is
// served in a non-production build and ?fixture=demo is present. Never wire
// this into production data paths.

export type TrackingReport = {
  client: string
  source: string
  sample: boolean
  days: number
  dateRange: { startDate: string | null; endDate: string | null; timeZone: string | null; label: string }
  totals: { visitors: number; sessions: number }
  daily: Array<{ date: string; visitors: number; sessions: number; bookings: number }>
  channels: Array<{ channel: string; sessions: number }>
  outcomes: { convertedUsers: number; eventCount: number; conversionRate: number | null; anomaly: boolean }
  events: Array<{ name: string; count: number }>
  meta: {
    partial: boolean
    thresholded: boolean
    otherRow: boolean
    sampled: boolean
    sampleFraction: number | null
    warnings: string[]
    generatedAt: string
  }
}

function buildFixture(days: number): TrackingReport {
  const daily = Array.from({ length: days }, (_, i) => {
    const visitors = 18 + Math.round(12 * Math.sin(i / 4) + (i % 5) * 2)
    return {
      date: `D${String(i + 1).padStart(2, "0")}`,
      visitors,
      sessions: visitors + 4 + (i % 7),
      bookings: i % 9 === 0 ? 1 : 0,
    }
  })
  // Period totals are intentionally NOT the sum of daily visitors (the same
  // visitor can appear on multiple days), matching GA4 distinct-user semantics.
  const dayTotals: Record<number, { visitors: number; sessions: number; converted: number; events: number }> = {
    7: { visitors: 132, sessions: 168, converted: 3, events: 3 },
    30: { visitors: 512, sessions: 648, converted: 9, events: 11 },
    90: { visitors: 1410, sessions: 1890, converted: 24, events: 29 },
  }
  const t = dayTotals[days] || dayTotals[30]
  const channelTotals: Record<number, number[]> = {
    7: [78, 49, 19, 13, 9],
    30: [302, 188, 74, 52, 32],
    90: [880, 540, 210, 150, 110],
  }
  const names = ["Organic Search", "Direct", "Referral", "Organic Social", "(not set)"]
  return {
    client: "Sample data",
    source: "fixture",
    sample: true,
    days,
    dateRange: {
      startDate: null,
      endDate: null,
      timeZone: null,
      label: `Last ${days} complete days ending yesterday (GA4 property timezone)`,
    },
    totals: { visitors: t.visitors, sessions: t.sessions },
    daily,
    channels: names.map((channel, i) => ({ channel, sessions: channelTotals[days][i] })),
    outcomes: {
      convertedUsers: t.converted,
      eventCount: t.events,
      conversionRate: (t.converted / t.visitors) * 100,
      anomaly: false,
    },
    events: [{ name: "booking_completed", count: t.events }],
    meta: {
      partial: false,
      thresholded: false,
      otherRow: false,
      sampled: false,
      sampleFraction: null,
      warnings: ["Sample data shown for local preview only — not real analytics."],
      generatedAt: new Date().toISOString(),
    },
  }
}

export function fixtureReport(days: number): TrackingReport {
  return buildFixture(days)
}
