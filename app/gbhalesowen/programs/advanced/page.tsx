import { Medal, ChevronRight, Clock, Check, Phone, Target, Award, Zap } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Advanced Classes | Gracie Barra Halesowen",
  description: "Advanced Brazilian Jiu-Jitsu training for blue belts and above. Competition preparation, technical refinement, and live sparring at Gracie Barra Halesowen.",
}

const requirements = [
  "Blue belt rank or higher",
  "Or by instructor invitation",
  "Solid fundamentals understanding",
  "Commitment to regular training",
]

const focusAreas = [
  {
    title: "Competition",
    description: "Tournament preparation, strategy, and peak performance training.",
    icon: Target,
  },
  {
    title: "Technical Refinement",
    description: "Advanced techniques, transitions, and chaining sequences.",
    icon: Medal,
  },
  {
    title: "Live Training",
    description: "Extended sparring rounds with high-level partners.",
    icon: Zap,
  },
]

export default function AdvancedPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#7647B9]">
        <img src="gbhalesowen/daytime-warriors.jpg" alt="Advanced training" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7647B9]/95 to-[#7647B9]/70" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Link href="gbhalesowen/programs" className="hover:text-white">Programs</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">Advanced</span>
          </div>
          <div className="mt-6 max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Medal className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">GB2 & Competition</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Advanced Training
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Sharper rounds, technical detail and live training for students ready to push their Jiu-Jitsu to the next level.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#7647B9]">Requirements</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">Ready for the next level?</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {requirements.map((req) => (
              <div key={req} className="flex items-center gap-3 border border-black/10 p-4">
                <Check className="size-5 text-[#7647B9]" />
                <span className="font-semibold text-[#4B5563]">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#7647B9]">Training Focus</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">What we work on.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {focusAreas.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="border border-black/10 bg-white p-8">
                  <Icon className="size-10 text-[#7647B9]" />
                  <h3 className="mt-4 text-xl font-extrabold text-[#002F86]">{f.title}</h3>
                  <p className="mt-2 text-[#4B5563]">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-[#7647B9] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[800px] text-center">
          <Clock className="mx-auto size-10" />
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">Schedule</h2>
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center justify-between border border-white/20 bg-white/10 p-4">
              <span className="font-bold">Tuesday</span>
              <span>GB2 Advanced 18:00-19:00</span>
            </div>
            <div className="flex items-center justify-between border border-white/20 bg-white/10 p-4">
              <span className="font-bold">Thursday</span>
              <span>GB2 Advanced 19:00-20:00</span>
            </div>
            <div className="flex items-center justify-between border border-white/20 bg-white/10 p-4">
              <span className="font-bold">Sunday</span>
              <span>Competition Training (by invite)</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
