export type ExampleCaseStudy = {
  slug: string
  category: string
  title: string
  business: string
  location: string
  description: string
  image: string
  screenshots: {
    desktop: string
    tablet: string
    mobile: string
  }
  liveUrl?: string
  goal: string
  solution: string
  testimonial: string
  testimonialName: string
  testimonialRole: string
  stats: [string, string][]
}

export const exampleCaseStudies: ExampleCaseStudy[] = [
  {
    slug: "warwickshire-short-stays",
    category: "Hospitality",
    title: "Designed to earn the booking.",
    business: "Warwickshire Short Stays",
    location: "Warwickshire",
    description: "Serviced accommodation website built to earn direct bookings and showcase a growing property portfolio.",
    image: "/examples/live/warwickshire-short-stays-desktop.png",
    screenshots: {
      desktop: "/examples/live/warwickshire-short-stays-desktop.png",
      tablet: "/examples/live/warwickshire-short-stays-tablet.png",
      mobile: "/examples/live/warwickshire-short-stays-mobile.png",
    },
    liveUrl: "https://warwickshire-short-stays.netlify.app/",
    goal: "Create a professional booking website that showcased a growing property portfolio, built trust with prospective guests and made it easy to enquire without relying only on third-party booking platforms.",
    solution: "We designed a modern hospitality website with a clear property catalogue, dedicated accommodation pages and a streamlined enquiry experience. The new design highlights each property's features, location and guest suitability while making the business feel credible from the first visit.",
    testimonial:
      "The difference between our old website and the new one is night and day. It finally feels like a business people can trust. The properties are much easier to browse, everything looks professional and guests regularly comment on how simple the website is to use.",
    testimonialName: "Warwickshire Short Stays",
    testimonialRole: "Management Team",
    stats: [
      ["24hrs", "First homepage concept delivered"],
      ["5", "Properties showcased"],
      ["100%", "Mobile responsive redesign"],
      ["Direct", "Booking-first user journey"],
    ],
  },
  {
    slug: "palace-barn-cottage",
    category: "Hospitality",
    title: "A luxury stay deserves a luxury website.",
    business: "Palace Barn & Cottage",
    location: "Shropshire",
    description: "Luxury countryside retreat website designed to feel premium before guests arrive.",
    image: "/examples/live/palace-barn-cottage-desktop.png",
    screenshots: {
      desktop: "/examples/live/palace-barn-cottage-desktop.png",
      tablet: "/examples/live/palace-barn-cottage-tablet.png",
      mobile: "/examples/live/palace-barn-cottage-mobile.png",
    },
    liveUrl: "https://palacebarns.com/",
    goal: "Create a premium website that reflected the quality of the property, showcased the accommodation and surrounding countryside, and made it easy for guests to explore and book their stay.",
    solution: "We designed an elegant, editorial-inspired website built around immersive photography, refined typography and a calm booking experience. The site helps guests imagine the stay before guiding them naturally towards making a reservation.",
    testimonial:
      "The first mockup immediately captured the feeling we'd always wanted guests to experience when they arrived. It felt elegant, peaceful and genuinely premium.",
    testimonialName: "Palace Barn & Cottage",
    testimonialRole: "Owners",
    stats: [
      ["24hrs", "First homepage concept delivered"],
      ["2", "Luxury properties showcased"],
      ["100%", "Mobile responsive redesign"],
      ["Luxury", "Editorial-inspired booking experience"],
    ],
  },
  {
    slug: "bodysharp-fitness",
    category: "Health & fitness",
    title: "A coaching brand built to convert.",
    business: "BodySharp Fitness",
    location: "Birmingham",
    description: "Premium coaching website built around energy, trust and Discovery Session enquiries.",
    image: "/examples/live/bodysharp-fitness-v2-desktop.png",
    screenshots: {
      desktop: "/examples/live/bodysharp-fitness-v2-desktop.png",
      tablet: "/examples/live/bodysharp-fitness-v2-tablet.png",
      mobile: "/examples/live/bodysharp-fitness-v2-mobile.png",
    },
    liveUrl: "https://bodysharp-fitness.netlify.app/",
    goal: "Move away from the look of a typical personal trainer website and establish a premium coaching brand that immediately built credibility, communicated the philosophy and converted visitors into Discovery Sessions.",
    solution: "We designed a bold, conversion-focused website centred around BodySharp's core message: getting your energy back. Strong typography, clear programme pathways and compelling proof create a site that positions Mikey as a trusted coach.",
    testimonial:
      "The first mockup immediately felt different. It wasn't just a better-looking website. It finally communicated what BodySharp actually stands for.",
    testimonialName: "Mikey Spice",
    testimonialRole: "Founder & Head Coach",
    stats: [
      ["24hrs", "First homepage concept delivered"],
      ["3", "Clear coaching pathways"],
      ["100%", "Mobile responsive redesign"],
      ["20+", "Years of experience showcased"],
    ],
  },
  {
    slug: "savannah-villegas",
    category: "Creative",
    title: "An online presence worthy of the work.",
    business: "Savannah Villegas",
    location: "Tennessee",
    description: "Editorial portfolio website for social-first video production and brand storytelling.",
    image: "/examples/live/savannah-villegas-desktop.png",
    screenshots: {
      desktop: "/examples/live/savannah-villegas-desktop.png",
      tablet: "/examples/live/savannah-villegas-tablet.png",
      mobile: "/examples/live/savannah-villegas-mobile.png",
    },
    liveUrl: "https://savannahvillegas.com/",
    goal: "Create a premium online presence that reflected the quality of the work, positioned the business as a high-end creative partner and gave potential clients a simple way to enquire.",
    solution: "We designed an editorial-inspired website that lets the work speak for itself. Clean typography, cinematic imagery and a calm user experience position Savannah as a premium creative while guiding visitors towards booking a project.",
    testimonial:
      "I wanted a website that felt like an extension of my work rather than another portfolio template. The first mockup immediately captured the tone I'd been trying to communicate for years.",
    testimonialName: "Savannah Villegas",
    testimonialRole: "Founder & Creative Director",
    stats: [
      ["24hrs", "First homepage concept delivered"],
      ["8", "Custom-designed pages"],
      ["100%", "Mobile responsive build"],
      ["Premium", "Editorial-inspired design system"],
    ],
  },
  {
    slug: "gracie-barra-halesowen",
    category: "Health & fitness",
    title: "A website as disciplined as the academy.",
    business: "Gracie Barra Halesowen",
    location: "Halesowen",
    description: "Brazilian Jiu-Jitsu academy website with clearer programmes and a stronger route to book.",
    image: "/examples/live/gracie-barra-halesowen-desktop.png",
    screenshots: {
      desktop: "/examples/live/gracie-barra-halesowen-desktop.png",
      tablet: "/examples/live/gracie-barra-halesowen-tablet.png",
      mobile: "/examples/live/gracie-barra-halesowen-mobile.png",
    },
    liveUrl: "https://gbhalesowen.com/",
    goal: "Create a modern website that reflected the professionalism of the academy, clearly explained every programme and made it easier for new members to book an introduction.",
    solution: "We redesigned the website with a clearer structure, stronger calls to action and dedicated landing pages for every programme. The result builds trust quickly and gives prospective members a straightforward route to enquire or book.",
    testimonial:
      "The mockup genuinely surprised us because it looked like someone had spent weeks understanding our academy. Everything felt cleaner, more professional and much easier for new members to navigate.",
    testimonialName: "Stuart Gwilt",
    testimonialRole: "Owner & Head Coach",
    stats: [
      ["24hrs", "First design mockup delivered"],
      ["5", "Dedicated programme pages"],
      ["100%", "Mobile responsive redesign"],
      ["4.9/5", "Google review rating"],
    ],
  },
]

export function getExampleCaseStudy(slug: string) {
  return exampleCaseStudies.find((caseStudy) => caseStudy.slug === slug)
}
