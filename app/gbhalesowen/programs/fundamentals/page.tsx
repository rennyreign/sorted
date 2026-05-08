import { GraduationCap, ChevronRight, Clock, Check, Users, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fundamentals Program | Gracie Barra Halesowen",
  description: "Beginner-friendly Brazilian Jiu-Jitsu classes. Learn the core movements, positions and build confidence to train safely. First class free.",
}

const whatYouWillLearn = [
  "Essential positions and movements",
  "Basic submissions and escapes",
  "Proper breathing and posture",
  "How to fall safely (breakfalls)",
  "Guard passing fundamentals",
  "Mount and back control basics",
  "Defence against common attacks",
  "Etiquette and academy culture",
]

const classStructure = [
  {
    step: 1,
    title: "Warm-up",
    description: "Movement drills and exercises to prepare your body",
    duration: "10 mins",
  },
  {
    step: 2,
    title: "Technique",
    description: "Learn 2-3 techniques from the GB curriculum",
    duration: "30 mins",
  },
  {
    step: 3,
    title: "Drilling",
    description: "Practice with a cooperative partner",
    duration: "15 mins",
  },
  {
    step: 4,
    title: "Live Training",
    description: "Controlled sparring (optional for beginners)",
    duration: "15 mins",
  },
]

const faqs = [
  {
    question: "Do I need any experience?",
    answer: "No experience is required. Our Fundamentals program is specifically designed for complete beginners.",
  },
  {
    question: "What should I wear?",
    answer: "For your first class, comfortable workout clothes are fine. We provide a gi (uniform) for trial classes. After joining, you will need your own gi.",
  },
  {
    question: "Is it safe?",
    answer: "Safety is our top priority. You will learn how to train safely, and there is no pressure to spar until you feel ready.",
  },
  {
    question: "How fit do I need to be?",
    answer: "Any fitness level is welcome. Jiu-Jitsu will help you get fitter over time. You work at your own pace.",
  },
]

export default function FundamentalsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#3158A7]">
        <img
          src="/gbhalesowen/gi-bjj.jpg"
          alt="Fundamentals class at Gracie Barra Halesowen"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3158A7]/95 to-[#3158A7]/70" />
        
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Link href="/gbhalesowen/programs" className="hover:text-white">Programs</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">Fundamentals</span>
          </div>
          
          <div className="mt-6 max-w-3xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <GraduationCap className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Beginner Program</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Fundamentals
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Beginner-friendly classes that build the core movements, positions and confidence 
              to train safely. The perfect starting point for your Jiu-Jitsu journey.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/gbhalesowen#contact"
                className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
              >
                Book free trial
                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
              <Link
                href="/gbhalesowen/timetable"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#3158A7] active:translate-y-0"
              >
                <Clock className="size-4" />
                View schedule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What You Will Learn */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#3158A7]">
                What You Will Learn
              </p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
                Building your foundation.
              </h2>
              <p className="mt-5 text-base font-medium leading-7 text-[#4B5563]">
                Our Fundamentals curriculum is structured to take you from complete beginner to confident 
                practitioner. Each class builds on the last, ensuring you develop solid Jiu-Jitsu fundamentals.
              </p>
              
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {whatYouWillLearn.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 grid size-5 place-items-center rounded-full bg-[#3158A7]">
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-[#4B5563]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-black/10 shadow-[0_24px_70px_rgba(0,47,134,0.13)]">
                <img
                  src="/gbhalesowen/gi-bjj.jpg"
                  alt="Fundamentals class"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 max-w-[200px] rounded-lg border border-black/10 bg-white p-4 shadow-lg">
                <p className="text-3xl font-extrabold text-[#3158A7]">16</p>
                <p className="text-sm font-medium text-[#4B5563]">Week curriculum before advancing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Structure */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#3158A7]">
              Class Format
            </p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
              What to expect in class.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {classStructure.map((step) => (
              <div key={step.step} className="relative border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-full bg-[#3158A7] text-white font-bold">
                    {step.step}
                  </div>
                  <span className="text-xs font-bold text-[#3158A7]">{step.duration}</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#002F86]">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#4B5563]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#3158A7]">
                Schedule
              </p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
                When to train.
              </h2>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <p className="font-bold text-[#002F86]">Monday</p>
                    <p className="text-sm text-[#4B5563]">GB1 Fundamentals</p>
                  </div>
                  <span className="text-sm font-bold text-[#3158A7]">18:00 - 19:00</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <p className="font-bold text-[#002F86]">Thursday</p>
                    <p className="text-sm text-[#4B5563]">GB1 Fundamentals</p>
                  </div>
                  <span className="text-sm font-bold text-[#3158A7]">18:00 - 19:00</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <p className="font-bold text-[#002F86]">Friday</p>
                    <p className="text-sm text-[#4B5563]">GB1 Fundamentals</p>
                  </div>
                  <span className="text-sm font-bold text-[#3158A7]">18:00 - 19:00</span>
                </div>
              </div>
              
              <div className="mt-8 rounded-lg border border-[#3158A7]/20 bg-[#3158A7]/5 p-4">
                <p className="text-sm font-medium text-[#4B5563]">
                  <strong className="text-[#002F86]">New to Jiu-Jitsu?</strong> We recommend 
                  starting with 2-3 classes per week to build consistency and see progress.
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg border border-black/10">
              <img
                src="/gbhalesowen/daytime-warriors.jpg"
                alt="Training session"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#F4F7FC] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#3158A7]">
              FAQs
            </p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[0.96] tracking-tight text-[#002F86]">
              Common questions.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-black/10 bg-white p-6">
                <h3 className="text-lg font-extrabold text-[#002F86]">{faq.question}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#4B5563]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#3158A7] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
                Start your Jiu-Jitsu journey today.
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/75">
                Your first Fundamentals class is free. No experience needed, 
                no equipment required. Just show up ready to learn.
              </p>
              
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/gbhalesowen#contact"
                  className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
                >
                  Book free trial class
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </a>
                <a
                  href="tel:01212854555"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#3158A7] active:translate-y-0"
                >
                  <Phone className="size-4" />
                  Call us
                </a>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <Users className="mx-auto size-8" />
                <p className="mt-3 text-sm font-semibold">All fitness levels welcome</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <MapPin className="mx-auto size-8" />
                <p className="mt-3 text-sm font-semibold">Free parking available</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <GraduationCap className="mx-auto size-8" />
                <p className="mt-3 text-sm font-semibold">Certified instructors</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <Clock className="mx-auto size-8" />
                <p className="mt-3 text-sm font-semibold">Flexible schedule</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
