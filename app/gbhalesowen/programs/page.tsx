import { GraduationCap, Medal, Users, Venus, Dumbbell, ChevronRight, Clock, Check } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programs | Gracie Barra Halesowen",
  description: "Explore our Brazilian Jiu-Jitsu programs: Fundamentals, Advanced, Kids Classes, Female Training, and Functional Fitness at Gracie Barra Halesowen.",
}

const programs = [
  {
    slug: "fundamentals",
    title: "Fundamentals",
    subtitle: "Beginner-Friendly Classes",
    description: "Beginner-friendly classes that build the core movements, positions and confidence to train safely. Perfect for first-timers and those returning to training.",
    image: "/gbhalesowen/gi-bjj.jpg",
    icon: GraduationCap,
    accent: "#3158A7",
    features: [
      "No experience required",
      "Learn essential positions and movements",
      "Build fitness gradually",
      "Safe, supportive environment",
      "Structured curriculum",
    ],
    schedule: "Mon, Wed, Thu, Fri evenings",
  },
  {
    slug: "advanced",
    title: "Advanced",
    subtitle: "GB2 & Competition Team",
    description: "Sharper rounds, technical detail and live training for students ready to push their Jiu-Jitsu further. For blue belts and above, or by instructor invitation.",
    image: "/gbhalesowen/daytime-warriors.jpg",
    icon: Medal,
    accent: "#7647B9",
    features: [
      "High-level technique refinement",
      "Competition preparation",
      "Live sparring rounds",
      "Advanced transitions",
      "Tournament strategy",
    ],
    schedule: "Tue, Thu evenings + Competition Sundays",
  },
  {
    slug: "kids",
    title: "Kids Classes",
    subtitle: "Ages 4-14 Years",
    description: "Structured sessions for ages 4+ focused on confidence, discipline, movement and respect. A fun, positive environment where children develop lifelong skills.",
    image: "/gbhalesowen/kids-jits.jpg",
    icon: Users,
    accent: "#168CC9",
    features: [
      "Age-appropriate groups (4-7 & 8-14)",
      "Character development focus",
      "Anti-bullying confidence",
      "Discipline and respect",
      "Fun, engaging sessions",
    ],
    schedule: "Mon-Fri after school + Saturday mornings",
  },
  {
    slug: "female",
    title: "Female Training",
    subtitle: "Women-Only Sessions",
    description: "A supportive training environment for women learning Jiu-Jitsu, fitness and practical self-defence. Empower yourself in a comfortable, confidence-building setting.",
    image: "/gbhalesowen/girls-bjj.jpg",
    icon: Venus,
    accent: "#D85B94",
    features: [
      "Women-only training space",
      "Self-defence focused",
      "All fitness levels welcome",
      "Supportive community",
      "Female leadership",
    ],
    schedule: "Wednesday evenings + Open mat options",
  },
  {
    slug: "fitness",
    title: "Barbell / Fitness",
    subtitle: "Strength & Conditioning",
    description: "Strength and conditioning support to improve performance, resilience and all-round wellbeing. Fully equipped gym open to all academy members.",
    image: "/gbhalesowen/functional-fitness_1.jpg",
    icon: Dumbbell,
    accent: "#22C55E",
    features: [
      "Free weights area",
      "Cardio equipment",
      "Functional training space",
      "Open gym access",
      "Complement your Jiu-Jitsu",
    ],
    schedule: "Mon-Thu 6pm-10pm, Fri 9am-12pm",
  },
]

export default function ProgramsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#001D58]">
        <img
          src="/gbhalesowen/gi-bjj.jpg"
          alt="Programs at Gracie Barra Halesowen"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,88,0.95)_0%,rgba(0,29,88,0.85)_50%,rgba(0,29,88,0.7)_100%)]" />
        
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
              Our Programs
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Something for everyone.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Whether you are a complete beginner, a seasoned competitor, a parent looking for kids classes, 
              or seeking fitness training, we have a program designed for you.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="space-y-8">
            {programs.map((program, index) => {
              const Icon = program.icon
              const isEven = index % 2 === 0
              
              return (
                <div 
                  key={program.slug}
                  className="overflow-hidden border border-black/10 bg-white shadow-[0_18px_45px_rgba(0,47,134,0.10)]"
                >
                  <div className={`grid lg:grid-cols-2 ${isEven ? '' : 'lg:direction-rtl'}`}>
                    {/* Image */}
                    <div className={`relative aspect-[16/10] lg:aspect-auto ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <img
                        src={program.image}
                        alt={`${program.title} at Gracie Barra Halesowen`}
                        className="h-full w-full object-cover"
                      />
                      <div 
                        className="absolute left-4 top-4 grid size-14 place-items-center rounded-full border-4 border-white text-white shadow-lg"
                        style={{ backgroundColor: program.accent }}
                      >
                        <Icon className="size-7" strokeWidth={2} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={`flex flex-col justify-center p-8 lg:p-12 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <p 
                        className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em]"
                        style={{ color: program.accent }}
                      >
                        {program.subtitle}
                      </p>
                      <h2 className="text-3xl font-extrabold text-[#002F86]">
                        {program.title}
                      </h2>
                      <p className="mt-4 text-base font-medium leading-7 text-[#4B5563]">
                        {program.description}
                      </p>
                      
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {program.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <Check 
                              className="mt-0.5 size-4 shrink-0" 
                              strokeWidth={2.5} 
                              style={{ color: program.accent }}
                            />
                            <span className="text-sm font-semibold text-[#4B5563]">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#4B5563]">
                        <Clock className="size-4" />
                        {program.schedule}
                      </div>
                      
                      <div className="mt-8">
                        <Link
                          href={`/gbhalesowen/programs/${program.slug}`}
                          className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 active:translate-y-0"
                          style={{ backgroundColor: program.accent }}
                        >
                          Learn more
                          <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="bg-[#003384] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
                Not sure which program is right for you?
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/75">
                Book a free consultation and trial class. We will assess your goals, 
                answer your questions, and recommend the best starting point for your journey.
              </p>
              
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/gbhalesowen/timetable"
                  className="group inline-flex items-center justify-center gap-2 bg-[#C8102E] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
                >
                  View timetable
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </Link>
                <a
                  href="/gbhalesowen#contact"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#002F86] active:translate-y-0"
                >
                  Book free intro
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <p className="text-3xl font-extrabold text-[#C8102E]">5</p>
                <p className="mt-1 text-sm font-semibold text-white/72">Programs</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <p className="text-3xl font-extrabold text-[#C8102E]">20+</p>
                <p className="mt-1 text-sm font-semibold text-white/72">Weekly Classes</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <p className="text-3xl font-extrabold text-[#C8102E]">4+</p>
                <p className="mt-1 text-sm font-semibold text-white/72">Kids Age Groups</p>
              </div>
              <div className="border border-white/20 bg-white/5 p-5 text-center">
                <p className="text-3xl font-extrabold text-[#C8102E]">100%</p>
                <p className="mt-1 text-sm font-semibold text-white/72">Beginner Friendly</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
