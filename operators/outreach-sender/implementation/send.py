#!/usr/bin/env python3
"""
Sorted Outreach Sender — Deterministic email operator.

Checks for READY prospects, compiles the fixed campaign template,
sends via Resend, and updates the CRM with the result.

No LLM. No probabilistic decisions. Fixed rules only.

Usage:
    python send.py              # send one email (the oldest READY prospect)
    python send.py --dry-run    # log what would be sent, don't actually send
    python send.py --batch N    # send up to N emails (respecting daily limit)
"""

import argparse
import os
import sys
import time
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import requests

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("outreach-sender")

# ─── Config ───────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "renaldo@sortmydigital.site")
FROM_NAME = os.environ.get("FROM_NAME", "Renaldo")
DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"

REVIEW_BASE_URL = "https://sortmydigital.site/review"
RESEND_API_ENDPOINT = "https://api.resend.com/emails"

# ─── Supabase helpers ─────────────────────────────────────────────────────────

def supabase_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def supabase_get(path, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    r = requests.get(url, headers=supabase_headers(), params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def supabase_patch(path, body, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    r = requests.patch(url, headers=supabase_headers(), json=body, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def supabase_post(path, body):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    r = requests.post(url, headers=supabase_headers(), json=body, timeout=30)
    r.raise_for_status()
    return r.json()

# ─── Config loader ────────────────────────────────────────────────────────────

def load_config():
    """Load the single outreach_config row."""
    data = supabase_get("outreach_config", params={"id": "eq.1"})
    if not data:
        log.error("No outreach_config row found — aborting")
        sys.exit(1)
    return data[0]

# ─── Sending window check ─────────────────────────────────────────────────────

def is_within_sending_window(cfg):
    """Check if current time is within the configured UK business-hours window."""
    tz = ZoneInfo(cfg["sending_window_tz"])
    now = datetime.now(tz)

    # Check day of week (ISO: 1=Mon, 7=Sun)
    allowed_days = [int(d) for d in cfg["sending_window_days"].split(",")]
    if now.isoweekday() not in allowed_days:
        return False, f"Outside sending days (today is day {now.isoweekday()})"

    # Check time window
    current_time = now.strftime("%H:%M")
    if current_time < cfg["sending_window_start"]:
        return False, f"Before sending window ({current_time} < {cfg['sending_window_start']})"
    if current_time >= cfg["sending_window_end"]:
        return False, f"After sending window ({current_time} >= {cfg['sending_window_end']})"

    return True, "Within sending window"

# ─── Daily send count ─────────────────────────────────────────────────────────

def get_today_send_count():
    """Count emails sent today (UTC date)."""
    today_start = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00")
    data = supabase_get("prospects", params={
        "outreach_status": "eq.SENT",
        "outreach_sent_at": f"gte.{today_start}",
        "select": "id",
    })
    return len(data)

# ─── Suppression check ────────────────────────────────────────────────────────

def is_suppressed(email):
    """Check if email is on the suppression list."""
    data = supabase_get("outreach_suppression", params={
        "email": f"eq.{email}",
        "select": "id,reason",
    })
    if data:
        return True, data[0]["reason"]
    return False, None

# ─── Campaign loader ──────────────────────────────────────────────────────────

def load_active_campaign():
    """Load the active campaign template."""
    data = supabase_get("outreach_campaigns", params={
        "is_active": "eq.true",
        "order": "created_at.desc",
        "limit": "1",
    })
    if not data:
        log.error("No active campaign found — aborting")
        sys.exit(1)
    return data[0]

# ─── Template compiler ────────────────────────────────────────────────────────

def compile_template(subject_template, body_template, prospect):
    """Replace {{review_url}} with the actual review URL."""
    review_url = f"{REVIEW_BASE_URL}/{prospect['review_slug']}"
    subject = subject_template.replace("{{review_url}}", review_url)
    body = body_template.replace("{{review_url}}", review_url)
    return subject, body

def body_to_html(text_body, review_url):
    """
    Convert the plain-text email body to a simple HTML version.
    This enables Resend's open tracking pixel (injected into HTML emails).
    """
    # Escape HTML special chars
    escaped = text_body.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Convert the review URL line to a clickable button
    lines = escaped.split("\n")
    html_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped == review_url:
            html_lines.append(
                f'<div style="margin:24px 0;">'
                f'<a href="{review_url}" '
                f'style="display:inline-block;background:#0A0A0A;color:#ffffff;'
                f'font-size:14px;font-weight:600;text-decoration:none;'
                f'padding:14px 28px;border-radius:8px;">'
                f'See your review &rarr;</a></div>'
            )
        elif stripped == "":
            html_lines.append("<br>")
        else:
            html_lines.append(f"<p style='margin:0 0 8px 0;'>{stripped}</p>")

    body_html = "\n".join(html_lines)

    return f"""<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A0A0A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr><td style="padding:8px 0 24px 0;">
            <span style="font-size:18px;font-weight:800;color:#0A0A0A;letter-spacing:-0.02em;">Sorted</span>
          </td></tr>
          <tr><td style="font-size:15px;line-height:1.6;color:#0A0A0A;">
{body_html}
          </td></tr>
          <tr><td style="padding:32px 0 16px 0;border-top:1px solid #f0f0f0;margin-top:24px;">
            <p style="font-size:12px;color:#A3A3A3;line-height:1.5;">
              Sorted — sortmydigital.site<br>
              You're receiving this because we built a new website for your business.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""

# ─── Email sender (Resend adapter) ────────────────────────────────────────────

def send_email(to, subject, body, idempotency_key, html_body=None):
    """
    Send email via Resend API.

    Returns dict:
        { success, provider_message_id, error_type, error_message }
    """
    if DRY_RUN:
        log.info(f"[DRY RUN] Would send to {to}: {subject}")
        return {
            "success": True,
            "provider_message_id": "dry-run-mock",
            "error_type": None,
            "error_message": None,
        }

    try:
        email_payload = {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to],
            "subject": subject,
            "text": body,
        }
        # Include HTML body when available — this enables Resend's
        # open tracking pixel (injected into HTML emails automatically)
        if html_body:
            email_payload["html"] = html_body

        r = requests.post(
            RESEND_API_ENDPOINT,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=email_payload,
            timeout=30,
        )

        if r.status_code == 200:
            data = r.json()
            return {
                "success": True,
                "provider_message_id": data.get("id"),
                "error_type": None,
                "error_message": None,
            }

        # Classify error
        error_body = r.text
        if r.status_code == 429:
            error_type = "PROVIDER_RATE_LIMIT"
        elif r.status_code in (400, 422):
            # Could be invalid email or duplicate
            if "duplicate" in error_body.lower() or "idempotency" in error_body.lower():
                error_type = "DUPLICATE_CAMPAIGN"
            else:
                error_type = "INVALID_EMAIL"
        elif r.status_code >= 500:
            error_type = "PROVIDER_TIMEOUT"
        else:
            error_type = "UNKNOWN_PROVIDER_ERROR"

        return {
            "success": False,
            "provider_message_id": None,
            "error_type": error_type,
            "error_message": error_body,
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "provider_message_id": None,
            "error_type": "PROVIDER_TIMEOUT",
            "error_message": "Request timed out",
        }
    except requests.exceptions.ConnectionError as e:
        return {
            "success": False,
            "provider_message_id": None,
            "error_type": "PROVIDER_TIMEOUT",
            "error_message": str(e),
        }
    except Exception as e:
        return {
            "success": False,
            "provider_message_id": None,
            "error_type": "UNKNOWN_PROVIDER_ERROR",
            "error_message": str(e),
        }

# ─── Audit logger ─────────────────────────────────────────────────────────────

PERMANENT_ERRORS = {"INVALID_EMAIL", "DUPLICATE_CAMPAIGN", "HARD_BOUNCE"}

def log_state_change(prospect_id, campaign_id, prev_state, new_state, trigger, provider_response=None, error=None):
    """Write an audit log entry."""
    supabase_post("outreach_log", {
        "prospect_id": prospect_id,
        "campaign_id": campaign_id,
        "previous_state": prev_state,
        "new_state": new_state,
        "trigger_source": trigger,
        "provider_response": provider_response,
        "error": error,
    })

# ─── Core send logic ──────────────────────────────────────────────────────────

def find_ready_prospect(campaign_id):
    """
    Find the oldest READY prospect that hasn't been sent this campaign.
    Excludes suppressed emails and already-sent records.
    """
    data = supabase_get("prospects", params={
        "outreach_status": "eq.READY",
        "email": "not.is.null",
        "review_slug": "not.is.null",
        "order": "outreach_queued_at.asc",
        "limit": "1",
        "select": "id,place_id,name,email,review_slug,mockup_url,outreach_status,outreach_campaign_id,outreach_attempt_count",
    })
    return data[0] if data else None

def process_one(campaign, cfg):
    """
    Process one prospect: validate, send, update CRM.
    Returns True if an email was sent (or attempted), False if nothing to do.
    """
    prospect = find_ready_prospect(campaign["id"])
    if not prospect:
        log.info("No READY prospects found")
        return False

    pid = prospect["id"]
    email = prospect["email"]
    prev_state = prospect["outreach_status"]
    attempt_count = prospect.get("outreach_attempt_count", 0)

    # ── Duplicate protection: skip if already sent this campaign ──
    if prospect.get("outreach_campaign_id") == campaign["id"] and prev_state == "SENT":
        log.warning(f"Prospect {pid} already sent campaign {campaign['id']} — skipping (duplicate protection)")
        return False

    # ── Suppression check ──
    suppressed, reason = is_suppressed(email)
    if suppressed:
        log.info(f"Prospect {pid} email {email} is suppressed ({reason}) — marking OPTED_OUT")
        supabase_patch("prospects", {
            "outreach_status": "OPTED_OUT",
            "email_opted_out_at": datetime.now(timezone.utc).isoformat(),
        }, params={"id": f"eq.{pid}"})
        log_state_change(pid, campaign["id"], prev_state, "OPTED_OUT", "suppression_check", error=reason)
        return False

    # ── Validate required fields ──
    if not prospect.get("review_slug"):
        log.warning(f"Prospect {pid} missing review_slug — marking FAILED_PERMANENT")
        supabase_patch("prospects", {
            "outreach_status": "FAILED_PERMANENT",
            "outreach_last_error": "MISSING_REVIEW_URL",
        }, params={"id": f"eq.{pid}"})
        log_state_change(pid, campaign["id"], prev_state, "FAILED_PERMANENT", "validation", error="MISSING_REVIEW_URL")
        return False

    if not email:
        log.warning(f"Prospect {pid} missing email — marking FAILED_PERMANENT")
        supabase_patch("prospects", {
            "outreach_status": "FAILED_PERMANENT",
            "outreach_last_error": "MISSING_EMAIL",
        }, params={"id": f"eq.{pid}"})
        log_state_change(pid, campaign["id"], prev_state, "FAILED_PERMANENT", "validation", error="MISSING_EMAIL")
        return False

    # ── Transition to SENDING ──
    supabase_patch("prospects", {
        "outreach_status": "SENDING",
        "outreach_campaign_id": campaign["id"],
        "outreach_attempt_count": attempt_count + 1,
    }, params={"id": f"eq.{pid}"})
    log_state_change(pid, campaign["id"], prev_state, "SENDING", "send_attempt")

    # ── Compile and send ──
    subject, body = compile_template(campaign["subject"], campaign["body_template"], prospect)
    review_url = f"{REVIEW_BASE_URL}/{prospect['review_slug']}"
    html_body = body_to_html(body, review_url)
    idempotency_key = f"{prospect['place_id']}_{campaign['id']}"

    result = send_email(email, subject, body, idempotency_key, html_body=html_body)

    if result["success"]:
        # ── SENT ──
        now_iso = datetime.now(timezone.utc).isoformat()
        supabase_patch("prospects", {
            "outreach_status": "SENT",
            "outreach_sent_at": now_iso,
            "outreach_provider_message_id": result["provider_message_id"],
            "outreach_last_error": None,
            "crm_status": "outreached",
            "contacted_at": now_iso,
        }, params={"id": f"eq.{pid}"})
        log_state_change(
            pid, campaign["id"], "SENDING", "SENT", "send_success",
            provider_response=result["provider_message_id"],
        )
        log.info(f"✓ Sent to {email} (prospect {pid}, message {result['provider_message_id']})")
        return True

    # ── Failed ──
    error_type = result["error_type"]
    error_msg = result["error_message"]

    if error_type in PERMANENT_ERRORS:
        new_state = "FAILED_PERMANENT"
        # Add to suppression list for hard bounces
        if error_type == "HARD_BOUNCE" or error_type == "INVALID_EMAIL":
            try:
                supabase_post("outreach_suppression", {
                    "email": email,
                    "reason": "hard_bounce" if error_type == "HARD_BOUNCE" else "manual_block",
                    "prospect_id": pid,
                })
            except Exception:
                pass  # Email may already be suppressed
    else:
        # Temporary failure — check retry limit
        max_attempts = cfg.get("max_retry_attempts", 3)
        if attempt_count + 1 >= max_attempts:
            new_state = "FAILED_PERMANENT"
        else:
            new_state = "FAILED_TEMPORARY"

    supabase_patch("prospects", {
        "outreach_status": new_state,
        "outreach_last_error": f"{error_type}: {error_msg}",
    }, params={"id": f"eq.{pid}"})
    log_state_change(
        pid, campaign["id"], "SENDING", new_state, "send_failure",
        provider_response=error_type, error=error_msg,
    )
    log.error(f"✗ Failed to send to {email} (prospect {pid}): {error_type} — {error_msg}")
    return True

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sorted Outreach Sender")
    parser.add_argument("--dry-run", action="store_true", help="Log without sending")
    parser.add_argument("--batch", type=int, default=1, help="Max emails to send this run")
    args = parser.parse_args()

    global DRY_RUN
    if args.dry_run:
        DRY_RUN = True
        log.info("DRY RUN mode — no emails will be sent")

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        log.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
        sys.exit(1)
    if not RESEND_API_KEY and not DRY_RUN:
        log.error("Missing RESEND_API_KEY")
        sys.exit(1)

    # ── Load config ──
    cfg = load_config()
    log.info(f"Mode: {cfg['mode']} | Daily limit: {cfg['daily_send_limit']} | "
             f"Window: {cfg['sending_window_start']}-{cfg['sending_window_end']} {cfg['sending_window_tz']}")

    # ── Check mode ──
    if cfg["mode"] == "PAUSED":
        log.info("Outreach is PAUSED — exiting")
        return
    if cfg["mode"] == "QUEUE_ONLY":
        log.info("Outreach is QUEUE_ONLY — prospects will be marked READY but not sent")
        return

    # ── Check sending window ──
    in_window, reason = is_within_sending_window(cfg)
    if not in_window:
        log.info(f"Outside sending window — {reason}")
        return

    # ── Check daily limit ──
    sent_today = get_today_send_count()
    remaining = cfg["daily_send_limit"] - sent_today
    if remaining <= 0:
        log.info(f"Daily limit reached ({sent_today}/{cfg['daily_send_limit']}) — exiting")
        return
    log.info(f"Sent today: {sent_today}/{cfg['daily_send_limit']} — {remaining} remaining")

    # ── Load campaign ──
    campaign = load_active_campaign()
    log.info(f"Active campaign: {campaign['id']} (v{campaign['version']})")

    # ── Process ──
    batch_size = min(args.batch, remaining)
    sent = 0
    for i in range(batch_size):
        try:
            did_send = process_one(campaign, cfg)
            if not did_send:
                break
            sent += 1
            # Spacing between sends (skip on last iteration)
            if i < batch_size - 1 and not DRY_RUN:
                spacing = cfg.get("send_spacing_minutes", 5)
                log.info(f"Waiting {spacing} minutes before next send...")
                time.sleep(spacing * 60)
        except Exception as e:
            log.error(f"Unexpected error processing prospect: {e}", exc_info=True)
            break

    log.info(f"Done — sent {sent} email(s) this run")

if __name__ == "__main__":
    main()
