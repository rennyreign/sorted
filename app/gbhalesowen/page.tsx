import {
  ChevronRight,
  Clock,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  MapPin,
  Medal,
  Phone,
  ShieldCheck,
  Swords,
  Target,
  UserRoundCheck,
  Users,
  Venus,
  CalendarDays,
  Check,
} from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gracie Barra Halesowen | Brazilian Jiu-Jitsu Classes",
  description:
    "Brazilian Jiu-Jitsu classes for beginners, kids, women and competitors in Halesowen. Book a free intro class with Gracie Barra Halesowen.",
}

const programs = [
  {
    title: "Fundamentals",
    text: "Beginner-friendly classes that build the core movements, positions and confidence to train safely.",
    image: "/gbhalesowen/gi-bjj.jpg",
    icon: GraduationCap,
    accent: "#3158A7",
  },
  {
    title: "Advanced",
    text: "Sharper rounds, technical detail and live training for students ready to push their Jiu-Jitsu further.",
    image: "/gbhalesowen/daytime-warriors.jpg",
    icon: Medal,
    accent: "#7647B9",
  },
  {
    title: "Kids Classes",
    text: "Structured sessions for ages 4+ focused on confidence, discipline, movement and respect.",
    image: "/gbhalesowen/kids-jits.jpg",
    icon: Users,
    accent: "#168CC9",
  },
  {
    title: "Female Training",
    text: "A supportive training environment for women learning Jiu-Jitsu, fitness and practical self-defence.",
    image: "/gbhalesowen/girls-bjj.jpg",
    icon: Venus,
    accent: "#D85B94",
  },
  {
    title: "Barbell / Fitness",
    text: "Strength and conditioning support to improve performance, resilience and all-round wellbeing.",
    image: "/gbhalesowen/functional-fitness_1.jpg",
    icon: Dumbbell,
    accent: "#D1414C",
  },
]

const benefits = [
  {
    title: "Confidence",
    text: "Build self-belief on and off the mats.",
    icon: ShieldCheck,
  },
  {
    title: "Fitness",
    text: "Train hard in a way that keeps you engaged.",
    icon: HeartPulse,
  },
  {
    title: "Self-defence",
    text: "Learn practical skills for real situations.",
    icon: Swords,
  },
  {
    title: "Discipline",
    text: "Develop focus, resilience and better habits.",
    icon: Target,
  },
  {
    title: "Community",
    text: "Join a team that looks after each other.",
    icon: Users,
  },
]

const timetable = [
  {
    title: "Kids Jiu-Jitsu",
    detail: "After-school and weekend options for ages 4+.",
  },
  {
    title: "Adult Fundamentals",
    detail: "Beginner classes for first-timers and returning students.",
  },
  {
    title: "Gi and No-Gi",
    detail: "Technical sessions and live rounds across the week.",
  },
  {
    title: "Female Training",
    detail: "Supportive classes and open mat opportunities.",
  },
]

const testimonials = [
  {
    quote:
      "GB Halesowen changed my life. The coaches are amazing and the community is like a second family.",
    name: "James P.",
    role: "Adult member",
  },
  {
    quote:
      "My son has grown so much in confidence and focus since joining the kids classes. Highly recommend.",
    name: "Sarah T.",
    role: "Parent",
  },
  {
    quote:
      "Top level instruction in a welcoming environment. Could not ask for a better academy.",
    name: "Liam R.",
    role: "Competition team",
  },
]

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
      {children}
    </p>
  )
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_16px_30px_rgba(200,16,46,0.25)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] hover:shadow-[0_20px_40px_rgba(200,16,46,0.32)] active:translate-y-0"
    >
      {children}
      <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
    </a>
  )
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center border-2 border-white/80 px-6 py-[0.875rem] text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#002F86] active:translate-y-0"
    >
      {children}
    </a>
  )
}

export default function GBHalesowenPage() {
  return (
    <>
      {/* Hero Section - Flipped horizontally with instructor visible */}
      <section className="relative isolate min-h-[calc(100dvh-80px)] overflow-hidden bg-[#001D58]">
        <img
          src="/gbhalesowen/gi-bjj.jpg"
          alt="Gracie Barra Halesowen adult students with instructor"
          className="absolute inset-0 h-full w-full object-cover object-center scale-x-[-1] md:object-[60%_center] lg:object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,88,0.92)_0%,rgba(0,29,88,0.65)_40%,rgba(0,29,88,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,rgba(0,29,88,0.9),rgba(0,29,88,0))]" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-80px)] max-w-[1400px] items-center px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-2xl text-white">
            <div className="mb-6 inline-flex items-center gap-3 border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#C8102E]" />
              Brazilian Jiu-Jitsu in Halesowen
            </div>
            <h1 className="max-w-[18ch] text-[clamp(3rem,7vw,6.25rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
              Jiu-Jitsu for everyone
            </h1>
            <p className="mt-7 max-w-lg text-lg font-semibold leading-8 text-white/88">
              Build confidence. Get fit. Learn self-defence. Join a supportive team that feels like family.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton href="https://cal.com/adxengine/free-intro?theme=light">Book a free intro</PrimaryButton>
              <SecondaryButton href="/gbhalesowen/timetable">View timetable</SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section - Fixed icon visibility */}
      <section id="programs" className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <SectionKicker>Our programs</SectionKicker>
            <h2 className="text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight text-[#002F86]">
              Find your path. Grow every day.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {programs.map((program) => {
              const Icon = program.icon

              return (
                <Link
                  key={program.title}
                  href={`/gbhalesowen/programs/${program.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group border border-black/10 bg-white shadow-[0_18px_45px_rgba(0,47,134,0.10)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#C8102E]/35 hover:shadow-[0_24px_60px_rgba(0,47,134,0.16)]"
                >
                  <div className="relative aspect-[1.35] overflow-hidden bg-[#E8EDF7]">
                    <img
                      src={program.image}
                      alt={`${program.title} training at Gracie Barra Halesowen`}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                  </div>
                  {/* Icon positioned to overlap image and content area */}
                  <div
                    className="relative -top-7 mx-auto grid size-14 place-items-center rounded-full border-4 border-white text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    style={{ backgroundColor: program.accent }}
                  >
                    <Icon className="size-7" strokeWidth={2} />
                  </div>
                  <div className="px-6 pb-7 pt-5 text-center">
                    <h3 className="text-lg font-extrabold uppercase tracking-[0.04em] text-[#002F86]">
                      {program.title}
                    </h3>
                    <p className="mt-4 min-h-[4.5rem] text-sm font-medium leading-6 text-[#4B5563]">
                      {program.text}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#C8102E] transition-colors hover:text-[#002F86]">
                      Learn more <ChevronRight className="size-3.5" strokeWidth={2.4} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#003384] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">
              Why train with us?
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.75rem)] font-extrabold leading-none tracking-tight">
              More than martial arts. It is a way of life.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden bg-white/25 md:grid-cols-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <div key={benefit.title} className="bg-[#003384] px-6 py-8 text-center">
                  <Icon className="mx-auto size-11 text-white" strokeWidth={1.7} />
                  <h3 className="mt-5 text-sm font-extrabold uppercase tracking-[0.06em]">
                    {benefit.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-[13rem] text-sm font-medium leading-6 text-white/76">
                    {benefit.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Kids Feature Section */}
      <section className="relative isolate overflow-hidden bg-[#F4F7FC] px-5 py-24 sm:px-8 lg:px-12">
        <img
          src="/gbhalesowen/kids-jits.jpg"
          alt="Kids Jiu-Jitsu students at Gracie Barra Halesowen"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-center lg:w-[64%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#F7F9FD_0%,rgba(247,249,253,0.94)_31%,rgba(247,249,253,0.42)_62%,rgba(247,249,253,0.08)_100%)]" />

        <div className="relative mx-auto max-w-[1400px]">
          <div className="max-w-xl">
            <SectionKicker>Kids classes</SectionKicker>
            <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] font-extrabold leading-[0.9] tracking-tight text-[#002F86]">
              Strong today. Leaders tomorrow.
            </h2>
            <p className="mt-6 max-w-md text-base font-semibold leading-7 text-[#4B5563]">
              Our kids programme combines Jiu-Jitsu, character development and real-life skills in a fun, positive environment.
            </p>
            <div className="mt-8">
              <PrimaryButton href="programs/kids">View kids program</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[0.96fr_1fr]">
          <div className="relative overflow-hidden border border-black/10 bg-[#E9EEF7] shadow-[0_24px_70px_rgba(0,47,134,0.13)]">
            <img
              src="/gbhalesowen/daytime-warriors.jpg"
              alt="Gracie Barra Halesowen academy team in the training room"
              className="aspect-[1.22] h-full w-full object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 bg-white/92 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#C8102E]">
                Halesowen academy
              </p>
              <p className="mt-2 text-sm font-bold text-[#002F86]">
                Clear coaching, clean mats, and a team-first culture.
              </p>
            </div>
          </div>

          <div>
            <SectionKicker>Welcome to</SectionKicker>
            <h2 className="max-w-xl text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
              Gracie Barra Halesowen
            </h2>
            <div className="mt-5 h-1.5 w-24 bg-[#C8102E]" />
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-[#4B5563]">
              We are part of Gracie Barra, one of the world&apos;s largest Jiu-Jitsu organisations. Our mission is to provide world-class instruction in a safe, supportive and family-friendly environment.
            </p>
            <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-[#4B5563]">
              Whether you want to get fit, learn self-defence, compete, or simply be part of a community, you will find your place here.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Certified instructors", "World-class curriculum", "Supportive community"].map((item) => (
                <div key={item} className="flex items-center gap-3 border-t border-black/10 pt-4 text-sm font-extrabold text-[#002F86]">
                  <Check className="size-5 text-[#C8102E]" strokeWidth={2.3} />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-9">
              <Link
                href="/gbhalesowen/about"
                className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_16px_30px_rgba(200,16,46,0.25)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] hover:shadow-[0_20px_40px_rgba(200,16,46,0.32)] active:translate-y-0"
              >
                Learn more about us
                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timetable Preview Section */}
      <section className="bg-[#F5F7FB] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <SectionKicker>Timetable</SectionKicker>
              <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
                Find the right class before you step on the mat.
              </h2>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-[#4B5563]">
                Class times change as the academy grows. Message the team for current spaces, starter slots and the best first class for your age and level.
              </p>
              <div className="mt-6">
                <Link
                  href="/gbhalesowen/timetable"
                  className="group inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.05em] text-[#C8102E] transition-colors hover:text-[#002F86]"
                >
                  View full timetable
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {timetable.map((item, index) => (
                <div key={item.title} className="border border-black/10 bg-white p-6 shadow-[0_16px_45px_rgba(0,47,134,0.07)]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <CalendarDays className="size-7 text-[#C8102E]" strokeWidth={1.9} />
                    <span className="font-mono text-xs font-bold text-[#697386]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#002F86]">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#4B5563]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 border-l-4 border-[#C8102E] bg-[#003384] p-6 text-white sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Clock className="size-8 shrink-0" strokeWidth={1.9} />
              <div>
                <p className="text-lg font-extrabold">New starters are welcome.</p>
                <p className="mt-1 text-sm font-medium text-white/78">
                  Book a free intro and we will point you to the right first session.
                </p>
              </div>
            </div>
            <a
              href="tel:01212854555"
              className="inline-flex items-center justify-center gap-2 bg-[#C8102E] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
            >
              <Phone className="size-4" strokeWidth={2.2} />
              Call the team
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <SectionKicker>What our members say</SectionKicker>
            <h2 className="text-[clamp(2.1rem,4vw,3.75rem)] font-extrabold leading-none tracking-tight text-[#002F86]">
              Real people. Real results.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="border border-black/10 bg-white p-7 shadow-[0_18px_50px_rgba(0,47,134,0.10)]">
                <div className="mb-5 text-5xl font-extrabold leading-none text-[#C8102E]">
                  &quot;
                </div>
                <p className="min-h-[7rem] text-base font-medium leading-7 text-[#4B5563]">
                  {testimonial.quote}
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-black/10 pt-5">
                  <div className="grid size-10 place-items-center rounded-full bg-[#E9EEF7] text-[#002F86]">
                    <UserRoundCheck className="size-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#002F86]">{testimonial.name}</p>
                    <p className="text-xs font-semibold text-[#667085]">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-[#003384] text-white">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[24rem] overflow-hidden bg-[#E9EEF7]">
            {/* Live Google Map */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2431.7!2d-2.060065!3d52.461649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870989a5c8c3c2f%3A0x5d2e2a33c5b2e1a0!2sGracie%20Barra%20Halesowen!5e0!3m2!1sen!2suk!4v1704067200000!5m2!1sen!2suk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Gracie Barra Halesowen Location"
              className="absolute inset-0 h-full w-full"
            />
            {/* Pulsing marker overlay */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-4 animate-ping rounded-full bg-[#C8102E]/30" />
                <div className="relative grid size-10 place-items-center rounded-full bg-[#C8102E] text-white shadow-[0_8px_20px_rgba(200,16,46,0.4)]">
                  <MapPin className="size-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 p-5 text-[#002F86] shadow-[0_20px_55px_rgba(0,47,134,0.16)] backdrop-blur-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#C8102E]">Visit us</p>
              <p className="mt-2 text-lg font-extrabold">Harvey Works, Shelah Road</p>
            </div>
          </div>

          <div className="px-5 py-14 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-white">Visit us</p>
              <h2 className="text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[0.94] tracking-tight">
                We would love to meet you.
              </h2>

              <div className="mt-8 grid gap-4 text-white/88 sm:grid-cols-2">
                <a href="https://www.google.com/maps/search/?api=1&query=Gracie%20Barra%20Halesowen%20Harvey%20Works%20Shelah%20Road%20B63%203PG" className="flex gap-3 border border-white/18 p-4 transition-colors hover:bg-white/8">
                  <MapPin className="mt-1 size-5 shrink-0 text-white" strokeWidth={2} />
                  <span className="text-sm font-semibold leading-6">
                    Gracie Barra Halesowen<br />
                    Harvey Works, Shelah Road<br />
                    Halesowen, West Midlands B63 3PG
                  </span>
                </a>
                <div className="grid gap-4">
                  <a href="tel:01212854555" className="flex items-center gap-3 bg-[#C8102E] p-4 text-sm font-extrabold transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0">
                    <Phone className="size-5" strokeWidth={2} />
                    0121 285 4555
                  </a>
                  <a href="mailto:info@graciebarrahalesowen.com" className="flex items-center gap-3 border border-white/18 p-4 text-sm font-extrabold transition-colors hover:bg-white/8">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    info@graciebarrahalesowen.com
                  </a>
                </div>
              </div>

              <div className="mt-8 grid gap-5 border border-white/22 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xl font-extrabold">Book a free intro</p>
                  <p className="mt-2 max-w-md text-sm font-medium leading-6 text-white/75">
                    Try a class, meet the team and see if Jiu-Jitsu is right for you.
                  </p>
                </div>
                <a
                  href="https://cal.com/adxengine/free-intro?theme=light"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#C8102E] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
                >
                  <CalendarDays className="size-4" />
                  Book now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
