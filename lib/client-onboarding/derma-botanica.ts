import type { ClientOnboardingConfig } from "./types"

const CHARGE = 3000

export const dermaBotanica: ClientOnboardingConfig = {
  slug: "derma-botanica",
  clientName: "Derma Botanica",
  shortName: "DB",
  line: "Creator Feedback Hub",
  accessCode: "derma2026",
  currency: "GBP",
  processReplaced:
    "One spreadsheet row per creator where relationship, trial progress, contact history, before/after evidence and content suitability all collapse into a single Status column. DMs and email threads live in people's memory.",
  observableImprovement:
    "Every creator shows relationship, trial stage, response state and evidence state independently. Each open trial produces one named next action with a reason. Re-importing the sheet creates no duplicates. Content suitability shows its reasons instead of a manual tick.",
  players: [
    {
      name: "Leader",
      goal: "Grow a valuable creator network without managing every detail.",
      contributes: "Expectations, exception review.",
      decides: "Partnership offers and approvals.",
    },
    {
      name: "Creator",
      goal: "A worthwhile product experience and suitable earning opportunities.",
      contributes: "Honest feedback, before/after evidence.",
      decides: "Permissions and whether to accept an offer.",
    },
    {
      name: "Team member",
      goal: "Keep relationships and trials moving.",
      contributes: "Coordination, record checks, reply review.",
      decides: "Which proposed facts to accept, next actions.",
    },
    {
      name: "Automation",
      goal: "Carry out delegated rules consistently.",
      contributes: "Timing, proposed facts, queued work.",
      decides: "Nothing. It never replaces human judgement or approval.",
    },
  ],
  timeline: [
    {
      id: "brief",
      title: "Brief",
      detail: "The process DB runs today and the outcome agreed.",
      state: "done",
    },
    {
      id: "prototype",
      title: "Prototype",
      detail: "Working Creator Feedback Hub built and verified locally.",
      state: "done",
    },
    {
      id: "demo",
      title: "Demo",
      detail: "DB reviews the real working hub on the private preview.",
      state: "current",
      clientCheck: true,
    },
    {
      id: "payment-start",
      title: "Starting payment",
      state: "todo",
      payment: { amount: 600, label: "£600 starting payment" },
    },
    {
      id: "implementation",
      title: "Implementation",
      detail: "Real data, approved services and decisions connected.",
      state: "todo",
    },
    {
      id: "payment-final",
      title: "Final payment",
      state: "todo",
      payment: { amount: 2400, label: "£2,400 at handover" },
    },
    {
      id: "handoff",
      title: "Handoff",
      detail: "Training, access, documents and the route for future help.",
      state: "todo",
    },
  ],
  journey: [
    {
      title: "Review",
      description: "Confirm the prototype and agreed scope.",
      timelineIds: ["brief", "prototype", "demo"],
    },
    {
      title: "Implement",
      description: "Connect services, permissions and live workflows.",
      timelineIds: ["payment-start", "implementation"],
    },
    {
      title: "Handover",
      description: "Complete testing, transfer access and train your team.",
      timelineIds: ["payment-final", "handoff"],
    },
  ],
  presentation: {
    eyebrow: "Creator Feedback Hub",
    heroHeading: "Your prototype is ready.\nLet's agree the next step.",
    heroDescription: "Review the workflow, confirm the scope and authorise implementation.",
    outcomes: [
      { title: "Less chasing", description: "A clear next action for every creator and trial." },
      { title: "Evidence you can find", description: "Photos, feedback and permission records kept together." },
      { title: "Decisions with context", description: "See who needs attention and who is ready for a partnership decision." },
    ],
    implementationIncludes: {
      title: "What implementation includes",
      items: [
        "Live email and signing integrations",
        "User roles and permissions",
        "Persistent records and file storage",
        "Automation rules and exception handling",
        "Production testing and handover",
      ],
      note: "Final deliverables are defined in the agreed scope.",
    },
  },
  agreementScope:
    "Signing records agreement to build the Creator Feedback Hub: £600 agreed prototype fee to start implementation. Nothing is sent or switched on without approval.",
  paymentDetails: {
    bankName: "NatWest",
    accountName: "ADX Engine Ltd",
    sortCode: "52-30-02",
    accountNumber: "30189489",
  },
  value: {
    lines: [
      {
        id: "time-returned",
        pillar: "Operations",
        title: "Illustrative team capacity released",
        basis: "Updating the sheet, chasing replies and re-reading notes to judge outcomes.",
        assumptions: [
          "30 creators active in a month",
          "45 minutes per creator per week today",
          "60% of that time removed by independent statuses and named next actions",
          "£25 per team hour",
        ],
        calculation: "13.5 hours/week × 4.33 × £25",
        amount: 1461,
        cadence: "monthly",
      },
      {
        id: "alternative-build",
        pillar: "Operations",
        title: "The cost of building it another way",
        basis: "What an AI-assisted build would likely cost in hours and tool spend, whether your team's time or a freelancer's.",
        assumptions: [
          "Commissioned AI-assisted build: ≈110 hours at ~£45/hour plus subscriptions and tokens, indicative £5,000 one-off",
          "DIY AI build: ≈120 hours of founder/team time plus ~£300 tool spend, indicative £3,300 equivalent",
          "Either route pulls founder attention off the business for weeks. The build is not the bottleneck, your hours are",
          "Compared against the Sorted charge below",
        ],
        calculation: "£5,000 − Sorted charge",
        amount: 5000 - CHARGE,
        cadence: "one-off",
      },
      {
        id: "evidence-throughput",
        pillar: "Trust",
        title: "Illustrative additional usable evidence",
        basis: "Trials complete when before and after evidence is usable and feedback is accepted, so fewer stall.",
        assumptions: ["3 additional usable pairs per month", "£150 indicative cost to commission one equivalent content pair"],
        calculation: "3 additional usable pairs × £150",
        amount: 450,
        cadence: "monthly",
      },
      {
        id: "feedback-quality",
        pillar: "Customers",
        title: "Credible feedback for targeting",
        basis: "Structured, sourced feedback replaces notes, feeding DB's targeting and positioning work.",
        assumptions: ["Not quantified before launch"],
        calculation: "Tracked after launch from accepted feedback responses",
        amount: null,
        cadence: "monthly",
      },
      {
        id: "partner-growth",
        pillar: "Enquiries",
        title: "Larger creator partner network",
        basis: "DB's model: more partners → more organic visibility → lower acquisition cost.",
        assumptions: ["Not quantified before launch; revenue, ROAS and CAC are not claimed"],
        calculation: "Tracked after launch from creators moving to partnership",
        amount: null,
        cadence: "monthly",
      },
    ],
    charge: CHARGE,
    chargeLabel: "Sorted charge for the Creator Feedback Hub build",
    chargeBasis: "A scoped one-off build charge. Ongoing support is agreed only for a defined need, not a retainer.",
    alternatives: [
      {
        title: "Build it yourselves with AI tools",
        indicative: 3300,
        cadence: "one-off",
        note: "≈120 hours of founder time to spec, prompt, test and rework × £25/hour (£3,000) plus ~£300 of AI subscriptions and tokens. That's the opportunity cost: two to three working weeks of the founder's attention pulled off sales, product and creators",
      },
      {
        title: "Commission a freelancer to AI-build it",
        indicative: 5000,
        cadence: "one-off",
        note: "≈110 hours at ~£45/hour (£4,950) plus tool spend. The rate doesn't include your hours writing the spec, reviewing every iteration and owning the fixes",
      },
      {
        title: "Influencer management software subscription",
        indicative: 800,
        cadence: "monthly",
        note: "Indicative mid-market subscription; excludes setup and your own process design",
      },
    ],
  },
  links: {
    hubPreview: "http://localhost:3000",
    hubOverview: "http://localhost:3000/overview",
    hubDevelopment: "http://localhost:3000/development",
  },
}
