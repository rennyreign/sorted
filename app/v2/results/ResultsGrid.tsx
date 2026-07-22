"use client"

import Link from "next/link"
import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Dumbbell,
  HeartPulse,
  Home,
  MessageCircle,
  Star,
} from "lucide-react"

const results = [
  {
    category: "Fitness academy",
    name: "Gracie Barra Halesowen",
    icon: Dumbbell,
    tone: "bg-[#ffd5e7]",
    copy: "Website structure, booking and intro flow were rebuilt so prospective members could understand classes and book online.",
    stats: ["7 hrs returned / week", "Online intro booking", "Member comments up"],
    href: "/ops/results/gracie-barra-halesowen",
  },
  {
    category: "Real estate marketing",
    name: "Action Hero Marketing",
    icon: Home,
    tone: "bg-[#efffb7]",
    copy: "Manual property research and outreach prep became a working research tool with extra capability built in.",
    stats: ["Research time removed", "Outreach ready lists", "Manual combing stopped"],
    href: "/ops/results/action-hero-marketing",
  },
  {
    category: "Education technology",
    name: "Bisk Education",
    icon: BrainCircuit,
    tone: "bg-[#ddc7ff]",
    copy: "AI was introduced into the product pipeline, changing delivery from stalled output to deployed software products.",
    stats: ["4 products deployed", "12 month shift", "Revenue pipelines built"],
    href: "/ops/results/bisk-education",
  },
  {
    category: "Fitness business",
    name: "Bodysharp",
    icon: HeartPulse,
    tone: "bg-[#c8f2d3]",
    copy: "A templated operational result showing admin, follow-up and customer update routines ready for replacement.",
    stats: ["Admin mapped", "Follow-up planned", "Capacity forecast"],
    href: "/ops/results/bodysharp",
  },
]

export function ResultsGrid() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((result) => (
          <ResultCard key={result.name} result={result} />
        ))}
      </div>
    </section>
  )
}

function ResultCard({ result }: { result: (typeof results)[number] }) {
  const Icon = result.icon

  return (
    <article className="flex min-h-[390px] flex-col rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
      <span className={`grid size-16 place-items-center rounded-full ${result.tone}`}>
        <Icon className="size-9" strokeWidth={2.1} />
      </span>
      <p className="mt-7 text-[12px] font-semibold text-black/55">{result.category}</p>
      <h2 className="mt-2 text-[25px] font-black leading-[1.05] tracking-[-0.055em]">{result.name}</h2>
      <p className="mt-5 text-[14px] font-semibold leading-[1.45]">{result.copy}</p>
      <div className="mt-auto grid grid-cols-3 gap-3 pt-8">
        {result.stats.map((stat, index) => {
          const IconForStat = [Clock3, MessageCircle, Star][index]
          return (
            <p key={stat} className="text-[10px] font-black leading-[1.1]">
              <IconForStat className="mb-1 size-5 text-[#9ab200]" strokeWidth={2.4} />
              {stat}
            </p>
          )
        })}
      </div>
      <Link href={result.href} className="mt-7 inline-flex min-h-11 w-fit items-center gap-4 border-b-[3px] border-[#dfff00] pb-2 text-[13px] font-black">
        View result
        <ArrowRight className="size-5 text-[#b6d000]" strokeWidth={2.8} />
      </Link>
    </article>
  )
}
