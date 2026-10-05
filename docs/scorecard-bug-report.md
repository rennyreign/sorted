# Scorecard Dashboard — Bug Report (Re-verification Pass 4)

**Scope:** Scorecard dashboard, scorecard RPCs, snapshot persistence, and GA4 sync.
**Method:** Static review, `tsc --noEmit`, `next build`, and end-to-end Postgres 16 tests using the current migration/function text.

## Summary

The frontend and most scorecard aggregation fixes are working. The snapshot pipeline is **still not deployable** in the current repository.

## 🔴 Bug 1 — Snapshot migrations claimed by the report are missing

The current repository contains only these scorecard migrations:

```text
20260824000000_scorecard_tables.sql
20260824010000_scorecard_rpcs.sql
20260824020000_scorecard_bugfixes.sql
```

The previously referenced migrations are absent:

```text
20260824030000_snapshot_nullable.sql
20260824040000_snapshot_skip_nonnumeric.sql
```

The base table still defines:

```sql
metric_value NUMERIC NOT NULL DEFAULT 0
```

Therefore the NULL-metric fix is not present in the repository or reproducible through migrations. Metrics such as `cac`, `cpl`, and `roas` legitimately return `NULL`, so snapshot insertion can still fail with a NOT NULL violation unless the remote database was changed manually.

## 🔴 Bug 2 — `pipeline_distribution` still crashes snapshot persistence

**File:** `supabase/migrations/20260824020000_scorecard_bugfixes.sql`

`operator_get_scorecard` emits:

```sql
'pipeline_distribution', jsonb_build_object(
  'value', v_pipeline_dist,
  'source', 'supabase'
)
```

`v_pipeline_dist` is a JSONB object, for example:

```json
{"new": 1, "responded": 1, "mockup_revealed": 1}
```

But `operator_save_scorecard_snapshot` casts every metric value to numeric:

```sql
(value->>'value')::NUMERIC
```

### Reproduced result

With real scorecard output and active prospects:

```text
ERROR: invalid input syntax for type numeric:
"{\"new\": 1, \"responded\": 1, \"mockup_revealed\": 1}"
```

The snapshot transaction rolls back and saves zero rows.

### Recommended fix

Add a numeric-type filter:

```sql
WHERE jsonb_typeof(value) = 'object'
  AND value ? 'value'
  AND jsonb_typeof(value->'value') = 'number'
```

This skips `pipeline_distribution`, which has no scalar `metric_value`.

## 🟡 Bug 3 — GA4 sync still swallows scorecard-fetch failures

**File:** `operators/ga4-sync/sync.js`

The snapshot fetch failure path still returns successfully:

```js
if (!snapshotResp.ok) {
  const text = await snapshotResp.text()
  console.error(`Failed to get scorecard: ${snapshotResp.status} ${text}`)
  return
}
```

The GA4 upsert and snapshot-save failure paths throw, but this path does not. If `operator_get_scorecard` fails, the GitHub Action can still exit successfully without saving a snapshot.

**Recommended fix:** replace `console.error(...)` and `return` with `throw new Error(...)`.

## Verified fixed

- Organic CRM leads are no longer substituted for GA4 leads.
- FY27 week calculations use numeric division.
- Prospects and mockup targets are separate.
- Cost metrics correctly use `lower_is_better`.
- `mockups_sent` has previous-week data.
- Deal values can be explicitly zeroed.
- Redundant mockup count query was removed.
- Funnel label is now `Responses`.
- Paid acquisition correctly displays genuine £0 spend.
- Snapshot-save HTTP failures now throw.

## Test results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npx next build` | PASS |
| `operator_get_scorecard` with empty data | PASS |
| Snapshot with NULL scalar metric against current migrations | FAIL: `metric_value` remains NOT NULL |
| Full scorecard → snapshot with pipeline distribution | FAIL: JSONB object cast to NUMERIC |

**Report path:** `docs/scorecard-bug-report.md`
