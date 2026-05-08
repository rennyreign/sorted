import { Clock, MapPin, Phone, ChevronRight, Info } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Timetable | Gracie Barra Halesowen",
  description: "View our full class timetable including Brazilian Jiu-Jitsu for all levels, kids classes, female training, and Functional Fitness sessions at Gracie Barra Halesowen.",
}

const bjjTimetable = {
  monday: [
    { time: "10:00 - 11:00", class: "All Levels", type: "gi" },
    { time: "17:00 - 18:00", class: "Kids GB1 (Ages 4-7)", type: "kids" },
    { time: "18:00 - 19:00", class: "GB1 Fundamentals", type: "fundamentals" },
    { time: "19:00 - 20:00", class: "Competition Class", type: "advanced" },
  ],
  tuesday: [
    { time: "06:00 - 07:00", class: "Morning All Levels", type: "gi" },
    { time: "17:00 - 18:00", class: "Kids GB1 (Ages 4-7)", type: "kids" },
    { time: "18:00 - 19:00", class: "GB2 Advanced", type: "advanced" },
    { time: "19:00 - 20:00", class: "No-Gi All Levels", type: "nogi" },
  ],
  wednesday: [
    { time: "10:00 - 11:00", class: "All Levels", type: "gi" },
    { time: "18:00 - 19:00", class: "Ladies Only", type: "female" },
    { time: "19:00 - 20:00", class: "Free Sparring", type: "open" },
  ],
  thursday: [
    { time: "06:00 - 07:00", class: "Morning All Levels", type: "gi" },
    { time: "17:00 - 18:00", class: "Kids GB2 (Ages 8-14)", type: "kids" },
    { time: "18:00 - 19:00", class: "GB1 Fundamentals", type: "fundamentals" },
    { time: "19:00 - 20:00", class: "GB2 Advanced", type: "advanced" },
  ],
  friday: [
    { time: "10:00 - 11:00", class: "All Levels", type: "gi" },
    { time: "17:00 - 18:00", class: "Kids Competition", type: "kids" },
    { time: "18:00 - 19:00", class: "GB1 Fundamentals", type: "fundamentals" },
    { time: "19:00 - 20:00", class: "No-Gi All Levels", type: "nogi" },
  ],
  saturday: [
    { time: "09:15 - 10:00", class: "Kids GB1 (Ages 4-7)", type: "kids" },
    { time: "10:00 - 11:00", class: "Kids GB2 (Ages 8-14)", type: "kids" },
    { time: "11:00 - 12:00", class: "All Levels", type: "gi" },
    { time: "12:00 - 13:00", class: "Open Mat", type: "open" },
  ],
  sunday: [
    { time: "Closed", class: "Rest Day", type: "rest" },
  ],
}

const functionalFitnessTimetable = {
  monday: [
    { time: "18:00 - 22:00", class: "Functional Fitness Open", type: "fitness" },
  ],
  tuesday: [
    { time: "18:00 - 22:00", class: "Functional Fitness Open", type: "fitness" },
  ],
  wednesday: [
    { time: "18:00 - 22:00", class: "Functional Fitness Open", type: "fitness" },
  ],
  thursday: [
    { time: "18:00 - 22:00", class: "Functional Fitness Open", type: "fitness" },
  ],
  friday: [
    { time: "09:00 - 12:00", class: "Morning Fitness", type: "fitness" },
    { time: "09:00 - 11:00", class: "Weekend Fitness", type: "fitness" },
  ],
  saturday: [],
  sunday: [],
}

const classTypes = {
  gi: { color: "#3158A7", label: "Gi" },
  nogi: { color: "#7647B9", label: "No-Gi" },
  fundamentals: { color: "#168CC9", label: "Fundamentals" },
  advanced: { color: "#D85B94", label: "Advanced" },
  kids: { color: "#D1414C", label: "Kids" },
  female: { color: "#E85D9A", label: "Female" },
  fitness: { color: "#22C55E", label: "Fitness" },
  open: { color: "#6B7280", label: "Open Mat" },
  rest: { color: "#E5E7EB", label: "Rest" },
}

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

function ClassBadge({ type }: { type: keyof typeof classTypes }) {
  const config = classTypes[type]
  return (
    <span 
      className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  )
}

export default function TimetablePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#001D58]">
        <img
          src="/gbhalesowen/daytime-warriors.jpg"
          alt="Class timetable at Gracie Barra Halesowen"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,88,0.95)_0%,rgba(0,29,88,0.85)_50%,rgba(0,29,88,0.7)_100%)]" />
        
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
              Class Schedule
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Timetable
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Brazilian Jiu-Jitsu and Functional Fitness classes throughout the week. 
              Find the right session for your level and goals.
            </p>
          </div>
        </div>
      </section>

      {/* Legend Section */}
      <section className="border-b border-black/10 bg-white px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">Class Types:</span>
            {Object.entries(classTypes).filter(([key]) => key !== "rest").map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span 
                  className="size-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs font-semibold text-[#4B5563]">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Timetable Section */}
      <section className="bg-[#F4F7FC] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#002F86]">Brazilian Jiu-Jitsu Schedule</h2>
            <div className="hidden text-sm text-[#4B5563] sm:block">
              <Info className="mr-1 inline size-4" />
              Classes subject to change. Call to confirm.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {days.map((day) => (
              <div key={day} className="border border-black/10 bg-white">
                <div className="border-b border-black/10 bg-[#002F86] px-4 py-3">
                  <h3 className="text-center text-sm font-extrabold uppercase tracking-wider text-white">
                    {day}
                  </h3>
                </div>
                <div className="space-y-2 p-3">
                  {bjjTimetable[day].map((session, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded border p-3 ${session.type === 'rest' ? 'bg-gray-50' : 'border-black/5 bg-white'}`}
                    >
                      {session.type !== 'rest' ? (
                        <>
                          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#002F86]">
                            <Clock className="size-3.5" />
                            {session.time}
                          </div>
                          <p className="mb-2 text-sm font-bold leading-tight text-[#111827]">
                            {session.class}
                          </p>
                          <ClassBadge type={session.type as keyof typeof classTypes} />
                        </>
                      ) : (
                        <p className="py-4 text-center text-sm font-medium text-gray-400">
                          {session.class}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-[#4B5563] sm:hidden">
            <Info className="mr-1 inline size-4" />
            Classes subject to change. Call to confirm.
          </div>
        </div>
      </section>

      {/* Functional Fitness Section */}
      <section className="bg-white px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#002F86]">Functional Fitness</h2>
              <p className="mt-1 text-sm text-[#4B5563]">Strength and conditioning for Jiu-Jitsu performance</p>
            </div>
            <div className="hidden text-sm text-[#22C55E] sm:block">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#22C55E]" />
                Fitness Classes
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <div className="space-y-4">
              {days.slice(0, 5).map((day) => (
                <div key={day} className="flex items-center gap-4 border-b border-black/10 pb-4">
                  <span className="w-24 text-sm font-bold uppercase text-[#002F86]">{day}</span>
                  <div className="flex-1">
                    {functionalFitnessTimetable[day].length > 0 ? (
                      functionalFitnessTimetable[day].map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#4B5563]">{session.time}</span>
                          <span className="rounded bg-[#22C55E] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            Fitness
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No classes</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 border-b border-black/10 pb-4">
                <span className="w-24 text-sm font-bold uppercase text-[#002F86]">Weekend</span>
                <span className="text-sm text-gray-400">Saturday & Sunday - BJJ Open Mat only</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-black/10">
              <img
                src="/gbhalesowen/functional-fitness_1.jpg"
                alt="Functional Fitness at Gracie Barra Halesowen"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-extrabold">Functional Fitness Area</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                  Fully equipped gym with free weights, cardio machines, and functional training 
                  equipment to complement your Jiu-Jitsu training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="bg-[#003384] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
                Not sure which class is right for you?
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/75">
                New members can start with a free introductory class. We will assess your fitness level, 
                explain the basics, and recommend the best classes for your goals.
              </p>
              
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/gbhalesowen/programs"
                  className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
                >
                  Explore programs
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </Link>
                <a
                  href="tel:01212854555"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#002F86] active:translate-y-0"
                >
                  <Phone className="size-4" />
                  Call 0121 285 4555
                </a>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/20 bg-white/5 p-5">
                <h3 className="text-lg font-extrabold">First Class Free</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/72">
                  Try any fundamentals class with no commitment. We provide the gi.
                </p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5">
                <h3 className="text-lg font-extrabold">Flexible Membership</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/72">
                  Choose from unlimited training or specific program access.
                </p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5">
                <h3 className="text-lg font-extrabold">Kids Welcome</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/72">
                  Programs for ages 4+. Safe, structured, and fun environment.
                </p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5">
                <h3 className="text-lg font-extrabold">No Experience Needed</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/72">
                  Our fundamentals program is designed for complete beginners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile View Notice */}
      <section className="border-t border-black/10 bg-[#F4F7FC] px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-start gap-3 rounded-lg border border-black/10 bg-white p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-[#C8102E]" />
            <div>
              <p className="font-bold text-[#002F86]">Timetable Updates</p>
              <p className="mt-1 text-sm text-[#4B5563]">
                Class times may change during holidays or special events. Follow us on 
                <a href="https://www.facebook.com/GracieBarraHalesowen/" target="_blank" rel="noopener noreferrer" className="mx-1 text-[#C8102E] hover:underline">Facebook</a> 
                or 
                <a href="https://www.instagram.com/graciebarrahalesowen/" target="_blank" rel="noopener noreferrer" className="mx-1 text-[#C8102E] hover:underline">Instagram</a> 
                for real-time updates, or call ahead to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
