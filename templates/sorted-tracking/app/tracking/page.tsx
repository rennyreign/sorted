"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import "./tracking.css"
import { fixtureReport, type TrackingReport } from "./fixture"

type Status = "loading" | "signedOut" | "ready" | "error" | "notConfigured"

const DAY_OPTIONS = [7, 30, 90] as const
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function identity() {
  return (window as any).netlifyIdentity
}

function formatYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

function formatDay(ymd: string) {
  if (/^\d{8}$/.test(ymd)) return `${ymd.slice(6, 8)}/${ymd.slice(4, 6)}`
  return ymd
}

export default function TrackingPage() {
  const [status, setStatus] = useState<Status>("loading")
  const [report, setReport] = useState<TrackingReport | null>(null)
  const [days, setDays] = useState<number>(30)
  const [refreshing, setRefreshing] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const mounted = useRef(true)
  const initialised = useRef(false)
  const daysRef = useRef(days)
  daysRef.current = days

  const useFixture =
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("fixture") === "demo"

  const signOut = useCallback(() => {
    try {
      identity()?.logout?.()
    } catch {}
    setReport(null)
    setStatus("signedOut")
  }, [])

  const loadReport = useCallback(
    async (period: number) => {
      if (useFixture) {
        setReport(fixtureReport(period))
        setStatus("ready")
        return
      }
      const ni = identity()
      const user = ni?.currentUser?.()
      if (!user) {
        setStatus("signedOut")
        return
      }
      setRefreshing(true)
      setErrorDetail(null)
      try {
        const token: string = await ni.refresh().catch(() => user.jwt())
        const res = await fetch(`/.netlify/functions/tracking-report?days=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!mounted.current) return
        if (res.status === 401) {
          signOut()
          return
        }
        if (res.status === 503) {
          setStatus("notConfigured")
          return
        }
        if (!res.ok) {
          setStatus("error")
          setErrorDetail(`Report request failed (${res.status})`)
          return
        }
        const data = (await res.json()) as TrackingReport
        setReport(data)
        setStatus("ready")
      } catch {
        if (mounted.current) {
          setStatus("error")
          setErrorDetail("Could not reach the reporting service.")
        }
      } finally {
        if (mounted.current) setRefreshing(false)
      }
    },
    [useFixture, signOut]
  )

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (useFixture) {
      loadReport(daysRef.current)
      return
    }
    if (!widgetReady || initialised.current) return
    initialised.current = true
    const ni = identity()
    if (!ni) {
      setStatus("error")
      setErrorDetail("Sign-in service unavailable.")
      return
    }
    let requested = false
    const request = () => {
      if (requested) return
      requested = true
      loadReport(daysRef.current)
    }
    ni.on("init", (user: unknown) => {
      if (user) request()
      else setStatus("signedOut")
    })
    ni.on("login", request)
    ni.on("logout", () => {
      requested = false
      setReport(null)
      setStatus("signedOut")
    })
    ni.init()
    // Fallback: 'init' may not fire locally (no Identity site), and may have
    // fired before listeners attached when a session exists.
    if (ni.currentUser?.()) request()
    else setStatus("signedOut")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetReady, useFixture])

  const changeDays = (d: number) => {
    setDays(d)
    loadReport(d)
  }

  const maxDaily = report ? Math.max(1, ...report.daily.map((d) => d.visitors)) : 1
  const maxChannel = report ? Math.max(1, ...report.channels.map((c) => c.sessions)) : 1

  const rangeText = report
    ? report.dateRange.startDate && report.dateRange.endDate
      ? `${formatYmd(report.dateRange.startDate)} – ${formatYmd(report.dateRange.endDate)}${report.dateRange.timeZone ? ` · ${report.dateRange.timeZone}` : ""}`
      : report.dateRange.label
    : ""

  return (
    <main className="trk">
      {!useFixture && (
        <Script
          src="https://identity.netlify.com/v1/netlify-identity-widget.js"
          strategy="afterInteractive"
          onLoad={() => setWidgetReady(true)}
        />
      )}

      <header className="trk-header">
        <div className="trk-brand">
          <span className="trk-title">Sorted Tracking</span>
          {report?.client ? <span className="trk-client">{report.client}</span> : null}
          {report?.sample ? <span className="trk-sample">Sample data</span> : null}
        </div>
        <div className="trk-actions">
          <div className="trk-days" role="group" aria-label="Report period">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={d === days ? "trk-day is-active" : "trk-day"}
                onClick={() => changeDays(d)}
                disabled={status !== "ready"}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            type="button"
            className="trk-btn"
            onClick={() => loadReport(days)}
            disabled={status !== "ready" || refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          {!useFixture && status === "ready" ? (
            <button type="button" className="trk-btn trk-btn-quiet" onClick={signOut}>
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {status === "loading" ? (
        <section className="trk-state" aria-busy="true">
          <div className="trk-skel trk-skel-lg" />
          <div className="trk-skel" />
          <div className="trk-skel" />
        </section>
      ) : null}

      {status === "signedOut" ? (
        <section className="trk-state">
          <h1 className="trk-h1">Site report</h1>
          <p className="trk-muted">Sign in with your Sorted account to view this site's private report.</p>
          <button type="button" className="trk-btn" onClick={() => identity()?.open?.("login")}>
            Sign in
          </button>
        </section>
      ) : null}

      {status === "notConfigured" ? (
        <section className="trk-state">
          <h1 className="trk-h1">Report not configured</h1>
          <p className="trk-muted">
            Analytics reporting is not set up for this site yet. Contact Sorted to finish configuration.
          </p>
        </section>
      ) : null}

      {status === "error" ? (
        <section className="trk-state">
          <h1 className="trk-h1">Report unavailable</h1>
          <p className="trk-muted">{errorDetail || "Something went wrong loading this report."}</p>
          <button type="button" className="trk-btn" onClick={() => loadReport(days)}>
            Try again
          </button>
        </section>
      ) : null}

      {status === "ready" && report ? (
        <>
          <p className="trk-range">
            {rangeText} · Source: {report.sample ? "sample fixture (local preview)" : "Google Analytics 4"}
          </p>

          {report.meta.warnings.length > 0 ? (
            <div className="trk-notice" role="status">
              {report.meta.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          ) : null}

          <section className="trk-kpis" aria-label="Headline metrics">
            <div className="trk-kpi trk-kpi-primary">
              <span className="trk-kpi-value">{report.totals.visitors.toLocaleString()}</span>
              <span className="trk-kpi-label">Distinct visitors</span>
            </div>
            <div className="trk-kpi">
              <span className="trk-kpi-value">{report.totals.sessions.toLocaleString()}</span>
              <span className="trk-kpi-label">Sessions</span>
            </div>
            <div className="trk-kpi">
              <span className="trk-kpi-value">{report.outcomes.eventCount.toLocaleString()}</span>
              <span className="trk-kpi-label">Recorded bookings</span>
            </div>
            <div className="trk-kpi">
              <span className="trk-kpi-value">
                {report.outcomes.conversionRate === null ? "—" : `${report.outcomes.conversionRate.toFixed(1)}%`}
              </span>
              <span className="trk-kpi-label">Visitor conversion rate</span>
            </div>
          </section>

          <section className="trk-panel" aria-label="Daily trend">
            <h2 className="trk-h2">Daily trend</h2>
            {report.daily.length === 0 ? (
              <p className="trk-muted">No traffic recorded in this period.</p>
            ) : (
              <div className="trk-trend" role="img" aria-label="Daily visitors bar chart">
                {report.daily.map((d) => (
                  <div key={d.date} className="trk-trend-col" title={`${formatDay(d.date)} — ${d.visitors} visitors, ${d.sessions} sessions, ${d.bookings} bookings`}>
                    {d.bookings > 0 ? <span className="trk-trend-dot" aria-hidden="true" /> : null}
                    <div className="trk-trend-bar" style={{ height: `${Math.max(2, (d.visitors / maxDaily) * 100)}%` }} />
                    <span className="trk-trend-date">{formatDay(d.date)}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="trk-legend">Bars: daily distinct visitors · Dot: day with recorded booking(s)</p>
          </section>

          <section className="trk-panel" aria-label="Sessions by channel">
            <h2 className="trk-h2">Sessions by channel</h2>
            {report.channels.length === 0 ? (
              <p className="trk-muted">No channel data recorded in this period.</p>
            ) : (
              <table className="trk-table">
                <tbody>
                  {report.channels.map((c) => (
                    <tr key={c.channel}>
                      <td className="trk-table-label">{c.channel}</td>
                      <td className="trk-table-bar">
                        <div className="trk-bar" style={{ width: `${Math.max(1, (c.sessions / maxChannel) * 100)}%` }} />
                      </td>
                      <td className="trk-table-num">{c.sessions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <footer className="trk-footer">
            <p>
              Distinct visitors is the number of unique people who visited across the whole period — it is not a
              sum of the daily figures. Sessions are visits, including repeat visits. Recorded bookings counts
              booking_completed events reported by the site (a browser-reported success, not a verified payment).
              Visitor conversion rate is unique visitors who completed a booking divided by all distinct visitors.
            </p>
            <p>
              Source: {report.sample ? "sample fixture (local preview)" : "Google Analytics 4"} · Report generated{" "}
              {new Date(report.meta.generatedAt).toLocaleString("en-GB")}
            </p>
          </footer>
        </>
      ) : null}
    </main>
  )
}
