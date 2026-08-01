"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, ChevronRight, Command, LockKeyhole, Menu, Search, X } from "lucide-react"
import { canvas, chapters, sections } from "./data"

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const AUTH_KEY = "sorted_os_auth"
const AUTH_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export default function SortedOSClient() {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState("vision")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return sections.filter((section) => [section.chapter, section.title, section.summary, section.takeaway, ...(section.content || []), ...(section.bullets || []), ...(section.steps || [])].filter(Boolean).join(" ").toLowerCase().includes(term))
  }, [query])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      const session = stored ? JSON.parse(stored) : null
      if (session?.expires && new Date(session.expires).getTime() > Date.now()) setAuthenticated(true)
      else localStorage.removeItem(AUTH_KEY)
    } catch {
      localStorage.removeItem(AUTH_KEY)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: "-18% 0px -70% 0px", threshold: [0.05, 0.4] })
    sections.forEach((section) => {
      const node = document.getElementById(section.id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [authenticated])

  const choose = (id: string) => { scrollToId(id); setMenuOpen(false); setQuery("") }

  const unlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.toLowerCase() !== "sorted2026") {
      setError(true)
      return
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ expires: new Date(Date.now() + AUTH_DURATION_MS).toISOString() }))
    setAuthenticated(true)
    setError(false)
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen bg-[#fbfbfa] px-5 py-5 text-[#070707] sm:px-8 sm:py-8">
        <div className="grid min-h-full border border-black/15 bg-white lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)]">
          <section className="flex min-h-[360px] flex-col justify-between bg-[#070707] p-7 text-white sm:p-10 lg:min-h-[640px] lg:p-14">
            <a href="/" className="w-fit text-[28px] font-black tracking-[-0.05em]">Sorted<span className="text-[#cfe900]">.</span></a>
            <div className="max-w-[620px] py-12">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#dfff00]">Private operating handbook</p>
              <h1 className="mt-5 text-[clamp(3rem,6.5vw,6.5rem)] font-black leading-[0.88] tracking-[-0.065em]">The system<br />behind the work.</h1>
              <p className="mt-7 max-w-[430px] font-[family-name:Arial] text-[16px] leading-[1.6] text-white/70">Strategy, doctrine, offers, operators, and the factory system for Sorted Global.</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Sorted OS / Internal access</p>
          </section>
          <section className="flex items-center p-7 sm:p-10 lg:p-14">
            <form onSubmit={unlock} className="w-full max-w-[390px]">
              <span className="grid size-12 place-items-center bg-[#dfff00]"><LockKeyhole className="size-6" strokeWidth={2.4} /></span>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.14em] text-black/45">Access required</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-black leading-[0.93] tracking-[-0.055em]">Enter the handbook.</h2>
              <p className="mt-5 font-[family-name:Arial] text-[15px] leading-[1.6] text-black/62">Use the access password to open the Sorted OS. This device will stay signed in for 30 days.</p>
              <label htmlFor="sorted-os-password" className="mt-9 block text-[11px] font-black uppercase tracking-[0.12em] text-black/55">Password</label>
              <input id="sorted-os-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(false) }} className="mt-3 h-12 w-full border border-black/20 px-4 text-[15px] font-semibold outline-none transition focus:border-black focus:ring-2 focus:ring-[#cfe900]" autoComplete="current-password" autoFocus />
              {error ? <p className="mt-3 text-[12px] font-semibold text-[#d61f69]">Incorrect password. Please try again.</p> : null}
              <button type="submit" className="mt-5 inline-flex h-12 items-center bg-[#070707] px-5 text-[12px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-[#cfe900] focus:ring-offset-2">Open Sorted OS <ArrowUpRight className="ml-3 size-4" /></button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#070707]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fbfbfa]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <a href="/" className="group flex items-baseline gap-2 font-black tracking-[-0.05em]" aria-label="Back to Sorted home"><span className="text-[24px]">Sorted<span className="text-[#cfe900]">.</span></span><span className="border-l border-black/20 pl-2 text-[11px] uppercase tracking-[0.12em] text-black/55">OS</span></a>
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-black/45 md:block">Operating handbook / 2026</p>
          <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex size-10 items-center justify-center border border-black/15 bg-white transition hover:border-black focus:outline-none focus:ring-2 focus:ring-[#cfe900] lg:hidden" aria-label="Toggle handbook navigation" aria-expanded={menuOpen}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
      </header>

      <section className="border-b border-black bg-[#070707] px-5 py-11 text-white sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(300px,0.56fr)] lg:items-end">
          <div className="max-w-[850px]">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#dfff00]">The operating handbook</p>
            <h1 className="max-w-[760px] text-[clamp(3rem,6vw,6.25rem)] font-black leading-[0.88] tracking-[-0.065em]">Build the relationship.<br /><span className="text-[#dfff00]">Then build the business.</span></h1>
          </div>
          <div className="border-l-0 border-white/20 pt-1 lg:border-l lg:pl-8">
            <p className="text-[17px] font-semibold leading-[1.45] text-white/86">Sorted Sites creates the relationship. Sorted Ops expands the value of the relationship.</p>
            <p className="mt-5 text-[13px] font-medium leading-[1.55] text-white/58">Vision defines the destination. GAP turns it into goals, actions, projects, and evidence.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[276px_minmax(0,1fr)]">
        <aside className={`${menuOpen ? "block" : "hidden"} border-b border-black/10 bg-[#f2f2ef] px-5 py-6 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-7`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/45" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the handbook" className="h-11 w-full border border-black/15 bg-white pl-10 pr-11 text-[13px] font-semibold outline-none transition placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-[#cfe900]" aria-label="Search the handbook" />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black/35"><Command className="inline size-3" />K</kbd>
          </div>
          {query.trim() ? <div className="mt-3 border border-black/10 bg-white p-2" aria-live="polite">{results.length ? results.map((item) => <button key={item.id} onClick={() => choose(item.id)} className="block w-full px-3 py-2 text-left transition hover:bg-[#dfff00] focus:bg-[#dfff00] focus:outline-none"><span className="block text-[10px] font-black uppercase tracking-[0.1em] text-black/45">{item.chapter}</span><span className="block text-[13px] font-black leading-tight">{item.title}</span></button>) : <p className="px-3 py-4 text-[12px] font-semibold leading-[1.45] text-black/55">No matching doctrine yet. Try “Nod”, “Ops”, “quality”, or “partners”.</p>}</div> : null}
          <nav className="mt-7" aria-label="Handbook chapters">{chapters.map((chapter) => <div key={chapter.id} className="mb-6"><p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/42">{chapter.label}</p><ul>{chapter.items.map((item) => { const section = sections.find((entry) => entry.id === item)!; return <li key={item}><button onClick={() => choose(item)} className={`flex w-full items-center justify-between gap-2 border-l-2 py-1.5 pl-3 text-left text-[12px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#cfe900] ${active === item ? "border-black text-black" : "border-transparent text-black/58 hover:border-[#cfe900] hover:text-black"}`}><span>{section.title}</span>{active === item ? <ChevronRight className="size-3.5 shrink-0" /> : null}</button></li> })}</ul></div>)}</nav>
        </aside>

        <div className="min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[940px]">
            <section className="mb-16 border-y-4 border-[#070707] py-7" aria-label="How to use this handbook"><div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-black/45">A working document</p><p className="mt-2 max-w-[620px] text-[18px] font-bold leading-[1.35] tracking-[-0.025em]">Read it front to back for the model, or use the index to enter where the work in front of you sits in the wider system.</p></div><span className="inline-flex w-fit items-center gap-2 bg-[#dfff00] px-3 py-2 text-[11px] font-black uppercase tracking-[0.08em]">Always improving <ArrowUpRight className="size-4" /></span></div></section>

            {sections.map((section) => <article id={section.id} key={section.id} className="scroll-mt-24 border-t border-black/14 py-11 first:border-t-0 first:pt-0"><div className="grid gap-6 lg:grid-cols-[120px_minmax(0,1fr)]"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/45">{section.eyebrow}</p></div><div><h2 className="max-w-[720px] text-[clamp(2rem,3.6vw,3.45rem)] font-black leading-[0.96] tracking-[-0.055em]">{section.title}</h2><p className="mt-5 max-w-[720px] text-[17px] font-bold leading-[1.42] tracking-[-0.02em]">{section.summary}</p>{section.takeaway ? <aside className="my-7 border-l-4 border-[#ff73d2] bg-[#fff0fa] px-5 py-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/48">Operating rule</p><p className="mt-1 text-[16px] font-black leading-[1.25] tracking-[-0.025em]">{section.takeaway}</p></aside> : null}<div className="space-y-4">{section.content.map((paragraph) => <p key={paragraph} className="max-w-[720px] font-[family-name:Arial] text-[15px] font-normal leading-[1.65] text-black/72">{paragraph}</p>)}</div>{section.bullets ? <ul className="mt-6 grid max-w-[760px] gap-3 sm:grid-cols-2">{section.bullets.map((item) => <li key={item} className="border-t border-black/12 pt-3 text-[13px] font-bold leading-[1.4]">{item}</li>)}</ul> : null}{section.steps ? <ol className="mt-7 max-w-[760px] divide-y divide-black/12 border-y border-black/12">{section.steps.map((step, index) => <li key={step} className="grid grid-cols-[32px_1fr] gap-4 py-3"><span className="grid size-6 place-items-center bg-[#dfff00] text-[11px] font-black">{index + 1}</span><span className="pt-0.5 text-[14px] font-bold leading-[1.45]">{step}</span></li>)}</ol> : null}{section.id === "model" ? <Canvas /> : null}</div></div></article>)}
          </div>
        </div>
      </div>
      <footer className="border-t border-black bg-[#070707] px-5 py-8 text-white sm:px-8"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55 sm:flex-row"><span>Sorted OS / Operating handbook</span><a href="#vision" onClick={(event) => { event.preventDefault(); scrollToId("vision") }} className="text-[#dfff00] hover:text-white">Back to start</a></div></footer>
    </main>
  )
}

function Canvas() {
  return <section className="mt-9 overflow-hidden border border-black bg-[#070707] text-white"><div className="border-b border-white/20 px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#dfff00]">Business model canvas</p><h3 className="mt-1 text-[24px] font-black tracking-[-0.04em]">The whole economic machine</h3></div><dl className="grid sm:grid-cols-2">{canvas.map(([label, description], index) => <div key={label} className={`p-5 ${index % 2 ? "sm:border-l" : ""} border-b border-white/15 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0`}><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#dfff00]">{label}</dt><dd className="mt-2 font-[family-name:Arial] text-[13px] font-normal leading-[1.5] text-white/80">{description}</dd></div>)}</dl></section>
}
