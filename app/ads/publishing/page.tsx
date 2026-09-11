"use client"

import { useState } from "react"
import { Send, Eye, Check, Calendar, DollarSign, Zap } from "lucide-react"

type SelectableAd = {
  angleId: string
  angleName: string
  creativeThumb: string
  variantType: "short" | "medium" | "long"
  status: "approved" | "ready"
  selected: boolean
}

const steps = ["Select ads", "Set schedule", "Review & publish"] as const
type Step = (typeof steps)[number]

export default function PublishingPage() {
  const [step, setStep] = useState<Step>("Select ads")
  const [ads, setAds] = useState<SelectableAd[]>([
    { angleId: "1", angleName: "Recognition", creativeThumb: "", variantType: "short", status: "approved", selected: true },
    { angleId: "1", angleName: "Recognition", creativeThumb: "", variantType: "medium", status: "approved", selected: false },
    { angleId: "1", angleName: "Recognition", creativeThumb: "", variantType: "long", status: "approved", selected: false },
    { angleId: "2", angleName: "Belief shift", creativeThumb: "", variantType: "short", status: "approved", selected: true },
    { angleId: "2", angleName: "Belief shift", creativeThumb: "", variantType: "medium", status: "approved", selected: false },
    { angleId: "3", angleName: "Last year", creativeThumb: "", variantType: "long", status: "ready", selected: false },
  ])
  const [schedule, setSchedule] = useState({ startDate: "", endDate: "", runTime: "09:00", budget: "500", optimisation: "registrations" })

  const stepIndex = steps.indexOf(step)
  const selectedCount = ads.filter((a) => a.selected).length
  const selectedAngles = new Set(ads.filter((a) => a.selected).map((a) => a.angleId)).size

  const toggleAd = (index: number) => {
    setAds((prev) => prev.map((a, i) => (i === index ? { ...a, selected: !a.selected } : a)))
  }

  const selectAll = () => {
    const allSelected = ads.every((a) => a.selected)
    setAds((prev) => prev.map((a) => ({ ...a, selected: !allSelected })))
  }

  return (
    <div className="ads-content">
      <div className="ads-page-header">
        <div className="ads-page-header-row">
          <div>
            <div className="eyebrow">School of Skill · Youth Camp</div>
            <h1>Publishing</h1>
            <p className="subtitle">Get your approved ads live.</p>
          </div>
          <div className="actions">
            <button className="ads-btn ads-btn-secondary">
              <Eye size={18} strokeWidth={1.75} /> Preview plan
            </button>
            <button className="ads-btn ads-btn-primary" disabled={step !== "Review & publish"}>
              <Send size={18} strokeWidth={1.75} /> Publish ads
            </button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "1px solid var(--ads-border)" }}>
        {steps.map((s, i) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderBottom: stepIndex === i ? "2px solid var(--ads-green)" : "2px solid transparent",
              cursor: "pointer",
              color: stepIndex === i ? "var(--ads-green)" : "var(--ads-text-muted)",
              fontWeight: stepIndex === i ? 600 : 500,
              fontSize: 15,
            }}
            onClick={() => setStep(s)}
          >
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: stepIndex >= i ? "var(--ads-green)" : "var(--ads-surface-soft)",
              color: stepIndex >= i ? "white" : "var(--ads-text-muted)",
            }}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {step === "Select ads" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Select approved ads</h2>
                <button className="ads-btn ads-btn-ghost" onClick={selectAll}>
                  {ads.every((a) => a.selected) ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="ads-angle-list">
                {ads.map((ad, i) => (
                  <div key={i} className="ads-angle" style={{ boxShadow: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
                      <input
                        type="checkbox"
                        checked={ad.selected}
                        onChange={() => toggleAd(i)}
                        style={{ width: 20, height: 20, accentColor: "var(--ads-green)", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ads-text-subtle)", width: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{ad.angleName}</div>
                        <div style={{ fontSize: 13, color: "var(--ads-text-muted)" }}>Copy: {ad.variantType}</div>
                      </div>
                      <span className={`ads-status-pill ads-status-${ad.status === "approved" ? "approved" : "learning"}`} style={{ height: 24, fontSize: 12 }}>
                        <span className="dot" />{ad.status === "approved" ? "Approved" : "Ready"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <button className="ads-btn ads-btn-primary" onClick={() => setStep("Set schedule")}>
                  Continue to schedule
                </button>
              </div>
            </>
          )}

          {step === "Set schedule" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Set schedule</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 600 }}>
                <div className="ads-field">
                  <label>Start date</label>
                  <input type="date" value={schedule.startDate} onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })} />
                </div>
                <div className="ads-field">
                  <label>End date</label>
                  <input type="date" value={schedule.endDate} onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })} />
                </div>
                <div className="ads-field">
                  <label>Run time</label>
                  <input type="time" value={schedule.runTime} onChange={(e) => setSchedule({ ...schedule, runTime: e.target.value })} />
                </div>
                <div className="ads-field">
                  <label>Budget (£)</label>
                  <input type="number" value={schedule.budget} onChange={(e) => setSchedule({ ...schedule, budget: e.target.value })} />
                </div>
                <div className="ads-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Optimisation goal</label>
                  <select value={schedule.optimisation} onChange={(e) => setSchedule({ ...schedule, optimisation: e.target.value })} style={{ width: "100%", height: 44, padding: "0 12px", border: "1px solid #DDE0DA", borderRadius: 10, fontSize: 14, background: "white" }}>
                    <option value="registrations">Registrations</option>
                    <option value="link_clicks">Link clicks</option>
                    <option value="reach">Reach</option>
                    <option value="impressions">Impressions</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                <button className="ads-btn ads-btn-secondary" onClick={() => setStep("Select ads")}>Back</button>
                <button className="ads-btn ads-btn-primary" onClick={() => setStep("Review & publish")}>Review & publish</button>
              </div>
            </>
          )}

          {step === "Review & publish" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Review & publish</h2>
              <div className="ads-rail-card" style={{ marginBottom: 16 }}>
                <h3>Selected ads</h3>
                <div style={{ fontSize: 15, marginBottom: 8 }}><strong>{selectedCount}</strong> ads selected across <strong>{selectedAngles}</strong> angles</div>
                {ads.filter((a) => a.selected).map((ad, i) => (
                  <div key={i} style={{ fontSize: 14, color: "var(--ads-text-muted)", marginBottom: 4 }}>
                    {ad.angleName} — {ad.variantType}
                  </div>
                ))}
              </div>
              <div className="ads-rail-card" style={{ marginBottom: 16 }}>
                <h3>Schedule</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
                  <div><strong>Dates:</strong> {schedule.startDate || "—"} to {schedule.endDate || "—"}</div>
                  <div><strong>Run time:</strong> {schedule.runTime}</div>
                  <div><strong>Budget:</strong> £{schedule.budget}</div>
                  <div><strong>Optimisation:</strong> {schedule.optimisation}</div>
                </div>
              </div>
              <div className="ads-rail-card" style={{ marginBottom: 16, background: "var(--ads-yellow-soft)", borderColor: "var(--ads-yellow)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check size={20} style={{ color: "var(--ads-green)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: 4 }}>Ready to publish</strong>
                    <span style={{ fontSize: 14, color: "var(--ads-text-muted)" }}>Connected ad account: School of Skill Meta Business. Publishing will create the ads in your ad account.</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="ads-btn ads-btn-secondary" onClick={() => setStep("Set schedule")}>Back</button>
                <button className="ads-btn ads-btn-primary">
                  <Send size={18} strokeWidth={1.75} /> Publish ads
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right summary */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="ads-rail-card">
            <h3>Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ads-text-muted)" }}>Selected ads</span>
                <strong>{selectedCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ads-text-muted)" }}>Angles</span>
                <strong>{selectedAngles}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ads-text-muted)" }}>Budget</span>
                <strong>£{schedule.budget}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ads-text-muted)" }}>Optimisation</span>
                <strong style={{ textTransform: "capitalize" }}>{schedule.optimisation}</strong>
              </div>
            </div>
          </div>
          <div className="ads-rail-card">
            <h3>Channels</h3>
            <div style={{ fontSize: 15 }}>Facebook · Instagram</div>
          </div>
          <div className="ads-rail-card">
            <h3>Ad account</h3>
            <div style={{ fontSize: 14, color: "var(--ads-text-muted)" }}>School of Skill Meta Business</div>
          </div>
        </div>
      </div>
    </div>
  )
}
