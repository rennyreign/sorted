import { Users, ChevronRight, Clock, Check, Phone, Heart, Shield, Star } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kids Classes | Gracie Barra Halesowen",
  description: "Brazilian Jiu-Jitsu for kids ages 4-14. Build confidence, discipline, and fitness in a fun, safe environment. First class free.",
}

const ageGroups = [
  {
    name: "GB1 Kids",
    ages: "Ages 4-7",
    focus: ["Basic movements", "Games and fun", "Discipline", "Coordination"],
    schedule: "Mon, Tue, Fri 17:00 + Sat 09:15",
  },
  {
    name: "GB2 Kids",
    ages: "Ages 8-14",
    focus: ["Technique introduction", "Self-defence", "Competition prep", "Leadership"],
    schedule: "Thu 17:00 + Sat 10:00",
  },
]

const benefits = [
  {
    title: "Confidence",
    description: "Children develop self-belief through achievement on the mats.",
    icon: Star,
  },
  {
    title: "Discipline",
    description: "Learn to listen, focus, and follow instructions.",
    icon: Shield,
  },
  {
    title: "Respect",
    description: "Respect for instructors, training partners, and oneself.",
    icon: Heart,
  },
  {
    title: "Fitness",
    description: "Fun physical activity that builds strength and coordination.",
    icon: Users,
  },
]

export default function KidsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#168CC9]">
        <img src="gbhalesowen/kids-jits.jpg" alt="Kids classes" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#168CC9]/95 to-[#168CC9]/70" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Link href="gbhalesowen/programs" className="hover:text-white">Programs</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">Kids</span>
          </div>
          <div className="mt-6 max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Users className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Ages 4-14</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Kids Classes
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Build confidence, discipline, and character through martial arts. 
              A fun, positive environment where your child will thrive.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="/gbhalesowen#contact" className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0">
                Book free trial
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#168CC9]">Age Groups</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">Programs for every age.</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {ageGroups.map((group) => (
              <div key={group.name} className="border border-black/10 bg-white p-8 shadow-[0_18px_45px_rgba(0,47,134,0.10)]">
                <div className="mb-4 inline-block rounded bg-[#168CC9] px-3 py-1 text-xs font-bold uppercase text-white">
                  {group.ages}
                </div>
                <h3 className="text-2xl font-extrabold text-[#002F86]">{group.name}</h3>
                <div className="mt-4 space-y-2">
                  {group.focus.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-[#168CC9]" />
                      <span className="text-sm font-medium text-[#4B5563]">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-[#4B5563]">
                  <Clock className="size-4" />
                  {group.schedule}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#168CC9]">Benefits</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">Why parents choose us.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="border border-black/10 bg-white p-6 text-center">
                  <Icon className="mx-auto size-10 text-[#168CC9]" />
                  <h3 className="mt-4 text-lg font-extrabold text-[#002F86]">{b.title}</h3>
                  <p className="mt-2 text-sm text-[#4B5563]">{b.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#168CC9] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">First class is free.</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">Bring your child for a trial. No commitment, no uniform needed.</p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="/gbhalesowen#contact" className="inline-flex items-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white hover:bg-[#A90E27]">
              Book now
            </a>
            <a href="tel:01212854555" className="inline-flex items-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white hover:bg-white hover:text-[#168CC9]">
              <Phone className="size-4" />
              Call us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
