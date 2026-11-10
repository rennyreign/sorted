/** Headers follow each service's decision sequence. Footers expose the wider site. */
export const WEBSITE_NAV = [
  ["sites", "Websites", "/websites"],
  ["whatelse", "What we improve", "/what-else-we-do"],
  ["how", "How it works", "/howitworks"],
  ["examples", "Our work", "/examples"],
  ["pricing", "Pricing", "/pricing"],
] as const

export const AUTOMATION_NAV = [
  ["Operators", "/automation"],
  ["How it works", "/automation/how-it-works"],
  ["About us", "/automation/about"],
  ["Pricing", "/automation/pricing"],
] as const

export const FOOTER_GROUPS = [
  { title: "Websites", links: [...WEBSITE_NAV.map(([, label, href]) => [label, href] as const), ["Website reviews", "/websites#reviews"], ["About our websites", "/about"], ["Content editing", "/website-updates"]] },
  { title: "AI automation", links: AUTOMATION_NAV },
  { title: "Sorted", links: [
    ["All services", "/"],
    ["Partnerships", "/partners"], ["For agencies", "/agencies"],
  ] },
] as const
