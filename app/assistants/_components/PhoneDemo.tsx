"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, Battery, Check, CheckCheck, ChevronLeft, ChevronRight, Mic, Plus, Signal, Wifi } from "lucide-react"
import { phoneMessages, phoneRecord } from "./demo-data"

const appleFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, "Segoe UI", Roboto, sans-serif'

type Beat = { type: "lead" | "typing" | "ownerTyping" | "show"; msg: number; dur: number }
const beats: Beat[] = [{ type: "lead", msg: -1, dur: 1200 }]
phoneMessages.forEach((m, i) => {
  const len = m.text.length
  const last = i === phoneMessages.length - 1
  beats.push({ type: m.from === "assistant" ? "typing" : "ownerTyping", msg: i, dur: m.from === "assistant" ? Math.min(3200, 1600 + 12 * len) : 1500 })
  beats.push({ type: "show", msg: i, dur: last ? 6000 : m.from === "owner" ? 1400 : Math.min(4500, Math.max(1800, 45 * len)) })
})
const TOTAL = beats.length
const showBeat = phoneMessages.map((_, i) => beats.findIndex((b) => b.type === "show" && b.msg === i))
const typingBeat = phoneMessages.map((_, i) => beats.findIndex((b) => b.type === "typing" && b.msg === i))
const ownerTypingBeat = phoneMessages.map((_, i) => beats.findIndex((b) => b.type === "ownerTyping" && b.msg === i))

function Dots() {
  return (
    <span className="inline-flex items-center gap-[5px] px-3 py-[13px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="phone-dot size-[7px] rounded-full bg-[#8E8E93]" style={{ animationDelay: `${i * 220}ms` }} />
      ))}
    </span>
  )
}

export function PhoneDemo() {
  const [step, setStep] = useState(TOTAL)
  const [fading, setFading] = useState(false)
  const [play, setPlay] = useState(false)
  const [geom, setGeom] = useState<{ bottoms: number[]; tops: number[]; vh: number }>({ bottoms: [], tops: [], vh: 0 })
  const wrapRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])
  const startedRef = useRef(false)

  const measure = useCallback(() => {
    const tops: number[] = []
    const bottoms: number[] = []
    rowsRef.current.forEach((el, i) => {
      if (el) {
        tops[i] = el.offsetTop
        bottoms[i] = el.offsetTop + el.offsetHeight
      }
    })
    setGeom({ tops, bottoms, vh: viewportRef.current?.clientHeight ?? 0 })
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = wrapRef.current
    if (!el) return
    let onScreen = false
    const update = () => setPlay(onScreen && !document.hidden)
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      update()
    })
    io.observe(el)
    const onVis = () => update()
    document.addEventListener("visibilitychange", onVis)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (viewportRef.current) ro.observe(viewportRef.current)
    rowsRef.current.forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [measure])

  useEffect(() => {
    if (!play) return
    if (!startedRef.current) {
      startedRef.current = true
      setStep(0)
    }
    const beat = beats[Math.min(step, TOTAL - 1)]
    const timer = window.setTimeout(() => {
      if (step >= TOTAL - 1) {
        setFading(true)
        window.setTimeout(() => {
          setStep(0)
          setFading(false)
        }, 400)
      } else {
        setStep(step + 1)
      }
    }, beat.dur)
    return () => window.clearTimeout(timer)
  }, [play, step])

  const lastShown = showBeat.reduce((acc, b, i) => (b <= step ? i : acc), -1)
  const typingMsg = typingBeat.findIndex((b) => b === step)
  const ownerTyping = ownerTypingBeat.includes(step)
  const DOTS_H = 34
  const offsetY =
    typingMsg >= 0 && geom.tops[typingMsg] !== undefined
      ? geom.vh - 4 - (geom.tops[typingMsg] + DOTS_H)
      : lastShown < 0
        ? geom.vh
        : geom.vh - (geom.bottoms[lastShown] ?? 0)

  return (
    <figure ref={wrapRef} id="phone" className="relative w-[300px] shrink-0 lg:w-[340px] xl:w-[360px]">
      <style>{`@keyframes phoneDot{0%,60%,100%{opacity:.25}30%{opacity:1}}.phone-dot{animation:phoneDot 1.4s infinite}@keyframes phoneIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <span className="sr-only">
        Example conversation: an assistant tells the owner about a new boiler repair enquiry, checks the details with the customer, gets a quote ready, waits for the owner to say yes, then sends it and plans a follow-up.
      </span>
      <div aria-hidden="true" className="relative">
        <img src="/assistants/phone-frame.webp" alt="" width={868} height={1764} className="relative z-10 block w-full" draggable={false} />
        <div
          className="absolute z-0 flex flex-col overflow-hidden bg-white"
          style={{ left: "5%", right: "5%", top: "2%", bottom: "2%", borderRadius: "15% / 7%", fontFamily: appleFont }}
        >
          <div style={{ height: "5.83%" }} />
          <div className="flex items-center justify-between px-6 pt-2.5 text-black">
            <span className="text-[14px] font-semibold">9:42</span>
            <span className="flex items-center gap-1.5">
              <Signal className="size-3.5" strokeWidth={2.4} />
              <Wifi className="size-3.5" strokeWidth={2.4} />
              <Battery className="size-4" strokeWidth={1.8} />
            </span>
          </div>
          <div className="relative px-2 pb-2.5 pt-1" style={{ borderBottom: "0.5px solid rgba(60,60,67,0.18)" }}>
            <ChevronLeft className="absolute left-2 top-[22px] size-6 -translate-y-1/2 text-[#0A84FF]" strokeWidth={2.4} />
            <div className="flex flex-col items-center">
              <span className="grid size-9 place-items-center rounded-full text-[15px] font-semibold text-white" style={{ background: "linear-gradient(#bdbdc2,#8e8e93)" }}>S</span>
              <span className="mt-0.5 flex items-center gap-0.5 text-[12px] font-medium text-black/60">
                Your assistant <ChevronRight className="size-2.5" strokeWidth={3} />
              </span>
            </div>
          </div>
          <p className="pt-2 text-center text-[11px] text-[#8E8E93]"><b className="font-semibold">Today</b> 9:42 AM</p>

          <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms" }}>
            <div
              className="absolute inset-x-0 top-0 px-2.5 pb-1"
              style={{ transform: `translateY(${offsetY}px)`, transition: "transform 450ms cubic-bezier(0.22,1,0.36,1)" }}
            >
              {phoneMessages.map((m, i) => {
                const shown = showBeat[i] <= step
                const owner = m.from === "owner"
                const prevSame = i > 0 && phoneMessages[i - 1].from === m.from
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      rowsRef.current[i] = el
                    }}
                    className={`flex flex-col ${owner ? "items-end" : "items-start"}`}
                    style={{ marginTop: i === 0 ? 0 : prevSame ? 4 : 10 }}
                  >
                    <p
                      className={`rounded-[18px] px-3 py-2 text-[15px] font-normal leading-[1.3] transition-[opacity,transform,visibility] duration-150 ${
                        owner ? "max-w-[70%] bg-[#0A84FF] text-white" : "max-w-[78%] bg-[#E9E9EB] text-black"
                      } ${shown ? "visible scale-100 opacity-100" : "invisible scale-[0.96] opacity-0"}`}
                      style={{ transformOrigin: owner ? "bottom right" : "bottom left" }}
                    >
                      {m.text}
                    </p>
                    {owner ? (
                      <p className={`mt-1 pr-1 text-right text-[11px] text-[#8E8E93] transition-opacity duration-150 ${shown ? "opacity-100" : "opacity-0"}`}>Delivered</p>
                    ) : null}
                  </div>
                )
              })}
              {typingMsg >= 0 && geom.tops[typingMsg] !== undefined ? (
                <span
                  className="absolute left-2.5 rounded-[18px] bg-[#E9E9EB]"
                  style={{ top: geom.tops[typingMsg] }}
                >
                  <Dots />
                </span>
              ) : null}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
          </div>

          <div className="flex items-center gap-2 px-2.5 pb-3 pt-1.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E9E9EB]">
              <Plus className="size-4 text-[#8E8E93]" strokeWidth={2.4} />
            </span>
            <span className="flex min-h-9 flex-1 items-center rounded-full px-3 text-[15px] text-[#8E8E93]" style={{ border: "0.5px solid #C7C7CC" }}>
              Message
            </span>
            {ownerTyping ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0A84FF]">
                <ArrowUp className="size-4 text-white" strokeWidth={2.6} />
              </span>
            ) : (
              <Mic className="size-5 shrink-0 text-[#8E8E93]" strokeWidth={2} />
            )}
          </div>
        </div>

        <div
          className={`absolute top-[3%] z-20 hidden w-[264px] rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition-all duration-500 min-[1360px]:block ${step > 0 && !fading ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          style={{ right: -252, fontFamily: appleFont }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-black text-[10px] font-semibold text-white">You</span>
            <div>
              <p className="text-[12px] font-semibold text-[#111]">Your job</p>
              <p className="text-[11px] text-black/45">Today 9:40 AM</p>
            </div>
          </div>
          <p className="mt-3 text-[14px] leading-[1.35] text-black/75">&ldquo;Handle new enquiries for my plumbing business.&rdquo;</p>
          <p className="mt-3 flex items-center gap-1.5 border-t border-black/10 pt-2.5 text-[12px] font-semibold text-black/55">
            <CheckCheck className="size-4 text-black" strokeWidth={2.4} /> Sent
          </p>
        </div>

        <div
          className={`absolute bottom-[4%] z-20 hidden w-[264px] rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition-all duration-500 min-[1360px]:block ${lastShown >= 0 && !fading ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          style={{ right: -252, fontFamily: appleFont }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#E9E9EB] text-[10px] font-semibold text-black">SJ</span>
            <div>
              <p className="text-[12px] font-semibold text-[#111]">Sam Jones, Leeds LS6</p>
              <p className="text-[11px] text-black/45">New enquiry</p>
            </div>
          </div>
          <dl className="mt-3 divide-y divide-black/10">
            {phoneRecord.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-1.5">
                <dt className="text-[12px] text-black/45">{k}</dt>
                <dd className="text-right text-[14px] font-semibold text-[#111]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="relative mt-3 h-[36px] border-t border-black/10 pt-2.5 text-[12px] font-semibold">
            {(["new", "waiting", "approved", "sent"] as const).map((s) => {
              const active = s === "sent" ? lastShown >= 4 : s === "approved" ? lastShown === 3 : s === "waiting" ? lastShown === 2 : lastShown < 2
              return (
                <p key={s} className={`absolute inset-x-0 top-2.5 flex items-center gap-1.5 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}>
                  {s === "approved" || s === "sent" ? (
                    <span className="grid size-4 place-items-center rounded-full bg-[#e4ff29]"><Check className="size-3 text-black" strokeWidth={3.5} /></span>
                  ) : null}
                  {s === "new" ? "Logged. Getting your quote ready." : s === "waiting" ? <>Waiting for your OK <Dots /></> : s === "approved" ? "You said yes" : "Quote sent. Not booked or paid yet."}
                </p>
              )
            })}
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-[11px] font-semibold text-black/45">Example only. Not a real customer.</figcaption>
    </figure>
  )
}
