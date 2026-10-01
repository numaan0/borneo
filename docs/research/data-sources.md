# Data sources research — iPhone 8 repair data

> Phase 0 output. Status: **research in progress, not decided**
> Target device: Apple iPhone 8, model A1863 (Qualcomm modem), logic board code 820-00871

---

## 1. The core problem in plain English

A repair workstation is only as good as its data. For iPhone 8 there are two very
different kinds of data, and they come from very different places:

| Data kind | What it tells you | Example files |
| --- | --- | --- |
| **Boardview geometry** | *Where* a component/pad/net sits on the physical board | `.brd`, `.pcb` (XZZ), `.cad` (GenCAD) |
| **Reference measurements** | *What the known-good electrical value* should be (diode, voltage, resistance) | `.obdata` from OpenBoardData |
| **Schematic** | *How* electrical relationships are organized | `.pdf` schematic |

These have different licensing situations. Do not treat them as one dataset.

---

## 2. Boardview / schematic file formats (evidence gathered)

### 2.1 Format landscape

From FlexBV5 docs (pldaniels.com/flexbv5) and OpenBoardView / BoardRipper sources:

| Format | Extension | Who / what uses it | Notes |
| --- | --- | --- | --- |
| Testlink BRD (Landrex) | `.brd` | The de-facto Apple boardview format (Mac/iPad/iPhone community files) | Only provides board outline usually + pin:part:network association. No pad/part outlines, no component values. Obfuscated text format, decoded in OpenBoardView. |
| XZZ (XinZhiZao) | `.pcb` | Frequently used for recent iPhones and MacBooks | Encrypted custom format. Used by ZXW commercial tools. |
| GenCAD | `.cad` | Export of various EDA suites | Plain text, documented — a good portable interchange format. |
| PADS | `.pcb` | Mentor PADS export; iPhone boardviews circulated in this form | Binary/DB-like; reverse-engineered partially, messy. |
| BRD2 / BDV | `.brd`, `.bdv` | TopTest / Honhan boardview formats | Text with section markers. |
| ASCII (asc) | `.asc` | Older boardview exports (e.g. iPhone 6 Plus circulated as `.asc`) | Plain text. |
| BVR | `.bvr`/`.bv` | OpenBoardView / FlexBV author's own raw format | Plain text, intended for conversions. |

Key implication:

```text
The ".brd" files that circulate for iPhones are NOT Apple-produced design files;
they are community-converted/test-tool exports. They describe layout + nets,
but often lack component values, ratings, and inner-layer traces.
```

### 2.2 iPhone 8 specifics

- Logic board code **820-00871** corresponds to **iPhone 8 A1863 (Qualcomm modem)**.
  Sources: RepairLap forum thread "iPhone 8 A1863 Qualcomm Modem 820-00871 Schematics",
  DZKJ schematics index, laptop-schematics.com MLB index. (Marked: to verify against a
  physical board / datasheet, but the mapping is consistent across multiple independent sites.)
- Board code **820-00872** corresponds to iPhone 8 A1905/A1906 (Intel modem).
- iPhone 8 Plus has its own board codes (820-00967 etc.) — do not confuse these with iPhone 8.

DOMAIN STATUS: UNKNOWN (partially validated)

```text
Assumption: iPhone 8 A1863 (Qualcomm) ↔ logic board 820-00871
Why uncertain: from repair forum/file-vendor indexes, not from a physical Apple board or official source
Needed validation: cross-check when a real iPhone 8 A1863 board is opened, or against a
reputable repair reference
```

---

## 3. OpenBoardData — the one clearly legitimate reference-measurement source

**Site:** https://openboarddata.org

### What it is

- A **community-contributed, open-data** archive of *known-good* values for circuit boards.
- Covers Apple (biased) and other brands; no subscription; everyone may contribute and access.
- Stores **four** data kinds:
  1. Diode values of nets
  2. Resistance values of nets
  3. Voltage values of nets
  4. Diagnostic solutions (fault-finding sequences)
- Each measurement can carry a note (e.g. "chip removed", "peripheral attached" board condition).

### Licensing

- The site footer/header states: data "released under the **ODbL** licence"
  (Open Data Commons Open Database License 1.0 — link in generated data headers:
  `https://opendatacommons.org/licenses/odbl/1-0/`).
- Note: the early GitHub README (2019) described MIT licensing. The current live site
  explicitly says ODbL. **Treat the current live site statement as authoritative; re-verify
  before redistribution.**

LICENCE STATUS: ODbL 1.0 (per site statement, 2026-09-24)

### The critical gap for our project

iPhone 8 board entries **already exist**:

```text
phones/apple/iphone8_qualcomm     (iPhone 8, Qualcomm modem — A1863)
phones/apple/ip8_qualcomm         (variant naming — needs dedupe/verification)
phones/apple/ip8p_qualcomm        (iPhone 8 Plus)
phones/apple/ip8p_intel
```

BUT as of 2026-09-24 the **net/component value tables for iPhone 8 are empty**:

- `phones/apple/iphone8_qualcomm` → Network Diode/Volt/Res values: none
- `phones/apple/ip8_qualcomm` → none
- `phones/apple/ip8p_qualcomm` → none

So OpenBoardData gives us:
1. A **proven format** for reference measurements (`.obdata` plain text, OBDATA_V002 header).
2. **Registered boards** we can structure around.
3. A **contribution path** (they accept new boards/data by email — `pldaniels@gmail.com`).

But it does **not yet provide iPhone 8 reference measurements**. Those could be
contributed by us only if we first obtain validated values from a trusted source,
and consistent with the ODbL sharing requirements.

### Relatedly supported tools

- **FlexBV** (commercial) reads OpenBoardData natively.
- **OpenBoardView** (inflex fork) reads `.obdata` in measurement overlays.

---

## 4. OpenBoardView — open source viewer (format parser reference)

**Repo:** https://github.com/OpenBoardView/OpenBoardView

- Viewer for `.brd` boardview files; drop-in for TestLink / Landrex.
- **MIT licensed** (confirmed via LICENSE file in repo and packaging metadata).
- Decodes: BRD (TestLink/Apple bit-rotation obfuscated), BRD2, BDV, GenCAD,
  and several encoded/encrypted formats (FZ, CST, etc. via the community).
- This is the primary **open reference for file formats**.
  We must write our own parsers (per AGENTS.md), but the format layout knowledge is
  openly documented here and under MIT.
- It does **not ship boardview data** — it views files you bring.

Usage for us: reference implementation for format details, not data.

---

## 5. BoardRipper — open source web boardview viewer

**Repo:** https://github.com/vietluu2020/BoardRipper (AGPL-3.0) — fork of an earlier project.

- Web-based boardview viewer, 11 formats (BVR1/3, BRD, BDV, BDV ASC, FZ, GenCAD,
  Mentor Neutral, XZZ, TVW, Allegro).
- "Bring your own files" — ships no boardview/schematic content; only board-number →
  device-model reference metadata.
- Uses OpenBoardView-derived parsers (MIT) and KiCad-derived Allegro reader (GPL → AGPL).

Usage for us: competitive reference and confirmation of the format list and the
"viewer without bundled data" pattern.

---

## 6. Commercial / paid sources — flag before touching

Plan says: never put pirated/leaked/scraped data into the repo. Be aware these
commercial vendors exist, and treat them as **copyright/licensing risk** until proven:

| Vendor | What they sell | Risk assessment |
| --- | --- | --- |
| FlexBV5 (pldaniels.com) | Boardview/schematic *viewer* software, $150 perpetual. Expressly states: "It is illegal to distribute other company's boardview & schematic files, as such FlexBV does not come with a complimentary bundle." | Software licensed; **data NOT bundled**. They say board files "are available readily across the internet" — i.e. grey-market. Do not redistribute. |
| laptop-schematics.com / repairlap / dzkj / phonerepairingsolutions | Individual boardview + schematic + silk-screen packages for iPhones (~$20/board) | These are *Apple proprietary schematics* redistributed. phonerepairingsolutions itself states Apple schematics "are considered the proprietary property of the Apple company." **Grey-market / likely unlawful distribution.** |
| REFOX BITMAP (refoxtech.com) | Subscription software with broad Apple/Android diagram database, monthly updates | Closed commercial platform; data locked to their app. Not a data source we can reuse. |
| ZXW / ZXW tools | Commercial repair tooling using XZZ `.pcb` encrypted boardviews | Closed commercial platform; encrypted formats; no redistribution rights. |

Conclusion: **Do not purchase or use grey-market Apple schematic/boardview bundles as
the project's dataset.** Their provenance is unlawful and bundling them would put the
project on the wrong side of the AGENTS.md data rules.

---

## 7. iFixit — legitimate physical-layer reference (limited)

- iFixit iPhone 8 device page (https://www.ifixit.com/Device/iPhone_8) has teardown
  guides and component-identification photos (model A1863, A1905 listed).
- Legitimate ACQUISITION of *photos/identifications*, usable for learning and for
  physical-layer context (which chip is where).
- **Not** structured boardview data (no pad/net geometry, no connectivity). Do not
  treat teardown photos as a data model source.

---

## 8. What this means — recommended data plan

```text
Layer                    Source                       Status
----------------------   ---------------------------  -------------------------------
Boardview geometry       NO legitimate source found   OPEN PROBLEM
(where things are)       for iPhone 8 .brd files

Reference measurements   OpenBoardData (ODbL)         FORMAT + registry ready,
(what values should be)                             but iPhone 8 values EMPTY

Schematic (how things    Grey-market only             AVOID until legit source exists
connect)

Physical photos / chips  iFixit                       legit, partial
```

### Concrete Phase 0/1-adjacent moves (to be confirmed with you)

1. **Proceed with the synthetic board** (Phase 1) — no real data needed for the
   workstation architecture. Unblocks all software work legally.
2. **Adopt the OpenBoardData `.obdata` format** as the reference-measurement interchange
   (licence allows it; it is the open standard used by this community).
3. **Record the iPhone 8 board-code mapping** (820-00871 → A1863) in domain docs, tagged
   `needs-validation`.
4. **Decide the boardview-geometry question** — options:
   - (a) Build the renderer around the **GenCAD plain-text interchange** and import
     *user-supplied* files they are licensed to use (matches README §10 "user-supplied
     data where permitted").
   - (b) Support the **community `.brd` (Testlink/Apple)** format at the *file reader*
     level only, and let the user supply their own files — we never publish them.
   - (c) Exclude boardview geometry entirely until a legitimate source is found
     (by building our own from licensed material — heavy).
   - (d) Seek permission/partnership with a legitimate data provider.

## 8A. Legal boardview fixtures we can download today (verified 2026-09-24)

The renderer/connectivity work does NOT need to wait on Apple data. Two legitimately
licensed, real board datasets are now in `data/raw/`:

| Dataset | Board | License | Format | Use |
| --- | --- | --- | --- | --- |
| MNT Reform (git.sr.ht/~rwa/reform @ a85c5df) | Open-source laptop motherboard | CERN-OHL-S v2 (declared in netlist title block) | KiCad 5.1 `.kicad_pcb` + `.net` netlist + `.sch` + BOM | Dense geometry fixture: 512 modules, 12,752 tracks, real nets |
| OpenSFC (github.com/starlightk7/OpenSFC @ 6574450) | Super Famicom motherboard | CERN-OHL-S-2.0 (LICENSE file) | **KiCad 9** `.kicad_pcb` + `.kicad_sch` | Second independent fixture; exercises modern KiCad format |

Why these three properties matter:

- Both are **real boards** (not hand-made demo data) with genuine coordinate/connectivity
  complexity — good stress tests for the renderer and parsers.
- Both are **CERN-OHL licensed** — we can derive, modify, and even redistribute with
  attribution/share-alike (AGENTS.md §13 "licensed real-device fixtures").
- Both are **KiCad format**, so writing one KiCad importer serves two independent,
  license-clean fixtures, plus any future user-supplied KiCad board.

Note: these are not iPhones. They validate *software* (rendering, search, connectivity).
iPhone-specific *content* still awaits a legitimate source. Also note the extra
milestone from OpenBoardData: a proven **`.obdata`** measurement format with real
examples (ip7 has populated diode-mode data incl. board conditions like
`AUDIO_IC_DESOLDERED`) — this is our reference-measurement model template.

### Open questions still to resolve

- Does the user (you) already own or have rights to any iPhone 8 boardview files? (README
  §10 explicitly anticipates "user-supplied data where permitted".)
- Do we want to contact OpenBoardData to contribute/claim the `iphone8_qualcomm` board?
- Is there a legitimate BD-seller willing to partner (e.g. licence-derived, permitted-use
  normalized data)?
- Which boardview format should the *first supported import format* be?

---

## 9. Provenance log

| Source | URL | Accessed | Content captured |
| --- | --- | --- | --- |
| FlexBV5 manual | https://pldaniels.com/flexbv5/manual/flexbv-manual.html | 2026-09-24 | Format table, licensing statements, OBData usage |
| OpenBoardView repo | https://github.com/OpenBoardView/OpenBoardView | 2026-09-24 | Format support, MIT licence, format internals |
| OpenBoardData site | https://openboarddata.org | 2026-09-24 | Board registry incl. iPhone 8 entries (empty), ODbL statement |
| OpenBoardData board pages | https://openboarddata.org/?a=showboardsolutions&bpath=phones/apple/iphone8_qualcomm (and ip8_*, ip8p_*) | 2026-09-24 | Confirmed iPhone 8 value tables currently empty |
| BoardRipper repo | https://github.com/vietluu2020/BoardRipper | 2026-09-24 | Format table, AGPL-3.0, no-bundled-data pattern |
| ODB README (GitHub) | https://github.com/inflex/OpenBoardData | 2026-09-24 | Project origin; MIT→ODbL licensing note |
| iPhone 8 board-code mappings | RepairLap, DZKJ schematics index, laptop-schematics.com MLB index, iMasterTeam FB post | 2026-09-24 | 820-00871 = A1863 Qualcomm; 820-00872 = A1905/A1906 Intel |
| iFixit | https://www.ifixit.com/Device/iPhone_8 | 2026-09-24 | Legit teardown/physical references |
| MNT Reform repo (sourcehut mirror) | https://git.sr.ht/~rwa/reform (commit a85c5df) | 2026-09-24 | KiCad motherboard boardview/netlist/schematic/BOM, CERN-OHL-S v2 |
| OpenSFC repo | https://github.com/starlightk7/OpenSFC (commit 6574450) | 2026-09-24 | KiCad 9 motherboard boardview/schematic, CERN-OHL-S-2.0 |