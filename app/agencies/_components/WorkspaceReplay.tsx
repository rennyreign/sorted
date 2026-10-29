"use client"

import { useEffect, useRef, useState } from "react"
import styles from "../../ops/infrastructure/infrastructure.module.css"

const brief = [
  "Twenty years of domestic and commercial electrical work",
  "A Facebook page as the entire web presence",
  "No website, no reviews on show, no quote route",
]

const stages = [
  { id: "brief", label: "Reads the brief", detail: "What exists, what the result must be" },
  { id: "build", label: "Builds the site", detail: "Section by section, unsupervised" },
  { id: "workspace", label: "Assembles the workspace", detail: "Review, site and next steps in one place" },
  { id: "handoff", label: "Delivers for review", detail: "The result, live" },
] as const

const STAGE_MS = [4200, 12500, 5500, 6000]

export function WorkspaceReplay() {
  const [stage, setStage] = useState(0)
  const [started, setStarted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setStarted(true),
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started || stage >= stages.length - 1) return
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS[stage])
    return () => clearTimeout(t)
  }, [started, stage])

  function replay() {
    setStage(0)
    setStarted(true)
  }

  const current = stages[stage].id

  return (
    <div
      ref={rootRef}
      className={styles.replay}
      aria-label="Replay of a real workspace build"
    >
      <div className={styles.replayRail}>
        <ol className={styles.replaySteps}>
          {stages.map(({ label, detail }, i) => (
            <li
              key={label}
              className={`${styles.replayStep} ${
                i < stage ? styles.replayStepDone : ""
              } ${i === stage ? styles.replayStepActive : ""}`}
            >
              <span className={styles.replayStepNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.replayStepText}>
                <span className={styles.replayStepLabel}>{label}</span>
                <span className={styles.replayStepDetail}>{detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className={styles.replayContrast}>
          The same line that builds the site assembles the workspace around it. One delivery,
          everything reviewable.
        </p>
        <button type="button" onClick={replay} className={styles.replayButton}>
          {stage >= stages.length - 1 ? "Replay the build" : "Restart"}
        </button>
      </div>

      <div className={styles.replayStage}>
        {current === "brief" && (
          <div className={styles.replayPanel}>
            <p className={styles.replayPanelLabel}>The input</p>
            <ul className={styles.replayFindings}>
              {brief.map((b, i) => (
                <li key={b} style={{ animationDelay: `${i * 0.5}s` }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {current === "build" && (
          <div className={`${styles.replayPanel} ${styles.replayBuild}`}>
            <div className={styles.replayBrowserBar}>
              <span />the new site, being built
            </div>
            <div className={styles.replayViewport}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/seem-electrical-homepage-preview.webp"
                alt="The new SEEM Electrical homepage being built"
                className={styles.replayBuildImg}
              />
            </div>
          </div>
        )}

        {current === "workspace" && (
          <figure className={styles.replayPanel}>
            <div className={styles.replayBrowserBar}>
              <span />the private workspace
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/agencies/seem-workspace-review.png"
              alt="The private review workspace for the build"
              className={styles.replayImg}
            />
            <figcaption className={styles.replayCaption}>
              The build lands in a private workspace, ready to review.
            </figcaption>
          </figure>
        )}

        {current === "handoff" && (
          <div className={`${styles.replayPanel} ${styles.replayDone}`}>
            <p className={styles.replayDoneTitle}>Brief in, workspace out.</p>
            <p className={styles.replayDoneBody}>
              Campaign angles ship the same way. A defined motivation becomes finished assets,
              assembled in one private workspace for review.
            </p>
            <a
              href="/workspace/seem-electrical-ltd"
              className={styles.replayLink}
            >
              See the real workspace
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
