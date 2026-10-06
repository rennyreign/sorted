"use client"

import { ArrowRight, Tag } from "lucide-react"
import { workspaceEvent, type Workspace } from "@/lib/workspace"

export function ReviewScreen({
  workspace,
  onNavigate,
}: {
  workspace: Workspace
  onNavigate: (route: "website" | "next-steps") => void
}) {
  const openPreview = () => {
    workspaceEvent(workspace, "homepage_preview_opened")
    onNavigate("website")
  }

  const { headline, summary, observations } = workspace.review

  return (
    <div className="mx-auto max-w-[1140px] px-5 pb-16 pt-7 sm:px-8 sm:pt-11">
      {/* Editorial hero */}
      <section className="mb-[18px]">
        <h1 className="text-[clamp(2.6rem,5.4vw,4rem)] font-extrabold leading-[0.97] tracking-[-0.05em]">
          {headline}
        </h1>
        <p className="mt-4 text-[16px] font-medium leading-[1.55] text-[#73736D] sm:text-[18px]">
          {summary}
        </p>
      </section>

      {/* Homepage reveal */}
      <section className="mb-7 overflow-hidden rounded-[14px] bg-[#070707] lg:grid lg:h-[340px] lg:grid-cols-[44%_56%]">
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="max-w-[380px] text-[34px] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-[44px]">
            We rebuilt your site.
          </h2>
          <p className="mt-4 max-w-[390px] text-[15px] font-medium leading-[1.5] text-white/70 sm:text-[16px]">
            A clearer direction, built around the substance already inside your business.
          </p>
          <button
            type="button"
            onClick={openPreview}
            className="mt-6 inline-flex h-12 w-fit items-center gap-3 rounded-full bg-[#DFFF00] px-6 text-[13px] font-black text-[#070707] shadow-[0_14px_34px_rgba(223,255,0,0.18)] transition-transform duration-150 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00] active:translate-y-0"
          >
            Explore your new site <ArrowRight className="size-4" strokeWidth={2.8} />
          </button>
        </div>
        {workspace.website.previewImageUrl ? (
          <button
            type="button"
            onClick={openPreview}
            aria-label={`Open the working site for ${workspace.business.name}`}
            className="relative block aspect-[16/10] cursor-pointer overflow-hidden p-3 sm:p-4 lg:h-full lg:aspect-auto lg:p-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workspace.website.previewImageUrl}
              alt={`Working site created for ${workspace.business.name}`}
              className="h-full w-full rounded-[10px] object-cover object-top"
            />
          </button>
        ) : null}
      </section>

      {/* Observations */}
      {observations.length > 0 ? (
        <section className="mb-[18px]">
          <h2 className="text-[28px] font-extrabold tracking-[-0.04em] sm:text-[34px]">Why we rebuilt it</h2>
          <span className="mt-3 block h-[4px] w-14 rounded-full bg-[#DFFF00]" />
          <ol className="mt-6">
            {observations.map((obs, i) => (
              <li
                key={obs.title}
                className="grid grid-cols-[42px_1fr] gap-x-4 border-t border-[#E8E5DD] py-5 first:border-t-0 sm:grid-cols-[64px_minmax(0,33%)_1fr] sm:items-center sm:gap-x-5 sm:py-6"
              >
                <span className="grid size-[34px] place-items-center rounded-full bg-[#F1F1EC] text-[12px] font-black text-[#73736D]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[15px] font-extrabold tracking-[-0.01em] sm:text-[16px]">{obs.title}</h3>
                <p className="col-start-2 mt-2 max-w-[560px] text-[14px] font-medium leading-[1.55] text-[#73736D] sm:col-start-3 sm:mt-0 sm:text-[15px]">
                  {obs.explanation}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Fixed price band */}
      <section className="grid grid-cols-[44px_1fr] items-center gap-x-5 gap-y-4 rounded-[12px] bg-[#F7F2E8] p-5 sm:grid-cols-[56px_1fr_auto] sm:p-6">
        <span className="grid size-11 place-items-center rounded-full bg-[#DFFF00] sm:size-14">
          <Tag className="size-5 sm:size-6" strokeWidth={2.2} />
        </span>
        <div>
          {workspace.offer.status === "pending" ? (
            <>
              <h2 className="text-[19px] font-extrabold tracking-[-0.03em] sm:text-[22px]">Next steps for your site.</h2>
              <p className="mt-1 max-w-[480px] text-[13px] font-semibold leading-[1.45] text-[#73736D] sm:text-[14px]">
                We&apos;ll confirm the remaining work and pricing with you before any payment.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[19px] font-extrabold tracking-[-0.03em] sm:text-[22px]">Complete website · £{workspace.offer.total.toLocaleString()} fixed</h2>
              <p className="mt-1 max-w-[480px] text-[13px] font-semibold leading-[1.45] text-[#73736D] sm:text-[14px]">
                Your complete website, built and launched for one fixed price.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            workspaceEvent(workspace, "next_steps_opened")
            onNavigate("next-steps")
          }}
          className="col-span-2 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#070707] px-6 text-[13px] font-black text-white transition-transform duration-150 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707] active:translate-y-0 sm:col-span-1 sm:w-auto"
        >
          See next steps <ArrowRight className="size-4" strokeWidth={2.8} />
        </button>
      </section>
    </div>
  )
}
