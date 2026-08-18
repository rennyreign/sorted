# Launch

Launch follows payment, approved content, completed Stage 2 CMS work, and a passing Launch QA report.

## Launch Protocol

1. Work on a feature branch. Never push active development directly to `main`.
2. Confirm `npm run build` passes clean.
3. Review the branch deploy preview, not production.
4. Run Launch QA against the deploy preview or final staging URL.
5. Resolve every blocking issue and rerun Launch QA.
6. Merge intentionally into `main` only after the site is launch-ready.
7. Confirm the production deploy and canonical domain.
8. Create the baseline recovery point.
9. Complete client handoff.

## Handoff

- Configure Netlify Identity as Invite Only and enable Git Gateway.
- Invite the client and verify CMS login at `/cms/`.
- Add the walkthrough tutorial URL.
- Record the handoff SHA and date in site content.
- Commit `scripts/reset.sh`.
- Tag the approved launch state as `baseline-v1` or `baseline/<client-slug>`.
- Record domain, CMS access model, analytics property, form destination, and integrations in the handoff notes.

The client can update content but not design, code, repository access, Netlify settings, or CMS users. Sorted retains the infrastructure and factory reset capability.

## Release Discipline

Develop on a feature branch, review the deploy preview, and merge intentionally. Do not push active work directly to `main`, which can trigger unnecessary paid builds on client Netlify sites.

`main` is production release territory. The feature branch is where iteration happens.

Source: `doctrine/client-onboarding.md`, `doctrine/factory-reset.md`, `doctrine/cascade-deployment-discipline.md`, `operators/skills/launch-qa.md`.
