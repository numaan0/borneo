import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist/renderer",
  },
  resolve: {
    // Workspace packages are exported as raw .ts sources; let Vite compile them.
    preserveSymlinks: true,
  },
});