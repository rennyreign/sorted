# Sorted Updates — Codex Handoff

## What This System Does

**Sorted Updates** is an AI-powered content management operator for client websites. A GB Halesowen admin logs into a portal, types a plain-English content change request (e.g. "change the hero subtitle to feel the difference"), and the system:

1. Parses the request using GPT
2. Plans which files to edit
3. Creates a GitHub branch on `rennyreign/gbhalesowen`
4. Writes the file edits to that branch via GPT-generated find/replace patches
5. Opens a draft PR
6. Netlify detects the branch and builds a deploy preview
7. Netlify fires a webhook back to the backend with the real deploy URL
8. The portal displays the preview URL so the admin can review it
9. The admin clicks "Publish" → backend merges the PR → Netlify deploys to production

---

## Repositories

| Repo | Purpose |
|------|---------|
| `rennyreign/sorted` | Backend Python API (Render) |
| `rennyreign/gbhalesowen` | Client website (Next.js, Netlify) |

---

## Infrastructure

| Service | URL / Ref |
|---------|-----------|
| Backend API (Render) | `https://sorted-fnl5.onrender.com` |
| Client website (Netlify) | `https://gbhalesowen-academy.netlify.app` |
| Supabase project | `https://qweevancxedkkfxysnzq.supabase.co` |
| GitHub repo edited | `rennyreign/gbhalesowen` |

### Render Environment Variables (all must be set in dashboard)
```
SORTED_UPDATES_ENABLE_NETWORK=1
SUPABASE_URL=https://qweevancxedkkfxysnzq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZWV2YW5jeGVka2tmeHlzbnpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMxMDMzMCwiZXhwIjoyMDk0ODg2MzMwfQ.8qpoEH-vaHT_lqeWOEBsTbfhDt2eGLdWfhJFPcHXVTI
GITHUB_TOKEN=<token with repo write access to rennyreign/gbhalesowen>
GITHUB_REPOSITORY=rennyreign/gbhalesowen
NETLIFY_SITE_ID=<gbhalesowen-academy site ID>
NETLIFY_TOKEN=<Netlify personal access token>
NETLIFY_SITE_NAME=gbhalesowen-academy
NETLIFY_WEBHOOK_SECRET=db8e547acf64363667ba1ba62437d94907989335
OPENAI_API_KEY=<OpenAI key>
```

---

## Key Files (sorted repo)

```
operators/sorted-updates/implementation/
├── api.py              — HTTP server, all endpoints
├── memory.py           — ConversationStore (Supabase-backed, file fallback)
├── models.py           — Pydantic models: ChangeRecord, ConversationMessage etc.
├── portal.py           — handle_portal_chat() — main chat handler
├── execution.py        — plan_change_execution() — decides preview vs escalate
├── providers.py        — GitHub + Netlify API wrappers
├── writer.py           — GPT-driven find/replace patch writer
├── netlify_webhook.py  — receives Netlify deploy events, updates ChangeRecord
├── approvals.py        — decide_change() — merges PR on approval
└── render.yaml         — Render deployment config
```

## Key File (gbhalesowen repo)

```
app/(portal)/sorted/page.tsx  — Portal chat UI
```

---

## Supabase Schema

Two tables created in `qweevancxedkkfxysnzq`:

```sql
sorted_messages (id, client_id, role, content, created_at, attachments, metadata)
sorted_changes  (change_id, client_id, request_id, status, summary,
                 created_at, updated_at, target_route, preview_url,
                 live_url, blocked_reasons, execution)
```

`execution` is a JSONB column containing `mode`, `preview_branch_plan` (with `branch_name`, `repo`, `pr_url`), and `notification_results`.

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/portal/chat` | Main chat — parses request, creates branch, saves ChangeRecord |
| GET | `/portal/change?client_id=&change_id=` | Fetch a single ChangeRecord (used by portal to poll for preview_url) |
| GET | `/portal/history?client_id=` | All messages + changes for a client |
| POST | `/portal/approval` | Approve or reject a change (merges PR on approval) |
| POST | `/netlify/webhook` | Netlify deploy event — updates ChangeRecord with real deploy URL |
| GET | `/health` | Health check |

---

## Current Problem: `/portal/change` returns `not found`

### What works
- ✅ `POST /portal/chat` creates a `ChangeRecord` and **writes it to Supabase** (confirmed via direct Supabase REST query)
- ✅ Supabase is reachable and the row is present with all correct fields
- ✅ `GET /portal/change` code path is correct in `api.py`
- ✅ `ConversationStore.get_change()` queries Supabase with correct filters

### What fails
- ❌ `GET /portal/change?client_id=gbhalesowen&change_id=chg_upd_xxx` returns `{"error": "not found"}`
- The row IS in Supabase — confirmed by querying Supabase directly

### Root cause diagnosis

There are two likely culprits, both need investigation:

**1. Pydantic `extra="forbid"` on `ChangeRecord`**

`ChangeRecord` in `models.py` previously had `extra="forbid"`. This was changed to `extra="ignore"` in the last commit (`e2611208`) but **Render may not have redeployed** with that change yet. When `model_validate()` receives a Supabase row with extra or mismatched fields, it raises a `ValidationError` which is caught and causes `get_change()` to return `None`.

**Fix to verify:** Confirm Render is running commit `e2611208` or later. Check the Render deploy log. If still on an older commit, trigger a manual deploy.

**2. Silent exception swallowing in `_supa_request`**

The `_supa_request` function in `memory.py` catches all exceptions and returns a dict. If `ChangeRecord.model_validate(rows[0])` raises inside `get_change()`, the exception propagates up to `api.py` which has no try/except around `store.get_change()`, so it would 500 — but the client sees `{"error": "not found"}` which suggests `get_change` is returning `None`, not raising.

**Most likely**: `model_validate` is failing on the Supabase row shape and returning `None` silently.

### Immediate fix to apply

In `api.py`, wrap the `get_change` call to expose the real error:

```python
if parsed.path == "/portal/change":
    query = parse_qs(parsed.query)
    client_id = query.get("client_id", [None])[0]
    change_id = query.get("change_id", [None])[0]
    if not client_id or not change_id:
        self._json_response(400, {"error": "missing client_id or change_id"})
        return
    from memory import ConversationStore
    store = ConversationStore()
    try:
        change = store.get_change(client_id, change_id)
    except Exception as exc:
        self._json_response(500, {"error": str(exc)})
        return
    if change is None:
        # Debug: return raw Supabase row to see what's actually there
        from memory import _supa_request
        raw = _supa_request("GET", "/sorted_changes",
                            params=f"change_id=eq.{change_id}&client_id=eq.{client_id}&limit=1")
        self._json_response(404, {"error": "change not found", "raw_supabase": raw})
        return
    self._json_response(200, change.model_dump(mode="json"))
    return
```

This will expose exactly what Supabase is returning and why `model_validate` is failing.

---

## Secondary Problem: Netlify Webhook Branch Lookup

`netlify_webhook.py`'s `find_change_by_branch()` still uses **file-based scanning** (lines 33–49). It iterates filesystem directories even though state is now in Supabase. This means Netlify webhook events will **never match** a change, so `preview_url` will never be updated.

### Fix required

Replace `find_change_by_branch()` in `netlify_webhook.py` with a Supabase query:

```python
def find_change_by_branch(branch_name: str, store: ConversationStore) -> tuple[str, ChangeRecord] | None:
    from memory import _supa_request
    rows = _supa_request(
        "GET", "/sorted_changes",
        params=f"execution->>preview_branch_plan->>branch_name=eq.{branch_name}&limit=1"
    )
    # NOTE: PostgREST JSONB nested queries use -> and ->> operators
    # The above syntax may need adjustment — see PostgREST docs for nested JSON filtering
    # Alternative: fetch all changes for known clients and filter in Python
    if isinstance(rows, list) and rows:
        r = rows[0]
        return r["client_id"], ChangeRecord.model_validate(r)
    return None
```

PostgREST JSONB path filtering syntax for nested keys:
```
?execution->preview_branch_plan->>branch_name=eq.sorted-updates/gbhalesowen/upd_xxx
```

---

## Portal UI Flow

`app/(portal)/sorted/page.tsx`:

1. User types → `doSend()` fires
2. Immediate "On it..." ack message shown
3. `POST /portal/chat` called
4. Response replaces ack message, includes `change_id`
5. If no `preview_url` in response, portal polls `GET /portal/change` every 8s for up to 3 min
6. When `preview_url` is populated (by Netlify webhook), portal updates the message with a clickable link
7. Publish button → `POST /portal/approval` → merges GitHub PR

---

## What Codex Should Do Next (Priority Order)

1. **Confirm Render is on latest commit** (`e2611208`) — check deploy logs
2. **Add debug logging to `/portal/change`** as shown above to expose raw Supabase response
3. **Fix `find_change_by_branch`** in `netlify_webhook.py` to query Supabase instead of filesystem
4. **Set up Netlify webhook** in Netlify dashboard: `https://sorted-fnl5.onrender.com/netlify/webhook` for `Deploy succeeded` and `Deploy failed` events on the `gbhalesowen-academy` site
5. **End-to-end test**: send a change via portal → verify `/portal/change` returns the record → wait for Netlify build → verify webhook updates `preview_url` → verify portal shows clickable link
