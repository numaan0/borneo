import { demoBoard } from "@borneo/domain";
import { BoardCanvasRenderer, cameraToFit, pickComponent, pickPad, worldToScreen, type CameraTransform, type Viewport } from "@borneo/rendering";

type Ctx = CanvasRenderingContext2D;

function stubContext(): Ctx {
  const noop = () => {};
  const ctx: Record<string, unknown> = {
    canvas: {} as HTMLCanvasElement,
    beginPath: noop,
    clearRect: noop,
    fill: noop,
    fillRect: noop,
    fillText: noop,
    lineTo: noop,
    moveTo: noop,
    restore: noop,
    save: noop,
    stroke: noop,
    strokeRect: noop,
    arc: noop,
    closePath: noop,
    clip: noop,
    globalAlpha: 1,
    lineCap: "",
    lineJoin: "",
    lineWidth: 0,
    strokeStyle: "",
    fillStyle: "",
    font: "",
    textAlign: "",
    textBaseline: "",
  };
  return ctx as Ctx;
}

const viewport: Viewport = { width: 800, height: 600 };
const renderer = new BoardCanvasRenderer(stubContext());
const camera: CameraTransform = { center: { x: 9.5, y: 8 }, zoom: 40 };

const visibleTop = new Set(["top"]);
const visibleBottom = new Set(["bottom"]);
const both = new Set(["top", "bottom"]);

// no-throw checks across layer visibility and net highlighting
renderer.render({ board: demoBoard, camera, viewport, visibleLayers: visibleTop });
renderer.render({ board: demoBoard, camera, viewport, visibleLayers: visibleBottom });
renderer.render({
  board: demoBoard,
  camera,
  viewport,
  visibleLayers: both,
  highlightedNetIds: new Set(["net-vdd"]),
});

// fit() should produce a finite zoom
const fit = renderer.fit(demoBoard, camera, viewport);
if (!Number.isFinite(fit.zoom) || fit.zoom <= 0) throw new Error("fit zoom not finite");
if (cameraToFit({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, viewport).zoom <= 0) throw new Error("degenerate fit");

// hit-testing: the screen point of U1's center should pick U1 and its P1 pad
const u1 = demoBoard.components.find((c) => c.designator === "U1");
if (!u1) throw new Error("U1 missing from fixture");
const u1Screen = worldToScreen({ x: u1.position.x.value, y: u1.position.y.value }, camera, viewport);
const picked = pickComponent(demoBoard, camera, viewport, u1Screen);
if (!picked || picked.id !== u1.id) throw new Error(`pickComponent failed: ${picked?.id ?? "none"}`);

const p1 = demoBoard.pads.find((p) => p.componentId === u1.id && p.ref === "P1");
if (!p1) throw new Error("P1 missing from fixture");
const p1Screen = worldToScreen({ x: p1.position.x.value, y: p1.position.y.value }, camera, viewport);
const pickedPad = pickPad(demoBoard, camera, viewport, p1Screen);
if (!pickedPad || pickedPad.kind !== "pad" || pickedPad.padId !== p1.id) {
  throw new Error(`pickPad failed: ${JSON.stringify(pickedPad)}`);
}

// a far-away screen point should pick nothing
const missed = pickPad(demoBoard, camera, viewport, { x: 5, y: 5 });
if (missed !== null) throw new Error(`pickPad should miss, got ${JSON.stringify(missed)}`);

console.log("renderer smoke test OK, fit zoom =", fit.zoom);