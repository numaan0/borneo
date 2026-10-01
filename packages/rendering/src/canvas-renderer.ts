import type { Board, LayerId, Net } from "@borneo/domain";
import { boundsOfBoard, cameraToFit, worldToScreen, type CameraTransform, type Viewport } from "./transform";

export interface RenderOptions {
  board: Board;
  camera: CameraTransform;
  viewport: Viewport;
  /** Layers to draw (copper ids are meaningful for traces/pads/vias). */
  visibleLayers: ReadonlySet<LayerId>;
  /** Net ids to highlight; others are dimmed. */
  highlightedNetIds?: ReadonlySet<string>;
}

const LAYER_COLOR: Record<LayerId, string> = {
  top: "#1f77b4",
  bottom: "#d62728",
  inner: "#7f7f7f",
};

const NET_COLORS = ["#1f77b4", "#d62728", "#2ca02c", "#9467bd", "#ff7f0e", "#17becf", "#e377c2", "#bcbd22"];

function colorForNetIndex(index: number): string {
  return NET_COLORS[index % NET_COLORS.length] ?? NET_COLORS[0] ?? "#1f77b4";
}

function hexHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export class BoardCanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Expand the camera to fit the whole board; returns the new camera.
   */
  fit(board: Board, camera: CameraTransform, viewport: Viewport): CameraTransform {
    const bounds = boundsOfBoard(board);
    if (!bounds) {
      return camera;
    }
    return cameraToFit(bounds, viewport);
  }

  render(options: RenderOptions): void {
    const { board, camera, viewport } = options;
    this.ctx.save();
    this.ctx.clearRect(0, 0, viewport.width, viewport.height);

    const highlighted = options.highlightedNetIds;
    const dimFactor = highlighted && highlighted.size > 0 ? 0.18 : 1;

    this.drawTraces(board, camera, viewport, options.visibleLayers, highlighted, dimFactor);
    this.drawVias(board, camera, viewport, options.visibleLayers, highlighted, dimFactor);
    this.drawPads(board, camera, viewport, options.visibleLayers, highlighted, dimFactor);
    this.drawComponents(board, camera, viewport, highlighted, dimFactor);

    this.ctx.restore();
  }

  private drawTraces(
    board: Board,
    camera: CameraTransform,
    viewport: Viewport,
    visibleLayers: ReadonlySet<LayerId>,
    highlighted: ReadonlySet<string> | undefined,
    dimFactor: number,
  ): void {
    const ctx = this.ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;

    for (const trace of board.traces) {
      if (!visibleLayers.has(trace.layer)) {
        continue;
      }
      const netColor = highlighted
        ? highlighted.has(trace.netId)
          ? colorForNetIndex(hexHash(trace.netId))
          : "#555555"
        : colorForNetIndex(hexHash(trace.netId));

      ctx.globalAlpha = highlighted && !(highlighted.has(trace.netId)) ? dimFactor : 1;
      ctx.strokeStyle = netColor;
      ctx.beginPath();
      const first = trace.points[0];
      if (!first) {
        continue;
      }
      const start = worldToScreen({ x: first.x.value, y: first.y.value }, camera, viewport);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < trace.points.length; i += 1) {
        const point = trace.points[i];
        if (!point) {
          continue;
        }
        const screen = worldToScreen({ x: point.x.value, y: point.y.value }, camera, viewport);
        ctx.lineTo(screen.x, screen.y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawVias(
    board: Board,
    camera: CameraTransform,
    viewport: Viewport,
    visibleLayers: ReadonlySet<LayerId>,
    highlighted: ReadonlySet<string> | undefined,
    dimFactor: number,
  ): void {
    const ctx = this.ctx;
    for (const via of board.vias) {
      const layer = via.layers[0];
      if (layer && !visibleLayers.has(layer)) {
        continue;
      }
      const netColor = via.netId
        ? highlighted
          ? highlighted.has(via.netId)
            ? colorForNetIndex(hexHash(via.netId))
            : "#555555"
          : colorForNetIndex(hexHash(via.netId))
        : "#999999";

      ctx.globalAlpha = via.netId && highlighted && !highlighted.has(via.netId) ? dimFactor : 1;
      ctx.fillStyle = netColor;
      const screen = worldToScreen({ x: via.position.x.value, y: via.position.y.value }, camera, viewport);
      const radius = Math.max(2, 5 * camera.zoom);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawPads(
    board: Board,
    camera: CameraTransform,
    viewport: Viewport,
    visibleLayers: ReadonlySet<LayerId>,
    highlighted: ReadonlySet<string> | undefined,
    dimFactor: number,
  ): void {
    const ctx = this.ctx;
    for (const pad of board.pads) {
      const layer = pad.layer;
      if (!visibleLayers.has(layer)) {
        continue;
      }
      const netColor = pad.netId
        ? highlighted
          ? highlighted.has(pad.netId)
            ? colorForNetIndex(hexHash(pad.netId))
            : "#555555"
          : colorForNetIndex(hexHash(pad.netId))
        : "#666666";

      ctx.globalAlpha = pad.netId && highlighted && !highlighted.has(pad.netId) ? dimFactor : 1;
      ctx.fillStyle = netColor;
      const screen = worldToScreen({ x: pad.position.x.value, y: pad.position.y.value }, camera, viewport);
      const half = Math.max(1.5, 3 * camera.zoom);
      ctx.fillRect(screen.x - half, screen.y - half, half * 2, half * 2);
    }
    ctx.globalAlpha = 1;
  }

  private drawComponents(
    board: Board,
    camera: CameraTransform,
    viewport: Viewport,
    highlighted: ReadonlySet<string> | undefined,
    dimFactor: number,
  ): void {
    const ctx = this.ctx;
    ctx.font = `${Math.max(10, 12 * camera.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const component of board.components) {
      const screen = worldToScreen({ x: component.position.x.value, y: component.position.y.value }, camera, viewport);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.strokeRect(screen.x - 6 * camera.zoom, screen.y - 6 * camera.zoom, 12 * camera.zoom, 12 * camera.zoom);
      ctx.fillStyle = "#222222";
      ctx.fillText(component.designator, screen.x, screen.y - 8 * camera.zoom);
    }
    ctx.globalAlpha = 1;
  }
}