"use client"

import { useState } from "react"
import { ArrowRight, Bell, Check, ChevronDown, MessageCircle, Phone, PoundSterling, Star, UserRound } from "lucide-react"

const routines = [
  {
    title: "Missed calls",
    copy: "Calls go unanswered and customers move on.",
    capability: "Missed Call Recovery",
    icon: Phone,
    happens: ["A customer calls.", "No one answers.", "The business gets busy.", "No one calls back.", "The customer calls someone else."],
    costs: ["Lost enquiries", "Reduced trust", "Missed revenue", "Invisible opportunity"],
    changes: ["Every missed call is recognised.", "Customer receives an acknowledgement.", "Your team is notified.", "Every opportunity is visible."],
  },
  {
    title: "Slow replies",
    copy: "Customers wait too long for a response.",
    capability: "Customer Response",
    icon: MessageCircle,
    happens: ["A customer sends an enquiry.", "Nobody sees it straight away.", "The reply waits until someone has time.", "The customer keeps looking elsewhere."],
    costs: ["Lower conversion", "Lost momentum", "Reduced confidence", "More chasing for your team"],
    changes: ["Every enquiry is acknowledged quickly.", "Your team sees what needs a reply.", "Follow-up becomes consistent.", "Customers know someone is handling it."],
  },
  {
    title: "No follow-up",
    copy: "Enquiries are never followed up consistently.",
    capability: "Enquiry Follow-up",
    icon: UserRound,
    happens: ["A promising enquiry arrives.", "The first reply is sent.", "Nobody owns the next step.", "The lead goes quiet."],
    costs: ["Warm leads go cold", "Sales depend on memory", "No clear accountability", "Revenue is left unclaimed"],
    changes: ["Every enquiry has an owner.", "Next steps are visible.", "Follow-up happens at the right time.", "Nothing depends on memory."],
  },
  {
    title: "Quotes not chased",
    copy: "Quotes sent but never followed up.",
    capability: "Quote Follow-up",
    icon: PoundSterling,
    happens: ["A quote is sent.", "The team moves on to new work.", "No reminder appears.", "The customer chooses another option."],
    costs: ["Lower close rate", "Invisible lost revenue", "Wasted quoting time", "Unclear sales pipeline"],
    changes: ["Every quote is tracked.", "Follow-up happens automatically.", "The team sees what is still open.", "More quotes turn into work."],
  },
  {
    title: "Treatment plans forgotten",
    copy: "No reminder, no follow-up, no conversion.",
    capability: "Appointment Reminder",
    icon: Bell,
    happens: ["A plan is discussed.", "The customer leaves to think.", "No reminder is scheduled.", "The opportunity disappears."],
    costs: ["Lower treatment uptake", "Poor patient experience", "Missed recurring revenue", "Manual admin pressure"],
    changes: ["Important plans are tracked.", "Patients receive timely reminders.", "Your team knows who needs attention.", "Conversion becomes measurable."],
  },
]

export function ProblemRoutineAccordion() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-3">
      {routines.map((routine, index) => {
        const Icon = routine.icon
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
              <span className="hidden text-[13px] font-semibold text-black/65 md:block">{routine.copy}</span>
              <ChevronDown className={`size-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
            </button>

            {isOpen ? (
              <div className="border-t border-black/10 px-5 pb-5 pt-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <DetailList title="What happens" items={routine.happens} />
                  <DetailList title="What it costs" items={routine.costs} />
                  <DetailList title="What changes" items={routine.changes} good />
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
