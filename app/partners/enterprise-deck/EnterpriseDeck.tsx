"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Mail, X } from "lucide-react"
import styles from "./enterprise-deck.module.css"

const TOTAL = 10

function Label({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className={styles.label}>
      <span>{number}</span>
      <span>{children}</span>
    </div>
  )
}

function Node({ index, active = false, label }: { index: number; active?: boolean; label: string }) {
  return (
    <div className={`${styles.node} ${active ? styles.nodeActive : ""}`}>
      <span>{String(index).padStart(2, "0")}</span>
      <strong>{label}</strong>
    </div>
  )
}

export default function EnterpriseDeck() {
  const [current, setCurrent] = useState(0)
  const [ready, setReady] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const wheelLocked = useRef(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const goTo = useCallback((next: number) => {
    setCurrent(Math.max(0, Math.min(TOTAL - 1, next)))
  }, [])

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    const fromHash = Number.parseInt(window.location.hash.slice(1), 10)
    if (Number.isFinite(fromHash) && fromHash >= 1 && fromHash <= TOTAL) setCurrent(fromHash - 1)
    setReady(true)

    const onHash = () => {
      const value = Number.parseInt(window.location.hash.slice(1), 10)
      if (Number.isFinite(value) && value >= 1 && value <= TOTAL) setCurrent(value - 1)
    }
    window.addEventListener("hashchange", onHash)
    return () => {
      window.removeEventListener("hashchange", onHash)
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${current + 1}`)
    const activeElement = document.activeElement as HTMLElement | null
    if (activeElement?.closest('section[aria-hidden="true"]')) deckRef.current?.focus({ preventScroll: true })
  }, [current, ready])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === " " && ["BUTTON", "A"].includes(target.tagName)) return
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault()
        goTo(current + 1)
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault()
        goTo(current - 1)
      } else if (event.key === "Home") {
        event.preventDefault()
        goTo(0)
      } else if (event.key === "End") {
        event.preventDefault()
        goTo(TOTAL - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, goTo])

  const onWheel = (event: React.WheelEvent) => {
    if (wheelLocked.current || Math.abs(event.deltaY) + Math.abs(event.deltaX) < 24) return
    wheelLocked.current = true
    goTo(current + (event.deltaY + event.deltaX > 0 ? 1 : -1))
    window.setTimeout(() => { wheelLocked.current = false }, 650)
  }

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    touchStart.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 48) return
    goTo(current + ((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? 1 : -1))
  }

  return (
    <div
      ref={deckRef}
      className={styles.deck}
      tabIndex={-1}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="slide presentation"
    >
      <div className={`${styles.brand} ${[0, 3, 5, 9].includes(current) ? styles.headerDark : styles.headerLight}`} aria-label="Sorted">Sorted<span>.</span></div>
      <div className={`${styles.briefing} ${[0, 3, 5, 9].includes(current) ? styles.headerDark : styles.headerLight}`}>Enterprise partner briefing</div>

      <div className={styles.slides} style={{ transform: `translate3d(-${current * 100}%,0,0)` }}>
        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 0} inert={current !== 0}>
          <div className={styles.slideInner}>
            <Label number="01">A delivery relationship</Label>
            <h1 className={`${styles.heroTitle} ${styles.reveal}`}>Your relationships.<br /><span>Our manufacturing</span><br />infrastructure.</h1>
            <div className={`${styles.openingBottom} ${styles.revealLate}`}>
              <p>Sorted helps organisations turn identified business needs into visible, useful work—without building another internal delivery team.</p>
              <span className={styles.beginCue}>Press <b>→</b> to begin</span>
            </div>
          </div>
          <div className={styles.cableOpening}><i /><i /><i /><i /></div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 1} inert={current !== 1}>
          <div className={styles.slideInner}>
            <Label number="02">The opportunity</Label>
            <h2 className={styles.title}>Trust is already there.<br /><em>Capacity often isn’t.</em></h2>
            <div className={styles.contrast}>
              <article>
                <span className={styles.micro}>YOU ALREADY HAVE</span>
                <ul><li>Trusted relationships</li><li>Business context</li><li>Qualified need</li></ul>
              </article>
              <div className={styles.bridge}><span>THE GAP</span><i /></div>
              <article className={styles.contrastDark}>
                <span className={styles.micro}>THE MISSING LAYER</span>
                <ul><li>Manufacturing capacity</li><li>A delivery system</li><li>Visible proof</li></ul>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.cream}`} aria-hidden={current !== 2} inert={current !== 2}>
          <div className={styles.slideInner}>
            <Label number="03">The economic thesis</Label>
            <h2 className={styles.title}>Make good businesses<br /><em>easier to choose.</em></h2>
            <ol className={styles.economicChain}>
              {[
                ["01", "Make quality visible"], ["02", "Easier to choose"], ["03", "Stronger revenue"],
                ["04", "Jobs & careers"], ["05", "Stronger places"], ["06", "Stronger economy"],
              ].map(([number, text], index) => <li key={number} className={index === 5 ? styles.chainFinal : ""}><span>{number}</span><strong>{text}</strong></li>)}
            </ol>
            <p className={styles.cornerNote}>The website is the front door.<br />The business is the mission.</p>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 3} inert={current !== 3}>
          <div className={styles.slideInner}>
            <Label number="04">Reverse the order</Label>
            <h2 className={`${styles.title} ${styles.whiteTitle}`}>We don’t sell.<br /><em>We show.</em></h2>
            <div className={styles.reversal}>
              <article>
                <span className={styles.micro}>CONVENTIONAL</span>
                <ol><li>Sell a promise</li><li>Assemble the team</li><li>Eventually show value</li></ol>
              </article>
              <div className={styles.reversalMark}>↺</div>
              <article className={styles.sortedOrder}>
                <span className={styles.micro}>SORTED</span>
                <ol><li>Understand the business</li><li>Manufacture proof</li><li>Earn commitment</li></ol>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 4} inert={current !== 4}>
          <div className={styles.slideInner}>
            <Label number="05">The partnership model</Label>
            <h2 className={styles.title}>One relationship in.<br /><em>A delivery system out.</em></h2>
            <div className={styles.pipeline}>
              <div className={styles.pipelineLine} />
              <Node index={1} label="Trusted access" />
              <Node index={2} label="Sorted manufactures" active />
              <Node index={3} label="Launch with visibility" />
              <Node index={4} label="Relationship retained" active />
            </div>
            <p className={styles.statement}>You keep the relationship. <span>Sorted supplies the engine.</span></p>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 5} inert={current !== 5}>
          <div className={styles.slideInner}>
            <Label number="06">Inside the infrastructure</Label>
            <h2 className={`${styles.title} ${styles.whiteTitle}`}>Capability, moved<br /><em>into the system.</em></h2>
            <dl className={styles.blueprint}>
              {[
                ["01", "Capacity", "Repeatable production without another internal team."],
                ["02", "Delivery", "Discovery, design, build, CMS and launch."],
                ["03", "Visibility", "Defined stages across active opportunities."],
                ["04", "Commercial fit", "A model shaped around the partnership."],
                ["05", "Relationship protection", "Clear ownership and handoffs upfront."],
                ["06", "Expansion", "The next useful intervention—when earned."],
              ].map(([number, term, detail]) => <div key={term}><span>{number}</span><dt>{term}</dt><dd>{detail}</dd></div>)}
            </dl>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.cream}`} aria-hidden={current !== 6} inert={current !== 6}>
          <div className={styles.slideInner}>
            <Label number="07">Who it is for</Label>
            <h2 className={styles.title}>Already close to<br /><em>good businesses.</em></h2>
            <div className={styles.audienceRows}>
              {[
                ["01", "Agencies & consultancies", "Add dependable production behind strategic relationships."],
                ["02", "Chambers & business networks", "Move members from identified need to visible delivery."],
                ["03", "Incubators & accelerators", "Give recurring cohorts credible digital foundations."],
                ["04", "Investors & portfolio teams", "Strengthen digital signal when a genuine gap appears."],
              ].map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.lime}`} aria-hidden={current !== 7} inert={current !== 7}>
          <div className={styles.slideInner}>
            <Label number="08">Start with proof</Label>
            <h2 className={styles.title}>One focused pilot.<br /><em>Enough evidence to decide.</em></h2>
            <div className={styles.pilotArc}>
              <div className={styles.pilotLine} />
              {[["01", "Align"], ["02", "Qualify"], ["03", "Manufacture"], ["04", "Review evidence"]].map(([number, text]) => <div key={number}><span>{number}</span><strong>{text}</strong></div>)}
            </div>
            <div className={styles.pilotProof}><span>Small commitment</span><i /><span>Visible evidence</span><i /><span>Repeatable decision</span></div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 8} inert={current !== 8}>
          <div className={styles.slideInner}>
            <Label number="09">Good fit</Label>
            <h2 className={styles.title}>The relationship<br /><em>sets the standard.</em></h2>
            <div className={styles.fitGrid}>
              <ul>
                {["Regular access to genuine need", "Values long-term relationships", "Wants repeatable delivery—not ad hoc freelancers", "Ready for clear ownership, qualification and handoffs"].map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}
              </ul>
              <aside>
                <span className={styles.micro}><X aria-hidden="true" /> NOT A FIT</span>
                <p>Volume without care.</p><p>False urgency.</p><p>Selling work before understanding the need.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 9} inert={current !== 9}>
          <div className={styles.slideInner}>
            <Label number="10">The next conversation</Label>
            <h2 className={`${styles.closeTitle} ${styles.reveal}`}>Build businesses.<br />Strengthen places.<br /><span>Grow the economy.</span></h2>
            <div className={styles.closeBottom}>
              <p>Start with one focused conversation<br />and one evidence-backed pilot.</p>
              <div className={styles.closeLinks}>
                <a href="mailto:hello@sortmydigital.site"><Mail aria-hidden="true" />hello@sortmydigital.site</a>
                <a href="/partners/apply">Begin a conversation <ArrowRight aria-hidden="true" /></a>
              </div>
            </div>
            <div className={styles.finalMark}>Sorted<span>.</span></div>
          </div>
        </section>
      </div>

      <nav className={styles.controls} aria-label="Presentation controls">
        <button onClick={() => goTo(current - 1)} disabled={current === 0} aria-label="Previous slide"><ArrowLeft /></button>
        <span aria-live="polite"><b>{String(current + 1).padStart(2, "0")}</b> / {TOTAL}</span>
        <button onClick={() => goTo(current + 1)} disabled={current === TOTAL - 1} aria-label="Next slide"><ArrowRight /></button>
      </nav>
      <div className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleX(${(current + 1) / TOTAL})` }} /></div>
    </div>
  )
}
