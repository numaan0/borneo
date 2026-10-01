# Competitor / ecosystem research

> Phase 0 output. Status: **research in progress**
> Just a snapshot to ground the workstation design; not a full business analysis.

---

## 1. Why we write this

README §17 says do not position as "another boardview software". To know what adjacent
tools already do (and where they leave gaps), we list them. Focus is on **what they
solve** and **what is licence-usable for us**, not marketing.

---

## 2. Tools we looked at

### 2.1 FlexBV (pldaniels.com/flexbv5)

- Paid perpetual licence ($150), also "FlexBV Free" edition.
- Boardview + schematic PDF viewer, cross-platform.
- Features: cross-referencing board-to-schematic, part search, diagram overlays,
  OBData integration, "constellation view", mycelium extensions.
- Explicitly does **not** bundle boardview files ("illegal to distribute other company's
  boardview & schematic files" — their manual).
- Business model: **software licenced perpetually, data supplied by user / user's own files.**

Relevance: closest commercial analogue to "workstation connecting board + schematic".
Gap: single-user local tool; measurements stored but workflow capture/synced diagnostics
are limited; data overlays come from OpenBoardData (ODbL).

### 2.2 OpenBoardView (open) / Bytexceed-ish followers

- Free, open source (MIT) viewer for `.brd` etc.; a "drop-in replacement" for
  TestLink/Landrex.
- Used by the repair community; Linux/SDL+ImGui, GitHub-community maintained.

Relevance: shows the baseline feature set that is *already free*. We can't win on
"viewer" alone. Confirm the open-source tooling already covers basic navigation.

### 2.3 BoardRipper (AGPL-3.0, web-based)

- 11 boardview formats, with matching PDF schematic, in a browser; self-hostable.
- Explicitly: bring-your-own-files; no copyrighted content bundled.
- "Reference metadata (board numbers and device models)" only.

Relevance: proves "web + 11 formats + no bundled data" is viable open source.
Positions the "viewer" commodity further down-market.

### 2.4 REFOX BITMAP / ZXW / ZXW-type tools

- REFOX BITMAP: commercial subscription, Windows only, monthly updates, broad device
  coverage (Apple/Android news + boards), database built internally + via vendors.
- ZXW: commercial repair tooling; encrypted XZZ `.pcb` boardviews; closed ecosystem.
- These make their money on **data convenience (subscription to diagram database)**,
  not on the viewer itself.

Relevance: confirms the **data bundle is the commercial value**, and that competitors
keep data closed and locked to their own tools. This is exactly the "must not reuse
for us" space.

### 2.5 Grey-market individual file sellers

- laptop-schematics.com ($20/board packages), repairlap threads, dzkj schematics index,
  phonerepairingsolutions — sell iPhone boardview + schematic + silk-sreen bundles.
- Data claimed Apple-proprietary; site text admits so.

Relevance: they sell **bundles, not tools**. We will not reproduce that business model
or that data. But note: their presence shows technicians **pay** for convenience and
for "schematic + boardview together".

### 2.6 Repair guides / BOM / other

- iFixit: teardowns, component identification photos, device pages (legit license).
- Community forums (repairlap, badcaps.net, elektronica-pt) as discussion ports.

Relevance: useful for learning and for physical-layer context; not a structured boardview
source.

---

## 3. Current gaps we might fill (hypotheses, needs validation)

1. **Workflow integration** — README's pitch: reduce context switching between board,
   schematic and measurements in *one* workspace. Existing tools are mostly viewers +
   side features, not a measurement/notes/repair-case journal bound to the board.
2. **Open, user-ownable data** — OpenBoardData-style open measurements para-layering;
   community contributions without vendor lock-in (opposite of REFOX/ZXW).
3. **Explainability** — diagnostic suggestions with evidence + source + confidence
   (not "C123 is faulty").
4. **Licence-clean** — we never ship Apple-proprietary files; long-term defensibility.

Hypotheses stay hypotheses until validated with technicians (see technician-interviews.md).

---

## 4. What NOT to take from competitors

- Do not copy REFOX/ZXW closed-data model.
- Do not copy grey-market file bundling.
- Do not copy their UI (we want board-nav-first, not admin dashboard).

---

## 5. Provenance

| Source | URL | Accessed |
| --- | --- | --- |
| FlexBV5 | https://pldaniels.com/flexbv5 | 2026-09-24 |
| FlexBV manual | https://pldaniels.com/flexbv5/manual/flexbv-manual.html | 2026-09-24 |
| OpenBoardView | https://github.com/OpenBoardView/OpenBoardView | 2026-09-24 |
| BoardRipper | https://github.com/vietluu2020/BoardRipper | 2026-09-24 |
| REFOX | https://refoxtech.com/products/refox-bitmap | 2026-09-24 |
| laptop-schematics.com | https://laptop-schematics.com/view/15538/ | 2026-09-24 |
| iFixit | https://www.ifixit.com/Device/iPhone_8 | 2026-09-24 |