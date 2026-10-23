"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { WorkflowComparison } from "../_components/WorkflowComparison"
import styles from "./presentation.module.css"

const TOTAL = 9

function FlowLine({ steps, accent = false }: { steps: string[]; accent?: boolean }) {
  return (
    <ol className={`${styles.flowLine} ${accent ? styles.flowLineAccent : ""}`}>
      {steps.map((s, i) => (
        <li key={s} className={styles.flowLineItem}>
          {i > 0 && <span className={styles.flowArrow} aria-hidden="true">→</span>}
          <span className={styles.flowStep}>{s}</span>
        </li>
      ))}
    </ol>
  )
}

export function OperatorDeck() {
  const [index, setIndex] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const active = stageRef.current?.querySelector("article:not([aria-hidden='true'])")
    if (active) active.scrollTop = 0
  }, [index])

  const go = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), TOTAL - 1)),
    []
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && t.closest("input, textarea, select, [contenteditable='true']")) return
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, TOTAL - 1))
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Home") {
        e.preventDefault()
        setIndex(0)
      } else if (e.key === "End") {
        e.preventDefault()
        setIndex(TOTAL - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const slides = [
    <div key={0} className={styles.slideInner}>
      <p className={styles.kicker}>Sorted</p>
      <h2 className={styles.slideTitle}>
        <span className={styles.marker}>More capacity.</span> Less overhead.
      </h2>
      <p className={styles.slideSub}>
        We build the AI-powered infrastructure your business doesn&apos;t have time to build.
      </p>
      <p className={styles.slideClose}>One operational improvement at a time.</p>
    </div>,

    <div key={1} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        The work that would create capacity needs capacity to get built.
      </h2>
      <ul className={styles.lineList}>
        <li>Your team runs the business.</li>
        <li>Repetitive work consumes the time.</li>
        <li>Infrastructure becomes another project in the queue.</li>
      </ul>
      <p className={styles.slideClose}>Sorted supplies the external building function.</p>
    </div>,

    <div key={2} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        Agents assist the workflow. Operators take on the job.
      </h2>
      <WorkflowComparison compact />
      <p className={styles.footnote}>
        Conceptual comparison. No timing, staffing or cost outcomes implied.
      </p>
    </div>,

    <div key={3} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        An operator is a scoped responsibility. Not an unrestricted assistant.
      </h2>
      <div className={styles.fourBlocks}>
        <div><h3>Input</h3><p>What starts the job.</p></div>
        <div><h3>Actions</h3><p>What it may do and access.</p></div>
        <div><h3>Output</h3><p>What it must produce.</p></div>
        <div><h3>Exceptions</h3><p>When it stops or escalates.</p></div>
      </div>
      <p className={styles.slideClose}>
        Routine execution does not require a person to supervise each step. Approval remains where
        the business needs it.
      </p>
    </div>,

    <div key={4} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>One handoff. A practical first build.</h2>
      <p className={styles.kicker}>Illustrative example: lead handling</p>
      <div className={styles.twoFlows}>
        <div>
          <p className={styles.flowLabel}>Before</p>
          <FlowLine steps={["Read enquiry", "Qualify", "Enter CRM", "Prepare follow-up"]} />
        </div>
        <div>
          <p className={styles.flowLabel}>Operator-led</p>
          <FlowLine
            accent
            steps={["Capture", "Apply agreed rules", "Update CRM", "Draft follow-up"]}
          />
        </div>
      </div>
      <p className={styles.slideClose}>Staff approve sensitive actions and handle exceptions.</p>
      <p className={styles.footnote}>
        Compare manual effort, response time and exception rate with the baseline.
      </p>
    </div>,

    <div key={5} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>Check the campaign before it spends.</h2>
      <p className={styles.kicker}>Illustrative example: ecommerce campaign readiness</p>
      <div className={styles.twoFlows}>
        <div>
          <p className={styles.flowLabel}>Before</p>
          <FlowLine
            steps={[
              "Compare the offer",
              "Check stock and prices",
              "Test product links",
              "Verify campaign tags",
            ]}
          />
        </div>
        <div>
          <p className={styles.flowLabel}>Operator-led</p>
          <FlowLine
            accent
            steps={[
              "Read approved campaign and catalogue",
              "Validate offer and availability",
              "Check destinations and tags",
              "Flag exceptions for approval",
            ]}
          />
        </div>
      </div>
      <p className={styles.slideClose}>
        Output: a launch-readiness report. People resolve exceptions and approve launch.
      </p>
      <p className={styles.footnote}>
        Compare manual QA time and time to approval with the baseline. No ads published or budgets
        changed.
      </p>
    </div>,

    <div key={6} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        Find the bottleneck. Build the operator. Prove the improvement.
      </h2>
      <ol className={styles.lineList}>
        <li>Map the workflow.</li>
        <li>Agree the output and permissions.</li>
        <li>Test with approvals and monitoring.</li>
        <li>Compare with the baseline.</li>
      </ol>
      <p className={styles.slideClose}>
        No predefined savings claim. Agree what success means before building.
      </p>
    </div>,

    <div key={7} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        The value is a more capable business. Not a higher agent count.
      </h2>
      <div className={styles.fourBlocks} data-tier>
        <div><h3>First build</h3><p>Understand the systems and rules.</p></div>
        <div><h3>Next build</h3><p>Reuse the connections and context.</p></div>
        <div><h3>Over time</h3><p>More output with less routine coordination.</p></div>
      </div>
      <p className={styles.slideClose}>
        Agents can help design and improve the system. Operators execute the defined work.
      </p>
    </div>,

    <div key={8} className={styles.slideInner}>
      <h2 className={styles.slideTitle}>
        Which workflow should no longer need your team to carry it?
      </h2>
      <ul className={styles.lineList}>
        <li>Where is the repeated effort?</li>
        <li>What systems and decisions does it depend on?</li>
        <li>What would a worthwhile improvement change?</li>
      </ul>
      <p className={styles.slideClose}>
        Next step: Operational Blueprint + proposal for one bounded operator.
      </p>
      <p className={styles.footnote}>
        Scope, acceptance criteria and costs agreed before development.
      </p>
    </div>,
  ]

  return (
    <div className={styles.deck}>
      <div className={styles.stage} ref={stageRef}>
        {slides.map((content, i) => (
          <article
            key={i}
            aria-label={`Slide ${i + 1} of ${TOTAL}`}
            aria-hidden={i !== index}
            className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
          >
            {content}
          </article>
        ))}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ← Back
        </button>
        <p className={styles.counter} aria-live="polite">
          {index + 1} / {TOTAL}
        </p>
        <nav className={styles.slideNav} aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
            >
              {i + 1}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={() => go(index + 1)}
          disabled={index === TOTAL - 1}
          aria-label="Next slide"
        >
          Next →
        </button>
        <button type="button" className={styles.ctrlBtn} onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <a className={styles.ctrlLink} href="/presentations/sorted-operators.pdf" download>
          Download PDF
        </a>
        <a className={styles.ctrlLink} href="/ops/infrastructure">
          Exit
        </a>
      </div>
    </div>
  )
}
