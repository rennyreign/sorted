import { Check, MapPin, Users, Award, Heart, Shield, GraduationCap, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Gracie Barra Halesowen",
  description: "Learn about Gracie Barra Halesowen's mission, values, and the Gracie Barra legacy. World-class Brazilian Jiu-Jitsu instruction in a family-friendly environment.",
}

const gbCode = [
  {
    title: "Brotherhood",
    description: "We are a family. We treat everyone with respect and build lasting friendships on and off the mats.",
    icon: Users,
  },
  {
    title: "Cooperation",
    description: "We grow together. Our training partners help us improve, and we return the favour.",
    icon: Heart,
  },
  {
    title: "Discipline",
    description: "Consistency and commitment are the foundations of progress in Jiu-Jitsu and in life.",
    icon: Shield,
  },
  {
    title: "Continuous Improvement",
    description: "We strive to be better every day — as athletes, instructors, and human beings.",
    icon: Award,
  },
]

const academyValues = [
  "World-class instruction",
  "Safe, clean training environment",
  "Family-friendly atmosphere",
  "Clear progression curriculum",
  "Supportive team culture",
  "Focus on technique over strength",
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#001D58]">
        <img
          src="gbhalesowen/daytime-warriors.jpg"
          alt="Gracie Barra Halesowen team training"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,88,0.95)_0%,rgba(0,29,88,0.8)_50%,rgba(0,29,88,0.6)_100%)]" />
        
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white">
              About Our Academy
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Built on tradition.<br />
              Focused on you.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Gracie Barra Halesowen brings world-class Brazilian Jiu-Jitsu instruction to the West Midlands. 
              We are part of a global family dedicated to transforming lives through martial arts.
            </p>
          </div>
        </div>
      </section>

      {/* Gracie Barra Legacy Section */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
                The Gracie Barra Legacy
              </p>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
                A worldwide family with local roots.
              </h2>
              <div className="mt-5 h-1.5 w-24 bg-[#C8102E]" />
              
              <div className="mt-8 space-y-4 text-base font-medium leading-7 text-[#4B5563]">
                <p>
                  Gracie Barra was founded by Master Carlos Gracie Jr. with a vision to make Brazilian Jiu-Jitsu 
                  accessible to everyone. What began in Rio de Janeiro has grown into one of the largest and 
                  most respected Jiu-Jitsu organisations in the world.
                </p>
                <p>
                  Today, Gracie Barra has over 1,000 schools worldwide, unified by a standardised curriculum 
                  that ensures every student receives the same high-quality instruction, whether they train 
                  in Halesowen, London, or Los Angeles.
                </p>
                <p>
                  At Gracie Barra Halesowen, we uphold this legacy. Our instructors are certified under 
                  the Gracie Barra system, and our curriculum follows the proven structure that has produced 
                  countless champions and changed millions of lives.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative overflow-hidden border border-black/10 shadow-[0_24px_70px_rgba(0,47,134,0.13)]">
                <img
                  src="gbhalesowen/gi-bjj.jpg"
                  alt="Gracie Barra lineage and tradition"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="border border-black/10 bg-[#F4F7FC] p-4">
                  <p className="text-3xl font-extrabold text-[#C8102E]">1000+</p>
                  <p className="mt-1 text-xs font-semibold text-[#4B5563]">Schools Worldwide</p>
                </div>
                <div className="border border-black/10 bg-[#F4F7FC] p-4">
                  <p className="text-3xl font-extrabold text-[#C8102E]">40+</p>
                  <p className="mt-1 text-xs font-semibold text-[#4B5563]">Countries</p>
                </div>
                <div className="border border-black/10 bg-[#F4F7FC] p-4">
                  <p className="text-3xl font-extrabold text-[#C8102E]">1986</p>
                  <p className="mt-1 text-xs font-semibold text-[#4B5563]">Founded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The GB Code Section */}
      <section className="bg-[#003384] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">
              The Gracie Barra Code
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight">
              The principles that guide us.
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-white/75">
              These four pillars define who we are and how we train. They are the foundation of everything we do.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {gbCode.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="border border-white/20 bg-white/5 p-6 transition-colors hover:bg-white/10">
                  <Icon className="size-10 text-[#C8102E]" strokeWidth={1.8} />
                  <h3 className="mt-5 text-lg font-extrabold uppercase tracking-[0.04em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/72">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Academy Values Section */}
      <section className="bg-[#F4F7FC] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden border border-black/10 shadow-[0_24px_70px_rgba(0,47,134,0.13)]">
                <img
                  src="gbhalesowen/kids-jits.jpg"
                  alt="Kids training at Gracie Barra Halesowen"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
                Our Academy
              </p>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
                What makes us different.
              </h2>
              <div className="mt-5 h-1.5 w-24 bg-[#C8102E]" />
              
              <p className="mt-8 text-base font-medium leading-7 text-[#4B5563]">
                At Gracie Barra Halesowen, we have built something special. Our academy is more than a place 
                to train — it is a community where people from all walks of life come together to improve themselves.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {academyValues.map((value) => (
                  <div key={value} className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-[#C8102E]" strokeWidth={2.5} />
                    <span className="text-sm font-bold text-[#002F86]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Team Section */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
              Meet the Team
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight text-[#002F86]">
              Experienced instructors dedicated to your growth.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-black/10 bg-white p-6 text-center shadow-[0_18px_50px_rgba(0,47,134,0.08)]">
              <div className="mx-auto size-24 rounded-full bg-[#E8EDF7]">
                <img
                  src="gbhalesowen/stu-headshot.png"
                  alt="Professor Stuart - Head Instructor"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#002F86]">Professor Stuart</h3>
              <p className="text-sm font-semibold text-[#C8102E]">Head Instructor</p>
              <p className="mt-3 text-sm font-medium leading-6 text-[#4B5563]">
                Black belt with over 15 years of training experience. Specialises in teaching beginners 
                and building fundamentals.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-6 text-center shadow-[0_18px_50px_rgba(0,47,134,0.08)]">
              <div className="mx-auto size-24 rounded-full bg-[#E8EDF7]">
                <img
                  src="gbhalesowen/daytime-warriors.jpg"
                  alt="Coach"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#002F86]">Coach Sarah</h3>
              <p className="text-sm font-semibold text-[#C8102E]">Kids Program Lead</p>
              <p className="mt-3 text-sm font-medium leading-6 text-[#4B5563]">
                Purple belt and certified youth instructor. Creates a fun, safe environment for kids 
                to learn discipline and confidence.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-6 text-center shadow-[0_18px_50px_rgba(0,47,134,0.08)]">
              <div className="mx-auto size-24 rounded-full bg-[#E8EDF7]">
                <img
                  src="gbhalesowen/nogi-bjj.jpg"
                  alt="Coach"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#002F86]">Coach James</h3>
              <p className="text-sm font-semibold text-[#C8102E]">Advanced Class Coach</p>
              <p className="mt-3 text-sm font-medium leading-6 text-[#4B5563]">
                Brown belt with competition experience. Leads advanced classes and competition team training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-[#002766] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white/60">
                Location
              </p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[0.96] tracking-tight">
                Find us in Halesowen.
              </h2>
              <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/75">
                Our academy is conveniently located at Harvey Works on Shelah Road, with easy access 
                from Halesowen town centre and surrounding areas.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 size-5 shrink-0 text-[#C8102E]" />
                  <div>
                    <p className="font-bold">Gracie Barra Halesowen</p>
                    <p className="text-sm text-white/70">Harvey Works, Shelah Road</p>
                    <p className="text-sm text-white/70">Halesowen, West Midlands B63 3PG</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="size-5 shrink-0 text-[#C8102E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-sm">info@graciebarrahalesowen.com</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/gbhalesowen#contact"
                  className="group inline-flex items-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
                >
                  Get directions
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
            
            <div className="aspect-video overflow-hidden rounded-lg border border-white/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2431.7!2d-2.060065!3d52.461649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870989a5c8c3c2f%3A0x5d2e2a33c5b2e1a0!2sGracie%20Barra%20Halesowen!5e0!3m2!1sen!2suk!4v1704067200000!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gracie Barra Halesowen Location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
