# Workflow observations

> Phase 0 output. Status: **almost empty — expected**, this fills in from:
> 1. watching real repair workflows (videos/in-person),
> 2. technician interviews (see docs/research/technician-interviews.md).
>
> Purpose: capture observed technician tasks in a form that directly feeds the
> data model and MVP feature priorities.

---

## 1. How to record a workflow observation

For each workflow, note:

- **Trigger** — why the tech reaches for a tool (e.g. "no power", "short on PP_VDD_MAIN")
- **Steps** — numbered sequence, what tool/data is used at each step
- **Data consumed** — schematic, boardview, known-good values, donor board, notes
- **Data produced** — measurement, note, replacement decision, outcome
- **Pain points** — where the tech switches tools, searches, or guesses
- **Uncertainties** — anything the tech relies on without verification (flag it)

## 2. Observation log

| # | Date | Source (video/shop/tech) | Workflow | Key data consumed | Pain points | Flags |
| --- | --- | --- | --- | --- | --- | --- |

(empty until Phase 0 fieldwork starts)

## 3. Recurring pain-point candidate list

Gathered from initial reading, to be validated with technicians:

- "Where is this component on the physical board?" — boardview navigation
- "What is this net connected to?" — connectivity inspection
- "What should this read in diode mode?" — known-good reference values
- "What page of the schematic is this on?" — schematic ⇄ board cross-reference
- "How did the last similar repair go?" — repair history search

These map to MVP features in README §20.