# Density clustering algorithm

This directory hosts the code for the denstiy map clustering algorithm.

## Building

Environment:

- Install the Rust toolchain through [rustup](https://rustup.rs/).
- Install the wasm-pack tool with `npm install -g wasm-pack`.

Build the command line tool:

```bash
cargo build --release
```

Build the wasm package:

```bash
cd density_clustering_wasm
npx wasm-pack build --release
```

Copy the wasm package to the UI component:

```bash
rm -rf ../../src/lib/density_clustering/wasm
mkdir ../../src/lib/density_clustering/wasm
cp pkg/*.ts pkg/*.js pkg/*.wasm ../../src/lib/density_clustering/wasm
```
