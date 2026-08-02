import type { Metadata } from "next"
import { FileText, Globe2, ImageIcon, LockKeyhole, Phone, RefreshCcw, Save, Share2, Star, Tag, Type } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../_components/SitesPrimitives"
import { MockupButton } from "../_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "SortedUpdates | Sorted",
  description: "Every Sorted website includes a clean content editor so business owners can update pages, images, services and contact details.",
  alternates: {
    canonical: "/website-updates",
  },
}

export default function UpdatesPage() {
  return (
    <SitesPage>
      <SitesHeader active="updates" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <SitesTitle title={<>Your content<br />Your control</>} marker="Update it yourself." />
          <Underline className="mt-2 w-full max-w-[320px] sm:max-w-[380px]" />
          <p className="mt-7 max-w-[450px] text-[16px] font-semibold leading-[1.55] tracking-[-0.03em]">
            Every Sorted website includes a built-in content editor. Change text, images, services, prices and contact details yourself. Save, publish and see your updates live in minutes.
          </p>
          <ul className="mt-8 grid gap-3 text-[14px] font-bold">
            {["Edit your site in minutes", "No code or developers needed", "Changes go live instantly"].map((item) => (
              <li key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#dfff00] text-[12px]">✓</span>{item}</li>
            ))}
          </ul>
        </div>
        <CmsPanel />
      </section>

      <section className="mx-auto max-w-[1220px] border-t border-black/10 px-5 py-12 sm:px-8">
        <h2 className="text-[34px] font-black tracking-[-0.035em]">SortedUpdates comes with every site</h2>
        <div className="mt-9 grid gap-8 md:grid-cols-3">
          {[
            ["SortedUpdates", "A clean content editor living at /cms/ on your site. Edit in your browser, save, and publish."],
            ["Included", "SortedUpdates comes with every Sorted website we build. It is part of the handoff, not an extra."],
            ["Self-service", "Swap words, images, prices and service details yourself. Changes publish automatically."],
          ].map(([title, copy], index) => (
            <article key={title}>
              <span className={`grid size-11 place-items-center rounded-full text-[15px] font-black ${index === 2 ? "bg-[#dfff00]" : "bg-[#070707] text-white"}`}>{index + 1}</span>
              <h3 className="mt-7 text-[18px] font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 max-w-[290px] text-[14px] font-semibold leading-[1.5] text-black/68">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 border-t border-black/10 px-5 py-12 sm:px-8 lg:grid-cols-[0.32fr_0.68fr]">
        <div>
          <h2 className="text-[34px] font-black leading-[1] tracking-[-0.035em]">If it appears on the page, you can change it</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Type, "Text and copy", "Headings, paragraphs, button labels, CTAs and every visible word."],
            [ImageIcon, "Images and media", "Hero photos, team headshots, gallery images, thumbnails and video URLs."],
            [Tag, "Services and offers", "Service descriptions, prices, packages and special offers."],
            [Phone, "Contact details", "Phone numbers, email addresses, opening hours and location information."],
            [Star, "FAQs and reviews", "Add or edit FAQs, entries, testimonials and case studies."],
            [Share2, "Social links", "Instagram, Facebook, WhatsApp and any other links in the footer or contact areas."],
          ].map(([Icon, title, copy]) => {
            const RealIcon = Icon as typeof Type
            return (
              <article key={title as string} className="grid grid-cols-[54px_1fr] gap-4 rounded-[14px] border border-black/10 bg-white p-5">
                <span className="grid size-12 place-items-center rounded-xl border border-black/10"><RealIcon className="size-6" /></span>
                <div>
                  <h3 className="text-[14px] font-black">{title as string}</h3>
                  <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] border-t border-black/10 px-5 py-12 sm:px-8">
        <h2 className="text-[34px] font-black tracking-[-0.035em]">Log in, edit, publish</h2>
        <div className="mt-9 grid gap-7 md:grid-cols-4">
          {[
            [LockKeyhole, "Log in", "Access your CMS at yoursite.com/cms/. We send you a secure invite."],
            [FileText, "Edit", "Click any section, change the text or image, and preview the result live."],
            [Save, "Save", "Hit save. Decap writes the change to your site repository automatically."],
            [Globe2, "Live", "Your updated site is live in under a minute. No developer needed."],
          ].map(([Icon, title, copy], index) => {
            const RealIcon = Icon as typeof LockKeyhole
            return (
              <article key={title as string}>
                <p className="mb-5 text-[16px] font-black">0{index + 1}</p>
                <span className="grid size-14 place-items-center rounded-xl border border-black/10 bg-white"><RealIcon className="size-7" /></span>
                <h3 className="mt-5 text-[15px] font-black">{title as string}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-8 rounded-[18px] border border-black/10 bg-white p-8 md:grid-cols-2">
          <InfoBlock icon={LockKeyhole} title="Invite only. You control the content." copy="Access is locked to invite-only identity. You decide who can edit. Sorted retains the design, code and factory reset capability." />
          <InfoBlock icon={RefreshCcw} title="Made a mess? We can reset it." copy="Every site ships with a recorded handoff state. If content changes go too far off track, we can restore the original approved content." />
        </div>
      </section>

      <DarkCta title="More trust. More enquiries. More customers." />
      <SitesFooter />
    </SitesPage>
  )
}

function CmsPanel() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_22px_55px_rgba(20,14,8,0.11)]">
      <div className="flex h-11 items-center justify-between bg-[#070707] px-4 text-[11px] font-bold text-white sm:px-5 sm:text-[12px]">
        <span>SortedUpdates / Pages / Home</span>
        <span>•••</span>
      </div>
      <div className="grid min-h-[390px] grid-cols-[82px_1fr] sm:min-h-[460px] sm:grid-cols-[150px_1fr_180px]">
        <aside className="border-r border-black/10 bg-[#f7f7f3] p-2 text-[10px] font-bold sm:p-4 sm:text-[12px]">
          {["Pages", "Home", "About", "Services", "Work", "Settings"].map((item, index) => (
            <p key={item} className={`rounded-lg px-2 py-2 sm:px-3 sm:py-3 ${index === 1 ? "bg-white shadow-sm" : ""}`}>{item}</p>
          ))}
        </aside>
        <main className="p-4 sm:p-7">
          <h3 className="text-[23px] font-black tracking-[-0.05em] sm:text-[27px]">Hero</h3>
          <label className="mt-6 block text-[11px] font-black text-black/45">Title</label>
          <div className="mt-2 rounded-xl border border-black/10 p-3 text-[12px] font-bold leading-[1.35] sm:p-4 sm:text-[14px]">YOUR SPACE<br />YOUR STRENGTH<br />YOUR RESULTS.</div>
          <label className="mt-5 block text-[11px] font-black text-black/45">Subtitle</label>
          <div className="mt-2 rounded-xl border border-black/10 p-3 text-[12px] font-semibold sm:p-4 sm:text-[13px]">We design and build websites that drive real growth.</div>
          <div className="mt-5 h-28 rounded-xl bg-[#070707] p-4 text-[12px] text-white sm:h-36 sm:text-base">Hero image preview</div>
        </main>
        <aside className="hidden border-l border-black/10 p-6 sm:block">
          <p className="text-[15px] font-black">Publish</p>
          <p className="mt-5 text-[12px] font-bold text-[#00983c]">● Published</p>
          <button className="mt-8 h-11 w-full rounded bg-[#070707] text-[12px] font-black text-white">Save & Publish</button>
          <button className="mt-3 h-10 w-full rounded bg-black/5 text-[12px] font-black">Preview changes</button>
        </aside>
      </div>
    </div>
  )
}

function InfoBlock({ icon: Icon, title, copy }: { icon: typeof LockKeyhole; title: string; copy: string }) {
  return (
    <article className="grid gap-6 md:grid-cols-[90px_1fr]">
      <span className="grid size-20 place-items-center rounded-full bg-[#dfff00]"><Icon className="size-10" /></span>
      <div>
        <h3 className="text-[30px] font-black leading-[1] tracking-[-0.035em]">{title}</h3>
        <p className="mt-4 max-w-[430px] text-[14px] font-semibold leading-[1.5] text-black/65">{copy}</p>
      </div>
    </article>
  )
}
