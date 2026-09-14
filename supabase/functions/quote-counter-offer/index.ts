import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SHARED_SECRET = Deno.env.get("QUOTE_COUNTER_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Sorted <hello@sortmydigital.site>";
const NOTIFY_EMAIL = Deno.env.get("RENALDO_EMAIL") ?? "hello@sortmydigital.site";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify shared secret
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!SHARED_SECRET || token !== SHARED_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { client_slug, client_name, original_amount, proposed_amount } = body;

    if (!client_slug || !client_name || !original_amount || !proposed_amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get client IP for record-keeping
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    // Insert into database
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error: insertError } = await supabase.from("quote_responses").insert({
      client_slug,
      client_name,
      original_amount,
      proposed_amount,
      status: "pending_review",
      signer_ip: clientIP,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to store response" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send email notification via Resend
    if (RESEND_API_KEY) {
      try {
        const emailHtml = buildEmailHtml(client_name, client_slug, original_amount, proposed_amount);

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [NOTIFY_EMAIL],
            subject: `Counter-offer from ${client_name}: £${proposed_amount} (was £${original_amount})`,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        // Don't fail the request if email fails — the record is still stored
      }
    } else {
      console.warn("RESEND_API_KEY not set — email notification skipped");
    }

    return new Response(JSON.stringify({ ok: true, message: "Counter-offer submitted for review" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function buildEmailHtml(
  clientName: string,
  clientSlug: string,
  originalAmount: number,
  proposedAmount: number,
): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">
          <tr><td style="background:#070707;padding:24px 28px;">
            <span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Sorted</span>
            <span style="float:right;font-size:11px;font-weight:900;color:#cfe900;text-transform:uppercase;letter-spacing:0.1em;">Quote counter-offer</span>
          </td></tr>
          <tr><td style="padding:32px 28px 8px 28px;">
            <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:900;letter-spacing:-0.035em;line-height:1.1;">Counter-offer needs review.</h1>
            <p style="margin:0;font-size:15px;font-weight:600;color:rgba(0,0,0,0.65);line-height:1.5;">A client has proposed a price below the auto-accept floor.</p>
          </td></tr>
          <tr><td style="padding:20px 28px 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:20px;">
              <tr>
                <td style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.5);padding-bottom:6px;">Client</td>
                <td align="right" style="font-size:15px;font-weight:800;padding-bottom:6px;">${clientName}</td>
              </tr>
              <tr>
                <td style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.5);padding-bottom:6px;">Client slug</td>
                <td align="right" style="font-size:15px;font-weight:800;padding-bottom:6px;">${clientSlug}</td>
              </tr>
              <tr>
                <td style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.5);padding-bottom:6px;">Original quote</td>
                <td align="right" style="font-size:15px;font-weight:800;padding-bottom:6px;">£${originalAmount}</td>
              </tr>
              <tr style="border-top:1px solid rgba(0,0,0,0.1);">
                <td style="padding-top:14px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">Proposed price</td>
                <td align="right" style="padding-top:14px;font-size:32px;font-weight:900;letter-spacing:-0.04em;color:#070707;">£${proposedAmount}</td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 28px 8px 28px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:rgba(0,0,0,0.7);line-height:1.5;">This proposal is below the £500 auto-accept floor. Review and respond to the client directly.</p>
          </td></tr>
          <tr><td style="padding:8px 28px 32px 28px;">
            <a href="https://sortmydigital.site/clients/${clientSlug}" style="display:inline-block;background:#070707;color:#ffffff;font-size:12px;font-weight:900;text-decoration:none;padding:14px 22px;border-radius:999px;letter-spacing:0.02em;">View quote page →</a>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#fafafa;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.45);font-weight:600;">Sorted — sortmydigital.site. You're receiving this because a quote counter-offer was submitted below the auto-accept floor.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
