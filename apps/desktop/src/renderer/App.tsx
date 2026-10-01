import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  demoBoard,
  indexBoard,
  netMembers,
  searchBoard,
  type Board,
  type BoardIndex,
  type Component,
  type Net,
  type NetMembers,
} from "@borneo/domain";
import {
  BoardCanvasRenderer,
  panByScreenDelta,
  pickComponent,
  zoomAt,
  type CameraTransform,
  type Viewport,
} from "@borneo/rendering";
import type { OpenBoardViewResult } from "../shared/ipc";
import "./app.css";

interface BoardState {
  board: Board;
  index: BoardIndex;
}

function initialBoardState(): BoardState {
  // Open with the synthetic demo board so the window is never blank
  // (AGENTS.md §13: base workflow must not require licensed data).
  const board = demoBoard;
  return { board, index: indexBoard(board) };
}

export function App() {
  const [{ board, index }, setBoardState] = useState<BoardState>(initialBoardState);
  const [camera, setCamera] = useState<CameraTransform>({ center: { x: 9.5, y: 8 }, zoom: 40 });
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [query, setQuery] = useState("");
  const [lastOpened, setLastOpened] = useState<OpenBoardViewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<BoardCanvasRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport: Viewport = { width: canvas.width, height: canvas.height };
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!rendererRef.current) {
      rendererRef.current = new BoardCanvasRenderer(ctx);
    }
    // Reset the view to frame the whole board whenever a new board loads.
    setCamera((prev) => rendererRef.current!.fit(board, prev, viewport));
  }, [board]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const highlightedNetIds = selectedComponent
      ? new Set(
          index.padsByComponentId
            .get(selectedComponent.id)
            ?.map((pad) => pad.netId)
            .filter((netId): netId is string => netId !== null) ?? [],
        )
      : undefined;

    const viewport: Viewport = { width: canvas.width, height: canvas.height };
    rendererRef.current.render({
      board,
      camera,
      viewport,
      visibleLayers: new Set(["top", "bottom", "inner"]),
      highlightedNetIds,
    });
  }, [board, camera, selectedComponent, index]);

  const handleOpen = useCallback(async () => {
    try {
      const result = await window.borneo.openBoardView();
      setLastOpened(result);
      setError(null);
      if (!result.canceled && result.board) {
        setBoardState({ board: result.board, index: indexBoard(result.board) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const dragRef = useRef<{ pointerId: number; last: { x: number; y: number } } | null>(null);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, last: { x: event.clientX, y: event.clientY } };
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;
      if (drag.pointerId !== event.pointerId) return;
      const delta = { x: event.clientX - drag.last.x, y: event.clientY - drag.last.y };
      drag.last = { x: event.clientX, y: event.clientY };
      setCamera((prev) => panByScreenDelta(prev, delta));
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;
      // A click without meaningful drag = selection attempt
      const delta = Math.hypot(event.clientX - drag.last.x, event.clientY - drag.last.y);
      dragRef.current = null;
      if (delta > 4) return;

      const rect = canvas.getBoundingClientRect();
      const viewport: Viewport = { width: canvas.width, height: canvas.height };
      const screen = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const component = pickComponent(board, camera, viewport, screen);
      setSelectedComponent(component);
    },
    [board, camera],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const viewport: Viewport = { width: canvas.width, height: canvas.height };
      const pivot = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = 1 + (event.deltaY < 0 ? 0.1 : -0.1);
      setCamera((prev) => zoomAt(prev, pivot, factor, viewport));
    },
    [],
  );

  const results = useMemo(() => (query ? searchBoard(board, index, query) : null), [board, index, query]);

  const selectResult = useCallback(
    (designator: string) => {
      const component = index.componentsByDesignator.get(designator);
      if (!component) return;
      setSelectedComponent(component);
      setQuery("");
    },
    [index],
  );

  const selectedMemberComponents = useMemo(() => {
    if (!selectedComponent) return null;
    const netIds = index.padsByComponentId
      .get(selectedComponent.id)
      ?.map((pad) => pad.netId)
      .filter((netId): netId is string => netId !== null);
    const members = netIds
      ? [...new Set(netIds.flatMap((netId) => index.componentsByNetId.get(netId) ?? []))].filter(
          (c) => c.id !== selectedComponent.id,
        )
      : [];
    const netNames = netIds ? netIds.map((netId) => index.netsByNetId.get(netId)?.name ?? netId) : [];
    return { netNames, members };
  }, [selectedComponent, index]);

  const selectedMetal = useMemo(() => {
    if (!selectedComponent) return null;
    const netIds = index.padsByComponentId
      .get(selectedComponent.id)
      ?.map((pad) => pad.netId)
      .filter((netId): netId is string => netId !== null) ?? [];
    const metal = netIds
      .map((netId) => netMembers(board, index, netId))
      .filter((m): m is NonNullable<typeof m> => m !== null);
    return metal;
  }, [selectedComponent, index, board]);

  const selectedNetsSummary = useMemo(() => {
    if (!selectedComponent) return null;
    return index.padsByComponentId
      .get(selectedComponent.id)
      ?.map((pad) => ({ pad, net: pad.netId ? index.netsByNetId.get(pad.netId) : null }))
      .filter((entry) => entry !== undefined && entry.net !== null && entry.net !== undefined) as Array<{
      pad: { ref: string; netId: string | null };
      net: Net;
    }>;
  }, [selectedComponent, index]);

  return (
    <div className="app">
      <header className="toolbar">
        <button className="btn" onClick={() => void handleOpen()}>
          Open boardview…
        </button>
        <input
          className="search"
          type="search"
          placeholder="Search component or net (e.g. U1, VDD)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {results && (
          <div className="search-results">
            {results.components.map((component) => (
              <button key={component.id} className="result-row" onClick={() => selectResult(component.designator)}>
                {component.designator}
                {component.value ? ` — ${component.value}` : ""}
              </button>
            ))}
            {results.nets.map((net) => (
              <div key={net.id} className="result-row result-net">
                net: {net.name}
              </div>
            ))}
          </div>
        )}
        <span className="spacer" />
        <span className="board-name">
          {board.name} {board.revision ? `(${board.revision})` : ""}
        </span>
      </header>

      {error && <div className="error-strip">{error}</div>}
      {lastOpened && !lastOpened.canceled && lastOpened.warnings.length > 0 && (
        <div className="warn-strip">{lastOpened.warnings.length} import warning(s)</div>
      )}

      <main className="workspace">
        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            width={1000}
            height={640}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>
        <aside className="inspector">
          {selectedComponent ? (
            <Inspector
              component={selectedComponent}
              nets={selectedNetsSummary ?? []}
              connected={selectedMemberComponents}
              metal={selectedMetal}
            />
          ) : (
            <p className="hint">Click a component on the board, or search by designator.</p>
          )}
        </aside>
      </main>
    </div>
  );
}

function Inspector({
  component,
  nets,
  connected,
  metal,
}: {
  component: Component;
  nets: Array<{ pad: { ref: string; netId: string | null }; net: Net | null }>;
  connected: { netNames: string[]; members: Component[] } | null;
  metal: NetMembers[] | null;
}) {
  return (
    <div className="inspector-content">
      <h2>{component.designator}</h2>
      <dl className="kv">
        <dt>Type</dt>
        <dd>{component.type ?? "unknown"}</dd>
        <dt>Footprint</dt>
        <dd>{component.footprint ?? "unknown"}</dd>
        <dt>Value</dt>
        <dd>{component.value ?? "unknown"}</dd>
        <dt>Position</dt>
        <dd>
          ({component.position.x.value}, {component.position.y.value}) {component.position.x.unit}
        </dd>
        <dt>Schematic sheet</dt>
        <dd>{component.schematic?.sheetName ?? "none"}</dd>
      </dl>
      {nets.length > 0 && (
        <>
          <h3>Nets on this component</h3>
          {nets.map(({ pad, net }) => (
            <div key={pad.ref} className="pad-net">
              <span className="pad-ref">{pad.ref}</span>{" "}
              <span className="net-name">{net?.name ?? "(no net)"}</span>
            </div>
          ))}
        </>
      )}
      {connected && connected.members.length > 0 && (
        <>
          <h3>Connected components</h3>
          {connected.members.map((member) => (
            <div key={member.id}>{member.designator}</div>
          ))}
        </>
      )}
      {metal && metal.length > 0 && (
        <>
          <h3>Net stats</h3>
          {metal.map((m) => (
            <div key={m.net.id} className="net-stats">
              {m.net.name}: {m.pads.length} pads, {m.traces.length} traces, {m.vias.length} vias,{" "}
              {m.components.length} components
            </div>
          ))}
        </>
      )}
    </div>
  );
}