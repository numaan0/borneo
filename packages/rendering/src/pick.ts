import type { Board, Component } from "@borneo/domain";
import { screenToWorld, type CameraTransform, type Viewport } from "./transform";

/**
 * Hit-testing in board coordinates (AGENTS.md §8). Screen points are converted
 * to board coordinates through the inverse camera transform, so picking is
 * independent of screen resolution and zoom.
 *
 * A component "hits" when its center lies within `componentRadiusMm`; a pad hits
 * when its center lies within `padRadiusMm`.
 */
export type PickResult =
  | { kind: "component"; componentId: string }
  | { kind: "pad"; padId: string };

export function pickComponent(
  board: Board,
  camera: CameraTransform,
  viewport: Viewport,
  screenPoint: { x: number; y: number },
  componentRadiusMm = 1.5,
): Component | null {
  const world = screenToWorld(screenPoint, camera, viewport);
  let closest: Component | null = null;
  let closestDistSq = componentRadiusMm * componentRadiusMm;
  for (const component of board.components) {
    const dx = component.position.x.value - world.x;
    const dy = component.position.y.value - world.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= closestDistSq) {
      closest = component;
      closestDistSq = distSq;
    }
  }
  return closest;
}

export function pickPad(
  board: Board,
  camera: CameraTransform,
  viewport: Viewport,
  screenPoint: { x: number; y: number },
  padRadiusMm = 0.6,
): PickResult | null {
  const world = screenToWorld(screenPoint, camera, viewport);
  let closestPadId: string | null = null;
  let closestDistSq = padRadiusMm * padRadiusMm;
  for (const pad of board.pads) {
    const dx = pad.position.x.value - world.x;
    const dy = pad.position.y.value - world.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= closestDistSq) {
      closestPadId = pad.id;
      closestDistSq = distSq;
    }
  }
  if (closestPadId !== null) {
    return { kind: "pad", padId: closestPadId };
  }
  const component = pickComponent(board, camera, viewport, screenPoint, padRadiusMm);
  return component ? { kind: "component", componentId: component.id } : null;
}