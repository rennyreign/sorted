import type { Metadata } from "next"
import Image from "next/image"
import { WorkflowComparison } from "./_components/WorkflowComparison"
import styles from "./infrastructure.module.css"

const CAL_URL =
  process.env.NEXT_PUBLIC_OPS_CAL_URL ||
  "https://cal.com/sortmydigital/discovery?layout=month_view&hideEventTypeDetails=true"
const CAL_DIRECT_URL = "https://cal.com/sortmydigital/discovery"

export const metadata: Metadata = {
  title: "Operational Infrastructure | Sorted",
  description:
    "Sorted builds the AI-powered operational infrastructure your business does not have time to build. One measured improvement at a time.",
  alternates: { canonical: "/ops/infrastructure" },
}

const steps = [
  {
    num: "01",
    title: "Operational discovery",
    body: "Map the work, handoffs and systems. Prioritise the bottleneck by business value and technical feasibility.",
  },
  {
    num: "02",
    title: "Operator development",
    body: "Define inputs, permitted actions, outputs and exception handling. Connect the operator to existing tools where sensible.",
  },
  {
    num: "03",
    title: "Controlled introduction",
    body: "Test against the current process. Keep approvals where needed. Monitor reliability before increasing autonomy.",
  },
  {
    num: "04",
    title: "Measurement and expansion",
    body: "Compare manual effort, cycle time, errors and throughput with the agreed baseline. Use the evidence to choose the next improvement.",
  },
]

const pillars = [
  "Defined input",
  "Agreed permissions",
  "Observable output",
  "Clear exception path",
]

export default function InfrastructurePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <a href="/" className={styles.logo} aria-label="Sorted home">
            Sorted<span className={styles.logoDot}>.</span>
          </a>
          <nav className={styles.nav} aria-label="Page sections">
            <a className={styles.navLink} href="#approach">How it works</a>
            <a className={styles.navLink} href="#difference">Agents vs operators</a>
            <a className={styles.navLink} href="#letter">The letter</a>
            <a className={styles.navLink} href="/ops/infrastructure/presentation">
              Meeting presentation
            </a>
          </nav>
          <a className={`${styles.btnPrimary} ${styles.btnHeader}`} href="#conversation">
            Let&apos;s find your first operator
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <div className={`${styles.wrap} ${styles.hero}`}>
          <div className={styles.enter}>
            <h1 className={styles.h1}>
              Your business is ready for AI.{" "}
              <span className={styles.h1Accent}>
                Your team is too busy to build it.
              </span>
            </h1>
            <p className={styles.heroBody}>
              Your team is occupied running the business. Building the infrastructure to change it
              becomes another job nobody has the capacity to do.
            </p>
            <p className={styles.heroPayoff}>
              We build the AI-powered infrastructure your business doesn&apos;t have time to build.
            </p>
            <div className={styles.heroCtas}>
              <a className={styles.btnPrimary} href="#conversation">
                Let&apos;s find your first operator
              </a>
              <a className={styles.btnGhost} href="#difference">
                See how an operator works
              </a>
            </div>
          </div>

          <div className={`${styles.receipt} ${styles.enter}`}>
            <p className={styles.receiptLabel}>One operational improvement at a time</p>
            <ol className={styles.receiptItems}>
              <li>
                <span className={styles.receiptNum}>01</span>
                Find the bottleneck
              </li>
              <li>
                <span className={styles.receiptNum}>02</span>
                Build the operator
              </li>
              <li>
                <span className={styles.receiptNum}>03</span>
                Prove the improvement
              </li>
            </ol>
            <p className={styles.receiptFoot}>More capacity. Less overhead.</p>
          </div>
        </div>

        <div className={styles.dividerStatement}>
          <div className={styles.wrap}>
            <p>
              An external infrastructure-building function. Without building an internal AI
              department.
            </p>
          </div>
        </div>

        {/* ── Difference ── */}
        <section id="difference" className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>A faster workflow still needs someone to run it.</h2>
            <p className={styles.lead}>
              An AI agent can help a person complete the work. An operator takes responsibility for
              a defined result, within agreed rules.
            </p>
            <WorkflowComparison />
            <p className={styles.callout}>
              The steps still happen. The need to manually coordinate every step does not.
            </p>
            <p className={styles.note}>
              This is how we scope operators, not a claim that every AI agent works the same way.
            </p>
          </div>
        </section>

        {/* ── Delivery approach ── */}
        <section id="approach" className={`${styles.section} ${styles.sectionSoft}`}>
          <div className={styles.wrap}>
            <h2 className={`${styles.h2} ${styles.h2Center}`}>
              More capacity. One improvement at a time.
            </h2>
            <p className={`${styles.lead} ${styles.leadCenter}`}>
              Find one costly gap. Build the infrastructure to close it. Measure what changes before
              deciding what comes next.
            </p>
            <div className={styles.steps}>
              {steps.map(({ num, title, body }) => (
                <div key={num} className={styles.step}>
                  <span className={styles.stepNum}>{num}</span>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepBody}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Worked example ── */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.illustrativeLabel}>Illustrative workflow, not a client result</p>
            <h2 className={styles.h2}>Start with one expensive handoff.</h2>
            <p className={styles.exampleSub}>Lead handling in a service business.</p>
            <div className={styles.exampleGrid}>
              <div className={styles.exampleCol}>
                <span className={styles.exampleTag}>Before</span>
                <ol className={styles.exampleList}>
                  <li>Enquiry arrives</li>
                  <li>Team reads and qualifies</li>
                  <li>Details entered in CRM</li>
                  <li>Someone prepares follow-up</li>
                </ol>
              </div>
              <div className={`${styles.exampleCol} ${styles.exampleColAfter}`}>
                <span className={`${styles.exampleTag} ${styles.exampleTagAfter}`}>
                  Operator-led
                </span>
                <ol className={styles.exampleList}>
                  <li>Enquiry captured</li>
                  <li>Qualification recorded against agreed rules</li>
                  <li>CRM updated</li>
                  <li>Follow-up drafted or sent within policy</li>
                  <li>Exceptions routed to staff</li>
                </ol>
              </div>
            </div>
            <p className={styles.exampleNote}>
              Routine work can run within agreed permissions. Uncertain cases and sensitive
              decisions stay with your team.
            </p>
            <div className={styles.measureRow} aria-label="What gets measured">
              <span className={styles.measureChip}>Manual minutes per enquiry</span>
              <span className={styles.measureChip}>Time to first response</span>
              <span className={styles.measureChip}>Exceptions needing review</span>
            </div>
          </div>
        </section>

        {/* ── Accountability ── */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>Defined work. Clear boundaries. Accountable execution.</h2>
            <p className={styles.lead}>
              An operator is not an unrestricted assistant. Each build has acceptance criteria,
              activity logs and a clear point at which it stops or asks for a decision.
            </p>
            <div className={styles.pillars}>
              {pillars.map((title) => (
                <div key={title} className={styles.pillar}>
                  <h3 className={styles.pillarTitle}>{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Compounding ── */}
        <section className={styles.section}>
          <div className={`${styles.wrap} ${styles.compound}`}>
            <div>
              <h2 className={styles.h2}>The next improvement should not start from zero.</h2>
              <p className={styles.lead}>
                Each deployment can reuse what we learn about your systems, data and operational
                rules. Your infrastructure becomes more useful as the business context becomes
                better understood.
              </p>
            </div>
            <div className={styles.compoundBlock}>
              <h3 className={styles.compoundTitle}>
                Built from the commercial side of the problem.
              </h3>
              <p className={styles.compoundBody}>
                Renaldo Edmondson spent 15 years in marketing, including as Head of Marketing at
                Bisk. Sorted brings that experience of stretched teams and unrealised opportunities
                to practical infrastructure development.
              </p>
            </div>
          </div>
        </section>

        {/* ── The letter ── */}
        <section
          id="letter"
          aria-labelledby="letter-heading"
          className={`${styles.section} ${styles.sectionSoft}`}
        >
          <div className={styles.wrap}>
            <div className={styles.letterColumn}>
              <p className={styles.letterEyebrow}>The elephant in the room</p>
              <h2 id="letter-heading" className={styles.h2}>
                Who builds the thing that gives you time back?
              </h2>
              <p className={styles.letterIntro}>
                An open letter to the people running the business.
              </p>
              <p className={styles.letterLead}>
                You probably already know where your business is losing time.
              </p>
              <p className={styles.letterBody}>
                The report someone rebuilds every week. The enquiry copied between systems. The
                estimate waiting for information. The follow-up that depends on someone remembering
                to send it.
              </p>
              <p className={styles.letterBody}>
                The problem isn&apos;t recognising the opportunity. It&apos;s finding the time and
                people to do something about it. Your team is busy running the business. Building
                the infrastructure that would create more capacity becomes another job in the queue.
              </p>
              <p className={styles.letterEmphasis}>
                The businesses that need this infrastructure most often have the least capacity to
                build it.
              </p>
              <p className={styles.letterBody}>
                I spent 15 years in marketing, including as Head of Marketing at Bisk. I saw the gap
                between knowing what needed to improve and having the resources to make it happen.
                Sorted exists to close that gap.
              </p>
              <h3 className={styles.letterH3}>Not another tool for your team to manage.</h3>
              <p className={styles.letterBody}>
                We work alongside your business as an external infrastructure-building function. We
                identify one costly bottleneck, build a scoped operator into the systems you already
                use where practical, and test it against the existing process.
              </p>
              <p className={styles.letterBody}>
                The aim isn&apos;t to give someone an AI assistant and another set of instructions.
                It&apos;s to remove the routine coordination needed to produce a defined result.
                Permissions, approvals and exception handling are agreed before the work runs.
              </p>
              <h3 className={styles.letterH3}>One improvement. Then the next.</h3>
              <p className={styles.letterBody}>
                We agree what success looks like before building. Less manual effort. Shorter cycle
                times. Fewer avoidable errors. More useful capacity. We measure what changes rather
                than promise a saving in advance.
              </p>
              <p className={styles.letterBody}>
                Once the first improvement is working, we use that evidence to decide what comes
                next. Each build can reuse the connections and context established before it.
              </p>
              <p className={styles.letterEmphasis}>
                You don&apos;t need to turn your team into an AI engineering department. You need a
                practical way to make the business more capable.
              </p>
              <div className={styles.letterSign}>
                <Image
                  src="/renaldo-bw.png"
                  width={88}
                  height={88}
                  alt="Renaldo Edmondson, founder of Sorted"
                  className={styles.founderPortrait}
                />
                <div className={styles.letterIdentity}>
                  <span className={styles.letterSignature} aria-hidden="true">
                    Renaldo
                  </span>
                  <span className={styles.letterName}>Renaldo Edmondson</span>
                  <span className={styles.letterRole}>Founder, Sorted</span>
                </div>
              </div>
              <p className={styles.letterCta}>
                <a href="#conversation" className={styles.letterCtaLink}>
                  Let&apos;s find your first operator
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ── Conversation ── */}
        <section
          id="conversation"
          className={`${styles.section} ${styles.sectionDark} ${styles.conversation}`}
        >
          <div className={`${styles.wrap} ${styles.conversationGrid}`}>
            <div>
              <h2 className={styles.h2}>Let&apos;s find your first operator.</h2>
              <p className={styles.lead}>
                Bring one process that costs too much time or holds the business back. We&apos;ll
                discuss the workflow, the systems it depends on and what a worthwhile improvement
                would look like.
              </p>
              <p className={styles.scopeNote}>
                Start with an Operational Blueprint and a proposal for one bounded build. Scope,
                acceptance criteria and costs are agreed before development.
              </p>
            </div>
            <div className={styles.bookingCard}>
              <iframe
                src={CAL_URL}
                title="Book an operational infrastructure conversation"
                width="100%"
                height={560}
                style={{ border: 0 }}
                loading="lazy"
              />
              <div className={styles.bookingLinks}>
                <a href={CAL_DIRECT_URL} rel="noopener noreferrer">
                  Open booking calendar
                </a>
                <a href="mailto:hello@sortmydigital.site">hello@sortmydigital.site</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <a href="/" className={`${styles.logo} ${styles.footerLogo}`} aria-label="Sorted home">
            Sorted<span className={styles.logoDot}>.</span>
          </a>
          <div className={styles.footerLinks}>
            <a className={styles.footerLink} href="/privacy">Privacy</a>
            <a className={styles.footerLink} href="/terms">Terms</a>
            <p className={styles.footerCredit}>Engineering infrastructure by ADX Engine</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
