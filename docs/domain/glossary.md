# Domain glossary

> Working glossary for board-level repair terms used in this project.
> The README has a beginner version; this page is the working reference that grows
> as we learn. When we add a term, add it here (AGENTS.md §15).

---

## A — terms already used in the project

- **PCB / motherboard** — the physical board that holds components and provides
  electrical connections between them. Phone motherboards are dense multi-layer PCBs.
- **Component** — a physical electronic part on the board (resistor, capacitor, IC, connector...).
- **IC (integrated circuit)** — a chip containing electronic circuitry.
- **Reference designator** — the identifier label for a component in data/schematic
  (e.g. R220, C341, U4500, J12). Exact conventions vary by source.
- **Schematic** — an electrical diagram: how circuit elements are connected/organized.
  (*Schematic = electrical map.*)
- **Boardview / board map** — representation of the physical layout of components,
  pads, positions, and often connectivity. (*Boardview = physical map.*)
- **Net** — a named electrical connectivity group (set of pads/pins electrically connected).
  (*Net = electrical road/network.*) Do not infer electrical behavior from net name alone.
- **Pad** — a conductive contact area on a PCB where a component connects electrically.
- **Pin** — an electrical connection on a component/connector/IC.
  - *Data-model rule:* pads are physical (boardview), pins are electrical (schematic).
    A pad and a pin on the same terminal are NOT the same object in the domain model;
    linking them later requires an explicit cross-reference (AGENTS.md §9).
- **Trace** — a conductive PCB path connecting points. (*Trace = copper road.*)
- **Via** — a plated conductive connection between PCB layers. (*Via = electrical tunnel.*)
- **PCB layer** — copper/dielectric structures stacked inside the board; multi-layer boards
  have routing layers not visible from the surface.
- **Power rail** — an electrical supply network used by a circuit/subsystem; may have a
  specific voltage and serve one or more parts of the board.
- **Ground / GND** — a common electrical reference. Not identical in behavior in every context.
- **Short circuit** — unintended low-impedance path between points that shouldn't be connected.
- **Open circuit** — unintended interruption in an electrical path.
- **Continuity** — a test to determine whether an electrical path is connected.
- **Resistance** — opposition to current flow, ohms (Ω).
- **Voltage** — electrical potential difference, volts (V).
- **Diode mode** — a multimeter mode characterizing semiconductor paths; readings vary with
  probe polarity, method, board state, and topology. NOT a universal pass/fail value.
- **Test point** — a designed or known point where a measurement can be taken.
- **BGA** — ball grid array: chip package with connections underneath as solder balls.
- **BOM** — bill of materials: list of components and related part info for a board.
- **Repair case** — record of a real repair: problem, observations, actions, outcome.
- **Board revision / logic board code (MLB#)** — manufacturer identifier for a specific
  board iteration, e.g. 820-00871 for iPhone 8 A1863.

## B — terms we must be careful with

- **Boardview format** — the file format encoding board layout/connectivity
  (e.g. Testlink BRD `.brd`, XZZ `.pcb`, GenCAD `.cad`). A format is not data; the data
  inside may be proprietary even if the format is open.
- **Known-good value** — a reference measurement taken from a known-working board.
  Trustworthy only with context: probe polarity, board state, method, source, confidence.
- **Reference data** — validated measurements/values used for comparison. Must have
  provenance (source, conditions).

## C — unresolved terminology (add here as we learn)

- None yet. Add via PR/edit when a new concept is needed.