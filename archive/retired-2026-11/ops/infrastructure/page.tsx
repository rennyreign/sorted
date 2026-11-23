import type { Metadata } from "next"
import Image from "next/image"
import { BuildReplay } from "./_components/BuildReplay"
import { InfraVideo } from "./_components/InfraVideo"
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
    title: "We find the bottleneck",
    body: "Show us where work piles up. We map the process and pick the one fix worth paying for first.",
  },
  {
    num: "02",
    title: "We build the fix",
    body: "We define what goes in, what comes out, and what it can never do. It plugs into the tools you already use.",
  },
  {
    num: "03",
    title: "We prove it safely",
    body: "It runs against your current process first. Approvals stay in place until it has earned more autonomy.",
  },
  {
    num: "04",
    title: "You see the numbers",
    body: "Less manual effort. Faster turnaround. Fewer errors. Measured against where you started. Then we pick the next one.",
  },
]

const workloads = [
  {
    quote: "Reporting eats half the week.",
    fix: "Bring the numbers together and prepare the report for someone to check.",
    effort: "6–12 hrs / week",
    people: "2–4 people",
    outcome: "Less copying. More time to act.",
  },
  {
    quote: "We type the same details into three systems.",
    fix: "Enter information once and pass it to the places that need it.",
    effort: "4–8 hrs / week",
    people: "2–3 people",
    outcome: "Less retyping. Fewer mismatched records.",
  },
  {
    quote: "Getting a new client started means endless chasing.",
    fix: "Collect the details, flag what’s missing and keep the next step moving.",
    effort: "2–4 hrs / new client",
    people: "2–4 people",
    outcome: "Less chasing. A clearer handover.",
  },
  {
    quote: "Every proposal starts from scratch.",
    fix: "Use the brief, approved pricing and service details to prepare a draft for sign-off.",
    effort: "2–5 hrs / proposal",
    people: "2–3 people",
    outcome: "Less rewriting. Easier reviews.",
  },
  {
    quote: "I keep asking where things stand.",
    fix: "Put job status, ownership and next steps in one place.",
    effort: "3–6 hrs / week",
    people: "3–6 people",
    outcome: "Fewer update requests. Clearer ownership.",
  },
  {
    quote: "Every request needs someone to sort it.",
    fix: "Send routine requests to the right place and flag the ones that need a decision.",
    effort: "4–10 hrs / week",
    people: "2–4 people",
    outcome: "Less manual sorting. Fewer missed requests.",
  },
]

const pillars = [
  "You set the input",
  "You set the permissions",
  "You see every output",
  "It asks before it guesses",
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
            <a className={styles.navLink} href="#difference">Agents vs operators</a>
            <a className={styles.navLink} href="#familiar">Sound familiar</a>
            <a className={styles.navLink} href="#watch">Watch a build</a>
            <a className={styles.navLink} href="#approach">How it works</a>
            <a className={styles.navLink} href="#letter">The letter</a>
          </nav>
          <a className={`${styles.btnPrimary} ${styles.btnHeader}`} href="#conversation">
            Let&apos;s fix your bottleneck
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
                Let&apos;s fix your bottleneck
              </a>
              <a className={styles.btnGhost} href="#watch">
                See how an operator works
              </a>
            </div>
          </div>

          <div className={styles.enter}>
            <InfraVideo />
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
              An AI agent can help a person complete the work. An operator removes the need for the
              process that drives the work.
            </p>
            <WorkflowComparison />
            <p className={styles.callout}>
              Operators render the steps to one input, one output.
            </p>
            <p className={styles.note}>
              Micro-scoping facilitates operators to transform any process into a predictable
              automated routine.
            </p>
          </div>
        </section>

        {/* ── Sound familiar ── */}
        <section id="familiar" className={`${styles.section} ${styles.sectionSoft}`}>
          <div className={styles.wrap}>
            <p className={styles.workloadEyebrow}>Sound familiar?</p>
            <h2 className={styles.h2}>The thing you keep putting off fixing.</h2>
            <p className={styles.lead}>
              The report. The chasing. The same details entered again. You know there should be a
              better way.
            </p>
            <p className={styles.illustrativeLabel}>
              Illustrative workloads · hours are total team time
            </p>
            <div className={styles.workloads}>
              {workloads.map(({ quote, fix, effort, people, outcome }, i) => (
                <article key={quote} className={styles.workload}>
                  <span className={styles.workloadNum}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={styles.workloadQuote}>&ldquo;{quote}&rdquo;</h3>
                  <p className={styles.workloadFix}>{fix}</p>
                  <div className={styles.workloadChips}>
                    <span className={styles.workloadChip}>{effort}</span>
                    <span className={styles.workloadChip}>{people}</span>
                  </div>
                  <p className={styles.workloadOutcome}>{outcome}</p>
                </article>
              ))}
            </div>
            <p className={styles.workloadNote}>
              Example estimates, not promised savings. We measure your workload and agree what can
              improve before building.
            </p>
          </div>
        </section>

        {/* ── Watch a build ── */}
        <section id="watch" className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>See how an operator works.</h2>
            <p className={`${styles.lead} ${styles.leadFull}`}>
              An agent would need you in the room for every step. The operator follows a defined
              chain and just builds. These are real runs, replayed.
            </p>
            <BuildReplay />
          </div>
        </section>

        {/* ── Delivery approach ── */}
        <section id="approach" className={`${styles.section} ${styles.sectionSoft}`}>
          <div className={styles.wrap}>
            <h2 className={`${styles.h2} ${styles.h2Center}`}>
              You don&apos;t need a bigger team. You need one thing fixed.
            </h2>
            <p className={`${styles.lead} ${styles.leadCenter}`}>
              Bring us the process that&apos;s slowing you down. We&apos;ll build the fix, prove it
              works in your business, then decide together what comes next.
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
            <h2 className={styles.h2}>Start with one thing that keeps costing your team time.</h2>
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
            <h2 className={styles.h2}>It does the job. Inside rules you set.</h2>
            <p className={styles.lead}>
              Before anything runs, we agree what it handles, what it can touch and when it must
              stop and ask you. Everything it does is logged.
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
                Bisk Education, one of the oldest OPMs in America. Sorted brings that experience of
                stretched teams and unrealised opportunities
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
                Your business is losing time, and you probably already know where.
              </p>
              <p className={styles.letterBody}>
                The report someone rebuilds every week. The enquiry copied between systems. The
                estimate waiting for information. The creative asset still being manually built.
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
                I spent 15 years in marketing, including as Head of Marketing at Bisk Education, one
                of the oldest OPMs in America. I saw the gap
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
                  Let&apos;s fix your bottleneck
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
              <h2 className={styles.h2}>Let&apos;s fix your bottleneck.</h2>
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
