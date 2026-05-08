import { Dumbbell, ChevronRight, Clock, Check, Phone, Zap, Heart, Flame } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Functional Fitness | Gracie Barra Halesowen",
  description: "Strength and conditioning facilities at Gracie Barra Halesowen. Free weights, cardio, and functional training equipment to complement your Jiu-Jitsu.",
}

const equipment = [
  "Free weights & dumbbells",
  "Squat racks & benches",
  "Cardio machines",
  "Kettlebells & medicine balls",
  "Pull-up bars & rigs",
  "Functional training area",
]

const benefits = [
  {
    title: "Performance",
    description: "Improve your Jiu-Jitsu with sport-specific conditioning.",
    icon: Zap,
  },
  {
    title: "Resilience",
    description: "Build the strength and endurance to train longer.",
    icon: Heart,
  },
  {
    title: "Metabolism",
    description: "Burn calories and improve body composition.",
    icon: Flame,
  },
]

export default function FitnessPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#22C55E]">
        <img src="/gbhalesowen/functional-fitness_1.jpg" alt="Functional fitness" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/95 to-[#22C55E]/70" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Link href="/gbhalesowen/programs" className="hover:text-white">Programs</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">Fitness</span>
          </div>
          <div className="mt-6 max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Dumbbell className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Strength & Conditioning</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Functional Fitness
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Complement your Jiu-Jitsu training with strength and conditioning. 
              Fully equipped gym open to all academy members.
            </p>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#22C55E]">Facilities</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">Fully equipped gym.</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {equipment.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="size-5 text-[#22C55E]" />
                    <span className="font-semibold text-[#4B5563]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/gbhalesowen/functional-fitness_2.jpg" alt="Gym" className="aspect-square rounded-lg object-cover" />
              <img src="/gbhalesowen/functional-fitness_3.jpg" alt="Equipment" className="aspect-square rounded-lg object-cover" />
              <img src="/gbhalesowen/functional-fitness_5.jpg" alt="Weights" className="aspect-square rounded-lg object-cover" />
              <img src="/gbhalesowen/functional-fitness_6.jpg" alt="Training" className="aspect-square rounded-lg object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#22C55E]">Access</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">Open gym hours.</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-black/10 bg-white p-6">
              <div>
                <p className="font-bold text-[#002F86]">Monday - Thursday</p>
                <p className="text-sm text-[#4B5563]">Evening open gym</p>
              </div>
              <span className="rounded bg-[#22C55E] px-3 py-1 text-sm font-bold text-white">18:00 - 22:00</span>
            </div>
            <div className="flex items-center justify-between border border-black/10 bg-white p-6">
              <div>
                <p className="font-bold text-[#002F86]">Friday</p>
                <p className="text-sm text-[#4B5563]">Morning session</p>
              </div>
              <span className="rounded bg-[#22C55E]/70 px-3 py-1 text-sm font-bold text-white">09:00 - 12:00</span>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-[#4B5563]">
            Functional Fitness access is included with all academy memberships.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#22C55E] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">Benefits</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold">Why add fitness training?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="border border-white/20 bg-white/10 p-8 text-center">
                  <Icon className="mx-auto size-12" />
                  <h3 className="mt-4 text-xl font-extrabold">{b.title}</h3>
                  <p className="mt-2 text-white/75">{b.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
