import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const workspaceRoot = resolve(projectRoot, "../..");

const workspacePlugin = {
  name: "workspace-alias",
  setup(build) {
    build.onResolve({ filter: /^@blackroad\/ingest-crd\/src\/index$/ }, () => ({
      path: resolve(workspaceRoot, "packages/ingest-crd/src/index.ts"),
    }));
    build.onResolve({ filter: /^@blackroad\/disclosures\/src\/index$/ }, () => ({
      path: resolve(workspaceRoot, "packages/disclosures/src/index.ts"),
    }));
    build.onResolve({ filter: /^@blackroad\/disclosures\/src\/types$/ }, () => ({
      path: resolve(workspaceRoot, "packages/disclosures/src/types.ts"),
    }));
    build.onResolve({ filter: /^@blackroad\/drafting\/src\/index$/ }, () => ({
      path: resolve(workspaceRoot, "packages/drafting/src/index.ts"),
    }));
    build.onResolve({ filter: /^@blackroad\/mapping\/src\/index$/ }, () => ({
      path: resolve(workspaceRoot, "packages/mapping/src/index.ts"),
    }));
  },
};

await build({
  entryPoints: [resolve(projectRoot, "src/index.ts")],
  outfile: resolve(projectRoot, "dist/index.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: false,
  plugins: [workspacePlugin],
  loader: {
    ".ts": "ts",
  },
  external: ["commander", "date-fns", "pdf-parse", "zod"],
});

