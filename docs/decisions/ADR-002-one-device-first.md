# ADR-002: One device first (iPhone 8 A1863)

- Status: **accepted** (from README §1/§6 — recorded here per AGENTS.md §15)
- Date: 2026-09-24 (decision recorded in project docs earlier)

## Context

README §1: start with one device. AGENTS.md §4: do not prematurely add iPhone 7 / X /
Samsung / MacBooks. The architecture must stay extensible (vendor formats behind
adapters/importers), but the MVP is one-device-first.

## Decision

Initial target: Apple iPhone 8, model A1863 (Qualcomm modem), logic board 820-00871.
Everything in the MVP is validated against this target. Generic domain model only —
no hard-coded Apple/iPhone specifics in `packages/domain` (README §9).

## Consequences

- iPhone 8 is the first dataset, not the permanent architecture.
- Domain entities (Component, Pad, Net, ...) are generic; the A1863 mapping lives in
  import/project data, not in code.