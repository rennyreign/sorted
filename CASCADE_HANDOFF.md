# Cascade Handoff — Sorted Updates Preview URL Flow

## Current Goal

Get the Sorted portal preview flow working end to end:

1. User submits a content change in the portal.
2. Backend creates a GitHub preview branch in `rennyreign/gbhalesowen`.
3. Netlify builds the branch deploy.
4. Backend stores the real Netlify deploy URL in Supabase `sorted_changes.preview_url`.
5. Portal polling changes `Building preview...` into a real preview link.
6. User can publish only after a preview URL exists.

## Repos

- Backend/operator repo: `rennyreign/sorted`
- Client site repo being edited: `rennyreign/gbhalesowen`
- Backend live URL: `https://sorted-fnl5.onrender.com`
- Portal/API frontend is in the `sorted` repo.

## Backend Commits Pushed

These commits were pushed to `rennyreign/sorted/main`:

- `3d602451 fix(sorted-updates): persist preview deploy URLs`
- `32e9128e fix(sorted-updates): match deploy webhooks by recent changes`
- `248299f5 fix(sorted-updates): hydrate preview URL during polling`

Render was reported as auto-deployed after `248299f5`.

## Backend Files Changed

Main implementation files:

- `operators/sorted-updates/implementation/api.py`
- `operators/sorted-updates/implementation/approvals.py`
- `operators/sorted-updates/implementation/memory.py`
- `operators/sorted-updates/implementation/netlify_webhook.py`

Tests updated/added:

- `operators/sorted-updates/implementation/tests/test_api.py`
- `operators/sorted-updates/implementation/tests/test_execution.py`
- `operators/sorted-updates/implementation/tests/test_parser.py`
- `operators/sorted-updates/implementation/tests/test_portal.py`
- `operators/sorted-updates/implementation/tests/test_preview.py`
- `operators/sorted-updates/implementation/tests/test_providers_reset_approvals.py`

Local backend test suite passed:

```bash
cd operators/sorted-updates/implementation
.venv/bin/python -m pytest tests
```

Latest result: `40 passed`.

## What Was Fixed

### 1. Supabase row validation

Problem:

- `/portal/history?client_id=gbhalesowen` was returning 500.
- Render logs showed `ConversationMessage.model_validate(r)` failing because Supabase rows include table fields like `client_id`, while `ConversationMessage` has `extra="forbid"`.

Fix:

- `memory.py` now has `conversation_message_from_row(row)` that filters Supabase rows down to model fields.
- `ChangeRecord` rows also go through `change_record_from_row(row)` to normalize nullable JSON columns.

Live verification:

- `https://sorted-fnl5.onrender.com/portal/history?client_id=gbhalesowen` now returns JSON.

### 2. Netlify webhook branch matching

Problem:

- Netlify branch deploys were succeeding, but `preview_url` stayed `null`.
- Existing `find_change_by_branch()` originally scanned local files, not Supabase.

Fix:

- `netlify_webhook.py` now:
  - Tries a Supabase JSONB query for `execution.preview_branch_plan.branch_name`.
  - Falls back to fetching the most recent 100 Supabase changes and matching the branch in Python.
  - Logs webhook outcomes to Render:

```text
netlify_webhook: {'status': 'updated', ...}
netlify_webhook: {'status': 'no_match', ...}
netlify_webhook: {'status': 'ignored', ...}
```

### 3. Polling fallback for preview URL

Problem:

- If the Netlify webhook misses or fails, portal polling could stay stuck on `Building preview...`.

Fix:

- `api.py` now hydrates `preview_url` during `GET /portal/change`.
- If a `ChangeRecord` has no `preview_url`, backend reads the branch name from:

```python
change.execution["preview_branch_plan"]["branch_name"]
```

- It then calls:

```python
get_netlify_deploy_url_for_branch(branch_name)
```

- If Netlify has a ready deploy for that branch, backend saves it to Supabase and returns the updated change.

Relevant endpoint:

```text
GET https://sorted-fnl5.onrender.com/portal/change?client_id=gbhalesowen&change_id=<change_id>
```

### 4. Approval guardrail

Problem:

- Portal could click `Publish` while preview was still building.
- Backend accepted approval before any preview URL existed.

Fix:

- `approvals.py` now blocks `approve` when a preview is required but `preview_url` is empty.
- API response:

```json
{
  "status": "blocked",
  "message": "Preview is still building. Review the preview link before publishing."
}
```

Frontend should still disable/hide `Publish` until `preview_url` exists, but backend now enforces this.

## Current Known State

Latest live history showed new changes were being created correctly, with branches like:

```text
sorted-updates/gbhalesowen/upd_portal_1779366100850-copy_update
```

The branch write path worked:

```json
"writer_result": {
  "status": "edits_written",
  "files": [
    {
      "file": "app/(site)/page.tsx",
      "status": "committed"
    }
  ]
}
```

Before the latest polling fallback, `preview_url` remained `null`. After commit `248299f5` is live, the next portal poll should be able to populate it from the Netlify API if the branch deploy is ready.

## What Cascade Should Do Next

### A. Run a fresh end-to-end portal test

In the Sorted portal, submit a fresh simple request:

```text
On the homepage, change "Build confidence" to "Build strength"
```

Expected:

- Portal shows `Building preview...`.
- Backend creates a new `ChangeRecord`.
- GitHub branch appears in `rennyreign/gbhalesowen`.
- Netlify branch deploy succeeds.
- Portal changes to a real preview link.

### B. If it stays stuck

Check backend state:

```bash
curl -sS 'https://sorted-fnl5.onrender.com/portal/history?client_id=gbhalesowen'
```

Find the newest change:

- `change_id`
- `execution.preview_branch_plan.branch_name`
- `preview_url`

Then check the single change endpoint:

```bash
curl -sS 'https://sorted-fnl5.onrender.com/portal/change?client_id=gbhalesowen&change_id=<change_id>'
```

Because of the new polling fallback, this endpoint should attempt to hydrate `preview_url` from Netlify.

### C. Check Render logs

Look for:

```text
netlify_webhook:
```

Interpretation:

- `updated`: webhook matched and saved preview data.
- `no_match`: webhook fired, but branch matching failed.
- `ignored`: webhook payload did not contain a branch or had a state other than `ready` / `error`.
- No log at all: Netlify webhook is not reaching Render.

### D. Check Netlify deploy notification config

Netlify already has outgoing webhooks for:

- Deploy succeeded
- Deploy failed

Both point to:

```text
https://sorted-fnl5.onrender.com/netlify/webhook
```

Netlify UI has a `JWS secret token` set. The backend currently checks `X-Netlify-Signature`, but Netlify docs say deploy notifications send JWS in:

```text
X-Webhook-Signature
```

Important:

- If `NETLIFY_WEBHOOK_SECRET` is unset in Render, backend skips signature verification, so this mismatch should not block webhook handling.
- If `NETLIFY_WEBHOOK_SECRET` is later added to Render, signature verification will likely need to be rewritten for Netlify JWS instead of HMAC.

## Useful Live URLs

Health:

```text
https://sorted-fnl5.onrender.com/health
```

History:

```text
https://sorted-fnl5.onrender.com/portal/history?client_id=gbhalesowen
```

Single change:

```text
https://sorted-fnl5.onrender.com/portal/change?client_id=gbhalesowen&change_id=<change_id>
```

Netlify webhook:

```text
https://sorted-fnl5.onrender.com/netlify/webhook
```

## Frontend Notes

The portal should:

- Store/use `change.change_id` from `/portal/chat`.
- Poll `/portal/change?client_id=gbhalesowen&change_id=<change_id>`.
- Keep preview button disabled while `preview_url` is missing.
- Only enable `Publish` once `preview_url` exists.
- If approval returns `status: "blocked"`, show the message and keep polling.

The backend now enforces the same rule, so a premature publish should not mark the change as approved anymore.

## Dirty Working Tree Note

At the time this handoff was created, unrelated local files existed in the repo, including `.DS_Store`, `HANDOFF.md`, mockups, proposals, and image assets. Those were intentionally not committed by Codex. The backend commits listed above were scoped to `operators/sorted-updates/implementation`.

