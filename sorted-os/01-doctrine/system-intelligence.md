# System Intelligence

System intelligence is the accumulated capability held by Sorted's workflows, schemas, validation, content models, quality gates, and operator skills. It is deliberately designed to reduce founder dependency.

## Operating Implications

- Skills are the canonical written specification for a job.
- Operators are the compiled, stateless runtime implementation of a skill.
- Artifacts on disk are the source of truth between steps.
- Schema validation blocks malformed output from cascading through the factory.
- Repeatable quality is enforced by the process, not remembered by an individual.

The longer-term objective is autonomous fulfilment: operators execute documented work, an orchestration layer routes them, and the resulting infrastructure becomes the moat.

Source: `doctrine/sorted-overview.md`, `doctrine/sorted-operating-model.md`.
