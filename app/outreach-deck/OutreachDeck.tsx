"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Mail, Phone, X } from "lucide-react"
import styles from "./outreach-deck.module.css"

const TOTAL = 9
const DARK_SLIDES = [0, 4, 8]

function Label({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className={styles.label}>
      <span>{number}</span>
      <span>{children}</span>
    </div>
  )
}

export default function OutreachDeck() {
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

  const headerClass = DARK_SLIDES.includes(current) ? styles.headerDark : styles.headerLight

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
      <div className={`${styles.brand} ${headerClass}`} aria-label="Sorted">Sorted<span>.</span></div>
      <div className={`${styles.briefing} ${headerClass}`}>The outreach system</div>

      <div className={styles.slides} style={{ transform: `translate3d(-${current * 100}%,0,0)` }}>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 0} inert={current !== 0}>
          <div className={styles.slideInner}>
            <Label number="01">How we grow</Label>
            <h1 className={`${styles.heroTitle} ${styles.reveal}`}>We don’t sell.<br /><span>We show.</span></h1>
            <div className={`${styles.openingBottom} ${styles.revealLate}`}>
              <p>The Sorted outreach system: find the business, build the proof, then ask one clear question.</p>
              <span className={styles.beginCue}>Press <b>→</b> to begin</span>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 1} inert={current !== 1}>
          <div className={styles.slideInner}>
            <Label number="02">What we offer</Label>
            <h2 className={styles.title}>The website is the<br /><em>digital command centre</em><br />of the modern business.</h2>
            <ol className={styles.pillarChain}>
              {[
                ["01", "Trust", "Reputation, brand, proof"],
                ["02", "Enquiries", "Ease, responsiveness, helpfulness"],
                ["03", "Customers", "Actions, engagement, resources"],
                ["04", "Operations", "Data, context, flow"],
              ].map(([number, term, detail]) => (
                <li key={number}><span>{number}</span><strong>{term}</strong><p>{detail}</p></li>
              ))}
            </ol>
            <p className={styles.cornerNote}>Four interconnected points of value.<br />Each one strengthens the next.</p>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.cream}`} aria-hidden={current !== 2} inert={current !== 2}>
          <div className={styles.slideInner}>
            <Label number="03">Step one — find</Label>
            <h2 className={styles.title}>The Prospect Finder<br /><em>uncovers the list.</em></h2>
            <dl className={styles.finderGrid}>
              {[
                ["01", "Companies House", "Live registry connection — real, registered businesses."],
                ["02", "Website score", "A measured read on their current digital presence."],
                ["03", "Current tech", "An outline of what their site is built on today."],
                ["04", "Contact info", "Available channels for outreach."],
                ["05", "Website address", "The destination we audit — and rebuild."],
              ].map(([number, term, detail]) => (
                <div key={term}><span>{number}</span><dt>{term}</dt><dd>{detail}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 3} inert={current !== 3}>
          <div className={styles.slideInner}>
            <Label number="04">Step two — build</Label>
            <h2 className={styles.title}>Five sites per day,<br /><em>built from the list.</em></h2>
            <div className={styles.buildStatement}>
              <span className={styles.bigNumber}>5</span>
              <p>Real websites, manufactured daily — before we ever reach out. The product exists before the conversation begins.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 4} inert={current !== 4}>
          <div className={styles.slideInner}>
            <Label number="05">Step three — workspace</Label>
            <h2 className={`${styles.title} ${styles.whiteTitle}`}>Every build lands<br /><em>in a workspace.</em></h2>
            <div className={styles.flow}>
              <div className={styles.flowLine} />
              {[["01", "Prospect list"], ["02", "Build"], ["03", "Workspace"]].map(([number, text]) => (
                <div key={number}><span>{number}</span><strong>{text}</strong></div>
              ))}
            </div>
            <p className={styles.statementDark}>Accessible straight from the Prospect Finder.<span> One system, end to end.</span></p>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 5} inert={current !== 5}>
          <div className={styles.slideInner}>
            <Label number="06">Step four — email</Label>
            <h2 className={styles.title}>Email first.<br /><em>Track the opens.</em></h2>
            <div className={styles.outreachPair}>
              <article>
                <Mail aria-hidden="true" />
                <h3>Reach out by email</h3>
                <p>The build is attached — they can see it before replying.</p>
              </article>
              <article>
                <span className={styles.openDot} aria-hidden="true" />
                <h3>Opens are tracked</h3>
                <p>We know who looked before we ever pick up the phone.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.cream}`} aria-hidden={current !== 6} inert={current !== 6}>
          <div className={styles.slideInner}>
            <Label number="07">Step five — call</Label>
            <h2 className={styles.title}>Follow up<br /><em>the next day.</em></h2>
            <div className={styles.outreachPair}>
              <article>
                <Phone aria-hidden="true" />
                <h3>One call, one goal</h3>
                <p>Get their attention onto the build that already exists.</p>
              </article>
              <article>
                <span className={styles.openDot} aria-hidden="true" />
                <h3>Warm, not cold</h3>
                <p>Open tracking tells us exactly who to call first.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.paper}`} aria-hidden={current !== 7} inert={current !== 7}>
          <div className={styles.slideInner}>
            <Label number="08">The outcome</Label>
            <h2 className={styles.title}>All roads lead to<br /><em>yes or no.</em></h2>
            <div className={styles.fitGrid}>
              <ul>
                <li><Check aria-hidden="true" />Yes — the site is built, we move to terms</li>
                <li><X aria-hidden="true" />No — we move on, the list is long</li>
              </ul>
              <aside>
                <span className={styles.micro}>NO AMBIGUITY</span>
                <p>No maybes. No chasing.</p>
                <p>Every prospect resolves to a clear answer.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={`${styles.slide} ${styles.dark}`} aria-hidden={current !== 8} inert={current !== 8}>
          <div className={styles.slideInner}>
            <Label number="09">The system</Label>
            <h2 className={`${styles.closeTitle} ${styles.reveal}`}>Find. Build.<br />Show. <span>Decide.</span></h2>
            <div className={styles.closeBottom}>
              <p>Prospect Finder → daily builds → workspace → email → call → yes or no.<br />Proof first. Always.</p>
              <div className={styles.closeLinks}>
                <a href="mailto:hello@sortmydigital.site"><Mail aria-hidden="true" />hello@sortmydigital.site</a>
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
