// Resend transactional email helper.
//
// The existing resend-webhook Supabase Edge Function only *receives* events;
// this helper is for *sending* transactional email from local operator API
// routes (which run with the service key and RESEND_API_KEY in the env).
//
// Never call this from a client component — the API key is server-only.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ""
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "Sorted Sites <hello@sortmydigital.site>"

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  /** optional plain-text fallback */
  text?: string
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string }

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY not set" }
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    })

    if (!resp.ok) {
      const body = await resp.text()
      return { ok: false, error: `Resend ${resp.status}: ${body.slice(0, 200)}` }
    }

    const data = (await resp.json()) as { id?: string }
    return { ok: true, messageId: data.id ?? "" }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown send error" }
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function payoutDueEmailHtml(opts: {
  affiliateName: string
  businessName: string
  stage: string
  amountGbp: number
  portalUrl: string
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">
          <tr><td style="background:#070707;padding:24px 28px;">
            <span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Sorted Sites</span>
            <span style="float:right;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.1em;">Partner payout</span>
          </td></tr>
          <tr><td style="padding:32px 28px 8px 28px;">
            <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:900;letter-spacing:-0.035em;line-height:1.1;">You've earned a payout.</h1>
            <p style="margin:0;font-size:15px;font-weight:600;color:rgba(0,0,0,0.65);line-height:1.5;">Hi ${escapeHtml(opts.affiliateName)}, a referral just closed. Here are the details.</p>
          </td></tr>
          <tr><td style="padding:20px 28px 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:20px;">
              <tr>
                <td style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.5);padding-bottom:6px;">Business</td>
                <td align="right" style="font-size:15px;font-weight:800;padding-bottom:6px;">${escapeHtml(opts.businessName)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.5);padding-bottom:6px;">Stage</td>
                <td align="right" style="font-size:15px;font-weight:800;padding-bottom:6px;">${escapeHtml(opts.stage)}</td>
              </tr>
              <tr style="border-top:1px solid rgba(0,0,0,0.1);">
                <td style="padding-top:14px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">Your payout</td>
                <td align="right" style="padding-top:14px;font-size:32px;font-weight:900;letter-spacing:-0.04em;color:#070707;">£${opts.amountGbp}</td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 28px 8px 28px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:rgba(0,0,0,0.7);line-height:1.5;">Your bank transfer is being arranged and will follow shortly. You can track this payout in the Sorted Partners Portal.</p>
          </td></tr>
          <tr><td style="padding:8px 28px 32px 28px;">
            <a href="${escapeHtml(opts.portalUrl)}" style="display:inline-block;background:#070707;color:#ffffff;font-size:12px;font-weight:900;text-decoration:none;padding:14px 22px;border-radius:999px;letter-spacing:0.02em;">View payout in portal →</a>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#fafafa;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.45);font-weight:600;">Sorted Sites — sortmydigital.site. You're receiving this because a referral you submitted was purchased.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
