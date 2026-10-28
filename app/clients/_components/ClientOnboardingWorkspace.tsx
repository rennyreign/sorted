"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUpRight, BadgeCheck, Plus } from "lucide-react"
import { getLatestAgreement, recordAgreement } from "@/lib/agreements"
import { completeStage, getCompletedStages } from "@/lib/onboarding-progress"
import { formatMoney } from "@/lib/market-pricing"
import type { ClientOnboardingConfig, TimelineNode } from "@/lib/client-onboarding/types"

const ONBOARDING_DOC_TYPE = "onboarding_agreement"

const C = {
  canvas: "#F7F7F2",
  surface: "#FFFFFF",
  ink: "#0B1110",
  muted: "#68706D",
  border: "#D9DDD6",
  lime: "#D5FF30",
  darkMuted: "#C8CFCA",
}

function formatSignedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase"
      style={{ letterSpacing: "0.16em", color: light ? C.darkMuted : C.muted }}
    >
      {children}
    </p>
  )
}

function phaseState(phaseNodeIds: string[], timeline: TimelineNode[], currentId: string | undefined) {
  const nodes = phaseNodeIds.map((id) => timeline.find((n) => n.id === id)).filter(Boolean) as TimelineNode[]
  if (nodes.every((n) => n.state === "done")) return "done" as const
  if (currentId && phaseNodeIds.includes(currentId)) return "current" as const
  return "todo" as const
}

export function ClientOnboardingWorkspace({ config }: { config: ClientOnboardingConfig }) {
  const [signerName, setSignerName] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [advancing, setAdvancing] = useState(false)

  const currency = config.currency
  const presentation = config.presentation

  // Effective stage = config state overlaid with recorded ticks. The first
  // node not done is the current stage, so a tick always advances the marker.
  const doneIds = new Set(config.timeline.filter((n) => n.state === "done").map((n) => n.id))
  for (const nodeId of ticked) doneIds.add(nodeId)
  const currentIndex = config.timeline.findIndex((n) => !doneIds.has(n.id))
  const timeline = config.timeline.map((node, index) => ({
    ...node,
    state: doneIds.has(node.id) ? ("done" as const) : index === currentIndex ? ("current" as const) : ("todo" as const),
  }))
  const currentNode = currentIndex >= 0 ? timeline[currentIndex] : null
  const metricLines = config.value.lines.filter((line) => line.amount !== null && line.cadence === "monthly")
  const avoidedLine = config.value.lines.find((line) => line.amount !== null && line.cadence === "one-off")

  useEffect(() => {
    getLatestAgreement(config.slug, ONBOARDING_DOC_TYPE).then((agreement) => {
      if (!agreement) return
      setSigned(true)
      setAgreed(true)
      setSignerName(agreement.signer_name)
      setSignedAt(agreement.signed_at)
    })
    getCompletedStages(config.slug).then((nodeIds) => setTicked(new Set(nodeIds)))
  }, [config.slug])

  function advanceStage(nodeId: string) {
    if (advancing || ticked.has(nodeId)) return
    setAdvancing(true)
    setTicked((prev) => new Set(prev).add(nodeId))
    completeStage(config.slug, nodeId).finally(() => setAdvancing(false))
  }

  async function signAgreement(event: React.FormEvent) {
    event.preventDefault()
    if (!signerName.trim()) {
      setFormError("Type your full name to sign.")
      return
    }
    if (!agreed) {
      setFormError("Tick the agreement box to confirm the scope and payment plan.")
      return
    }
    if (recording) return
    setFormError(null)
    setRecording(true)
    const name = signerName.trim()
    const now = new Date().toISOString()
    setSigned(true)
    setSignedAt(now)
    await recordAgreement({
      slug: config.slug,
      docType: ONBOARDING_DOC_TYPE,
      pagePath: `/clients/${config.slug}`,
      clientName: config.clientName,
      signerName: name,
    })
    setRecording(false)
  }

  return (
    <main className="min-h-screen overflow-x-clip font-sans" style={{ background: C.canvas, color: C.ink }}>
      {/* Header */}
      <header className="mx-auto flex max-w-[1160px] items-baseline justify-between px-5 py-6 sm:px-8 lg:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-tight.png" alt="Sorted." className="h-8 w-auto" />
        <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.16em", color: C.muted }}>
          {config.clientName} / Private workspace
        </p>
      </header>
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8 lg:px-16">
        <div className="border-t" style={{ borderColor: C.border }} />
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1160px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.8fr_1fr] lg:px-16">
        <div>
          <Eyebrow>{presentation?.eyebrow ?? config.line}</Eyebrow>
          <h1
            className="mt-5 font-extrabold"
            style={{ fontSize: "clamp(36px, 5.6vw, 58px)", lineHeight: 1.03, letterSpacing: "-0.02em" }}
          >
            {(presentation?.heroHeading ?? "Your prototype is ready.\nLet's agree the next step.")
              .split("\n")
              .map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
          </h1>
        </div>
        <div className="lg:pt-4">
          {currentNode ? (
            <>
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase" style={{ letterSpacing: "0.08em" }}>
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: C.lime, boxShadow: `0 0 0 3px ${C.ink}` }} />
                Current stage / {currentNode.title}
              </p>
              <label className="mt-4 flex min-h-11 w-fit cursor-pointer items-center gap-3 text-[14px] font-semibold">
              <input
                type="checkbox"
                className="size-5 accent-[#0B1110]"
                disabled={advancing}
                onChange={() => advanceStage(currentNode.id)}
              />
              {currentNode.payment ? "Mark as paid, advance the stage" : "Mark complete, advance the stage"}
              </label>
            </>
          ) : (
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase" style={{ letterSpacing: "0.08em" }}>
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: C.ink }} />
              All stages complete
            </p>
          )}
          <p className="mt-3 max-w-[320px] text-[16px] leading-[1.5]" style={{ color: C.ink }}>
            {presentation?.heroDescription ?? "Review the workflow, confirm the scope and authorise implementation."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            {config.links.hubPreview ? (
              <a
                href={config.links.hubPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-[14px] font-semibold text-white"
                style={{ background: C.ink }}
              >
                Explore the prototype <ArrowUpRight className="size-4" strokeWidth={2.4} />
              </a>
            ) : null}
            <a
              href="#agreement"
              className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4"
              style={{ color: C.ink }}
            >
              Review scope and sign <ArrowDown className="size-4" strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </section>

      {/* Project journey */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-8 lg:px-16">
        <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {(config.journey ?? []).map((phase, index) => {
            const state = phaseState(phase.timelineIds, timeline, currentNode?.id)
            return (
              <li key={phase.title} className="relative">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold"
                    style={
                      state === "current"
                        ? { background: C.lime, color: C.ink, boxShadow: `0 0 0 2px ${C.ink}` }
                        : { border: `1px solid ${C.muted}`, color: C.ink, background: state === "done" ? C.ink : "transparent", ...(state === "done" ? { color: "#fff" } : {}) }
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < (config.journey?.length ?? 0) - 1 ? (
                    <span aria-hidden className="h-px flex-1" style={{ background: C.border }} />
                  ) : null}
                </div>
                <p className="mt-3 text-[15px] font-bold">{phase.title}</p>
                <p className="mt-0.5 text-[13px] leading-[1.5]" style={{ color: C.muted }}>
                  {phase.description}
                </p>
              </li>
            )
          })}
        </ol>

        <details className="mt-6" open>
          <summary className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4">
            All {config.timeline.length} project stages <Plus className="size-3.5" strokeWidth={2.6} />
          </summary>
          <ul className="mt-4 grid gap-0 rounded-lg border bg-white" style={{ borderColor: C.border }}>
            {timeline.map((node, i) => (
              <li
                key={node.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3"
                style={i > 0 ? { borderTop: `1px solid ${C.border}` } : undefined}
              >
                <span
                  aria-hidden
                  className="inline-block size-2 rounded-full"
                  style={{
                    background: node.state === "done" ? C.ink : node.state === "current" ? C.lime : C.border,
                    boxShadow: node.state === "current" ? `0 0 0 1.5px ${C.ink}` : undefined,
                  }}
                />
                <span className="text-[14px] font-semibold">{node.title}</span>
                {node.payment ? (
                  <span className="text-[13px] font-bold" style={{ color: C.ink }}>
                    {node.payment.label}
                  </span>
                ) : null}
                {node.detail ? (
                  <span className="text-[13px]" style={{ color: C.muted }}>
                    {node.detail}
                  </span>
                ) : null}
                {node.state === "current" ? (
                  <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: C.ink }}>
                    <input
                      type="checkbox"
                      className="size-5 accent-[#0B1110]"
                      disabled={advancing}
                      onChange={() => advanceStage(node.id)}
                    />
                    {node.payment ? "Mark paid" : "Mark done"}
                  </label>
                ) : (
                  <span className="ml-auto text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: C.muted }}>
                    {node.state === "done" ? "Done" : "Upcoming"}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {config.links.hubDevelopment ? (
            <p className="mt-3 text-[13px] leading-[1.5]" style={{ color: C.muted }}>
              The detailed build stages live in the{" "}
              <a
                href={config.links.hubDevelopment}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-4"
                style={{ color: C.ink }}
              >
                Creator Hub development view
              </a>
              .
            </p>
          ) : null}
        </details>
      </section>

      {/* Payment band */}
      <section className="mt-16 w-screen relative left-1/2 -translate-x-1/2" style={{ background: C.ink }}>
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-10 sm:grid-cols-3 sm:gap-0 sm:px-8 sm:divide-x sm:divide-white/15 lg:px-16">
          {[
            {
              eyebrow: "TOTAL BUILD",
              amount: formatMoney(config.value.charge, currency),
              note: "One-off scoped build. Ongoing support is agreed separately.",
              lime: false,
            },
            ...config.timeline
              .filter((n) => n.payment?.amount != null)
              .map((n) => ({
                eyebrow: n.id === "payment-start" ? "TO START" : "AT HANDOVER",
                amount: formatMoney(n.payment!.amount!, currency),
                note: n.id === "payment-start" ? "Agreed prototype fee." : "Remaining balance, confirmed at handover.",
                lime: n.id === "payment-start",
              })),
          ].map((col) => (
            <div key={col.eyebrow} className="text-white sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.16em", color: C.darkMuted }}>
                {col.eyebrow}
              </p>
              <p
                className="mt-3 font-extrabold"
                style={{
                  fontSize: "clamp(36px, 4.4vw, 54px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: col.lime ? C.lime : "#FFFFFF",
                  textDecoration: col.lime ? undefined : "line-through",
                  textDecorationThickness: "3px",
                }}
              >
                {col.amount}
              </p>
              <p className="mt-2 text-[13px] leading-[1.5]" style={{ color: C.darkMuted }}>
                {col.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Outcomes + scope */}
      <section className="mx-auto grid max-w-[1160px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:px-16">
        <div>
          <Eyebrow>What changes for your team.</Eyebrow>
          <ul className="mt-6">
            {(presentation?.outcomes ?? []).map((item, index) => (
              <li
                key={item.title}
                className="flex gap-5 py-5"
                style={index > 0 ? { borderTop: `1px solid ${C.border}` } : undefined}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[16px] font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[14px] leading-[1.5]" style={{ color: C.muted }}>
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {presentation?.implementationIncludes ? (
          <div className="h-fit rounded-lg border bg-white p-6" style={{ borderColor: C.border }}>
            <p className="text-[16px] font-bold">{presentation.implementationIncludes.title}</p>
            <ul className="mt-4">
              {presentation.implementationIncludes.items.map((item, i) => (
                <li
                  key={item}
                  className="py-3 text-[14px] leading-[1.5]"
                  style={{ borderTop: `1px solid ${C.border}`, color: C.ink }}
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] leading-[1.5]" style={{ color: C.muted }}>
              {presentation.implementationIncludes.note}
            </p>
          </div>
        ) : null}
        <p className="text-[13px] leading-[1.5] lg:col-span-2" style={{ color: C.muted }}>
          The prototype demonstrates the flow. Live wiring and production controls come next.
        </p>
      </section>

      {/* Potential value */}
      <section className="mx-auto max-w-[1160px] px-5 pb-16 sm:px-8 lg:px-16">
        <h2 className="font-extrabold" style={{ fontSize: "clamp(27px, 3.4vw, 32px)", lineHeight: 1.12, letterSpacing: "-0.012em" }}>
          How much you could save
        </h2>
        <div className="mt-8">
          <p className="font-extrabold" style={{ fontSize: "clamp(56px, 8vw, 92px)", lineHeight: 1.02 }}>
            <span style={{ letterSpacing: "-0.02em" }}>
              {formatMoney(
                metricLines.reduce((sum, line) => sum + (line.amount ?? 0) * 12, 0),
                currency,
              )}
            </span>
            <span className="ml-3 align-baseline text-[16px] font-semibold" style={{ color: C.muted, letterSpacing: 0 }}>
              in your first year
            </span>
          </p>
          <p className="mt-2 max-w-[520px] text-[14px] leading-[1.5]" style={{ color: C.muted }}>
            An estimate, not a measured saving. The two figures below add up to this. Each one shows
            its assumptions.
          </p>
        </div>
        <div className="mt-10 grid gap-10 border-t pt-10 sm:grid-cols-2" style={{ borderColor: C.border }}>
          {metricLines.map((line, i) => (
            <div key={line.id} className={i > 0 ? "sm:border-l sm:pl-10" : ""} style={i > 0 ? { borderColor: C.border } : undefined}>
              <p className="font-extrabold" style={{ fontSize: "clamp(42px, 4.6vw, 54px)", lineHeight: 1.05 }}>
                <span style={{ letterSpacing: "-0.02em" }}>{formatMoney(line.amount!, currency)}</span>
                <span className="ml-2 align-baseline text-[15px] font-semibold" style={{ color: C.muted, letterSpacing: 0 }}>
                  / month
                </span>
              </p>
              <p className="mt-2 text-[14px] font-bold">{line.title}</p>
              <p className="mt-0.5 text-[13px] leading-[1.5]" style={{ color: C.muted }}>
                {line.calculation}
              </p>
              <ul className="mt-3 grid gap-1.5">
                {line.assumptions.map((assumption) => (
                  <li key={assumption} className="flex gap-2 text-[13px] leading-[1.45]" style={{ color: C.muted }}>
                    <span className="mt-[7px] size-1 shrink-0 rounded-full" style={{ background: C.border }} />
                    {assumption}
                  </li>
                ))}
                <li className="flex gap-2 text-[13px] leading-[1.45]" style={{ color: C.muted }}>
                  <span className="mt-[7px] size-1 shrink-0 rounded-full" style={{ background: C.border }} />
                  Unvalidated assumption.
                </li>
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[13px] leading-[1.5]" style={{ color: C.muted }}>
          Freeing up hours is not automatically cash saved. We check these figures together before
          claiming any of it.
        </p>

        <details className="mt-5" open>
          <summary className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4">
            What it would cost another way <Plus className="size-3.5" strokeWidth={2.6} />
          </summary>
          <div className="mt-4 overflow-x-auto rounded-lg border bg-white" style={{ borderColor: C.border }}>
            <table className="w-full min-w-[480px] text-left">
              <tbody>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-4 py-3 text-[14px] font-bold">Sorted build</td>
                  <td className="px-4 py-3 text-[14px] font-bold">{formatMoney(config.value.charge, currency)}</td>
                  <td className="px-4 py-3 text-[13px] leading-[1.45]" style={{ color: C.muted }}>
                    {config.value.chargeBasis}
                  </td>
                </tr>
                {config.value.alternatives.map((alt) => (
                  <tr key={alt.title} style={{ borderBottom: `1px solid ${C.border}` }} className="last:border-b-0">
                    <td className="px-4 py-3 text-[14px] font-semibold">{alt.title}</td>
                    <td className="px-4 py-3 text-[14px] font-semibold">
                      {alt.indicative === null ? (
                        <span style={{ color: C.muted }}>Varies</span>
                      ) : (
                        <>{formatMoney(alt.indicative, currency)}{alt.cadence === "monthly" ? " / month" : ""}</>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] leading-[1.45]" style={{ color: C.muted }}>
                      {alt.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {avoidedLine ? (
            <p className="mt-3 text-[13px] leading-[1.5]" style={{ color: C.muted }}>
              The indicative external route differs from the Sorted charge by {formatMoney(avoidedLine.amount!, currency)}.
              A comparison assumption kept separate from operating benefits, not a measured return.
            </p>
          ) : null}
        </details>
      </section>

      {/* Agreement */}
      <section id="agreement" className="mx-auto max-w-[1160px] scroll-mt-8 px-5 pb-16 sm:px-8 lg:px-16">
        <div className="grid gap-10 rounded-lg p-8 text-white sm:grid-cols-2" style={{ background: C.ink }}>
          <div>
            <Eyebrow light>Your next action</Eyebrow>
            <h2 className="mt-4 font-extrabold" style={{ fontSize: "clamp(28px, 3.6vw, 36px)", lineHeight: 1.08, letterSpacing: "-0.015em" }}>
              Confirm the plan.
              <span className="block">Start implementation.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-[1.55]" style={{ color: C.darkMuted }}>
              {config.agreementScope}
            </p>
          </div>
          <div className="sm:border-l sm:pl-10" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            {signed ? (
              <div className="rounded-md p-5" style={{ background: C.lime, color: C.ink }}>
                <p className="flex items-center gap-2 text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em" }}>
                  <BadgeCheck className="size-4" strokeWidth={2.4} /> Signed
                </p>
                <p className="mt-2 text-[15px] font-bold">Signed by {signerName}</p>
                {signedAt ? <p className="mt-1 text-[13px] font-semibold">{formatSignedDate(signedAt)}</p> : null}
              </div>
            ) : (
              <form onSubmit={signAgreement} className="grid gap-4" noValidate={false}>
                <label className="grid gap-2 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.14em", color: C.darkMuted }}>
                  Your full name
                  <input
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    placeholder="Type your full name"
                    autoComplete="name"
                    maxLength={200}
                    required
                    aria-invalid={formError ? true : undefined}
                    className="min-h-11 rounded-md border bg-white px-4 text-[15px] font-medium normal-case tracking-normal outline-none"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: C.ink }}
                  />
                </label>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[14px] leading-[1.5]" style={{ color: C.darkMuted }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    className="mt-1 size-4"
                    style={{ accentColor: C.lime }}
                  />
                  I agree to the scope, responsibilities and payment plan.
                </label>
                {formError ? (
                  <p className="text-[13px] font-semibold" role="alert" style={{ color: "#FFB4AE" }}>
                    {formError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={recording}
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-md px-5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: C.lime, color: C.ink }}
                >
                  {recording ? "Signing…" : "Sign agreement"} <ArrowUpRight className="size-4" strokeWidth={2.6} />
                </button>
                <p className="text-[12px] leading-[1.5]" style={{ color: C.darkMuted }}>
                  Signing records agreement only. Payments are confirmed separately. Nothing is sent or activated
                  without approval.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Payment details */}
      {config.paymentDetails &&
        (config.paymentDetails.bankName ||
          config.paymentDetails.accountName ||
          config.paymentDetails.sortCode ||
          config.paymentDetails.accountNumber ||
          config.paymentDetails.reference) ? (
        <section className="mx-auto max-w-[1160px] px-5 pb-16 sm:px-8 lg:px-16">
          <div className="rounded-lg border bg-white p-6 sm:max-w-[480px]" style={{ borderColor: C.border }}>
            <Eyebrow>Payment details</Eyebrow>
            <dl className="mt-4">
              {(
                [
                  ["Bank", config.paymentDetails.bankName],
                  ["Account name", config.paymentDetails.accountName],
                  ["Sort code", config.paymentDetails.sortCode],
                  ["Account number", config.paymentDetails.accountNumber],
                  ["Reference", config.paymentDetails.reference],
                ] as const
              )
                .filter(([, value]) => value)
                .map(([label, value], i) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-6 py-2.5"
                    style={i > 0 ? { borderTop: `1px solid ${C.border}` } : undefined}
                  >
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {label}
                    </dt>
                    <dd className="text-[14px] font-bold">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* Footer */}
      <footer className="mx-auto max-w-[1160px] px-5 pb-10 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t pt-6" style={{ borderColor: C.border }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-tight.png" alt="Sorted." className="h-6 w-auto" />
          <p className="text-[12px]" style={{ color: C.muted }}>
            Private onboarding workspace for {config.clientName}. Questions? Contact Sorted.
          </p>
        </div>
      </footer>
    </main>
  )
}
