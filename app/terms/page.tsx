import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import { LegalDocument, type LegalSection } from "../_components/LegalDocument"

export const metadata: Metadata = {
  title: "Terms | Sorted",
  description: "The standard terms for using sortmydigital.site and buying Sorted website, campaign-setup and follow-up services.",
  alternates: {
    canonical: "/terms",
  },
}

const sections: LegalSection[] = [
  {
    title: "Who these terms cover",
    body: (
      <p>
        These terms apply to your use of sortmydigital.site and to Sorted&apos;s standard website and launch-setup services unless a signed proposal, quote or agreement says something different. Sorted is a trading name of ADX Engine Ltd, registered in England and Wales with company number 17327041.
      </p>
    ),
    points: ["Email: hello@sortmydigital.site", "Phone / WhatsApp: 07386 468085"],
  },
  {
    title: "The standard service",
    body: (
      <p>
        The current standard offer is a fixed launch setup. Unless your agreed proposal says otherwise, it includes the website, content-management setup, agreed analytics, ad creative and campaign structure, follow-up setup and launch support.
      </p>
    ),
    points: [
      "Ad spend is not included.",
      "Ongoing campaign management is not included unless agreed separately.",
      "Future optimisation, new features and wider operational services are scoped separately.",
      "Booking systems, CRM and other integrations are included only when explicitly agreed.",
    ],
  },
  {
    title: "Mockups, approval and scope",
    body: (
      <p>
        We may create a homepage direction or working preview before you commit. A preview shows the proposed direction; it does not by itself create a contract, launch a website or activate external services. The agreed scope, price and payment schedule are confirmed before paid work begins.
      </p>
    ),
    points: [
      "You should check names, facts, services, prices, images and legal claims before approval.",
      "Changes after approval may affect cost, timing or both.",
      "External integrations only activate after the required access, approval and setup work is complete.",
    ],
  },
  {
    title: "Price and payment",
    body: (
      <p>
        The public fixed price is currently <MarketCopy>{"{total}"}</MarketCopy> for the standard launch setup, normally split into <MarketCopy>{"{deposit}"}</MarketCopy> after direction approval and <MarketCopy>{"{balance}"}</MarketCopy> when the completed site is ready to launch. Client-specific quotes, proposals or invoices take precedence where different terms have been agreed.
      </p>
    ),
    points: [
      "Payment links and invoices must be treated as confidential.",
      "Work may pause while agreed payments remain outstanding.",
      "Ad spend, platform fees, subscriptions, domain renewals and third-party charges are payable separately unless explicitly included in writing.",
    ],
  },
  {
    title: "What we need from you",
    body: (
      <p>
        You are responsible for supplying accurate business information, materials, approvals and any access needed for the work. You must have the right to use the content, images, logos, customer details and claims you give us.
      </p>
    ),
    points: [
      "Tell us about required legal, regulatory or accessibility obligations.",
      "Do not supply content that is unlawful, infringing, misleading or unsafe.",
      "Keep workspace, preview and payment links private unless we say otherwise.",
    ],
  },
  {
    title: "Ownership and content",
    body: (
      <p>
        You retain ownership of the business content and materials you supply. Unless agreed otherwise in writing, Sorted retains ownership of its underlying design methods, code structure, internal tools and systems. On full payment, you receive the agreed right to use the delivered website and supplied creative for your business.
      </p>
    ),
  },
  {
    title: "Third-party services",
    body: (
      <p>
        Websites, workspaces, analytics, email, scheduling, payment, hosting and advertising services may depend on third-party providers. Those providers have their own terms and may change features, pricing or availability. We are not responsible for third-party outages or decisions outside our reasonable control, but we will help you work through them where we can.
      </p>
    ),
  },
  {
    title: "No guaranteed outcomes",
    body: (
      <p>
        We provide services with reasonable skill and care. We do not guarantee search rankings, enquiry volume, revenue, advertising performance or uninterrupted operation. Any example figures shown in a workspace are labelled as illustrative unless connected reporting confirms otherwise.
      </p>
    ),
  },
  {
    title: "Liability",
    body: (
      <p>
        Nothing in these terms limits liability that cannot legally be limited, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation. Subject to that, our total liability for a service is limited to the amount you paid Sorted for that service in the 12 months before the claim. We are not liable for indirect losses, lost profits, lost revenue or loss of opportunity.
      </p>
    ),
  },
  {
    title: "Cancellation, changes and law",
    body: (
      <p>
        If you cancel after work has begun, you may need to pay for work completed and committed costs up to cancellation. We may update these terms from time to time; the version on this page applies from its stated date. These terms are governed by the laws of England and Wales, and the courts of England and Wales have jurisdiction unless mandatory consumer law says otherwise.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms. No fog."
      intro="These are the standard terms for using the site and buying Sorted&apos;s launch setup. If a signed proposal or agreement differs, that document wins."
      updated="11 October 2026"
      sections={sections}
    />
  )
}
