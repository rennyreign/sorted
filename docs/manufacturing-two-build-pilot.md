# Two-Build Manufacturing Pilot

This is the first prospective test of the updated pipeline, not proof of five websites per day. Do not start real builds until Renaldo supplies/selects the two packs and confirms their scope.

## Fixed Protocol

1. Use two new, complete ChatGPT export packs: approved mockup, reconstructed images and design-IR. Prefer one trade and one professional-service/booking-led client. Preserve originals and hashes.
2. Record current factory/skills revision, tools, model, runtime and dependency versions. Use the same setup for both. Run sequentially for this first pilot; do not change models or concurrency halfway through.
3. Validate intake before scaffolding. Missing fonts/assets or material mockup/manifest conflicts stop the relevant boundary; record the question and resolution time.
4. Build homepage plus explicitly advertised review routes. Do not install CMS, deploy, publish advertising, send emails or exercise real payments/bookings.
5. Run structural/browser checks, independent visual diagnosis, consolidated corrections and fresh QA. Keep reference-width and mobile evidence, and document intentional safety departures.
6. Preserve UI systemisation/design extraction/core QA and later lifecycle gates. Obtain human assessment separately. Workspace follows the approved commercial/creative brief; absent human decisions remain blocked, not guessed.
7. Report both jobs individually and together: scope, first visual result, material defects, correction attempts/minutes, known human time, recorded service time, unknowns, billed/estimated costs separately and accepted milestone.

## Evidence And Timing

Use the append-only job ledger; do not estimate API costs from a model's name or convert unknown human time to zero.

```bash
node scripts/manufacturing-ledger.mjs start <job-dir> --phase frontend-build --tool devin-cli --model <actual-model>
```

Record the returned attempt ID. Start the factory stage before implementing it. After the work, record actual time spent actively supervising/reviewing, not the entire elapsed machine duration:

```bash
node scripts/manufacturing-ledger.mjs finish <job-dir> --attempt <id> --result passed --evidence artifacts/frontend-build.json --human-minutes <known-minutes>
```

Only include `--billed-cost-usd` when actual billed usage is known. Estimates use `--estimated-cost-usd`; they are never included in billed totals. Record failed/interrupted work with `--result failed|interrupted --reason "<cause>"`. Keep defect correction separate from a new user-requested scope/design change using `--correction-origin`.

Record acceptance only after actual current-revision checks:

```bash
node scripts/manufacturing-ledger.mjs accept <job-dir> --kind stage1 --by <independent-reviewer>
node scripts/manufacturing-ledger.mjs summary <job-dir>
```

`stage1`, `workspace` and `launch` are separate milestones. The ledger checks factory state/evidence and excludes old source/input acceptances. Summed attempt durations are service time, not end-to-end wall time; note the actual start/acceptance timestamps and any human/input waiting separately.

## Acceptance

- No broken required routes/assets/anchors, unusable navigation/dialogs, hidden-content overflow, wrong-client payment destinations or fabricated working integration states.
- Independent reviewer finds no unresolved material geometry/font/crop/component/copy mismatch against the approved mockup. Approved accessibility/safety departures are recorded and not counted as defects.
- Desktop/reference and 768/375/320px evidence exists, with keyboard and reduced-motion checks. Functional pass alone cannot waive visual QA.
- Human/client approval is explicitly recorded for its revision, not inferred from agent confidence.
- A review-route placeholder is not a completed internal page; Stage 1 acceptance is not launch readiness.
- Workspace acceptance additionally requires approved client-specific offer/payment choice, supplied creative/email provenance, honest proposed/connected states and a built-site screenshot.

## Comparison Limits

Existing historical builds are not a controlled baseline: their inputs, scope, logging and models vary. Report the two new jobs' actual performance and recurring friction, without claiming a percentage speed improvement from incomparable timestamps.

If both pass, use the measured bottlenecks to choose the next experiment: intake/context refinement, reusable interaction improvement or two-job concurrency. Change one variable at a time. Do not lower the acceptance bar to achieve the daily target.
