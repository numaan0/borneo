import type { Board, Component, Net, Pad, Trace, Via } from "./board";

/**
 * Indexed search/selection helper over a Board (AGENTS.md Â§16):
 * search uses prebuilt maps, not scans over the render tree.
 * Build once per loaded board.
 */
export interface BoardIndex {
  componentsByDesignator: ReadonlyMap<string, Component>;
  componentsById: ReadonlyMap<string, Component>;
  componentsByNetId: ReadonlyMap<string, Component[]>;
  netsByNetId: ReadonlyMap<string, Net>;
  netsByNetName: ReadonlyMap<string, Net>;
  padsByNetId: ReadonlyMap<string, Pad[]>;
  padsByComponentId: ReadonlyMap<string, Pad[]>;
  tracesByNetId: ReadonlyMap<string, Trace[]>;
  viasByNetId: ReadonlyMap<string, Via[]>;
}

export function indexBoard(board: Board): BoardIndex {
  const componentsByDesignator = new Map<string, Component>();
  const componentsById = new Map<string, Component>();
  const componentsByNetId = new Map<string, Component[]>();
  const netsByNetId = new Map<string, Net>();
  const netsByNetName = new Map<string, Net>();
  const padsByNetId = new Map<string, Pad[]>();
  const padsByComponentId = new Map<string, Pad[]>();
  const tracesByNetId = new Map<string, Trace[]>();
  const viasByNetId = new Map<string, Via[]>();

  for (const net of board.nets) {
    netsByNetId.set(net.id, net);
    if (net.name) {
      netsByNetName.set(net.name, net);
    }
  }

  for (const component of board.components) {
    componentsByDesignator.set(component.designator, component);
    componentsById.set(component.id, component);
  }

  for (const pad of board.pads) {
    appendToList(padsByComponentId, pad.componentId, pad);
    if (pad.netId) {
      appendToList(padsByNetId, pad.netId, pad);
    }
  }

  for (const trace of board.traces) {
    appendToList(tracesByNetId, trace.netId, trace);
  }

  for (const via of board.vias) {
    if (via.netId) {
      appendToList(viasByNetId, via.netId, via);
    }
  }

  // components by net: from pads connected to that net
  for (const [netId, pads] of padsByNetId) {
    const seen = new Set<string>();
    const components: Component[] = [];
    for (const pad of pads) {
      const component = componentsById.get(pad.componentId);
      if (component && !seen.has(component.id)) {
        seen.add(component.id);
        components.push(component);
      }
    }
    if (components.length > 0) {
      componentsByNetId.set(netId, components);
    }
  }

  return {
    componentsByDesignator,
    componentsById,
    componentsByNetId,
    netsByNetId,
    netsByNetName,
    padsByNetId,
    padsByComponentId,
    tracesByNetId,
    viasByNetId,
  };
}

function appendToList<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list) {
    list.push(value);
  } else {
    map.set(key, [value]);
  }
}

/** Case-insensitive substring match on designator or net name. */
export interface SearchResult {
  components: Component[];
  nets: Net[];
}

export function searchBoard(board: Board, index: BoardIndex, query: string): SearchResult {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { components: [], nets: [] };
  }

  const components: Component[] = [];
  const nets: Net[] = [];

  for (const component of board.components) {
    if (component.designator.toLowerCase().includes(q)) {
      components.push(component);
    }
  }

  for (const net of board.nets) {
    if (net.name.toLowerCase().includes(q)) {
      nets.push(net);
    }
  }

  return { components, nets };
}