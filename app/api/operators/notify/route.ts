import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/resend"

const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL ?? "hello@sortmydigital.site"
const REVIEW_BASE_URL = "https://sortmydigital.site/review/"

type WebsiteLeadPayload = {
  type: "website_lead"
  businessName: string
  email: string
  websiteUrl?: string
  reviewSlug: string
  summary: string
  answers?: Record<string, string>
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as WebsiteLeadPayload

  if (payload.type !== "website_lead") {
    return NextResponse.json({ error: "unknown notification type" }, { status: 400 })
  }

  const { businessName, email, websiteUrl, reviewSlug, summary, answers } = payload

  if (!businessName || !email || !reviewSlug) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 })
  }

  const reviewUrl = `${REVIEW_BASE_URL}?slug=${reviewSlug}`
  const answersHtml = answers
    ? `<ul style="margin:0;padding:0 0 0 18px;list-style:disc;">
        ${Object.entries(answers)
          .map(([key, value]) => `<li style="margin-bottom:6px;"><strong style="text-transform:capitalize;">${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
          .join("")}
       </ul>`
    : ""

  const result = await sendEmail({
    to: OPERATOR_EMAIL,
    subject: `New Sorted mockup request: ${businessName}`,
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">
          <tr><td style="background:#070707;padding:24px 28px;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>
            <span style="float:right;margin-top:5px;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.08em;">New lead</span>
          </td></tr>
          <tr><td style="padding:34px 28px 8px 28px;">
            <p style="margin:0 0 10px 0;font-size:13px;font-weight:900;color:#9bb000;">New website mockup brief</p>
            <h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">${escapeHtml(businessName)}</h1>
            <p style="margin:18px 0 0 0;font-size:15px;font-weight:650;color:rgba(0,0,0,0.66);line-height:1.5;">${escapeHtml(summary)}</p>
          </td></tr>
          <tr><td style="padding:24px 28px 10px 28px;">
            <a href="${reviewUrl}" style="display:block;background:#dfff00;color:#070707;text-align:center;font-size:13px;font-weight:900;text-decoration:none;padding:17px 22px;border-radius:999px;">Open review page →</a>
          </td></tr>
          <tr><td style="padding:24px 28px 8px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">
              <tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">
                <p style="margin:0 0 8px 0;"><strong>Business:</strong> ${escapeHtml(businessName)}</p>
                <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
                ${websiteUrl ? `<p style="margin:0 0 8px 0;"><strong>Website:</strong> ${escapeHtml(websiteUrl)}</p>` : ""}
                <p style="margin:0;"><strong>Review slug:</strong> ${escapeHtml(reviewSlug)}</p>
              </td></tr>
            </table>
          </td></tr>
          ${answersHtml ? `<tr><td style="padding:8px 28px 24px 28px;"><p style="margin:0 0 12px 0;font-size:13px;font-weight:900;color:#9bb000;">Their answers</p>${answersHtml}</td></tr>` : ""}
          <tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  })

  if (!result.ok) {
    console.error("[notify] Failed to send operator email:", result.error)
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, messageId: result.messageId })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
