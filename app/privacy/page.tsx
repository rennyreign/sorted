import type { Metadata } from "next"
import { LegalDocument, type LegalSection } from "../_components/LegalDocument"

export const metadata: Metadata = {
  title: "Privacy Notice | Sorted",
  description: "How Sorted collects, uses, shares and protects personal information across sortmydigital.site, mockups, workspaces and client services.",
  alternates: {
    canonical: "/privacy",
  },
}

const sections: LegalSection[] = [
  {
    title: "Who we are",
    body: (
      <p>
        Sorted is a trading name of ADX Engine Ltd, registered in England and Wales with company number 17327041. For privacy purposes, ADX Engine Ltd is the data controller for the personal information described on this page.
      </p>
    ),
    points: ["Email: hello@sortmydigital.site", "Phone / WhatsApp: 07386 468085"],
  },
  {
    title: "The information we collect",
    body: (
      <p>
        We collect the information needed to respond to enquiries, create mockups, run client workspaces and deliver agreed services. The exact information depends on how you use the site and whether you become a client.
      </p>
    ),
    points: [
      "Contact and business details, such as your name, business name, email address, phone number and website.",
      "Enquiry and project information, including messages, goals, supplied materials, approvals and questions.",
      "Workspace and proposal activity, such as pages viewed, options selected and next-step interests.",
      "Payment and transaction records where work is agreed. Card payments are processed by our payment provider; Sorted does not store full card details.",
      "Pricing region: a country-only lookup through api.country.is receives your IP address to default public pricing. Your manual UK/US choice is saved in your browser; client workspace pricing follows the agreed offer.",
      "Technical and analytics information, such as device, browser, approximate location, pages visited and actions taken, where enabled.",
      "Communications, including emails, calls, WhatsApp messages and meeting details.",
    ],
  },
  {
    title: "How we use it",
    body: (
      <p>
        We use personal information to run Sorted properly: to answer enquiries, prepare and present work, provide agreed services, manage payments and keep accurate records. We do not sell personal information.
      </p>
    ),
    points: [
      "Responding to enquiries and preparing a free mockup or proposal.",
      "Creating, reviewing and delivering websites, campaign setup and follow-up setup.",
      "Managing workspaces, approvals, client communications and support.",
      "Processing payments, invoices, accounting and tax records.",
      "Improving our website, services, security and internal processes.",
      "Meeting legal, regulatory and contractual obligations.",
    ],
  },
  {
    title: "Our lawful reasons",
    body: (
      <p>
        Under UK data protection law, we rely on the lawful basis that fits the activity: taking steps before or performing a contract, pursuing legitimate business interests, meeting legal obligations, or consent where consent is required. We balance legitimate interests against your rights and only use information in ways you would reasonably expect.
      </p>
    ),
  },
  {
    title: "Who we share it with",
    body: (
      <p>
        We share information only where needed to provide the service or meet a legal obligation. This can include hosting, email, workspace/database, scheduling, analytics and payment providers, professional advisers, and service providers acting under contract. If a client site or workspace uses third-party tools, those tools may also process information under their own terms.
      </p>
    ),
    points: [
      "Website, hosting and content-management providers.",
      "Email, scheduling, analytics and communications providers.",
      "Payment and banking providers.",
      "Accountants, insurers, legal or regulatory bodies where required.",
    ],
  },
  {
    title: "How long we keep it",
    body: (
      <p>
        We keep personal information only for as long as it is needed for the purpose collected, our ongoing business relationship, accounting, legal or contractual requirements. When information is no longer needed, we delete it, anonymise it or securely archive it where deletion is not immediately practical.
      </p>
    ),
  },
  {
    title: "Cookies and analytics",
    body: (
      <p>
        The website may use cookies or similar technologies for security, functionality, analytics and remembering preferences. Where analytics are enabled, we use them to understand site performance and improve the service. You can control cookies through your browser settings, although some site features may not work properly if essential storage is disabled.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <p>
        You have rights over your personal information under UK data protection law. To exercise a right, contact us using the details above. We may need to verify your identity before acting. You also have the right to complain to the UK Information Commissioner&apos;s Office.
      </p>
    ),
    points: [
      "Ask for access to your personal information.",
      "Ask us to correct inaccurate or incomplete information.",
      "Ask us to delete information where there is no good reason to keep it.",
      "Object to or restrict certain processing.",
      "Ask for information to be transferred in a usable format where applicable.",
      "Withdraw consent where consent is the lawful basis.",
    ],
  },
  {
    title: "Security and changes",
    body: (
      <p>
        We use reasonable technical and organisational measures to protect personal information, limit access and reduce the risk of loss or misuse. No internet service can be guaranteed completely secure. If this notice changes, we will update this page and the date shown above.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy. Plainly."
      intro="This notice explains what Sorted collects, why we collect it and the choices you have. No legal fog — just the practical position."
      updated="11 October 2026"
      sections={sections}
    />
  )
}
