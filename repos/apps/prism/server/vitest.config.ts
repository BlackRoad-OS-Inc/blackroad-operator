import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    deps: {
      optimizer: {
        web: { enabled: false },
        ssr: { enabled: false },
      },
    },
  },
  resolve: {
    alias: [
      { find: "@prism/core", replacement: path.resolve(__dirname, "../packages/prism-core/src") },
      {
        find: /\.\.\/\.\.\/\.\.\/package\.json$/,
        replacement: path.resolve(__dirname, "stub-package.json"),
      },
      {
        find: "package.json",
        replacement: path.resolve(__dirname, "stub-package.json"),
      },
    ],
  },
});
