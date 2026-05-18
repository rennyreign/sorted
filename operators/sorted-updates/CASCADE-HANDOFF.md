# Sorted Updates Cascade Handoff

## Repos Touched

- Platform repo: `/Users/renaldoedmondson/Projects/sorted`
- Client repo: `/Users/renaldoedmondson/Projects/gbhalesowen`

## Pushed Commits

- Sorted platform: `7401cc7e Build Sorted Updates platform scaffold`
- GB Halesowen: `e88600c Add Sorted Updates portal`
- GB Halesowen tag: `sorted-handoff` pointing to `e88600c`

## Current Backend Location

The Python backend already exists in the Sorted platform repo.

```bash
/Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation
```

Backend entrypoint:

```bash
/Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation/api.py
```

Run locally:

```bash
cd /Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation
./.venv/bin/python api.py
```

Local backend URL:

```txt
http://127.0.0.1:8787
```

## Backend Endpoints

- `GET /health`
- `POST /portal/chat`
- `GET /portal/history?client_id=gbhalesowen`
- `POST /portal/approval`
- `POST /portal/reset`

## Platform Backend Modules Added

- `portal.py`: portal chat orchestration.
- `memory.py`: local JSON conversation/change store.
- `execution.py`: decides auto-apply vs preview vs clarify vs escalate.
- `providers.py`: no-network stubs for GitHub, Netlify, notifications.
- `master.py`: escalation queue.
- `reset.py`: `sorted-handoff` reset planning.
- `approvals.py`: preview approve/reject flow.
- `assets.py`: upload/crop planning.
- `provisioning.py`: client onboarding plan.

## Validation Commands

Platform backend tests:

```bash
cd /Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation
./.venv/bin/python -m pytest tests
```

Last result:

```txt
35 passed
```

Sorted platform build:

```bash
cd /Users/renaldoedmondson/Projects/sorted
npm run build
```

GB Halesowen build:

```bash
cd /Users/renaldoedmondson/Projects/gbhalesowen
npm run build
```

Both builds passed.

## GB Halesowen Portal

Added static routes:

- `/sorted`
- `/sorted/chat`
- `/sorted/history`
- `/sorted/preview`
- `/sorted/reset`

Files:

```txt
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/page.tsx
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/chat/page.tsx
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/history/page.tsx
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/preview/page.tsx
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/reset/page.tsx
/Users/renaldoedmondson/Projects/gbhalesowen/app/sorted/portalClient.ts
```

## Important Env

GB Halesowen currently has a placeholder backend URL in:

```txt
/Users/renaldoedmondson/Projects/gbhalesowen/netlify.toml
```

Current value:

```toml
NEXT_PUBLIC_SORTED_UPDATES_API_URL = "https://sorted-updates-api.example.com"
```

For local testing, use:

```env
NEXT_PUBLIC_SORTED_UPDATES_API_URL=http://127.0.0.1:8787
```

For production, replace this with the deployed Python backend URL.

## Operator Config

GB operator config was corrected for the real active GB repo layout.

File:

```txt
/Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation/clients/gbhalesowen/operator.json
```

Current relevant values:

```json
{
  "site_route": "",
  "site_paths": {
    "app_root": "app",
    "components": "app/components",
    "public_assets": "public",
    "client_context": "client"
  }
}
```

## What Is Not Done Yet

- Production deployment scaffold for the Python backend.
- CORS support for browser calls from `graciebarrahalesowen.com`.
- Real Supabase Auth/memory.
- Real GitHub branch/commit/PR execution.
- Real Netlify preview lookup/deploy trigger.
- Real Resend/Meta WhatsApp notifications.
- Real LLM classifier.
- Real asset upload/crop execution.

## Recommended Next Step

Create a deployable backend package for Render or Railway from:

```txt
/Users/renaldoedmondson/Projects/sorted/operators/sorted-updates/implementation
```

Needed:

- CORS handling in `api.py`.
- `render.yaml` or `Procfile`.
- Production env docs.
- Real hosted URL wired into GB Halesowen Netlify env.

## Local Git State Notes

GB Halesowen still has unrelated untracked files:

```txt
redirect-brief-for-web-designer.md
redirect-brief-simple.md
```

Sorted platform still has unrelated local untracked mockup/assets and `.DS_Store`. These were intentionally left untouched.
