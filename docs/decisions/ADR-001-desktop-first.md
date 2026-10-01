# ADR-001: Desktop-first application

- Status: **accepted** (from README §7 — recorded here per AGENTS.md §15)
- Date: 2026-09-24 (decision recorded in project docs earlier)

## Context

The repair-tool workflow is desktop-oriented (see README §7). Technicians work at a
bench with a PC; the workstation requires heavy local rendering (board canvas),
file/import handling, and offline use. Mobile-first and cloud-first are explicitly out
of scope for MVP (README §6).

## Decision

Build a desktop app: React + TypeScript + Electron, SQLite local storage, HTML Canvas
for the MVP renderer (with abstract renderer API to allow WebGL later). No separate
service unless a concrete need appears.

## Consequences

- Native window app; files/session on local machine.
- Electron: must use a narrow preload bridge (AGENTS.md §17), keep renderer without
  unrestricted Node access.
- Coordinate flow: board → world → camera transform → screen (AGENTS.md §8).