# Campaign package contract

An agent harness submits one server-authenticated package. The ingestion service derives
the tenant from its credential and allowed client mapping; it does not trust an arbitrary
browser tenant field.

```json
{
  "schema_version": 1,
  "idempotency_key": "edgbaston-parent-acquisition-r1",
  "client_slug": "edgbaston",
  "campaign": {
    "id": "parent-acquisition",
    "revision": 1,
    "name": "Parent Acquisition",
    "platform": "meta",
    "objective": "Invite local families to a free first lesson.",
    "status": "draft",
    "created_at": "2026-09-10T00:00:00Z",
    "concepts": [
      {
        "id": "academic-excellence",
        "revision": 1,
        "name": "Academic Excellence",
        "strategy": "Show a focused and supportive learning environment.",
        "audience": "Parents of children aged 5–16 around Edgbaston.",
        "proposition": "High expectations and individual attention.",
        "ads": [
          {
            "id": "AE-001",
            "revision": 1,
            "placement": "facebook_feed",
            "ratio": "4:5",
            "primary_text": "Draft client-facing copy.",
            "headline": "Academic excellence starts here.",
            "description": "Expert tuition in Edgbaston",
            "creative_key": "sha256/immutable-object-key.webp",
            "creative_alt": "A tutor helping students in the classroom.",
            "cta": "BOOK_NOW",
            "destination_url": "https://client.example/free-lesson/"
          }
        ]
      }
    ]
  },
  "provenance": {
    "agent": "campaign-builder",
    "run_id": "provider-run-id",
    "created_by": "operator@example.com"
  }
}
```

## Validation invariants

- `schema_version` is supported and `idempotency_key` is unique per submission intent.
- IDs and slugs use lowercase letters, numbers and hyphens; ad display IDs may also use
  uppercase letters and digits.
- Campaign, concept and ad revisions are positive integers.
- Every ID is unique within its scope and every ad belongs to its enclosing concept.
- Platform and placement values come from maintained enums.
- Destination URLs use HTTPS and belong to an approved client domain or allowlist.
- Creative keys are immutable and resolve in central object storage.
- Required client-visible strings are non-empty and length-limited.
- No `internal_notes`, credentials, prompts or hidden model reasoning enter the package.
- Claims requiring evidence remain blocked until supporting evidence is recorded.
- The server computes the approval fingerprint from all client-visible execution fields
  and the creative content hash.

Reject the complete package on validation failure. Return structured field errors to the
harness; never publish a partially accepted campaign to the client index.

