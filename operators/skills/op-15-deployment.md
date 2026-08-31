# Skill: op-15-deployment

**Operator:** 15 — Deployment
**Execution:** harness
**Trigger:** `deployment` is the next pending operator (after launch-qa passes)
**Input:** the site repo (launch-qa passed)
**Output:** `artifacts/deployment.json`

---

## What you do

Ship the validated website. Follow Sorted deployment discipline. Do not bypass existing branch/review/deployment doctrine.

## How to execute

### Step 1: Confirm launch-qa passed

Verify that `launch-qa` is marked as `passed` in build state. If it failed, do not deploy.

### Step 2: Prepare the production release

- Ensure all changes are committed
- Ensure the branch is correct (main or production branch per the repo's doctrine)
- Ensure the build passes one final time:

```bash
cd <build-dir>/site
npm run build
```

### Step 3: Deploy

Follow the site's deployment method. For Netlify:

```bash
# Option A: Netlify CLI
netlify deploy --prod --dir=.next

# Option B: Git push (if Netlify is connected to the repo)
git push origin main
```

For other platforms, follow the platform-specific deployment process.

### Step 4: Verify production availability

- Wait for deployment to complete
- Visit the production URL
- Verify the site loads
- Verify key pages are accessible
- Verify the CMS is accessible at `/cms/`
- Verify analytics events fire on production

### Step 5: Record the deployment

- Record the deployment URL
- Record the commit SHA
- Record the deployment platform
- Record whether production was verified

### Step 6: Write deployment.json

```json
{
  "deployment_url": "https://example.com",
  "deployment_commit": "abc123def456",
  "deployment_platform": "netlify",
  "deployed_at": "<ISO timestamp>",
  "production_verified": true
}
```

### Step 7: Mark the manufacturing job complete

Mark `deployment` as passed in build state. This is the final operator. The manufacturing job is complete.

Update build state with:
- `deployment_url`
- `deployment_commit`
- `site_repo_path`

### Step 8: Report

Report the completion:

```
Manufacturing complete — <client-slug>
  Build ID: <build-id>
  Deployed: <deployment-url>
  Commit: <commit-sha>
  Operators: 16/16 passed
  Build duration: <time>
```

## Validation

- `deployment.json` exists and is valid JSON
- `deployment_url` is accessible
- `production_verified` is true
- `deployment_commit` is recorded

## Failure states

- Build fails before deploy → fix, rebuild
- Deployment fails → check Netlify/platform logs, retry
- Production site doesn't load → check DNS, check build output, retry
- CMS not accessible → check CMS files are in the build output
- Analytics not firing → check GTM container is published

## Notes

- Do not bypass existing branch/review/deployment doctrine
- Do not force-push
- If the site uses Netlify, ensure the deploy settings are correct (build command, publish directory)
- The manufacturing job is not complete until production is verified
