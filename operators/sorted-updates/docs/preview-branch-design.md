# Netlify Preview Branch Design

This document defines the first Level 2 preview workflow for Sorted Updates. It is design-only for now. The current build remains dry-run and local auto-reply only.

Current implementation note: `implementation/preview.py` now creates a safe preview branch plan from an approved `DryRunPlan`. It validates target paths and returns deterministic branch/PR metadata, but it does not call GitHub.

## Goal

When a Client Website Operator receives an approved update request, Sorted Updates should be able to create a GitHub branch, open a pull request, let Netlify produce a preview, then reply in WhatsApp with the preview link.

GB Halesowen stays inside `rennyreign/sorted` for this first path.

## Trigger

Preview branch automation can run only when all are true:

- dry-run plan status is `dry_run_ready`
- `approval_required` is `false`
- every target file is inside the client operator's allowed paths
- request type is in the client operator's allowed update menu
- the inbound `message_id` has not already produced a preview branch

Approval-gated, unsupported, or clarification-required requests must not create branches.

## Branch Naming

Use deterministic branch names so duplicate requests do not create noisy branches:

```txt
sorted-updates/{client_id}/{request_id}-{request_type}
```

Example:

```txt
sorted-updates/gbhalesowen/upd_wamid_example_beginners_001-predefined_page_addition
```

If a branch already exists for the same request id, return the existing branch/PR state instead of creating a second branch.

## Commit Scope

The preview worker may only write files listed in the dry-run plan target files and approved generated support files.

For GB Halesowen, allowed roots are:

```txt
app/gbhalesowen
app/gbhalesowen/components
public/gbhalesowen
client/gbhalesowen
```

Never write:

- `.env`
- secrets
- package manager files unless the approved update requires a reviewed dependency change
- unrelated app routes
- unrelated client folders

## PR Shape

Title format:

```txt
Sorted Updates: {client_id} {request_type}
```

Body template:

```md
## Sorted Updates Preview

Client: {client_id}
Operator: {operator_id}
Request: {raw_message}
Status: preview branch

### Dry-run summary
{summary}

### Target files
{target_files}

### Safety notes
{blocked_reasons_or_none}

### Owner approval
Pending Renaldo review.
```

## Netlify Preview URL

Preferred source:

1. GitHub PR checks/statuses emitted by Netlify.
2. Netlify API lookup by site id and deploy id if check metadata is insufficient.
3. Manual Netlify dashboard lookup as fallback during prototype.

Do not block the WhatsApp acknowledgement on the preview URL. Send a first reply when the preview branch starts, then a second reply once the preview URL is available.

## WhatsApp Reply Flow

Initial allowed request reply:

```txt
Sorted - I can prepare that as a preview first.
```

Preview branch started reply:

```txt
Preview is being prepared now. I'll send the Netlify link when it is ready.
```

Preview ready reply:

```txt
Preview ready: {preview_url}
```

Approval-gated reply:

```txt
I can prepare this as a preview, but it needs manual approval before anything changes.
```

## Approval Policy

Renaldo approves:

- pricing
- legal or policy content
- payment and checkout changes
- integrations
- brand identity changes
- page deletion

Open decision: approval can happen by WhatsApp reply, GitHub PR review, or both. Until decided, PR automation should mark gated changes as blocked and wait.

## GitHub PAT Requirements

Use a fine-scoped PAT stored only in local `.env` or deployment secrets.

Minimum intended capabilities:

- read repository contents
- create branches
- write commits to preview branches
- open pull requests
- read pull request checks/statuses

Do not print or persist the token.

## No-Op And Rollback

Duplicate inbound `message_id`:

- do not create another branch
- return existing reply/preview state

Failed generation:

- leave the branch unmerged
- reply with a manual-review message
- record the failure against the request id

Rollback:

- close the PR or abandon the preview branch
- never force-push or delete branches automatically in the first implementation

## First Implementation Slice

Build after the HTTP intake and Meta adapter are stable:

1. Generate a branch plan from `DryRunPlan`.
2. Validate every target file against client allowed paths.
3. Create a dry-run PR body only.
4. Add GitHub branch/PR mutation behind an explicit env flag.
5. Read Netlify preview URL from PR checks/statuses.
