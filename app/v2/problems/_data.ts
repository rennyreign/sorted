import { Bell, BarChart3, CalendarDays, CheckCircle2, Clock3, FileText, MessageCircle, PoundSterling, RefreshCw, Repeat2, Star, TrendingUp, UserRound, UsersRound, X } from "lucide-react"

export const problemDetails = {
  "we-waste-time": {
    title: "We waste time.",
    description: "Manual admin, repeated questions and copied updates keep pulling people away from useful work.",
    pain: ["Work is copied between tools", "Customers ask the same thing again", "Reports take too long", "People spend time chasing updates"],
    stats: [
      [Clock3, "6-10 hrs", "lost each week to repeated admin"],
      [Repeat2, "Daily", "tasks repeated by the same team"],
      [FileText, "Manual", "reporting and status updates"],
      [UsersRound, "Team", "capacity used on low-value work"],
    ],
    reasons: [
      [Repeat2, "The work repeats", "Nobody notices the same task is being done every day."],
      [FileText, "Information is scattered", "Staff jump between inboxes, forms, spreadsheets and software."],
      [MessageCircle, "Customers need updates", "The same questions interrupt the team again and again."],
      [Clock3, "No one measures it", "Small admin blocks hide inside the working week."],
    ],
    routines: [
      ["Copying information", "Details move between systems by hand.", "Fewer copied updates"],
      ["Answering the same questions", "Staff repeat answers customers could receive automatically.", "Faster customer replies"],
      ["Manual reporting", "Reports are rebuilt from scratch instead of produced from live information.", "Clearer visibility"],
      ["Moving data between systems", "Useful information gets trapped in disconnected tools.", "Cleaner handoffs"],
    ],
    capabilities: ["Customer Response", "Internal Admin Replacement", "Reporting System", "Data Handoff System"],
    resultTitle: "Bodysharp",
    resultCopy: "Admin and repeated customer updates were taking time away from booked work.",
  },
  "we-miss-opportunities": {
    title: "We miss opportunities.",
    description: "Happy customers, warm leads and old clients are sitting in the business with no consistent routine to bring them back.",
    pain: ["Review requests are forgotten", "Old customers are ignored", "Quotes are not chased", "Referrals are not requested"],
    stats: [
      [Star, "Low", "review volume despite happy customers"],
      [TrendingUp, "Warm", "opportunities left inactive"],
      [PoundSterling, "Open", "quotes not followed up"],
      [CalendarDays, "Late", "timing on reactivation and reminders"],
    ],
    reasons: [
      [Star, "No review routine", "The ask happens only when someone remembers."],
      [UserRound, "Old customers go quiet", "There is no rhythm for keeping valuable relationships active."],
      [PoundSterling, "Quotes fade out", "Sent quotes are not tracked through to a clear answer."],
      [TrendingUp, "Growth depends on chance", "Good opportunities rely on memory instead of a visible system."],
    ],
    routines: [
      ["No review requests", "Happy customers leave without being asked at the right moment.", "More local proof"],
      ["Old customers ignored", "Past customers are not invited back with useful reasons to return.", "Recovered demand"],
      ["Quotes never chased", "Sales conversations stop after the quote goes out.", "Higher close rate"],
      ["Referrals not requested", "Satisfied customers are never asked who else needs help.", "More warm introductions"],
    ],
    capabilities: ["Review Collection", "Customer Reactivation", "Quote Follow-up", "Referral Request System"],
    resultTitle: "Action Hero Marketing",
    resultCopy: "A manual property research and outreach process became a working research tool.",
  },
  "nobody-owns-it": {
    title: "Nobody owns it.",
    description: "Important routines fall between people because ownership, timing and outcomes are unclear.",
    pain: ["Everyone assumes someone else has it", "Work depends on memory", "No one sees the outcome", "Key people become bottlenecks"],
    stats: [
      [UserRound, "No owner", "for the routine from start to finish"],
      [Bell, "Missed", "handoffs and reminders"],
      [BarChart3, "No view", "of what happened or what failed"],
      [CheckCircle2, "Fragile", "processes dependent on specific people"],
    ],
    reasons: [
      [UserRound, "Ownership is unclear", "The routine is shared, but accountability is not."],
      [Bell, "Reminders live in heads", "Tasks happen only when the right person remembers."],
      [X, "Failure is invisible", "Nobody can see the routine breaking until there is a complaint."],
      [RefreshCw, "The process drifts", "Every person handles the same work slightly differently."],
    ],
    routines: [
      ["Unclear responsibility", "No single person owns the next step.", "One visible owner"],
      ["Routines rely on memory", "The business depends on someone remembering what happens next.", "Automatic prompts"],
      ["No visibility of outcomes", "Nobody can see what was done, missed or delayed.", "Measurable progress"],
      ["Work depends on key people", "When one person is away, the routine stalls.", "Shared operating rhythm"],
    ],
    capabilities: ["Routine Ownership Map", "Handoff System", "Visibility Dashboard", "Team Prompt System"],
    resultTitle: "Bisk Education",
    resultCopy: "Product delivery accelerated once the underlying system changed.",
  },
} as const

export type ProblemSlug = keyof typeof problemDetails
