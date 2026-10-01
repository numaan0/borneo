import type { Board, Component, Net, Pad, Trace, Via } from "./board";
import type { BoardIndex } from "./indexed-board";

/**
 * Net connectivity summary — the "show connected objects" feature
 * (MVP items 6-8, see docs/planning/phase-1.md).
 */
export interface NetMembers {
  net: Net;
  pads: Pad[];
  traces: Trace[];
  vias: Via[];
  components: Component[];
}

/** All objects attached to a single net. */
export function netMembers(board: Board, index: BoardIndex, netId: string): NetMembers | null {
  const net = index.netsByNetId.get(netId);
  if (!net) {
    return null;
  }
  return {
    net,
    pads: index.padsByNetId.get(netId) ?? [],
    traces: index.tracesByNetId.get(netId) ?? [],
    vias: index.viasByNetId.get(netId) ?? [],
    components: index.componentsByNetId.get(netId) ?? [],
  };
}

/**
 * A simple undirected connectivity graph between components made from shared nets.
 * Component A and B are adjacent when they share at least one net.
 * This is the boardview-level connectivity; schematic relationships are separate
 * (AGENTS.md §9).
 */
export interface ConnectivityGraph {
  adjacency: Map<string, Set<string>>;
  /** Shortest path (component ids, BFS). Empty when no path exists. */
  path(startId: string, endId: string): string[];
}

export function buildConnectivityGraph(board: Board, index: BoardIndex): ConnectivityGraph {
  const adjacency = new Map<string, Set<string>>();

  const addEdge = (a: string, b: string) => {
    if (a === b) {
      return;
    }
    let na = adjacency.get(a);
    if (!na) {
      na = new Set<string>();
      adjacency.set(a, na);
    }
    na.add(b);
    let nb = adjacency.get(b);
    if (!nb) {
      nb = new Set<string>();
      adjacency.set(b, nb);
    }
    nb.add(a);
  };

  for (const [, pads] of index.padsByNetId) {
    for (let i = 0; i < pads.length; i += 1) {
      const a = pads[i];
      if (!a) {
        continue;
      }
      for (let j = i + 1; j < pads.length; j += 1) {
        const b = pads[j];
        if (b) {
          addEdge(a.componentId, b.componentId);
        }
      }
    }
  }

  const path = (startId: string, endId: string): string[] => {
    if (startId === endId) {
      return [startId];
    }
    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    const previous = new Map<string, string>();
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined) {
        break;
      }
      if (current === endId) {
        break;
      }
      const neighbors = adjacency.get(current);
      if (!neighbors) {
        continue;
      }
      for (const next of neighbors) {
        if (visited.has(next)) {
          continue;
        }
        visited.add(next);
        previous.set(next, current);
        if (next === endId) {
          break;
        }
        queue.push(next);
      }
    }
    if (!visited.has(endId)) {
      return [];
    }
    const result: string[] = [];
    let cursor: string | undefined = endId;
    while (cursor !== undefined) {
      result.unshift(cursor);
      cursor = previous.get(cursor);
    }
    return result;
  };

  return { adjacency, path };
}