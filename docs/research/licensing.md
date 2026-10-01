# Repair-data licensing landscape

> Phase 0 output. Status: **research in progress, not legal advice**
> Last updated: 2026-09-24

This document records what is known and unknown about the licensing of repair data,
and which sources we can and cannot use. It is not a legal opinion.

---

## 1. Summary table

| Dataset / format | Owner / author | Licence you were told | Status for our use |
| --- | --- | --- | --- |
| OpenBoardData reference measurements | OpenBoardData community (inflex / Paul L. Daniels) | ODbL 1.0 per live site | Usable with attribution, v/1-0 share-alike obligations |
| OpenBoardView parser code | OpenBoardView contributors | MIT | Usable as reference (not data) |
| BoardRipper viewer code | BoardRipper contributors | AGPL-3.0 | Usable as reference (be careful: copyleft if we copy code) |
| FlexBV viewer software | Paul L. Daniels | Commercial (perpetual, $150) | Part of our research target/competitor; not our dataset |
| Apple iPhone 8 schematic PDFs | Apple (proprietary) | None granted; community redistributes | NOT usable |
| Circulating ".brd" iPhone 8 boardview files | Apple-derived test formats, community-converted | None granted | NOT usable for redistribution |
| laptop-schematics.com / repairlap packages | Grey market resellers | None granted ("property of Apple") | NOT usable |
| ZXW / XZZ `.pcb` data | XinZhiZao / ZXW tools | Proprietary, encrypted | NOT usable unless licensed |

---

## 2. The one clearly-licensed useful dataset: OpenBoardData (ODbL)

### What ODbL 1.0 means (plain English)

- It is an **open database licence** maintained by Open Data Commons /
  Open Knowledge Foundation.
- You may: share, extract, use, and create derivatives of the database.
- Obligations include:
  - keep the database under the same licence (share-alike),
  - attribute contributors,
  - if you produce a derivative database, share it under ODbL too
    (or make the extracted/database content available under ODbL).
- It is designed exactly for datasets like "known-good measurements per net".

### Caveat: verify, don't trust my summary

LICENCE STATUS: ODbL 1.0 (per openboarddata.org statements in generated data, 2026-09-24)

```text
Needed validation: re-read https://opendatacommons.org/licenses/odbl/1-0/ before we
redistribute anything derived from OpenBoardData, and confirm the exact dataset
terms for the specific board files we import.
```

### What we need from the project side if we ship derived OpenBoardData

```yaml
source:
  name: "OpenBoardData"
  provider: "community / openboarddata.org"
  acquisition_date: "2026-09-24"
  licence: "ODbL 1.0"
  permitted_use: "read + use in the workstation; redistribute derived database under ODbL with attribution"
  redistribution_allowed: true   # conditioned on ODbL compliance
  notes: "Verify against actual ODbL text before shipping any derived data."
```

---

## 3. Mitigated-risk avenues for boardview geometry

Right now there is **no legitimately-licensed iPhone 8 boardview geometry** we can:
download, import, normalize, and ship. The community files all derive from Apple
proprietary data and are redistributed without permission.

Mitigation options (decision needed — see data-sources.md §8):

1. **User imports their own files.** The workstation reads files the user already owns
   or is licensed to use. We never redistribute. (Matches README §10.)
2. **Import to adjusted synthetic data.** We build the renderer against GenCAD/own
   fixtures; real "debris" files are optional user-provided inputs.
3. **Wait until a licensed source exists** (partner/licence, or a claimant of a
   legitimately available dataset).
4. **Build our own from permitted material** (e.g. our own board measurements) — heavy,
   out of Phase 0.

None of these require us to *ship* infringing data.

---

## 4. "It's fine because it's downloadable" is wrong

Community forums and cheap-vendor sites make iOS boardview files trivially available.
That is irrelevant to licensing: downloadable ≠ licensed. Several grey-market pages even
admit the schematics belong to Apple. Redistributing such files in our product is
exactly the behavior AGENTS.md §3 forbids.

---

## 5. What we still need to find out (open questions)

- Where do claimed "licensed" iPad/iPhone data packages (REFox BITMAP, others) actually
  derive their data from? (Their TOS likely treats docs as their own; unclear.)
- Is there an official/authorized channel (e.g. an Apple-Authorized repair provider
  licence terms, or a court-approved repairability data release)?
- What are the ODbL attribution/indicator requirements as implemented by OpenBoardData's
  web UI (does the site provide a preferred attribution form)?
- Do the commercial ecosystem terms (FlexBV EULA) place any further restriction on us
  reading OpenBoardData files through our own software? (Unlikely, but worth checking.)

---

## 6. Related legal/policy notes (as reminders, not advice)

- Licensing ⟺ jurisdiction-specific; this document is a research note, not a lawyer's
  memo.
- If the project ever processes customer repair data, that introduces separate privacy
  concerns (out of scope here).
- "Open" formats (GenCAD plain-text, BVR, BRD2) may be freely parsed; the **data**
  inside them can still be copyright/otherwise restricted. Parsing tool vs dataset are
  two different licence questions.