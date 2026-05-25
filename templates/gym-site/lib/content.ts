import { readFileSync } from "fs"
import { join } from "path"

export interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  ctaUrl: string
}

export interface Feature {
  title: string
  description: string
  icon: string
}

export interface FeaturesContent {
  features: Feature[]
}

export interface SiteSettings {
  siteName: string
  tagline: string
  contactEmail: string
  phone: string
  address: string
}

export function loadHeroContent(): HeroContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/homepage/hero.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      title: "Gracie Barra Halesowen",
      subtitle: "Build confidence. Get fit. Learn self-defence.",
      ctaText: "Book a free intro",
      ctaUrl: "https://cal.com/graciebarrahalesowen/intro",
    }
  }
}

export function loadFeaturesContent(): FeaturesContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/homepage/features.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      features: [],
    }
  }
}

export function loadSiteSettings(): SiteSettings {
  try {
    const file = readFileSync(join(process.cwd(), "content/site/general.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      siteName: "Gracie Barra Halesowen",
      tagline: "Jiu-Jitsu for everyone",
      contactEmail: "",
      phone: "",
      address: "",
    }
  }
}

export interface Program {
  title: string
  slug: string
  text: string
  image: string
  icon: string
  accent: string
}

export interface ProgramsContent {
  programs: Program[]
}

export function loadProgramsContent(): ProgramsContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/programs/list.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      programs: [
        {
          title: "Fundamentals",
          slug: "fundamentals",
          text: "Beginner-friendly classes that build the core movements, positions and confidence to train safely.",
          image: "/gi-bjj.jpg",
          icon: "graduation-cap",
          accent: "#3158A7",
        },
      ],
    }
  }
}

export interface Benefit {
  title: string
  text: string
  icon: string
}

export interface BenefitsContent {
  benefits: Benefit[]
}

export function loadBenefitsContent(): BenefitsContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/benefits/list.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      benefits: [
        { title: "Confidence", text: "Build self-belief on and off the mats.", icon: "shield-check" },
        { title: "Fitness", text: "Train hard in a way that keeps you engaged.", icon: "heart-pulse" },
      ],
    }
  }
}

export interface Testimonial {
  name: string
  role: string
  quote: string
}

export interface TestimonialsContent {
  testimonials: Testimonial[]
}

export function loadTestimonialsContent(): TestimonialsContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/testimonials/list.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      testimonials: [
        {
          name: "Member Name",
          role: "Member since 2023",
          quote: "This academy has completely changed my life for the better.",
        },
      ],
    }
  }
}

export interface ClassType {
  name: string
  color: string
}

export interface TimetableClass {
  time: string
  name: string
  type: string
  notes: string
}

export interface TimetableDay {
  day: string
  classes: TimetableClass[]
}

export interface FitnessSchedule {
  day: string
  time: string
}

export interface CtaButton {
  text: string
  url: string
}

export interface TimetableCta {
  heading: string
  text: string
  buttons: CtaButton[]
}

export interface FitnessClasses {
  heading: string
  subheading: string
  schedule: FitnessSchedule[]
}

export interface TimetableContent {
  heading: string
  subheading: string
  classTypes: ClassType[]
  days: TimetableDay[]
  fitnessClasses: FitnessClasses
  cta: TimetableCta
}

export function loadTimetableContent(): TimetableContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/timetable/schedule.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      heading: "Timetable",
      subheading: "Brazilian Jiu-Jitsu and Functional Fitness classes",
      classTypes: [
        { name: "Gi", color: "#3158A7" },
        { name: "Fundamentals", color: "#10B981" },
      ],
      days: [
        {
          day: "Monday",
          classes: [
            { time: "10:00 - 11:00", name: "Morning All Levels", type: "Gi", notes: "" },
          ],
        },
      ],
      fitnessClasses: {
        heading: "Functional Fitness",
        subheading: "Strength and conditioning",
        schedule: [{ day: "Monday", time: "18:00 - 22:00" }],
      },
      cta: {
        heading: "Not sure which class?",
        text: "Try a free introductory class.",
        buttons: [{ text: "Explore Programs", url: "/programs" }],
      },
    }
  }
}

export interface ContactContent {
  heading: string
  subheading: string
  addressLabel: string
  addressShort: string
  addressFull: string
  phone: string
  email: string
  bookingHeading: string
  bookingText: string
  bookingButton: string
  bookingUrl: string
  mapEmbedUrl: string
}

export function loadContactContent(): ContactContent {
  try {
    const file = readFileSync(join(process.cwd(), "content/contact/info.json"), "utf-8")
    return JSON.parse(file)
  } catch {
    return {
      heading: "We would love to meet you.",
      subheading: "Visit us",
      addressLabel: "Visit us",
      addressShort: "Harvey Works, Shelah Road",
      addressFull: "Gracie Barra Halesowen\nHarvey Works, Shelah Road\nHalesowen, West Midlands B63 3PG",
      phone: "0121 285 4555",
      email: "info@graciebarrahalesowen.com",
      bookingHeading: "Book a free intro",
      bookingText: "Try a class, meet the team and see if Jiu-Jitsu is right for you.",
      bookingButton: "Book now",
      bookingUrl: "https://cal.com/graciebarrahalesowen/intro",
      mapEmbedUrl: "",
    }
  }
}
