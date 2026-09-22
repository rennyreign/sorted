# Sorted Identity Email Templates

Branded replacements for the four Netlify Identity transactional emails. Paste each file's
contents into the matching template slot in the Netlify dashboard. The templates reference
`{{ .SiteURL }}/cms/sorted-logo.png`, so install `public/cms/sorted-logo.png` with the Studio
assets before applying them:

**Site → Identity → Emails → [Invitation / Confirmation / Password recovery / Email change]**

| File | Netlify template | Token it carries |
|---|---|---|
| `invitation.html` | Invitation | `#invite_token` |
| `confirmation.html` | Confirmation | `#confirmation_token` |
| `recovery.html` | Password recovery | `#recovery_token` |
| `email-change.html` | Email change | `#email_change_token` |

## Why the links point at `/cms/`

Every template builds its action URL as `{{ .SiteURL }}/cms/#<type>_token={{ .Token }}`
instead of the default `{{ .ConfirmationURL }}` (site root). The Studio calls
`netlifyIdentity.init()` on `/cms/`, so the invitee lands directly in the CMS, the widget
consumes the token, and the "complete signup / reset" modal opens — no dead landing on the
homepage.

The root layout token redirect (required by `add-decap-cms.md` Step 9) is the safety net:
it catches any token that still lands on a non-`/cms/` path and forwards it to `/cms/`.

## Transport note

Netlify Identity sends these emails through its own mailer — custom SMTP (Resend, Postmark,
etc.) is **not supported** for auth emails. Branding is applied through these templates, not
the transport. If fully-branded sending is ever required, it needs an invite function that
calls the Identity admin API to generate the token and sends via Resend — treat that as a
separate enhancement, not part of the standard install.

## Variables available

`{{ .SiteURL }}`, `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Data }}`.
Keep links built from `.SiteURL` + `.Token` so they work on any site the templates are pasted into.
