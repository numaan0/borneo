import { buildConnectivityGraph, demoBoard, indexBoard, netMembers } from "@borneo/domain";

const index = indexBoard(demoBoard);

// VDD net connects U1, C1, R1 with pad P1 of each
const vdd = netMembers(demoBoard, index, "net-vdd");
if (!vdd) throw new Error("net-vdd missing");
if (vdd.components.length !== 3) throw new Error(`vdd components expected 3, got ${vdd.components.length}`);
if (vdd.pads.length !== 3) throw new Error(`vdd pads expected 3, got ${vdd.pads.length}`);
if (vdd.traces.length !== 1) throw new Error(`vdd traces expected 1, got ${vdd.traces.length}`);

// unknown net -> null
if (netMembers(demoBoard, index, "net-nope") !== null) throw new Error("unknown net should be null");

// connectivity graph: U1 <-> R1 path must exist and be length 2
const graph = buildConnectivityGraph(demoBoard, index);
const pathU1R1 = graph.path("comp-u1", "comp-r1");
if (pathU1R1.length !== 2) throw new Error(`u1->r1 path expected 2 nodes, got ${JSON.stringify(pathU1R1)}`);
const pathU1C1 = graph.path("comp-u1", "comp-c1");
if (pathU1C1.length !== 2) throw new Error(`u1->c1 path expected 2 nodes, got ${JSON.stringify(pathU1C1)}`);

// no path between R1 and an isolated component (none in fixture, so verify R1->R1)
if (graph.path("comp-r1", "comp-r1").length !== 1) throw new Error("self path failed");

console.log("connectivity OK (vdd comps=%d, u1-r1 path=%s)", vdd.components.length, pathU1R1.join("->"));