"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { US_REFERRAL_WEBSITE_OFFER, formatMoney } from "@/lib/market-pricing"
import { getAttribution } from "@/lib/attribution"
import { trackEvent, TRACKING_EVENTS } from "@/lib/tracking"
import styles from "./UsFreeWebsite.module.css"

type AnswerKey = "business" | "currentSite" | "goal" | "style" | "timeline" | "about"
type Answers = Record<AnswerKey, string>
const INITIAL: Answers = { business: "", currentSite: "", goal: "", style: "", timeline: "", about: "" }
const options = {
  business: ["Local service or trade", "Health, beauty or fitness", "Food or hospitality", "Professional services", "Retail or ecommerce", "Small online business", "Something else"],
  currentSite: ["No website yet", "An old website", "A site I don’t like", "A DIY website", "A website that doesn’t bring inquiries"],
  goal: ["Get more inquiries", "Look more professional", "Take bookings", "Explain services clearly", "Show proof and reviews"],
  style: ["Premium and trusted", "Clean and simple", "Bold and direct", "Warm and local", "Modern but not flashy"],
  timeline: ["As soon as practical", "This month", "Exploring options"],
}
const TRACKING_CONTEXT = { form_name: "us_free_website", form_type: "inline", currency: "USD", pricing_market: "US" }

export default function UsFreeWebsite() {
  return (
    <main className={styles.page} lang="en-US">
      <div className={styles.darkBand}><div className={styles.shell}>
        <header className={styles.masthead}><span className={styles.wordmark}>Sorted<span>.</span></span><span className={styles.mastheadNote}>BUSINESS MODERNIZATION. STARTING WITH YOUR WEBSITE.</span></header>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <h1 id="hero-title">Your next<br />website.<span className={styles.heroScript}>See it first.</span></h1>
            <p className={styles.heroDescription}>A new website for your business.<br />See it before you spend a dollar.</p>
            <a className={styles.primary} href="#request" onClick={() => trackEvent(TRACKING_EVENTS.CTA_CLICK, { cta_text: "Get your free site", cta_location: "us_free_website_hero" })}>Get your free site <ArrowUpRight size={21} aria-hidden="true" /></a>
            <p className={styles.disclosure}>No payment. No obligation.<br />Decide whether to take it further.</p>
          </div>
          <figure className={styles.work}>
            <div className={styles.annotation} aria-hidden="true"><span>Your business, <br />shown properly.</span><svg width="82" height="42" viewBox="0 0 82 42" fill="none"><path d="M4 5C20 29 41 33 72 28M63 21L74 28L65 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className={styles.previewHeader}><span className={styles.previewDots}><i /><i /><i /></span><span>JOSHI ACCOUNTING · WEBSITE PREVIEW</span><ArrowUpRight size={14} aria-hidden="true" /></div>
            <div className={styles.previewImage}><Image src="/joshi-accounting-homepage-preview.webp" alt="Sorted website preview for Joshi Accounting, with clear accounting services and a welcoming client meeting photograph" width={1440} height={4130} sizes="(max-width: 800px) 92vw, 46vw" priority /></div>
            <figcaption><span>Joshi Accounting</span><span className={styles.previewLabel}>A website preview by Sorted.</span></figcaption>
          </figure>
        </section>
      </div></div>
      <div className={styles.processBand}><div className={styles.shell}>
        <section className={styles.process} aria-labelledby="process-title">
          <div className={styles.processIntro}><h2 id="process-title">We don’t sell.<br /><span className={styles.showEmphasis}>We show.</span></h2></div>
          <ol className={styles.steps}>
            <li><span>01</span><div><h3>Tell us about your business.</h3><p>A few quick questions.</p></div></li>
            <li><span>02</span><div><h3>See your new website.</h3><p>A real design for your business. Clear services, reasons to trust you, and an easy next step.</p></div></li>
            <li><span>03</span><div><h3>Decide with something to see.</h3><p>Review it in your private workspace. Like the direction? We’ll talk about taking it live. No obligation.</p></div></li>
          </ol>
        </section>
      </div></div>
      <div className={styles.shell}>
        <section id="request" className={styles.request} aria-labelledby="request-title">
          <div className={styles.requestIntro}><h2 id="request-title">Your business.<br />Your new<br />website<span className={styles.limeDot}>.</span></h2><p>Built around what you do.<br />Designed to make the next step obvious.</p><div className={styles.promise}><Check size={17} aria-hidden="true" /><span>No payment details.<br />No commitment to buy.</span></div><p className={styles.fit}>Made for local businesses.<br />Small online businesses welcome, too.</p></div>
          <RequestForm />
        </section>
        <section className={styles.faq} aria-labelledby="faq-title"><h2 id="faq-title">Good questions.</h2><div>
          <details><summary>Is it really free?<ChevronDown size={18} aria-hidden="true" /></summary><p>Yes. We create a website preview for your business free, so you can see the direction before you decide. You only pay if you choose to move forward with the agreed launch. There’s no obligation to continue.</p></details>
          <details><summary>What if I want to launch it?<ChevronDown size={18} aria-hidden="true" /></summary><p>The US website launch is {formatMoney(US_REFERRAL_WEBSITE_OFFER.total, "USD")} USD. It includes your website, agreed ad creative and campaign setup, tracking, and inquiry follow-up setup. We agree the scope before you pay. Ad spend, ongoing management, and future improvements are separate and optional.</p></details>
          <details><summary>What happens after I request it?<ChevronDown size={18} aria-hidden="true" /></summary><p>Your answers give us the brief. We’ll use them to prepare your website design, and you’ll review it in your private workspace. No call needed to request your build.</p></details>
          <details><summary>Do I need an existing website?<ChevronDown size={18} aria-hidden="true" /></summary><p>No. We can start fresh or work from what you have. Local services, trades, shops, and small online businesses are all welcome.</p></details>
        </div></section>
      </div>
      <div className={styles.footerBand}><div className={styles.shell}>
        <footer className={styles.footer}><span className={styles.wordmark}>Sorted<span>.</span></span><p>We make good businesses more capable.</p><a href="/privacy/">Privacy</a></footer>
      </div></div>
    </main>
  )
}

function RequestForm() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(INITIAL)
  const [contact, setContact] = useState({ businessName: "", name: "", email: "", website: "", location: "" })
  const [state, setState] = useState<"idle" | "submitting" | "error" | "success">("idle")
  const [error, setError] = useState("")
  const [reviewUrl, setReviewUrl] = useState<string | null>(null)
  const lock = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const hasNavigated = useRef(false)

  useEffect(() => { if (hasNavigated.current) heading.current?.focus() }, [step, state === "success"])

  function update(key: AnswerKey, value: string) { setAnswers(previous => ({ ...previous, [key]: value })) }
  function move(next: number) { hasNavigated.current = true; setStep(next); setError(""); setState("idle") }
  function select(key: keyof typeof options, label: string) {
    return <label className={styles.field} htmlFor={`us-${key}`}>{label}<select id={`us-${key}`} name={key} value={answers[key]} onChange={event => update(key, event.target.value)} required><option value="" disabled>Select an option</option>{options[key].map(option => <option key={option}>{option}</option>)}</select></label>
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    const required: AnswerKey[] = step === 0 ? ["business", "currentSite", "about"] : ["goal", "style", "timeline"]
    if (step < 2) {
      if (required.some(key => !answers[key].trim())) { setError("Please answer each question to continue."); return }
      move(step + 1)
      return
    }
    if (!contact.businessName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) { setError("Please enter your business name and a valid email address."); return }
    lock.current = true
    setState("submitting")
    setError("")
    try {
      const attribution = getAttribution()
      // Preserve independently supplied UTM fields even when the URL has no utm_source.
      const urlParams = new URLSearchParams(window.location.search)
      const utm = (key: keyof typeof attribution) => urlParams.has(key) ? urlParams.get(key) : attribution[key]
      const { data: leadId, error: submissionError } = await supabase.rpc("submit_website_lead", {
        p_business_name: contact.businessName.trim(), p_website_url: contact.website.trim() || null, p_email: contact.email.trim().toLowerCase(),
        p_answers: { ...answers, market: "US", currency: "USD", landing_page: "us_free_website", location: contact.location.trim() || null, contact_name: contact.name.trim() || null },
        p_summary: `US free website request. ${contact.businessName.trim()}: ${answers.about.trim()} Business: ${answers.business}. Current website: ${answers.currentSite}. Goal: ${answers.goal}. Style: ${answers.style}. Timing preference: ${answers.timeline}.${contact.location.trim() ? ` Location: ${contact.location.trim()}.` : ""}`,
        p_utm_source: utm("utm_source"), p_utm_medium: utm("utm_medium"), p_utm_campaign: utm("utm_campaign"), p_utm_content: utm("utm_content"), p_utm_term: utm("utm_term"),
      })
      if (submissionError || !leadId) throw new Error("We couldn’t save your request. Please try again.")
      hasNavigated.current = true
      setState("success")
      trackEvent(TRACKING_EVENTS.FORM_SUBMIT, { ...TRACKING_CONTEXT, conversion_type: "lead", conversion_name: "us_free_website_request" })
      trackEvent(TRACKING_EVENTS.THANK_YOU_VIEW, { ...TRACKING_CONTEXT, conversion_type: "lead", conversion_name: "us_free_website_request" })
      // This optional lookup must never invalidate an already saved request.
      void (async () => {
        try {
          const { data: lead } = await supabase.from("prospects").select("review_slug").eq("id", leadId).single()
          if (typeof lead?.review_slug === "string" && lead.review_slug) setReviewUrl(`/workspace/?slug=${encodeURIComponent(lead.review_slug)}`)
        } catch { /* The saved request remains successful if workspace details cannot be read. */ }
      })()
    } catch (cause) {
      lock.current = false
      setState("error")
      setError(cause instanceof Error ? cause.message : "We couldn’t save your request. Please try again.")
      trackEvent(TRACKING_EVENTS.FORM_ERROR, TRACKING_CONTEXT)
    }
  }

  if (state === "success") return <div className={styles.success}>
    <p className={styles.received}><Check size={17} aria-hidden="true" /> REQUEST RECEIVED</p><h3 ref={heading} tabIndex={-1}>You’ve given us<br />the brief.</h3><p>Your free site request is saved. We’ll use your answers to prepare your website design. You’ll review it in your private workspace and decide what happens next.</p>
    {reviewUrl ? <a className={styles.primary} href={reviewUrl}>Open your workspace <ArrowRight size={18} aria-hidden="true" /></a> : <p className={styles.small}>We’ll email your workspace link to you. There’s nothing else you need to do right now.</p>}

  </div>

  return <form className={styles.form} onSubmit={submit} aria-labelledby="us-form-heading">
    <div className={styles.formTop}><span>YOUR FREE SITE REQUEST</span><span>0{step + 1} / 03</span></div>
    <div className={styles.progress} role="progressbar" aria-label="Request progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step + 1}><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
    <h3 id="us-form-heading" ref={heading} tabIndex={-1}>{["First, your business.", "Make it feel like you.", "Where can we reach you?"][step]}</h3><p className={styles.formHint}>{["A little context goes a long way.", "We’ll use this to shape your website.", "Save your request. We’ll take it from here."][step]}</p>
    <fieldset disabled={state === "submitting"} className={styles.fields}>
      <legend className={styles.srOnly}>{["Your business", "Your website preferences", "Your contact details"][step]}</legend>
      {step === 0 ? <>{select("business", "What kind of business is it?")}{select("currentSite", "What are you working with right now?")}<label className={styles.field} htmlFor="us-about">In a line or two, what do you do?<textarea id="us-about" name="about" value={answers.about} onChange={event => update("about", event.target.value)} placeholder="e.g. A family-run landscaping business in Austin, helping homeowners make more of their yards." required maxLength={600} rows={3} /></label></> : null}
      {step === 1 ? <>{select("goal", "What should your new site help you do?")}{select("style", "What should it feel like?")}{select("timeline", "When would you like to get started?")}<p className={styles.small}>A preference, not a delivery promise. We’ll agree timing together.</p></> : null}
      {step === 2 ? <><label className={styles.field} htmlFor="us-business-name">Business name<input id="us-business-name" name="businessName" autoComplete="organization" value={contact.businessName} onChange={event => setContact({ ...contact, businessName: event.target.value })} required maxLength={180} /></label><label className={styles.field} htmlFor="us-email">Email address<input id="us-email" name="email" type="email" autoComplete="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} required maxLength={254} /></label><div className={styles.fieldPair}><label className={styles.field} htmlFor="us-name">Your name <span>(optional)</span><input id="us-name" name="name" autoComplete="name" value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} maxLength={120} /></label><label className={styles.field} htmlFor="us-location">City / state <span>(optional)</span><input id="us-location" name="location" autoComplete="address-level2" value={contact.location} onChange={event => setContact({ ...contact, location: event.target.value })} maxLength={180} /></label></div><label className={styles.field} htmlFor="us-website">Current website <span>(optional)</span><input id="us-website" name="website" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" value={contact.website} onChange={event => setContact({ ...contact, website: event.target.value })} maxLength={500} /></label></> : null}
    </fieldset>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <div className={styles.formActions}>{step > 0 ? <button className={styles.back} type="button" disabled={state === "submitting"} onClick={() => move(step - 1)}>Back</button> : <span className={styles.small}>No payment details.</span>}<button className={styles.submit} type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Saving request…" : step < 2 ? "Continue" : "Request my free site"}{state === "submitting" ? <Loader2 size={18} className={styles.spin} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</button></div>
    <p className={styles.formPrivacy}>By submitting, you’re asking Sorted to contact you about your website. <a href="/privacy/">Privacy policy</a>.</p><span className={styles.srOnly} role="status">{state === "submitting" ? "Saving your request. Please wait." : ""}</span>
  </form>
}
