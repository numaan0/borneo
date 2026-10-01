import type { Board, Position } from "@borneo/domain";

/**
 * Coordinate abstraction (AGENTS.md §8):
 *
 *   board coordinates (domain Position, mm)
 *        ↓  unit-aware → plain numbers
 *   world coordinates (mm)
 *        ↓  camera transform (center + zoom)
 *   camera
 *        ↓
 *   screen coordinates (px)
 *
 * This module only holds the pure math; it never touches the DOM/CANVAS.
 */

export interface WorldPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface CameraTransform {
  /** World (mm) point at the viewport center. */
  center: WorldPoint;
  /** Screen pixels per world unit (mm). */
  zoom: number;
}

export function worldToScreen(point: WorldPoint, camera: CameraTransform, viewport: Viewport): ScreenPoint {
  return {
    x: (point.x - camera.center.x) * camera.zoom + viewport.width / 2,
    y: (point.y - camera.center.y) * camera.zoom + viewport.height / 2,
  };
}

export function screenToWorld(point: ScreenPoint, camera: CameraTransform, viewport: Viewport): WorldPoint {
  return {
    x: camera.center.x + (point.x - viewport.width / 2) / camera.zoom,
    y: camera.center.y + (point.y - viewport.height / 2) / camera.zoom,
  };
}

/** Move the camera so the world moves by the given screen delta. */
export function panByScreenDelta(camera: CameraTransform, delta: ScreenPoint): CameraTransform {
  return {
    center: {
      x: camera.center.x - delta.x / camera.zoom,
      y: camera.center.y - delta.y / camera.zoom,
    },
    zoom: camera.zoom,
  };
}

/**
 * Zoom by `factor` keeping the world point under `pivot` (a screen point) fixed.
 * factor > 1 zooms in.
 */
export function zoomAt(
  camera: CameraTransform,
  pivot: ScreenPoint,
  factor: number,
  viewport: Viewport,
): CameraTransform {
  const newZoom = camera.zoom * factor;
  if (!Number.isFinite(newZoom) || newZoom <= 0) {
    return camera;
  }
  const worldUnderPivot = screenToWorld(pivot, camera, viewport);
  const scale = pivot.x - viewport.width / 2;
  const travel = pivot.y - viewport.height / 2;
  return {
    center: {
      x: worldUnderPivot.x - scale / newZoom,
      y: worldUnderPivot.y - travel / newZoom,
    },
    zoom: newZoom,
  };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsOfBoard(board: Board): Bounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let any = false;

  const include = (position: Position) => {
    minX = Math.min(minX, position.x.value);
    minY = Math.min(minY, position.y.value);
    maxX = Math.max(maxX, position.x.value);
    maxY = Math.max(maxY, position.y.value);
    any = true;
  };

  for (const component of board.components) {
    include(component.position);
  }
  for (const pad of board.pads) {
    include(pad.position);
  }
  for (const trace of board.traces) {
    for (const point of trace.points) {
      include(point);
    }
  }
  for (const via of board.vias) {
    include(via.position);
  }

  return any ? { minX, minY, maxX, maxY } : null;
}

/** Center the given bounds in the viewport with a padding margin. */
export function cameraToFit(bounds: Bounds, viewport: Viewport, paddingPx = 40): CameraTransform {
  const contentW = Math.max(bounds.maxX - bounds.minX, 1e-6);
  const contentH = Math.max(bounds.maxY - bounds.minY, 1e-6);
  const zoom = Math.min(
    (viewport.width - paddingPx * 2) / contentW,
    (viewport.height - paddingPx * 2) / contentH,
  );
  const safeZoom = Math.max(zoom, 1e-6);
  const center: WorldPoint = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
  return { center, zoom: safeZoom };
}