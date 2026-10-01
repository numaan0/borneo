import { demoBoard, indexBoard, searchBoard } from "@borneo/domain";

const index = indexBoard(demoBoard);

// designator lookup
const u1 = index.componentsByDesignator.get("U1");
if (!u1 || u1.id !== "comp-u1") throw new Error("designator lookup failed");

// pad -> component (by id)
const c1 = index.componentsById.get("comp-c1");
if (!c1 || c1.designator !== "C1") throw new Error("byId lookup failed");

// pads by component
const u1Pads = index.padsByComponentId.get("comp-u1");
if (!u1Pads || u1Pads.length !== 6) throw new Error(`u1 pads expected 6, got ${u1Pads?.length}`);
if ((u1Pads[0]?.netId ?? null) !== "net-vdd") throw new Error("u1 pad0 net wrong");

// net "VDD_DEMO": pads on it + traces on it + components on it
const netVdd = index.netsByNetName.get("VDD_DEMO");
if (!netVdd || netVdd.id !== "net-vdd") throw new Error("net name lookup failed");
const vddPads = index.padsByNetId.get("net-vdd");
if (!vddPads || vddPads.length !== 3) throw new Error(`vdd pads expected 3, got ${vddPads?.length}`);
const vddTraces = index.tracesByNetId.get("net-vdd");
if (!vddTraces || vddTraces.length !== 1) throw new Error("vdd traces expected 1");
const vddComps = index.componentsByNetId.get("net-vdd");
if (!vddComps || vddComps.length !== 3) throw new Error(`vdd components expected 3, got ${vddComps?.length}`);

// search (case-insensitive substring)
const r1 = searchBoard(demoBoard, index, "r1");
if (r1.components.some((c) => c.designator !== "R1")) throw new Error("search r1 unexpected matches");
const gnd = searchBoard(demoBoard, index, "GND");
if (!gnd.nets.some((n) => n.name === "GND_DEMO")) throw new Error("search GND missed net");

// empty query returns nothing
const empty = searchBoard(demoBoard, index, "  ");
if (empty.components.length !== 0 || empty.nets.length !== 0) throw new Error("empty query should return nothing");

console.log("index/search OK (U1 pads=%d, VDD pads=%d, VDD comps=%d)", u1Pads.length, vddPads.length, vddComps.length);