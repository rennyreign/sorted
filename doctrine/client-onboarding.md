# Client Onboarding — Sorted Delivery Standard

Every Sorted site is handed off using the same access model. This document defines the standard process for giving clients CMS access securely.

---

## Access Model

**Netlify Identity — Invite Only.**

- Registration is locked. Nobody can self-sign-up.
- Sorted controls who has access via email invitations.
- The client receives a private invitation link, sets their own password, and logs in.
- Sorted retains admin access via the Netlify account at all times.

---

## Handoff Checklist

### 1. Lock registration
Netlify dashboard → **Site → Identity → Registration preferences** → set to **Invite only**.

Do this before sending the client anything. Never leave a site on Open registration.

### 2. Enable Git Gateway
Netlify dashboard → **Site → Identity → Services → Git Gateway** → Enable.

Required for the CMS to commit content changes to GitHub.

### 3. Invite the client
Netlify dashboard → **Site → Identity → Invite users** → enter client email.

Client receives an email with a magic link. They click it, set a password, and are in.

### 4. Send the client their CMS URL
Format: `https://[site-name].netlify.app/cms/`

Include in the handoff message alongside the tutorial video link.

### 5. Confirm they can log in
Ask the client to confirm they can access the CMS before closing the delivery.

---

## Adding Additional Users

If a client wants to give CMS access to a team member:

1. Client contacts Sorted
2. Sorted invites the new user via Netlify Identity
3. New user receives invite email, sets password, logs in

Clients cannot invite users themselves. Sorted controls the access list.

This is intentional — it keeps Sorted in the loop on who has edit access to the site.

---

## Roles (Multi-user sites)

For sites with multiple users at different permission levels, Netlify Identity supports roles.

Tag users in Netlify Identity with a role (e.g. `editor`, `admin`). Then restrict CMS collections in `config.yml`:

```yaml
collections:
  - name: "site"
    label: "⚙️ Site Settings"
    role: admin
```

Standard single-client Sorted sites do not use roles. Apply only when a client has a team with differentiated access needs.

---

## What the Client Can Do

| Action | Client |
|---|---|
| Edit text content | ✅ |
| Update images | ✅ |
| Publish changes (triggers deploy) | ✅ |
| View tutorial video in CMS | ✅ |
| Access Site Settings (handoff SHA etc.) | ✅ |
| Change site design or code | ❌ |
| Invite new CMS users | ❌ |
| Access Netlify dashboard | ❌ |
| Access GitHub repo | ❌ |

---

## What Sorted Retains

- Full Netlify account access (can revoke CMS access at any time)
- GitHub repo ownership
- Factory reset capability via `scripts/reset.sh`
- Ability to push design and structural updates via git

---

## Handoff Message Template

> Hi [Client name],
>
> Your site is live at [URL].
>
> You can update your content any time at [URL]/cms/ — log in with the email you'll receive shortly.
>
> Watch the short walkthrough inside the CMS to see how to make changes. Everything publishes automatically when you hit Save.
>
> If you ever want to reset your content back to the original build, just let us know.
>
> — Sorted

---

## Doctrine Alignment

The client owns the content layer. Sorted owns the design layer, the infrastructure, and the reset key.

Access control enforces this boundary at the product level — not through trust or policy, but through architecture.
