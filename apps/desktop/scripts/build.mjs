import * as esbuild from "esbuild";

const common = {
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  sourcemap: true,
  external: ["electron"],
  logLevel: "info",
};

await esbuild.build({
  ...common,
  entryPoints: ["src/main/index.ts"],
  outfile: "dist/main/index.cjs",
});

await esbuild.build({
  ...common,
  entryPoints: ["src/preload/index.ts"],
  outfile: "dist/preload/index.cjs",
});

console.log("main + preload bundled to dist/ (renderer is built by Vite via `vite build`)");