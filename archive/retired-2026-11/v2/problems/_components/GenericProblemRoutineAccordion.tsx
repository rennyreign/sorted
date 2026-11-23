"use client"

import { useState } from "react"
import { ArrowRight, Bell, Check, ChevronDown, Clock3, MessageCircle, Repeat2, Star, UserRound } from "lucide-react"

type Routine = {
  title: string
  cost: string
  change: string
  capability: string
}

const icons = [Repeat2, MessageCircle, UserRound, Clock3, Bell]

export function GenericProblemRoutineAccordion({ routines }: { routines: Routine[] }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-3">
      {routines.map((routine, index) => {
        const Icon = icons[index] ?? icons[0]
        const isOpen = openIndex === index

        return (
          <article key={routine.title} className={`overflow-hidden rounded-[14px] border border-black/10 bg-white ${isOpen ? "shadow-[0_14px_40px_rgba(0,0,0,0.05)]" : ""}`}>
            <button
              type="button"
              className="grid w-full grid-cols-[54px_0.5fr_auto] items-center gap-4 px-4 py-4 text-left md:grid-cols-[54px_0.5fr_1fr_auto]"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[#dfff00]">
                <Icon className="size-6" />
              </span>
              <span className="text-[15px] font-black tracking-[-0.035em]">{routine.title}</span>
              <span className="hidden text-[13px] font-semibold text-black/65 md:block">{routine.cost}</span>
              <ChevronDown className={`size-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
            </button>

            {isOpen ? (
              <div className="border-t border-black/10 px-5 pb-5 pt-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <DetailList title="What happens" items={["The routine starts.", "The team handles it manually.", "No one can see the full handoff.", routine.cost]} />
                  <DetailList title="What it costs" items={["Lost time", "Reduced consistency", "More interruptions", "Invisible drag"]} />
                  <DetailList title="What changes" items={["The routine is visible.", "The next step is clear.", "The team stops relying on memory.", routine.change]} good />
                </div>
                <a href="/ops/how-it-works" className="mt-5 flex min-h-14 flex-col gap-4 rounded-[12px] border border-black/10 bg-[#f7f7f3] px-5 py-4 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#dfff00]">
                      <Star className="size-6" strokeWidth={2.4} />
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold text-black/55">Removed by this capability</span>
                      <span className="block text-[15px] font-black tracking-[-0.035em]">{routine.capability}</span>
                    </span>
                  </span>
                  <span className="flex min-h-10 items-center gap-3 text-[12px] font-black">
                    See how it works <ArrowRight className="size-4" strokeWidth={2.6} />
                  </span>
                </a>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function DetailList({ title, items, good = false }: { title: string; items: string[]; good?: boolean }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-black">{title}</h3>
      <ul className="space-y-2 text-[12px] font-semibold">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            {good ? <Check className="mt-0.5 size-4 text-[#a8c000]" strokeWidth={4} /> : <span className="mt-2 size-1.5 rounded-full bg-black" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
