#!/usr/bin/env python3
"""
Sorted Website Lead Sender.

Sends the confirmation/review-link email for new website leads created by the
Sorted mockup modal. The public site is statically hosted, so Resend must run
from this server-side operator rather than from the browser.

Usage:
    python send.py
    python send.py --dry-run
    python send.py --batch 10
"""

import argparse
import html
import logging
import os
import sys
from datetime import datetime, timezone

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("website-lead-sender")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "hello@sortmydigital.site")
FROM_NAME = os.environ.get("FROM_NAME", "Sorted")
REVIEW_BASE_URL = os.environ.get("REVIEW_BASE_URL", "https://sortmydigital.site/review/")
OPERATOR_EMAIL = os.environ.get("OPERATOR_EMAIL", "hello@sortmydigital.site")
RESEND_API_ENDPOINT = "https://api.resend.com/emails"


def require_env():
    missing = [
        name
        for name, value in {
            "SUPABASE_URL": SUPABASE_URL,
            "SUPABASE_SERVICE_KEY": SUPABASE_SERVICE_KEY,
            "RESEND_API_KEY": RESEND_API_KEY,
        }.items()
        if not value
    ]
    if missing:
        log.error("Missing required env vars: %s", ", ".join(missing))
        sys.exit(1)


def supabase_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def supabase_get(path, params=None):
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers=supabase_headers(),
        params=params,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def supabase_patch(path, body, params=None):
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers=supabase_headers(),
        json=body,
        params=params,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def review_url(slug):
    return f"{REVIEW_BASE_URL}?slug={slug}"


def find_leads(batch):
    leads = supabase_get(
        "prospects",
        params={
            "status": "eq.website_lead",
            "email": "not.is.null",
            "review_slug": "not.is.null",
            "order": "first_seen_at.asc",
            "limit": str(batch * 3),
            "select": "id,name,email,website,review_slug,notes,outreach_status,outreach_sent_at",
        },
    )
    return [
        lead
        for lead in leads
        if lead.get("outreach_status") != "SENT" and not lead.get("outreach_sent_at")
    ][:batch]


def email_text(lead):
    url = review_url(lead["review_slug"])
    return f"""Hi {lead['name']},

Thanks for requesting a Sorted mockup.

We've created your private review page here:
{url}

This is where your website mockup will be shown once it is ready. When you reveal the mockup, your project stage updates automatically in the Sorted pipeline.

No obligation. No pressure. You see it first, then decide.

Sorted
https://sortmydigital.site
"""


def email_html(lead):
    url = html.escape(review_url(lead["review_slug"]))
    name = html.escape(lead["name"])
    return f"""<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">
          <tr><td style="background:#070707;padding:24px 28px;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>
            <span style="float:right;margin-top:5px;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.08em;">Mockup request</span>
          </td></tr>
          <tr><td style="padding:34px 28px 8px 28px;">
            <p style="margin:0 0 10px 0;font-size:13px;font-weight:900;color:#9bb000;">We've got your brief</p>
            <h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">Your private mockup page is being prepared.</h1>
            <p style="margin:18px 0 0 0;font-size:15px;font-weight:650;color:rgba(0,0,0,0.66);line-height:1.5;">Hi {name}, this is where your Sorted website mockup will be shown once it is ready.</p>
          </td></tr>
          <tr><td style="padding:24px 28px 10px 28px;">
            <a href="{url}" style="display:block;background:#dfff00;color:#070707;text-align:center;font-size:13px;font-weight:900;text-decoration:none;padding:17px 22px;border-radius:999px;">Open your review page →</a>
          </td></tr>
          <tr><td style="padding:12px 28px 34px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">
              <tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">
                No obligation. No pressure. You see it first, then decide.
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""


def send_email(lead, dry_run):
    subject = "Your Sorted mockup page"
    text = email_text(lead)
    if dry_run:
        log.info("[DRY RUN] Would send %s to %s", subject, lead["email"])
        return {"success": True, "provider_message_id": "dry-run"}

    response = requests.post(
        RESEND_API_ENDPOINT,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [lead["email"]],
            "subject": subject,
            "html": email_html(lead),
            "text": text,
        },
        timeout=30,
    )

    if response.status_code != 200:
        return {"success": False, "error": f"Resend {response.status_code}: {response.text[:240]}"}

    return {"success": True, "provider_message_id": response.json().get("id")}


def mark_sent(lead_id, provider_message_id):
    now = datetime.now(timezone.utc).isoformat()
    supabase_patch(
        "prospects",
        {
            "outreach_status": "SENT",
            "outreach_sent_at": now,
            "outreach_provider_message_id": provider_message_id,
            "outreach_last_error": None,
        },
        params={"id": f"eq.{lead_id}"},
    )


def mark_failed(lead_id, error):
    supabase_patch(
        "prospects",
        {
            "outreach_status": "FAILED_TEMPORARY",
            "outreach_last_error": error[:500],
        },
        params={"id": f"eq.{lead_id}"},
    )


def operator_email_html(lead):
    url = html.escape(review_url(lead["review_slug"]))
    name = html.escape(lead["name"])
    email = html.escape(lead["email"])
    website = html.escape(lead.get("website") or "")
    notes = html.escape(lead.get("notes") or "")
    notes_html = "<br/>".join(notes.split("\n")) if notes else "No notes"
    return f"""<!doctype html>
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
            <h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">{name}</h1>
          </td></tr>
          <tr><td style="padding:24px 28px 10px 28px;">
            <a href="{url}" style="display:block;background:#dfff00;color:#070707;text-align:center;font-size:13px;font-weight:900;text-decoration:none;padding:17px 22px;border-radius:999px;">Open review page →</a>
          </td></tr>
          <tr><td style="padding:24px 28px 8px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">
              <tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">
                <p style="margin:0 0 8px 0;"><strong>Business:</strong> {name}</p>
                <p style="margin:0 0 8px 0;"><strong>Email:</strong> {email}</p>
                {f'<p style="margin:0 0 8px 0;"><strong>Website:</strong> {website}</p>' if website else ""}
                <p style="margin:0;"><strong>Review slug:</strong> {html.escape(lead["review_slug"])}</p>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:8px 28px 24px 28px;">
            <p style="margin:0 0 12px 0;font-size:13px;font-weight:900;color:#9bb000;">Brief details</p>
            <p style="margin:0;font-size:13px;font-weight:600;line-height:1.55;color:rgba(0,0,0,0.66);">{notes_html}</p>
          </td></tr>
          <tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""


def notify_operator(lead, dry_run):
    subject = f"New Sorted mockup request: {lead['name']}"
    if dry_run:
        log.info("[DRY RUN] Would send operator notification: %s", subject)
        return

    try:
        response = requests.post(
            RESEND_API_ENDPOINT,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": f"{FROM_NAME} <{FROM_EMAIL}>",
                "to": [OPERATOR_EMAIL],
                "subject": subject,
                "html": operator_email_html(lead),
            },
            timeout=30,
        )
        if response.status_code == 200:
            log.info("Sent operator notification for %s", lead["name"])
        else:
            log.error("Operator notification failed for %s: Resend %s", lead["name"], response.status_code)
    except Exception as exc:
        log.error("Operator notification error for %s: %s", lead["name"], exc)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    require_env()

    leads = find_leads(args.batch)
    log.info("Found %s website lead(s) to email", len(leads))

    sent = 0
    failed = 0
    for lead in leads:
        result = send_email(lead, args.dry_run)
        if result["success"]:
            if not args.dry_run:
                mark_sent(lead["id"], result.get("provider_message_id"))
            sent += 1
            log.info("Sent review link to %s", lead["email"])
            notify_operator(lead, args.dry_run)
        else:
            mark_failed(lead["id"], result["error"])
            failed += 1
            log.error("Failed to send to %s: %s", lead["email"], result["error"])

    log.info("Done. sent=%s failed=%s", sent, failed)


if __name__ == "__main__":
    main()
