export type Unit = "mm";

export type ValueWithUnit<T extends string = string> = {
  value: number;
  unit: T;
};

export type Position = {
  x: ValueWithUnit<Unit>;
  y: ValueWithUnit<Unit>;
};

export type LayerId = "top" | "bottom" | "inner";

export type ComponentType =
  | "resistor"
  | "capacitor"
  | "inductor"
  | "diode"
  | "transistor"
  | "ic"
  | "connector"
  | "switch"
  | "battery"
  | "crystal"
  | "other";

export type LayerKind = "copper" | "silkscreen" | "mask" | "paste" | "edge" | "user";

export interface BoardLayer {
  /** Unique source layer key, e.g. "F.Cu". */
  id: string;
  name: string;
  kind: LayerKind;
  /** Copper position when kind === "copper"; null for non-copper layers. */
  copper: LayerId | null;
}

/**
 * Schematic-level electrical terminal of a component.
 *
 * Per AGENTS.md §9: pads are physical (boardview), pins are electrical (schematic).
 * A pin and a pad that refer to the same terminal share no implicit identity; an
 * explicit cross-reference is required when linking is implemented.
 */
export interface Pin {
  id: string;
  componentId: string;
  ref: string;
  netId: string | null;
}

export interface Component {
  id: string;
  designator: string;
  type: ComponentType | null;
  layer: LayerId;
  position: Position;
  rotationDeg: number;
  value: string | null;
  footprint: string | null;
  /** Locates the component's schematic counter-entity, if a linked schematic source exists. */
  schematic: {
    path: string | null;
    sheetName: string | null;
    sheetFile: string | null;
  };
  /** Schematic-level terminals. Empty unless a schematic source was imported. */
  pins: Pin[];
}

export interface Pad {
  id: string;
  componentId: string;
  ref: string;
  name: string | null;
  netId: string | null;
  layer: LayerId;
  position: Position;
}

export interface Net {
  id: string;
  name: string;
}

export interface Trace {
  id: string;
  netId: string;
  layer: LayerId;
  points: Position[];
}

export interface Via {
  id: string;
  netId: string | null;
  layers: LayerId[];
  position: Position;
}

export interface TestPoint {
  id: string;
  netId: string | null;
  layer: LayerId;
  position: Position | null;
  description: string | null;
}

/**
 * Provenance for a board dataset. Real imported data must carry this (AGENTS.md §3,
 * §17); synthetic fixtures identify themselves so they can never be mistaken for
 * real repair data.
 */
export interface SourceReference {
  kind: "synthetic-fixture" | "imported";
  sourceFormat?: string;
  description: string;
  created: string;
  /** From the source-level provenance block (AGENTS.md §3), when one exists. */
  provenances: UnknownYaml[];
}

/** Placeholder for the YAML provenance metadata block defined in AGENTS.md §3. */
export type UnknownYaml = Record<string, string | number | boolean>;

export interface BoardRevision {
  id: string;
  boardId: string;
  label: string | null;
  description: string | null;
}

export interface Board {
  id: string;
  name: string;
  model: string;
  revision: string | null;
  unit: Unit;
  layers: BoardLayer[];
  components: Component[];
  pads: Pad[];
  nets: Net[];
  traces: Trace[];
  vias: Via[];
  testPoints: TestPoint[];
  revisions: BoardRevision[];
  provenance: SourceReference;
}