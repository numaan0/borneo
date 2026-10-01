import { readFileSync } from "node:fs";
import { importKicadPcb } from "@borneo/parsers";

const file = process.argv[2];
if (!file) {
  console.error("usage: inspect-bd <path-to.kicad_pcb>");
  process.exit(1);
}

const board = importKicadPcb(readFileSync(file, "utf8"), {
  sourceName: file,
  sourceFormat: "kicad_pcb",
  description: `inspect-bd run on ${file}`,
}).board;

console.log(JSON.stringify(
  {
    id: board.id,
    name: board.name,
    layers: board.layers.length,
    components: board.components.length,
    pads: board.pads.length,
    nets: board.nets.length,
    traces: board.traces.length,
    vias: board.vias.length,
    sampleComponents: board.components.slice(0, 5).map((c) => ({
      designator: c.designator,
      type: c.type,
      layer: c.layer,
      value: c.value,
      footprint: c.footprint,
      pads: board.pads.filter((p) => p.componentId === c.id).map((p) => ({ ref: p.ref, netId: p.netId })),
    })),
  },
  null,
  2
));