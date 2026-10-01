# Technician interviews — template and log

> Phase 0 required activity: talk to at least 3 real board-repair technicians,
> to understand common workflows, real measurement habits, and data needs.
> Status: **not started**

---

## Purpose

The workstation must be useful to a technician under time pressure. We (the
developer + OpenCode) are new to the domain. Before writing a single feature
we need firsthand answers to the questions below.

Use one copy of this file per interviewee, or keep interview notes in
`docs/domain/repair-interview-notes.md` and keep this page as the master list.

---

## Interviewee log

| # | Date | Name / shop | Role | Channel | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | OPEN |
| 2 | | | | | OPEN |
| 3 | | | | | OPEN |

Interview consent note: explain we are building a repair workstation, we are not
asking for proprietary data, and we will keep the shop/name anonymous in any notes
unless they agree otherwise.

---

## Interview script (questions)

### A. About them and their workflow

1. What do you repair most often (brands/models/board types)?
2. Walk me through a typical board-level repair from start to finish — what do you
   do first, second, third?
3. When diagnosing, what data/tools do you actually open (schematic? boardview?
   known-good measurements? a repair database? notes)?
4. How do you usually find "where is this component" or "what is this net"?

### B. Measurement habits (critical for Phase 3)

5. What measurements do you routinely take (diode mode, voltage, resistance, continuity)?
6. In diode mode, how do you know what a "good" reading is? Do you compare to a manual
   reference, a donor board, or a known-good values table?
7. How often is probe polarity/board state (chip removed, battery connected) relevant to
   your reading? Is that context usually written down?
8. Do you record measurements anywhere right now? If yes, where (paper, spreadsheet,
   app, memory)? What is recorded when the repair succeeds?
9. Which measurements would you trust as reference data — and how should we mark
   confidence/provenance for them to be trustworthy to you?

### C. Navigation & cross-reference

10. When a fault involves, say, a charging circuit, how do you jump between the board
    location, the schematic page, and the net list today?
11. How hard is it to follow a trace/probe a specific pad/pin now? What would make it
    smoother?
12. Do you use board revision numbers (e.g. 820-00871) in practice? How do you tell
    which revision a board is?

### D. Repair cases & notes

13. Do you keep records of past repairs? What info is in them (symptom, measurements,
    actions, outcome, parts)? How useful are they months later?
14. If a tool kept repair history, notes, and measurements attached to the board/component,
    would that help you?

### E. Product fit

15. Are there pain points in your current tools (cost, subscriptions, data lock-in,
    licensing, speed, search, PDF jank)?
16. Would you pay for a locally-stored workstation that ties board + schematic +
    measurements + notes together? What price point feels fair?
17. What is the single feature that would make you switch tools?

---

## What we must NOT ask or collect

- No requests for pirated schematics or boardview files.
- No requests for customer/device identity (IMEI, owner names).
- We only want aggregate workflow answers and (with consent) anonymized repair cases.

---

## After each interview: capture in repair-interview-notes.md

For every interview, record (unless the tech asks to omit):

- summary of their workflow (numbered steps)
- the measurements they use and their context requirements
- how they currently store/distrust data
- pain points and the "one feature that matters"
- anything that changes our data model or MVP priority
- flag any claim that needs validation (per AGENTS.md §2 format)