# iPhone 8 Repair Workstation

> **Project status:** Domain discovery / architecture stage
> **Target device:** Apple iPhone 8, model **A1863**
> **Primary goal:** Build a desktop-first repair workstation that helps a technician understand and navigate board-level repair data.

---

## 1. Why this project exists

This project started from a simple product question:

> **Are there specialized repair tools that technicians pay for because they solve a painful workflow, and can we build a better or more focused version?**

The first concrete target is an **iPhone 8 repair workstation**.

The project is intentionally starting with **one device**, not a giant multi-device repair platform.

The long-term product direction being explored is a combination of:

1. **Physical board understanding** — where a component/pad/trace is on the board.
2. **Electrical understanding** — what a component is connected to and which net/circuit it belongs to.
3. **Diagnostic workflow** — helping a technician record and reason about measurements and repair observations.
4. **Repair knowledge** — notes, known-good measurements, repair cases and technician observations.

The product must not pretend to know more than the underlying data supports.

---

## 2. Critical context: the developer is new to this field

The person building this project is an experienced software developer but **does not have professional board-repair expertise**.

That is a first-class project constraint, not something to hide.

### What the developer already knows

- React / TypeScript / JavaScript
- Next.js / Vite
- Tailwind CSS / MUI
- Python
- Flask / FastAPI
- PostgreSQL / SQLite
- REST APIs
- Docker / Docker Compose
- AWS / Linux / Nginx
- Full-stack application architecture

### What the developer is learning

- PCB anatomy
- Schematic diagrams
- Boardview data
- Component reference designators
- Nets and connectivity
- Pads and pins
- Traces and PCB layers
- Vias
- Power rails
- Ground references
- Resistance / continuity / diode-mode measurements
- Fault isolation
- Board-level repair workflows
- Repair-data formats and licensing

### What this means for engineering decisions

Do **not** silently convert assumptions into domain facts.

When domain behavior is uncertain:

1. Mark it as `UNKNOWN` or `NEEDS DOMAIN VALIDATION`.
2. Explain the assumption in a decision note.
3. Ask a repair technician / domain expert to validate it.
4. Store source/reference information when available.
5. Only then turn the assumption into production behavior.

The application should make it possible to replace incorrect early assumptions without rewriting the whole system.

---

## 3. Glossary — beginner version

This section exists because the developer is learning the domain while building the product.

### PCB / motherboard

A **PCB (Printed Circuit Board)** is the physical board that holds components and provides electrical connections between them.

A phone motherboard is a highly dense multi-layer PCB containing chips, passive components, connectors, and many microscopic electrical connections.

### Component

A physical electronic part on the board.

Common examples include:

- resistor
- capacitor
- inductor / coil
- diode
- transistor / MOSFET
- filter
- integrated circuit (IC)
- connector

### IC

**Integrated Circuit.** A chip containing electronic circuitry.

Examples in a phone can include power-management, storage, charging, audio, wireless, and application-processing functions.

Do not assume a specific chip's function without a trusted source.

### Reference designator

The label used to identify a component in repair data or a schematic.

Typical examples:

- `R220` — resistor
- `C341` — capacitor
- `L12` — inductor
- `D45` — diode
- `U4500` — IC
- `J12` — connector

Exact conventions can vary by source.

### Schematic

An **electrical diagram** showing how circuit elements are connected and how the circuit is organized.

Mental model:

> **Schematic = electrical map**

A schematic is not a photograph of the physical board.

### Boardview / board map

A representation of the **physical layout** of board components, pads, positions and often connectivity information.

Mental model:

> **Boardview = physical map**

### Net

A named electrical connectivity group.

If several pads/components are electrically connected as part of the same network, they can belong to the same net.

Mental model:

> **Net = electrical road/network**

The exact electrical behavior of a net must not be inferred solely from its name.

### Pad

A conductive contact area on a PCB where a component or connection interfaces electrically with the board.

### Pin

An electrical connection on an electronic component, connector or IC.

### Trace

A conductive PCB path, commonly copper, connecting electrical points.

Mental model:

> **Trace = copper road**

### Via

A plated conductive connection that links different PCB layers.

Mental model:

> **Via = electrical tunnel between layers**

### PCB layer

Copper and dielectric structures stacked inside a PCB. A board can have multiple routing layers that are not visible from the top or bottom surface.

### Power rail

An electrical supply network used by a circuit or subsystem.

A rail may have a specific voltage and serve one or more parts of the board.

### Ground / GND

A common electrical reference used by the circuit.

Do not assume every occurrence of `GND` has identical measurement behavior in every context without domain validation.

### Short circuit

An unintended low-impedance electrical path between points that should not be directly connected.

### Open circuit

An unintended interruption in an electrical path.

### Continuity

A test used to determine whether an electrical path is connected under the test conditions.

### Resistance

A measurement of opposition to current flow, commonly expressed in ohms (`Ω`).

### Voltage

Electrical potential difference, commonly expressed in volts (`V`).

### Diode mode

A multimeter measurement mode commonly used by board technicians to characterize semiconductor paths and compare readings.

Important: a diode-mode reading is **not automatically a universal pass/fail value**. Probe direction, measurement method, board state and circuit topology matter.

### Test point

A designed or known point where a technician can take a measurement.

### BGA

**Ball Grid Array.** A package whose electrical connections are arranged underneath the chip rather than as visible leads around the outside.

### BOM

**Bill of Materials.** A list of components and associated part information for a board/product, depending on the source.

### Repair case

A record of a real repair problem, observed measurements, actions and outcome.

---

## 4. Core mental model

The product has three main layers.

```text
┌─────────────────────────────────────────────────────────────┐
│  PHYSICAL LAYER                                             │
│  Where is it?                                               │
│  Board / component / pad / trace / layer / coordinates      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  ELECTRICAL LAYER                                           │
│  How is it connected?                                       │
│  Schematic / net / pin / power rail / connectivity          │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  DIAGNOSTIC LAYER                                          │
│  What might be wrong?                                       │
│  Symptoms / measurements / test sequence / repair cases     │
└─────────────────────────────────────────────────────────────┘
```

The first MVP should primarily establish the first two layers.

The diagnostic layer should begin as **measurement capture and navigation**, not autonomous diagnosis.

---

## 5. Product thesis

Existing repair ecosystems already show that technicians use combinations of:

- schematic viewers
- boardview / bitmap viewers
- component/net search
- repair databases
- measurement references
- phone servicing tools
- programmer tools
- repair notes
- community knowledge

The opportunity being explored here is **not** simply another boardview viewer.

The higher-value direction is a workstation that reduces context switching between physical board information, electrical information and diagnostic records.

Potential future workflow:

```text
Device
  ↓
Select board / revision
  ↓
Search component / net / symptom
  ↓
See electrical relationship
  ↓
Jump to physical board location
  ↓
Record measurement
  ↓
Compare with trusted reference data
  ↓
Record action / result
  ↓
Build repair history
```

Any automated diagnostic recommendation must be explainable and source-backed.

---

## 6. Initial scope: iPhone 8 A1863

### In scope

- One target device family / board dataset
- Desktop workstation
- Importing legitimate repair data supplied by the user or licensed source
- Board navigation: pan / zoom
- Component search
- Net search
- Component detail view
- Connectivity inspection
- Schematic navigation, where legitimate data is available
- Linking schematic entities to board entities where the data permits it
- Measurement entry
- Repair notes
- Local project/session storage

### Explicitly out of scope for the first MVP

- Automatic phone unlocking
- FRP / account bypass
- Activation-lock bypass
- IMEI alteration
- Unauthorized access to devices
- Firmware abuse tooling
- Pirated or leaked repair-data distribution
- Automatic diagnosis presented as fact
- Supporting hundreds of devices before one device works correctly
- Mobile-first UI
- Cloud-first architecture
- AI before reliable structured data exists

---

## 7. Recommended architecture

### Desktop application

**React + TypeScript + Electron**

Reason: the developer already knows React/TypeScript and the professional repair-tool workflow is desktop-oriented.

### Local data

**SQLite** for the initial structured dataset/session store.

### Rendering

A dedicated canvas-based renderer for board geometry and highlighting.

Preferred initial approach:

- HTML Canvas for MVP
- abstract renderer API
- leave room for WebGL if board complexity demands it

### Optional analysis service

Python service for future parsing/analysis where useful.

Do not introduce a separate service just because it sounds scalable. Start in-process where possible.

---

## 8. Proposed repository structure

```text
iphone8-repair-workstation/
│
├── README.md
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── .env.example
│
├── apps/
│   └── desktop/
│       ├── src/
│       │   ├── main/             # Electron main process
│       │   ├── preload/          # Safe bridge to renderer
│       │   └── renderer/         # React application
│       │       ├── app/
│       │       ├── components/
│       │       ├── features/
│       │       │   ├── board-viewer/
│       │       │   ├── schematic-viewer/
│       │       │   ├── component-search/
│       │       │   ├── net-explorer/
│       │       │   ├── measurements/
│       │       │   └── repair-notes/
│       │       └── styles/
│       └── electron-builder.yml
│
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── board.ts
│   │   │   ├── component.ts
│   │   │   ├── pad.ts
│   │   │   ├── pin.ts
│   │   │   ├── net.ts
│   │   │   ├── trace.ts
│   │   │   ├── via.ts
│   │   │   ├── layer.ts
│   │   │   ├── measurement.ts
│   │   │   └── repair-case.ts
│   │   └── tests/
│   │
│   ├── data-model/
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── repositories/
│   │   │   └── migrations/
│   │   └── tests/
│   │
│   ├── rendering/
│   │   ├── src/
│   │   │   ├── camera/
│   │   │   ├── layers/
│   │   │   ├── hit-testing/
│   │   │   ├── highlighting/
│   │   │   └── renderer.ts
│   │   └── tests/
│   │
│   ├── parsers/
│   │   ├── src/
│   │   │   ├── boardview/
│   │   │   ├── schematic/
│   │   │   ├── bitmap/
│   │   │   └── common/
│   │   └── tests/
│   │
│   └── ui/
│       ├── src/
│       │   ├── panels/
│       │   ├── tables/
│       │   ├── search/
│       │   └── diagnostics/
│       └── tests/
│
├── services/
│   ├── importer/
│   │   ├── README.md
│   │   └── src/
│   └── analysis/
│       ├── README.md
│       └── src/
│
├── data/
│   ├── raw/                      # NEVER commit copyrighted/leaked datasets
│   ├── normalized/               # Derived project-owned representation
│   └── samples/                  # Tiny synthetic fixtures only
│
├── docs/
│   ├── domain/
│   │   ├── glossary.md
│   │   ├── workflow-observations.md
│   │   ├── measurement-methods.md
│   │   └── repair-interview-notes.md
│   │
│   ├── research/
│   │   ├── data-sources.md
│   │   ├── competitors.md
│   │   ├── licensing.md
│   │   └── technician-interviews.md
│   │
│   └── decisions/
│       ├── ADR-001-desktop-first.md
│       ├── ADR-002-one-device-first.md
│       └── ADR-003-data-before-ai.md
│
├── tests/
│   └── fixtures/
│
└── scripts/
    ├── validate-data.ts
    ├── inspect-import.ts
    └── generate-fixture.ts
```

---

## 9. Domain model we should eventually support

The application should model relationships roughly like this:

```text
Board
 ├── Revision
 ├── Layer[]
 ├── Component[]
 │     ├── Pad[]
 │     └── Pin[]
 ├── Net[]
 ├── Trace[]
 ├── Via[]
 ├── TestPoint[]
 └── SchematicEntity[]

Measurement
 ├── Board
 ├── Point / Net / Component
 ├── MeasurementType
 ├── Value
 ├── Unit
 ├── Probe / Method (when known)
 ├── Conditions
 ├── Source
 └── Confidence

RepairCase
 ├── Device / Board
 ├── Symptom
 ├── Observations
 ├── Measurements
 ├── Actions
 ├── Outcome
 ├── Source
 └── Technician / author (if available)
```

### Do not hard-code Apple-specific assumptions into generic domain objects

For example:

```ts
// Good
interface Component {
  designator: string;
  type?: ComponentType;
  pads: Pad[];
}
```

rather than:

```ts
// Bad
interface IPhone8Capacitor {
  ppVddMain: boolean;
}
```

The iPhone 8 is the first dataset, not the permanent architecture.

---

## 10. Data strategy

This is one of the highest-risk areas of the project.

The application is only useful if it has reliable repair data.

### We need to investigate

- Which boardview formats are legally available to use
- Which schematic formats are legally available to use
- What commercial tools license versus merely display
- Whether users can import their own files
- Whether transformations/normalization are permitted
- Whether derived metadata can be stored
- Whether any dataset is copyrighted, restricted, or sourced from a third party without redistribution rights

### Product rule

**Never put pirated, leaked, scraped, or unauthorized repair data into the repository.**

For development fixtures, use:

- synthetic board data
- openly licensed datasets
- user-supplied data where permitted
- data under a license we have documented

### Import architecture

Raw source format:

```text
Source file
   ↓
Importer
   ↓
Normalized internal model
   ↓
SQLite
   ↓
Renderer / Search / Connectivity
```

Do not let one vendor's file format become the application's core domain model.

---

## 11. MVP milestones

### Phase 0 — Domain discovery

Before implementation:

- learn the basic terminology
- watch real repair workflows
- talk to at least 3 technicians
- document common tasks
- identify what data a technician actually uses
- establish legitimate data sources

### Phase 1 — Synthetic board

Build the entire UI using a tiny fake board dataset.

Goal:

> prove the software architecture without depending on commercial repair data.

Features:

- board canvas
- zoom/pan
- component labels
- click component
- show connected net
- highlight net
- component search
- basic schematic graph

### Phase 2 — Real iPhone 8 dataset

Only after a legitimate source is established.

Features:

- import
- normalization
- physical board visualization
- schematic navigation
- component/net linking

### Phase 3 — Measurement workflow

Add:

- measurement entry
- measurement type
- units
- test conditions
- source
- confidence
- comparison against trusted reference data

### Phase 4 — Repair cases

Add:

- symptoms
- measurement sequences
- actions
- outcome
- notes
- searchable repair history

### Phase 5 — Assistance

Only after enough trustworthy structured data exists:

- guided diagnostic flow
- suggested next test
- explainable hypotheses
- confidence indicators
- source citations

AI is **not** a substitute for missing repair data.

---

## 12. UX principles

The primary user is assumed to be working under time pressure.

The UI should prioritize:

1. Search
2. Jump to result
3. See context
4. Highlight related items
5. Measure / record
6. Return to previous context

### Important interaction patterns

- Double-click component → open details
- Click net → highlight connected objects
- Search → jump to component/net
- Cross-reference → jump between schematic and board
- Pin/pad selection → show linked entities
- Measurement entry should preserve the exact measurement context
- Every diagnostic recommendation should show **why** it was suggested

---

## 13. What the first screen should NOT be

Do not create a giant dashboard full of meaningless cards.

The core workspace should feel closer to:

```text
┌────────────────────────────────────────────────────────────┐
│ Search [ C120 / PP_VDD_MAIN / U4500 ]                    │
├──────────────────────────────┬─────────────────────────────┤
│                              │                             │
│                              │   Component / Net Details  │
│                              │                             │
│        BOARD VIEW            │   Connections              │
│                              │   Schematic context        │
│                              │   Measurements              │
│                              │   Notes                     │
│                              │                             │
├──────────────────────────────┴─────────────────────────────┤
│ Status / selection / measurement context                   │
└────────────────────────────────────────────────────────────┘
```

---

## 14. AI rules

AI may eventually help with:

- searching repair cases
- summarizing technician notes
- explaining terminology
- generating a proposed next-test sequence
- finding similar historical cases

AI must not:

- invent component values
- invent a schematic connection
- invent a measurement
- state that a component is faulty without evidence
- fabricate a repair procedure
- silently substitute a model's guess for source data

Every AI-generated claim should be traceable to:

- imported source data
- explicit technician input
- documented knowledge
- or clearly labeled inference

---

## 15. Success criteria for the first real prototype

The first useful prototype does **not** need hundreds of devices.

It should let a technician do something like:

```text
Open iPhone 8
   ↓
Search R220
   ↓
See R220 on the board
   ↓
See its connected net
   ↓
See related schematic location
   ↓
Highlight connected pads/components
   ↓
Enter a measurement
   ↓
Save the repair note
```

If that workflow is fast and reliable, then we have something worth expanding.

---

## 16. Research questions still open

These must be resolved before product claims are made:

### Domain

- Which repair workflows are actually most frequent?
- Which measurements are routinely recorded?
- What counts as a trustworthy reference measurement?
- How are board revisions handled?
- How do technicians identify a board revision?
- Which parts of the workflow are most time-consuming?

### Data

- What file formats are available?
- What is the licensing situation?
- Can users import their own commercial data?
- Can normalized metadata be saved locally?
- What information is missing from each source?

### Product

- Is a standalone viewer enough?
- Is a measurement database valuable enough to pay for?
- Does a community dataset create genuine value?
- Which device family should come after iPhone 8?

### Business

- Who is the buyer: technician, shop owner, training center, or repair chain?
- Subscription vs perpetual licence?
- Offline-first vs account-required?
- India-first or global from the beginning?

---

## 17. Current product positioning hypothesis

Do not position this as:

> "Another boardview software."

Potential positioning direction:

> **A repair workstation that connects the board, the schematic and the technician's measurements.**

This is a hypothesis, not the final positioning.

Validate it with real technicians.

---

## 18. Development philosophy

### Build the boring foundations first

- data model
- coordinate systems
- imports
- rendering
- search
- connectivity
- persistence

### Keep domain assumptions replaceable

Domain knowledge is still being acquired.

### Prefer explicit uncertainty

Use:

- `unknown`
- `needs-validation`
- `source-required`
- `inferred`

rather than pretending something is known.

### One device done properly beats 100 devices done badly

The iPhone 8 dataset is the laboratory.

---

## 19. Suggested next steps

1. Learn the repair workflow before implementing diagnosis.
2. Interview repair technicians.
3. Establish a legitimate iPhone 8 data source.
4. Build a synthetic-board prototype.
5. Validate the navigation workflow with technicians.
6. Import one real iPhone 8 dataset.
7. Add measurement capture.
8. Only then investigate diagnostic assistance.

---

## 20. Important reminder

This is a software project **inside a technical domain we are still learning**.

That means the correct engineering posture is:

> **Build what we can verify. Isolate what we don't know. Never fake domain expertise.**
