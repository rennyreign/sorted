# Field Mapping — {{CLIENT_NAME}}

Map the client's real source columns. Preserve the original label, the raw value, the source row and the batch ID. Never silently reinterpret a legacy status.

## Source columns

| Source column | Destination | Rule | Never do this |
| --- | --- | --- | --- |
| | | | |

## Legacy label mapping

| Legacy label | Mapped meaning | Confidence | Note |
| --- | --- | --- | --- |
| | | | |

Unknown labels must create a mapping question, not a guess.

## Duplicate rules

- Exact match on normalised email: duplicate candidate.
- Exact match on platform + handle: duplicate candidate.
- Name-only similarity: **never** auto-merge.
- Conflicting matches across different creators: review task.

## Reimport behaviour

- Default: fill blanks only.
- Overwrite requires explicit selection per row.
- Reimporting the same file must create no new creators or trials.
- Imports never enqueue outbound messages.

## Inert files

Files are data. Never execute spreadsheet formulas or macros. Exports must not interpret untrusted cell contents as formulas.
