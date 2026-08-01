# Operator Standard

An operator is a bounded, repeatable unit of work with defined inputs, outputs, validation, and a safe retry path. It does not rely on conversational memory from another operator.

Every operator must:

- Read a specified state artifact or job payload.
- Produce its declared artifact at the canonical path.
- Validate output before downstream use.
- Be stateless and idempotent for equivalent input where run in the pipeline.
- Have a skill specification before a compiled operator implementation.

Humans retain deliberate approval and judgement roles where doctrine requires them, notably prospect selection and cold-email sending.

Source: `doctrine/operator-chain.md`, `doctrine/sorted-operating-model.md`.
