# Launch

Launch follows payment and completion of the delivery checklist.

## Handoff

- Configure Netlify Identity as Invite Only and enable Git Gateway.
- Invite the client and verify CMS login at `/cms/`.
- Add the walkthrough tutorial URL.
- Record the handoff SHA and date in site content.
- Commit `scripts/reset.sh` and tag the handoff commit as `handoff/<client-slug>`.

The client can update content but not design, code, repository access, Netlify settings, or CMS users. Sorted retains the infrastructure and factory reset capability.

## Release Discipline

Develop on a feature branch, review the deploy preview, and merge intentionally. Do not push active work directly to `main`, which can trigger unnecessary paid builds on client Netlify sites.

Source: `doctrine/client-onboarding.md`, `doctrine/factory-reset.md`, `doctrine/cascade-deployment-discipline.md`.
