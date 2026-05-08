import { Venus, ChevronRight, Clock, Check, Phone, Shield, Users, Heart } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Female Training | Gracie Barra Halesowen",
  description: "Women-only Brazilian Jiu-Jitsu classes in Halesowen. Learn self-defence, build confidence, and train in a supportive environment.",
}

const benefits = [
  {
    title: "Self-Defence",
    description: "Practical techniques for real-world situations.",
    icon: Shield,
  },
  {
    title: "Confidence",
    description: "Build self-belief through physical achievement.",
    icon: Users,
  },
  {
    title: "Community",
    description: "Train with like-minded women in a supportive space.",
    icon: Heart,
  },
]

export default function FemalePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#D85B94]">
        <img src="/gbhalesowen/girls-bjj.jpg" alt="Female training" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D85B94]/95 to-[#D85B94]/70" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Link href="/gbhalesowen/programs" className="hover:text-white">Programs</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">Female</span>
          </div>
          <div className="mt-6 max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Venus className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Women Only</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Female Training
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              A supportive, empowering environment for women to learn Jiu-Jitsu. 
              Build confidence, get fit, and master practical self-defence.
            </p>
            <div className="mt-8">
              <a href="https://cal.com/adxengine/free-intro?theme=light" className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0">
                Book free trial
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#D85B94]">Schedule</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">When we train.</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-black/10 bg-white p-6 shadow-sm">
              <div>
                <p className="font-bold text-[#002F86]">Wednesday Evening</p>
                <p className="text-sm text-[#4B5563]">Ladies Only Class</p>
              </div>
              <span className="rounded bg-[#D85B94] px-3 py-1 text-sm font-bold text-white">18:00 - 19:00</span>
            </div>
            <div className="flex items-center justify-between border border-black/10 bg-white p-6 shadow-sm">
              <div>
                <p className="font-bold text-[#002F86]">Saturday Open Mat</p>
                <p className="text-sm text-[#4B5563]">Women welcome to train together</p>
              </div>
              <span className="rounded bg-[#D85B94]/70 px-3 py-1 text-sm font-bold text-white">12:00 - 13:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#D85B94]">Why Train</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002F86]">More than martial arts.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="border border-black/10 bg-white p-8 text-center">
                  <Icon className="mx-auto size-12 text-[#D85B94]" />
                  <h3 className="mt-4 text-xl font-extrabold text-[#002F86]">{b.title}</h3>
                  <p className="mt-2 text-[#4B5563]">{b.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#D85B94] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">Train in a supportive space.</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">Your first class is free. All fitness levels welcome.</p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="https://cal.com/adxengine/free-intro?theme=light" className="inline-flex items-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white hover:bg-[#A90E27]">
              Book free trial
            </a>
            <a href="tel:01212854555" className="inline-flex items-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white hover:bg-white hover:text-[#D85B94]">
              <Phone className="size-4" />
              Call us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
