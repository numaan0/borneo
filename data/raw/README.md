# data/raw — imported source data

Status: **do not redistribute anything here without checking each dataset's licence.**

Every subdirectory below has provenance metadata and must only contain data we are
permitted to use. Per AGENTS.md §3 and §18: no pirated, leaked, or unauthorized data
is ever placed here.

---

## openboarddata/

| Field | Value |
| --- | --- |
| source.name | OpenBoardData |
| source.provider | OpenBoardData community (openboarddata.org) |
| acquisition_date | 2026-09-24 |
| licence | ODbL 1.0 (Open Data Commons Open Database License) |
| licence_url | https://opendatacommons.org/licenses/odbl/1-0/ |
| permitted_use | read, use, derive; share-alike under ODbL with attribution |
| redistribution_allowed | true (conditioned on ODbL compliance) |
| notes | iPhone 8 entries (iphone8_qualcomm, ip8_qualcomm) are currently EMPTY. ip5/ip7 included as format examples. Files claim licence in-header: "Released under the OBbL - https://opendatacommons.org/licenses/odbl/1-0/". Verify against actual ODbL text before redistribution. |

Files:

| File | Source path on openboarddata.org |
| --- | --- |
| iphone8_qualcomm.obdata | phones/apple/iphone8_qualcomm |
| ip8_qualcomm.obdata | phones/apple/ip8_qualcomm |
| ip5_example.obdata | phones/apple/ip5 |
| ip7_example.obdata | phones/apple/ip7 |

## mnt-reform/

| Field | Value |
| --- | --- |
| source.name | MNT Reform (open source portable computer) |
| source.provider | MNT Research GmbH, MNT community |
| acquisition_date | 2026-09-24 |
| licence | CERN-OHL-S v2 (schematics/PCBs); declared in netlist title block |
| license_url | https://git.sr.ht/~rwa/reform (sourcehut mirror of https://source.mnt.re/reform/reform) |
| permitted_use | study, modify, reproduce per CERN-OHL-S |
| redistribution_allowed | yes, under CERN-OHL-S terms |
| notes | Downloaded commit a85c5df98993dc0e41c840ed7d0a602639a19f1a (sparse: reform2-motherboard-pcb/). KiCad 5.1 motherboard boardview (512 modules, 12,752 tracks), netlist, schematic, BOM, PDF. See README.md in that folder. |

## opensfc/

| Field | Value |
| --- | --- |
| source.name | OpenSFC — OSHW Super Famicom/SNES reproduction parts |
| source.provider | starlightk7 |
| acquisition_date | 2026-09-24 |
| licence | CERN-OHL-S-2.0 |
| license_url | https://github.com/starlightk7/OpenSFC |
| permitted_use | study, repair, modify, sell per CERN-OHL-S-2.0 |
| redistribution_allowed | yes, per CERN-OHL-S-2.0 |
| notes | Downloaded commit 6574450b1a4594b2aae436cf23869b0fb5808ce8. Includes schematics, boardviews, BOM. Notable: it explicitly lists "aiding repairs and failure diagnostics through the created schematics and boardviews" as a permitted use. KiCad 9 motherboard boardview + schematic. See README.md in that folder. |

## samples/

Synthetic fixtures we author ourselves (Phase 1). See data/samples/README if any are added.