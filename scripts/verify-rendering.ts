import { demoBoard } from "@borneo/domain";
import { boundsOfBoard, cameraToFit, panByScreenDelta, screenToWorld, worldToScreen, zoomAt } from "@borneo/rendering";

const viewport = { width: 800, height: 600 };
const bounds = boundsOfBoard(demoBoard);
if (!bounds) throw new Error("no bounds");

const fit = cameraToFit(bounds, viewport, 40);
console.log("bounds:", JSON.stringify(bounds));
console.log("fit camera:", JSON.stringify(fit));

// board center should project to viewport center
const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
const centerScreen = worldToScreen(center, fit, viewport);
console.log("board center -> screen:", JSON.stringify(centerScreen), "(expect 400,300)");

// roundtrip: screen -> world -> screen must be identity
const p = { x: 123, y: 456 };
const roundTrip = worldToScreen(screenToWorld(p, fit, viewport), fit, viewport);
console.log("roundtrip:", JSON.stringify(roundTrip), "(expect 123,456)");

// zoom in at a pivot keeps the world under the pivot fixed
const pivot = { x: 200, y: 150 };
const worldBefore = screenToWorld(pivot, fit, viewport);
const zoomed = zoomAt(fit, pivot, 2, viewport);
const worldAfter = screenToWorld(pivot, zoomed, viewport);
const drift = Math.hypot(worldAfter.x - worldBefore.x, worldAfter.y - worldBefore.y);
console.log("zoom pivot drift:", drift);
if (drift > 1e-9) throw new Error("zoom pivot drift too large");

// pan: center moves opposite delta/zoom
const panned = panByScreenDelta(fit, { x: 100, y: 0 });
console.log("panned center x delta:", panned.center.x - fit.center.x, "(expect", -100 / fit.zoom, ")");
console.log("OK");