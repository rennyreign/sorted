"use client"

import { useEffect, useRef, useState } from "react"
import styles from "../infrastructure.module.css"

type Stage = { id: string; label: string; detail: string }

type Build = {
  id: string
  tab: string
  aria: string
  stages: Stage[]
  stageMs: number[]
  before: { src: string; alt: string; bar: string; caption: string }
  findingsLabel: string
  findings: string[]
  planLabel: string
  plan: string[]
  built: { src: string; alt: string; bar: string }
  done: { title: string; body: string; href?: string; linkLabel?: string }
  contrast: string
}

const BUILDS: Build[] = [
  {
    id: "site",
    tab: "Site rebuild",
    aria: "Replay of a real website build run by one operator",
    stages: [
      { id: "audit", label: "Reads the brief", detail: "What exists, what the result must be" },
      { id: "diagnose", label: "Finds what it costs", detail: "Three gaps worth fixing" },
      { id: "plan", label: "Locks the scope", detail: "Agreed before a line is written" },
      { id: "build", label: "Builds the page", detail: "No prompts. No supervision." },
      { id: "handoff", label: "Delivers for review", detail: "The result, live" },
    ],
    stageMs: [4200, 4200, 3800, 13000, 6000],
    before: {
      src: "/ops/joshi-old-site.jpg",
      alt: "The old website the operator started from",
      bar: "the site as it was",
      caption: "The input: an existing site underselling the business.",
    },
    findingsLabel: "What the old site was costing",
    findings: [
      "Generic stock imagery hid the people behind the firm",
      "Services were hard to choose between",
      "No simple, personal first step",
    ],
    planLabel: "The agreed fix",
    plan: [
      "A warmer first impression",
      "Six services, plainly organised",
      "A direct conversation route",
    ],
    built: {
      src: "/ops/joshi-new-homepage.webp",
      alt: "The new homepage being built",
      bar: "the new site, live",
    },
    done: {
      title: "No prompts. No supervision.",
      body: "Brief in, finished page out. Every build runs the same chain. The business changes, the process doesn't.",
      href: "https://sortmydigital.site/preview/joshi-accounting-services/",
      linkLabel: "See the real result",
    },
    contrast:
      "An agent would need you to prompt every step. This ran start to finish on its own.",
  },
  {
    id: "sheet",
    tab: "Sheet → automated application",
    aria: "Replay of a spreadsheet process rebuilt as an automated application by one operator",
    stages: [
      { id: "audit", label: "Reads the process", detail: "The sheet the business runs on" },
      { id: "diagnose", label: "Finds what it costs", detail: "Where the sheet lets work fall through" },
      { id: "plan", label: "Locks the scope", detail: "Agreed before a line is written" },
      { id: "build", label: "Builds the interface", detail: "No prompts. No supervision." },
      { id: "handoff", label: "Delivers for review", detail: "The working app, live" },
    ],
    stageMs: [4200, 4200, 3800, 13000, 6000],
    before: {
      src: "/ops/derma-sheet.png",
      alt: "The outreach spreadsheet the business ran on",
      bar: "the process as it was",
      caption:
        "The input: one spreadsheet where every creator relationship collapses into a single status column.",
    },
    findingsLabel: "What the sheet was costing",
    findings: [
      "Trials, replies and evidence squeezed into one status column",
      "Contact history lived in DMs and memory",
      "No named next action. Nothing tells you who to chase today",
    ],
    planLabel: "The agreed fix",
    plan: [
      "Relationship, trial stage and evidence shown separately",
      "One named next action on every open trial",
      "Re-import the sheet, no duplicates",
    ],
    built: {
      src: "/ops/derma-app.png",
      alt: "The Creator Hub interface being built: creator cards, statuses and next actions",
      bar: "the new interface, live",
    },
    done: {
      title: "Sheet in. App out.",
      body: "The process the business already ran, rebuilt as a working interface. Same chain. The input changed, the process didn't.",
    },
    contrast:
      "An agent would need you to describe the schema and prompt every step. This ran start to finish on its own.",
  },
]

function Replay({ build }: { build: Build }) {
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
    if (!started || stage >= build.stages.length - 1) return
    const t = setTimeout(() => setStage((s) => s + 1), build.stageMs[stage])
    return () => clearTimeout(t)
  }, [started, stage, build])

  function replay() {
    setStage(0)
    setStarted(true)
  }

  const current = build.stages[stage].id

  return (
    <div ref={rootRef} className={styles.replay} aria-label={build.aria}>
      <div className={styles.replayRail}>
        <ol className={styles.replaySteps}>
          {build.stages.map(({ label, detail }, i) => (
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
        <p className={styles.replayContrast}>{build.contrast}</p>
        <button type="button" onClick={replay} className={styles.replayButton}>
          {stage >= build.stages.length - 1 ? "Replay the build" : "Restart"}
        </button>
      </div>

      <div className={styles.replayStage}>
        {current === "audit" && (
          <figure className={styles.replayPanel}>
            <div className={styles.replayBrowserBar}>
              <span />
              {build.before.bar}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={build.before.src} alt={build.before.alt} className={styles.replayImg} />
            <figcaption className={styles.replayCaption}>{build.before.caption}</figcaption>
          </figure>
        )}

        {current === "diagnose" && (
          <div className={styles.replayPanel}>
            <p className={styles.replayPanelLabel}>{build.findingsLabel}</p>
            <ul className={styles.replayFindings}>
              {build.findings.map((f, i) => (
                <li key={f} style={{ animationDelay: `${i * 0.5}s` }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {current === "plan" && (
          <div className={styles.replayPanel}>
            <p className={styles.replayPanelLabel}>{build.planLabel}</p>
            <ul className={styles.replayPlan}>
              {build.plan.map((p, i) => (
                <li key={p} style={{ animationDelay: `${i * 0.4}s` }}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {current === "build" && (
          <div className={`${styles.replayPanel} ${styles.replayBuild}`}>
            <div className={styles.replayBrowserBar}>
              <span />
              {build.built.bar}
            </div>
            <div className={styles.replayViewport}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={build.built.src} alt={build.built.alt} className={styles.replayBuildImg} />
            </div>
          </div>
        )}

        {current === "handoff" && (
          <div className={`${styles.replayPanel} ${styles.replayDone}`}>
            <p className={styles.replayDoneTitle}>{build.done.title}</p>
            <p className={styles.replayDoneBody}>{build.done.body}</p>
            {build.done.href && (
              <a
                href={build.done.href}
                target={build.done.href.startsWith("http") ? "_blank" : undefined}
                rel={build.done.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={styles.replayLink}
              >
                {build.done.linkLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function BuildReplay({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0)

  return (
    <div className={compact ? styles.replayCompact : ""}>
      <div className={styles.replayTabs} role="tablist" aria-label="Build examples">
        {BUILDS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`${styles.replayTab} ${i === active ? styles.replayTabActive : ""}`}
            onClick={() => setActive(i)}
          >
            {b.tab}
          </button>
        ))}
      </div>
      <Replay key={BUILDS[active].id} build={BUILDS[active]} />
    </div>
  )
}
