import type {
  Board,
  BoardLayer,
  Component,
  LayerId,
  Net,
  Pad,
  Trace,
  Via,
} from "@borneo/domain";
import { findChild, findChildren, isList, parseSExpr, toNumber } from "../../common/sexpr";
import type { SExprList } from "../../common/sexpr";

export interface KicadPcbImportOptions {
  sourceName: string;
  sourceFormat: string;
  description: string;
}

export interface KicadPcbImportResult {
  board: Board;
  warnings: string[];
}

const COPPER_KIND = new Set(["signal", "power"]);

function layerIdFromName(name: string, kind: string): LayerId | null {
  if (!COPPER_KIND.has(kind)) {
    return null;
  }
  if (name === "F.Cu") {
    return "top";
  }
  if (name === "B.Cu") {
    return "bottom";
  }
  return "inner";
}

function layerKindOf(kind: string): BoardLayer["kind"] {
  if (COPPER_KIND.has(kind)) {
    return "copper";
  }
  if (kind.includes("Silk")) {
    return "silkscreen";
  }
  if (kind.includes("Mask")) {
    return "mask";
  }
  if (kind.includes("Paste")) {
    return "paste";
  }
  if (kind.includes("Edge")) {
    return "edge";
  }
  return "user";
}

function numberToken(list: SExprList, index = 0): number | null {
  return toNumber(list, index);
}

function stringToken(list: SExprList, index = 0): string | null {
  const value = list.children[index];
  return value?.type === "atom" ? value.value : null;
}

const DESIGNATOR_TYPES: Record<string, Component["type"]> = {
  R: "resistor",
  C: "capacitor",
  L: "inductor",
  D: "diode",
  Q: "transistor",
  U: "ic",
  J: "connector",
  SW: "switch",
  BT: "battery",
  Y: "crystal",
  X: "crystal",
};

function typeFromDesignator(designator: string): Component["type"] {
  if (DESIGNATOR_TYPES[designator]) {
    return DESIGNATOR_TYPES[designator];
  }
  const prefix = designator.match(/^[A-Z]+/)?.[0] ?? "";
  let best: Component["type"] | null = null;
  for (const [key, type] of Object.entries(DESIGNATOR_TYPES)) {
    if (prefix.length >= key.length && prefix.startsWith(key)) {
      best = type;
    }
  }
  return best;
}

export function importKicadPcb(source: string, options: KicadPcbImportOptions): KicadPcbImportResult {
  const warnings: string[] = [];
  const parsed = parseSExpr(source);
  if (!isList(parsed)) {
    throw new Error("not a kicad_pcb file");
  }
  const root = parsed;
  if (root.children.length === 0 || root.children[0]?.type !== "atom" || root.children[0].value !== "kicad_pcb") {
    throw new Error("not a kicad_pcb file");
  }

  const netsOut: Net[] = [];
  for (const net of findChildren(root, "net")) {
    const id = numberToken(net, 1);
    const name = stringToken(net, 2);
    if (id === null) {
      continue;
    }
    if (id !== 0) {
      netsOut.push({ id: `net-${id}`, name: name ?? `net-${id}` });
    }
  }

  const layersOut: BoardLayer[] = [];
  const copperLayerFor = new Map<string, LayerId>();
  const boardLayersNode = findChild(root, "layers");
  if (boardLayersNode) {
    for (const layer of boardLayersNode.children) {
      if (!isList(layer)) {
        continue;
      }
      const name = stringToken(layer, 1);
      const kind = stringToken(layer, 2) ?? "user";
      if (name === null) {
        continue;
      }
      const mapped = layerIdFromName(name, kind);
      if (mapped !== null) {
        copperLayerFor.set(name, mapped);
      }
      if (COPPER_KIND.has(kind)) {
        layersOut.push({ id: name, name, kind: "copper", copper: mapped ?? "inner" });
      } else {
        layersOut.push({ id: name, name, kind: layerKindOf(kind), copper: null });
      }
    }
  }

  const components: Component[] = [];
  const pads: Pad[] = [];

  const componentNodes = [...findChildren(root, "module"), ...findChildren(root, "footprint")];
  for (const node of componentNodes) {
    const footprint = stringToken(node, 1);
    const atChild = findChild(node, "at");
    const at = atChild
      ? { x: numberToken(atChild, 1) ?? 0, y: numberToken(atChild, 2) ?? 0, rotation: numberToken(atChild, 3) ?? 0 }
      : { x: 0, y: 0, rotation: 0 };

    let designator: string | null | undefined = null;
    let value: string | null = null;
    for (const prop of findChildren(node, "fp_text")) {
      const kind = stringToken(prop, 1);
      const text = stringToken(prop, 2);
      if (kind === "reference") {
        designator = text;
      } else if (kind === "value") {
        value = text;
      }
    }
    for (const prop of findChildren(node, "property")) {
      const kind = stringToken(prop, 1);
      const text = stringToken(prop, 2);
      if (kind === "Reference") {
        designator = text;
      } else if (kind === "Value") {
        value = text;
      }
    }

    if (designator === null || designator === undefined) {
      warnings.push(`component without reference designator (footprint ${footprint ?? "unknown"})`);
      continue;
    }

    const layerNode = findChild(node, "layer");
    const compLayerName = layerNode ? stringToken(layerNode, 1) : null;
    const compLayer: LayerId = compLayerName && compLayerName !== "B.Cu" ? "top" : "bottom";

    const schematic = {
      path: null as string | null,
      sheetName: null as string | null,
      sheetFile: null as string | null,
    };
    const path = findChild(node, "path");
    if (path) {
      schematic.path = path.children.slice(1).map((c) => (c.type === "atom" ? c.value : "")).join("/");
    }
    const sheetName = findChild(node, "sheetname");
    if (sheetName) {
      schematic.sheetName = sheetName.children.slice(1).map((c) => (c.type === "atom" ? c.value : "")).join("");
    }
    const sheetFile = findChild(node, "sheetfile");
    if (sheetFile) {
      schematic.sheetFile = sheetFile.children.slice(1).map((c) => (c.type === "atom" ? c.value : "")).join("");
    }

    const component: Component = {
      id: `c-${designator}`,
      designator,
      type: typeFromDesignator(designator),
      layer: compLayer,
      position: { x: { value: at.x, unit: "mm" }, y: { value: at.y, unit: "mm" } },
      rotationDeg: at.rotation,
      value,
      footprint,
      schematic,
      pins: [],
    };
    components.push(component);

    const rotationRad = (at.rotation * Math.PI) / 180;
    const cosR = Math.cos(rotationRad);
    const sinR = Math.sin(rotationRad);

    for (const pad of findChildren(node, "pad")) {
      const padNumber = stringToken(pad, 1) ?? "?";
      const padAt = findChild(pad, "at");
      const padPos = padAt ? { x: numberToken(padAt, 1) ?? 0, y: numberToken(padAt, 2) ?? 0 } : { x: 0, y: 0 };
      const offsetX = padPos.x * cosR - padPos.y * sinR;
      const offsetY = padPos.x * sinR + padPos.y * cosR;
      const netChild = findChild(pad, "net");
      const netId = netChild ? numberToken(netChild, 1) ?? 0 : 0;
      const padLayersNode = findChild(pad, "layers");
      const padLayerNames =
        padLayersNode?.children
          .filter((c): c is { type: "atom"; value: string } => c.type === "atom" && c.value !== "layers")
          .map((c) => c.value) ?? [];
      const padLayer: LayerId = padLayerNames.includes("B.Cu") ? "bottom" : "top";

      pads.push({
        id: `p-${designator}-${padNumber}`,
        componentId: component.id,
        ref: padNumber,
        name: netChild ? stringToken(netChild, 2) : null,
        netId: netId === 0 ? null : `net-${netId}`,
        layer: padLayer,
        position: {
          x: { value: at.x + offsetX, unit: "mm" },
          y: { value: at.y + offsetY, unit: "mm" },
        },
      });
    }
  }

  const traces: Trace[] = [];
  const segments = findChildren(root, "segment");
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (!segment) {
      continue;
    }
    const start = findChild(segment, "start");
    const end = findChild(segment, "end");
    const netChild = findChild(segment, "net");
    const netId = netChild ? numberToken(netChild, 1) ?? 0 : 0;
    const layerList = findChild(segment, "layer");
    const layerName = layerList ? stringToken(layerList, 1) : null;
    const layer: LayerId = layerName ? (copperLayerFor.get(layerName) ?? "inner") : "inner";

    if (start && end) {
      traces.push({
        id: `t-${i}`,
        netId: `net-${netId}`,
        layer,
        points: [
          { x: { value: numberToken(start, 1) ?? 0, unit: "mm" }, y: { value: numberToken(start, 2) ?? 0, unit: "mm" } },
          { x: { value: numberToken(end, 1) ?? 0, unit: "mm" }, y: { value: numberToken(end, 2) ?? 0, unit: "mm" } },
        ],
      });
    }
  }

  const vias: Via[] = [];
  const viaNodes = findChildren(root, "via");
  for (let i = 0; i < viaNodes.length; i += 1) {
    const via = viaNodes[i];
    if (!via) {
      continue;
    }
    const viaAt = findChild(via, "at");
    const netChild = findChild(via, "net");
    const netId = netChild ? numberToken(netChild, 1) ?? 0 : 0;
    const viaLayersNode = findChild(via, "layers");
    const viaLayerNames =
      viaLayersNode?.children
        .filter((c): c is { type: "atom"; value: string } => c.type === "atom" && c.value !== "layers")
        .map((c) => c.value) ?? [];
    const mappedViaLayers = viaLayerNames
      .map((name) => copperLayerFor.get(name))
      .filter((l): l is LayerId => l !== undefined);
    const viaLayers: LayerId[] = mappedViaLayers.length > 0 ? mappedViaLayers : ["top", "bottom"];
    vias.push({
      id: `v-${i}`,
      netId: netId === 0 ? null : `net-${netId}`,
      layers: viaLayers,
      position: { x: { value: viaAt ? numberToken(viaAt, 1) ?? 0 : 0, unit: "mm" }, y: { value: viaAt ? numberToken(viaAt, 2) ?? 0 : 0, unit: "mm" } },
    });
  }

  return {
    board: {
      id: `kicad-${options.sourceName}`,
      name: options.sourceName,
      model: options.sourceFormat,
      revision: null,
      unit: "mm",
      layers: layersOut,
      components,
      pads,
      nets: netsOut,
      traces,
      vias,
      testPoints: [],
      revisions: [],
      provenance: {
        kind: "imported",
        sourceFormat: options.sourceFormat,
        description: options.description,
        created: new Date().toISOString(),
        provenances: [],
      },
    },
    warnings,
  };
}