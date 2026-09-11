"use client"

import { useState } from "react"
import { Download, TrendingDown, TrendingUp } from "lucide-react"

type Metric = {
  name: string
  value: string
  delta: number | null
  format: "integer" | "currency"
}

const topMetrics: Metric[] = [
  { name: "Impressions", value: "48,210", delta: 12, format: "integer" },
  { name: "Link clicks", value: "1,847", delta: 8, format: "integer" },
  { name: "Registrations", value: "94", delta: 23, format: "integer" },
  { name: "Cost per result", value: "£5.32", delta: -15, format: "currency" },
]

const rightMetrics = [
  { name: "Click through rate (CTR)", value: "3.83%", change: 8 },
  { name: "Conversion rate", value: "5.09%", change: 12 },
  { name: "Cost per click (CPC)", value: "£0.27", change: -6 },
  { name: "Cost per registration", value: "£5.32", change: -15 },
  { name: "Impression to registration rate", value: "0.19%", change: 23 },
  { name: "Total spend", value: "£500.00", change: 0 },
]

const channelBreakdown = [
  { name: "Facebook", share: "68%", rate: "5.8%", change: 14 },
  { name: "Instagram", share: "32%", rate: "4.2%", change: 6 },
]

const tableData = [
  { ad: "Recognition — Short", angle: "Recognition", copy: "Short", impressions: 16200, clicks: 680, registrations: 38, costPerResult: "£4.80", ctr: "4.20%", convRate: "5.59%", status: "active" },
  { ad: "Recognition — Medium", angle: "Recognition", copy: "Medium", impressions: 14800, clicks: 520, registrations: 28, costPerResult: "£5.36", ctr: "3.51%", convRate: "5.38%", status: "active" },
  { ad: "Recognition — Long", angle: "Recognition", copy: "Long", impressions: 12100, clicks: 380, registrations: 18, costPerResult: "£6.67", ctr: "3.14%", convRate: "4.74%", status: "active" },
  { ad: "Belief shift — Short", angle: "Belief shift", copy: "Short", impressions: 5100, clicks: 267, registrations: 10, costPerResult: "£7.00", ctr: "5.24%", convRate: "3.75%", status: "learning" },
]

export default function ResultsPage() {
  const [angleFilter, setAngleFilter] = useState("All angles")
  const [copyFilter, setCopyFilter] = useState("All copy lengths")

  return (
    <div className="ads-content">
      <div className="ads-page-header">
        <div className="ads-page-header-row">
          <div>
            <div className="eyebrow">School of Skill · Youth Camp</div>
            <h1>Results</h1>
            <p className="subtitle">Real performance. Clear decisions.</p>
          </div>
          <div className="actions">
            <input type="date" defaultValue="2026-09-01" style={{ height: 44, padding: "0 12px", border: "1px solid #DDE0DA", borderRadius: 10, fontSize: 14 }} />
            <button className="ads-btn ads-btn-secondary">
              <Download size={18} strokeWidth={1.75} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {topMetrics.map((m) => (
          <div key={m.name} className="ads-rail-card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--ads-text-muted)", marginBottom: 8 }}>{m.name}</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>{m.value}</div>
            {m.delta !== null && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: m.delta > 0 || m.name === "Cost per result" && m.delta < 0 ? "var(--ads-green)" : "var(--ads-red)",
              }}>
                {m.delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(m.delta)}% {m.delta > 0 ? "up" : "down"}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Chart placeholder */}
          <div className="ads-rail-card" style={{ marginBottom: 24, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Registrations over time</h3>
              <select style={{ height: 36, padding: "0 12px", border: "1px solid #DDE0DA", borderRadius: 8, fontSize: 13, background: "white" }}>
                <option>Registrations</option>
                <option>Impressions</option>
                <option>Link clicks</option>
                <option>Spend</option>
              </select>
            </div>
            {/* Simple SVG line chart */}
            <svg viewBox="0 0 600 200" style={{ width: "100%", height: 200 }}>
              <defs>
                <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#003E32" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#003E32" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#E3E5DF" strokeWidth="1" />
              ))}
              <path d="M 0 160 L 75 140 L 150 120 L 225 100 L 300 85 L 375 70 L 450 55 L 525 45 L 600 40 L 600 200 L 0 200 Z" fill="url(#area-fill)" />
              <path d="M 0 160 L 75 140 L 150 120 L 225 100 L 300 85 L 375 70 L 450 55 L 525 45 L 600 40" fill="none" stroke="#003E32" strokeWidth="2" />
            </svg>
          </div>

          {/* Performance table */}
          <div className="ads-rail-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--ads-border)" }}>
              <h3 style={{ margin: 0 }}>Performance by ad</h3>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={angleFilter} onChange={(e) => setAngleFilter(e.target.value)} style={{ height: 36, padding: "0 12px", border: "1px solid #DDE0DA", borderRadius: 8, fontSize: 13, background: "white" }}>
                  <option>All angles</option>
                  <option>Recognition</option>
                  <option>Belief shift</option>
                  <option>Last year</option>
                </select>
                <select value={copyFilter} onChange={(e) => setCopyFilter(e.target.value)} style={{ height: 36, padding: "0 12px", border: "1px solid #DDE0DA", borderRadius: 8, fontSize: 13, background: "white" }}>
                  <option>All copy lengths</option>
                  <option>Short</option>
                  <option>Medium</option>
                  <option>Long</option>
                </select>
                <button className="ads-btn ads-btn-secondary" style={{ height: 36, padding: "0 14px", fontSize: 13 }}>
                  <Download size={15} strokeWidth={1.75} /> Export
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--ads-border)" }}>
                    {["Ad", "Angle", "Copy", "Impressions", "Link clicks", "Registrations", "Cost/result", "CTR", "Conv rate", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "var(--ads-text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--ads-border)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)", flexShrink: 0 }} />
                          {row.ad}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--ads-text-muted)" }}>{row.angle}</td>
                      <td style={{ padding: "10px 14px", color: "var(--ads-text-muted)" }}>{row.copy}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{row.impressions.toLocaleString()}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{row.clicks.toLocaleString()}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{row.registrations}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{row.costPerResult}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{row.ctr}</td>
                      <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{row.convRate}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className={`ads-status-pill ads-status-${row.status === "active" ? "active" : "learning"}`} style={{ height: 24, fontSize: 12 }}>
                          <span className="dot" />{row.status === "active" ? "Active" : "Learning"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right metrics */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="ads-rail-card">
            <h3>Performance metrics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {rightMetrics.map((m) => (
                <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--ads-text-muted)" }}>{m.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{m.value}</div>
                  </div>
                  {m.change !== 0 && (
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: m.change > 0 ? "var(--ads-green)" : "var(--ads-red)",
                      display: "flex", alignItems: "center", gap: 2,
                    }}>
                      {m.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(m.change)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="ads-rail-card">
            <h3>Performance by channel</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {channelBreakdown.map((ch) => (
                <div key={ch.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{ch.name}</span>
                    <span style={{ fontSize: 13, color: "var(--ads-text-muted)" }}>{ch.share} of registrations</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--ads-text-muted)" }}>Rate: {ch.rate}</span>
                    <span style={{ color: ch.change > 0 ? "var(--ads-green)" : "var(--ads-red)", fontWeight: 600 }}>
                      {ch.change > 0 ? "+" : ""}{ch.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
