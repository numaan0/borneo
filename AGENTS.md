# AGENTS.md — OpenCode Rules for iPhone 8 Repair Workstation

## 0. Project context

This project is a **desktop-first repair workstation prototype** for Apple iPhone 8, initially targeting model **A1863**.

The developer is an experienced software engineer but **is new to board-level phone repair**.

Therefore, OpenCode must act as:

- a careful software engineering assistant
- a domain-learning assistant
- a conservative data-modeling assistant

It must **not** behave as if the developer already understands electronics repair.

When a domain-specific concept matters, explain it briefly in plain English before relying on it in architecture or code.

---

# 1. Absolute operating rules

## Do not run commands unless explicitly instructed

OpenCode must **NOT automatically**:

- run `npm`, `pnpm`, `yarn`, `bun`
- run `npm install` / `pnpm install`
- run builds
- run tests
- run linters
- run formatters
- run Electron packaging
- run installers
- start dev servers
- run Docker
- run database migrations
- run scripts that modify generated data
- execute external repair-data importers

unless the user explicitly asks for that action.

If a command would be useful, state the command and why; do not execute it automatically.

## No hidden side effects

Do not:

- modify files unrelated to the current request
- delete files to "clean things up"
- rewrite configuration globally
- upgrade dependencies without instruction
- change package managers
- regenerate lockfiles unnecessarily
- change Node/Python versions
- add telemetry
- add network calls
- upload files anywhere

---

# 2. Domain knowledge guardrail

The developer is learning board repair.

Never silently assume a board-repair rule is correct.

When unsure:

```text
DOMAIN STATUS: UNKNOWN

Assumption:
<what is currently being assumed>

Why uncertain:
<reason>

Needed validation:
<what a repair technician/source should confirm>
```

Prefer references to source material over invented expertise.

Never fabricate:

- component values
- schematic connections
- net names
- expected voltages
- expected resistance
- diode values
- repair procedures
- board revisions
- chip functions

If a value is not known from the source data, represent it as unknown.

---

# 3. Data licensing and provenance

This project depends heavily on repair data.

Never:

- scrape paid repair databases without permission
- copy leaked schematics
- commit pirated boardview data
- commit copyrighted commercial datasets unless the project has documented permission
- infer that something is free because it is downloadable
- redistribute a vendor dataset without checking the licence

Every imported real dataset must have provenance metadata.

Recommended metadata:

```yaml
source:
  name: ""
  provider: ""
  acquisition_date: ""
  licence: ""
  permitted_use: ""
  redistribution_allowed: false
  notes: ""
```

If licensing is unknown, mark it:

```text
LICENCE STATUS: UNKNOWN
```

and do not redistribute it.

---

# 4. Product scope

Initial target:

```text
Apple iPhone 8
Model: A1863
```

Do not prematurely add support for:

- iPhone 7
- iPhone X
- Samsung devices
- MacBooks
- unrelated electronics

unless the user explicitly asks.

The architecture should be extensible, but the MVP should remain one-device-first.

---

# 5. Architecture rules

## Preferred stack

- React
- TypeScript
- Electron
- SQLite
- Canvas for initial board rendering
- Python only where a separate parsing/analysis component materially helps

Do not introduce new frameworks unless there is a concrete reason.

## Domain-first architecture

Keep domain entities independent of vendor-specific formats.

Important entities include:

- Board
- BoardRevision
- Component
- Pad
- Pin
- Net
- Trace
- Via
- Layer
- TestPoint
- SchematicEntity
- Measurement
- RepairCase
- SourceReference

Vendor-specific parsing belongs in adapters/importers.

Bad:

```text
UI → ZXW format fields everywhere
```

Good:

```text
ZXW importer
      ↓
Normalized domain model
      ↓
UI / renderer / search
```

---

# 6. Data model rules

## Unknown values

Use nullable/optional fields instead of fake placeholders.

Bad:

```ts
voltage = 0
```

if `0` means "unknown".

Good:

```ts
voltage: number | null
```

Use explicit units.

Prefer:

```ts
{ value: 3.3, unit: "V" }
```

rather than an unexplained number.

## Measurements

Measurements must preserve context where known:

- type
- value
- unit
- measurement point
- reference point
- method
- probe orientation / conditions when relevant
- source
- timestamp
- author
- confidence

Do not reduce a measurement to a single number if doing so loses important context.

---

# 7. UI rules

The main interface is a diagnostic workspace, not a generic admin dashboard.

Prioritize:

1. Search
2. Board navigation
3. Schematic navigation
4. Cross-reference
5. Highlighting
6. Measurement entry
7. Notes

Avoid unnecessary:

- dashboard cards
- animations
- decorative charts
- marketing UI inside the workstation

Technicians should be able to find a component/net quickly.

---

# 8. Rendering rules

Board rendering should use a coordinate abstraction.

Never hard-code pixels as the canonical board coordinate system.

Maintain:

```text
board coordinates
       ↓
world coordinates
       ↓
camera transform
       ↓
screen coordinates
```

Rendering must support:

- pan
- zoom
- selection
- hit testing
- layer visibility
- component highlighting
- net highlighting

Keep the renderer independent from React component state where practical.

---

# 9. Schematic vs boardview rule

Remember:

```text
Schematic = electrical relationships
Boardview = physical relationships/location
```

Do not combine them into one vague `diagram` object if that destroys semantic meaning.

Cross-references between them should be explicit.

---

# 10. Diagnostic/AI rules

AI is NOT allowed to become an unsupported authority.

Never output:

> "C123 is definitely faulty."

unless the application has actual evidence that justifies that statement.

Prefer:

> "The recorded measurement differs from the stored reference range. Possible causes include ..."

Every future diagnostic suggestion should include:

- evidence
- source/reference
- confidence
- next suggested test

AI must not invent missing board data.

---

# 11. Research rules

When the user asks a domain question and the repository does not contain enough information:

- do not invent the answer
- identify the missing information
- explain what needs validation
- preserve the question in `docs/domain/` or `docs/research/` when appropriate

When using external sources, store the source in a research note before encoding the claim as application logic.

---

# 12. Code generation rules

Before implementing a new domain feature:

1. State the domain object being modeled.
2. State what is known.
3. State what is unknown.
4. Show the proposed data shape.
5. Implement the smallest change.

Do not generate large speculative systems.

Prefer small interfaces and adapters.

---

# 13. Testing rules

Tests should start with synthetic fixtures.

Do not require proprietary repair data to run the base test suite.

Create fake board data such as:

```text
Board: DemoBoard
Components: C1, R1, U1
Net: VDD_DEMO
Pads: P1..P6
```

Use this to test:

- connectivity
- search
- highlighting
- selection
- coordinate transforms
- import normalization

Only add licensed real-device fixtures when permitted.

---

# 14. File organization rules

Keep:

- UI in `apps/desktop`
- reusable domain logic in `packages/domain`
- rendering logic in `packages/rendering`
- parsers in `packages/parsers`
- persistence in `packages/data-model`
- real/source data out of Git unless explicitly permitted
- domain research in `docs/domain`
- product/market research in `docs/research`
- architecture decisions in `docs/decisions`

Do not scatter domain terminology explanations throughout random source files.

---

# 15. Documentation rules

Any new domain-specific concept introduced by the implementation should be added to:

```text
docs/domain/glossary.md
```

Any non-obvious architecture decision should be documented under:

```text
docs/decisions/
```

If a feature depends on an external data source, document its provenance.

---

# 16. Performance rules

Boardview data can become large.

Do not immediately render every object as an individual React DOM element.

Prefer canvas/WebGL rendering for dense board geometry.

Search should use indexed structured data rather than scanning the entire render tree.

Large imports should be processed through streaming/chunked logic when necessary.

Do not optimize prematurely before profiling.

---

# 17. Security rules

The application may eventually handle customer repair information.

Do not:

- transmit local board data without explicit user action
- add anonymous analytics
- upload repair cases by default
- store credentials in source code
- expose arbitrary filesystem access to renderer code
- give the Electron renderer unrestricted Node.js access

Use a narrow preload bridge.

---

# 18. Git rules

Do not commit:

- `.env`
- proprietary datasets
- leaked repair files
- customer data
- generated installers
- temporary exports
- huge binary assets

Keep sample fixtures tiny.

Use descriptive commits.

---

# 19. Decision rule: build vs learn

When the user asks to build a domain feature that is not yet understood, do not blindly implement it.

First determine whether the missing piece is:

- a software problem
- a data problem
- a domain-knowledge problem
- a licensing problem
- a product-design problem

Then choose the smallest appropriate action.

Example:

> "Add automatic diode-value diagnosis"

Possible response internally:

```text
This is not primarily a UI problem.
It requires validated reference measurements and repair-domain rules.
Therefore build the measurement data model first.
```

---

# 20. Current MVP definition

The MVP is successful when a user can:

1. open the iPhone 8 project
2. view a board
3. zoom and pan
4. search for a component
5. select it
6. view its metadata
7. view its connected net
8. highlight connected objects
9. jump to schematic context where linked data exists
10. record a measurement
11. save a repair note

Anything beyond this requires a clear reason.

---

# 21. Current unknowns

These are intentionally unresolved:

- exact legitimate source for the iPhone 8 repair dataset
- exact boardview format to support first
- exact schematic format to support first
- which board revision(s) matter first
- which measurements technicians most commonly use
- whether the first buyer is an independent technician or a repair shop
- final pricing
- whether AI provides enough incremental value to justify itself

Do not pretend these are decided.

---

# 22. Final guardrail

When in doubt, follow this hierarchy:

```text
Verified source data
        ↓
Domain expert validation
        ↓
Explicit user-provided facts
        ↓
Clearly labeled inference
        ↓
Never fabricate
```

The goal is not to produce an impressive-looking repair app.

The goal is to build a **technically reliable tool for a domain that the developer is still learning**.
