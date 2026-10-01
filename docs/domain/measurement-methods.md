# Measurement methods

> Phase 0 reference. Status: **learning — expand as we learn; never invent values.**
> This page is about *how measurements are taken and interpreted*, not about specific
> known-good values. It feeds the Measurement data model (AGENTS.md §6, README §9).

---

## 1. Core measurement types (used by technicians and reference DBs)

From OpenBoardData and general repair practice, the routine board-level checks:

| Type | What it measures | Units | Context that matters |
| --- | --- | --- | --- |
| **Diode mode** | Conductivity of semiconductor paths (forward voltage drop) | volts (displayed) | probe polarity/orientation, board state (chip present?), reference point (usually GND) |
| **Resistance** | Opposition to current | ohms (Ω) | measurement point, reference point, powered vs unpowered board |
| **Voltage** | Potential difference at a point | volts (V) | powered conditions, board state (booted, charging), reference (usually GND) |
| **Continuity** | Is a path connected | pass/fail | which two points |

> Diode-mode readings are NOT universal pass/fail numbers. A reading is meaningful only
> relative to: probe polarity, method, board state, and circuit topology. (README §3.)

## 2. Context every measurement must preserve (when known)

Per AGENTS.md §6, a measurement is not a single number:

- type
- value
- unit
- measurement point (component/pad/net)
- reference point (usually GND, but note it)
- method (diode mode, resistance scale, etc.)
- probe orientation/conditions when relevant
- source (who/what provided it: technician, OpenBoardData, manual)
- timestamp
- author
- confidence

Do not flatten to one number if that loses context.

## 3. Board states that change readings

OpenBoardData supports explicit "conditions" (e.g. chip removed, peripheral attached).
Known board-state categories we expect (to be confirmed with technicians):

- default / naked board
- battery connected / disconnected
- powered on / booted / charging
- specific component removed (e.g. "with U4500 removed")

## 4. Open questions to validate with technicians

- Which is the most common reference point for board measurements? (GND — confirm)
- In diode mode, what probe polarity do most techs use? Both? Does it depend?
- Which board states should be recorded by default to make a value trustworthy?
- How do techs today decide a reading is "bad" — reference table, donor board,
  experience, or community data?

## 5. Provenance

- OpenBoardData format definitions (OBDATA_V002 headers) — openboarddata.org, 2026-09-24.
- README.md §3 glossary definitions — project docs.