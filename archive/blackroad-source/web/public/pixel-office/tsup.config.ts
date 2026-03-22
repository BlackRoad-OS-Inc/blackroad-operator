import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: true,
  // Bundle workspace dependency @office/shared into output
  noExternal: ["@office/shared"],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
