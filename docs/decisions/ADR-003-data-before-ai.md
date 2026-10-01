# ADR-003: Data before AI

- Status: **accepted** (from README §6/§11, AGENTS.md §10 — recorded here per AGENTS.md §15)
- Date: 2026-09-24 (decision recorded in project docs earlier)

## Context

AI recommendations without reliable structured data produce false authority ("C123 is
definitely faulty" — AGENTS.md §10 forbids this). README §11 puts diagnosis/assistance
after measurement and repair-history layers exist. Data licensing is the highest-risk
area (README §10).

## Decision

No autonomous/AI-driven diagnosis in MVP. MVP diagnostic layer = measurement capture +
navigation (README §4). Automated suggestions (Phase 5) only after trustworthy,
provenanced structured data exists; every suggestion carries evidence + source +
confidence + suggested next test.

## Consequences

- Measurement data model and RepairCase come before any "assistant".
- AI must not invent missing board data; missing values stay `null`/`unknown`
  (AGENTS.md §6).
- OpenBoardData (ODbL) is the only currently-licensed measurement reference;
  iPhone 8 entries are empty (see docs/research/data-sources.md).