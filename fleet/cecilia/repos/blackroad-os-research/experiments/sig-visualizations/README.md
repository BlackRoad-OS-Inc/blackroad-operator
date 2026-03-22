# SIG Visualizations (Text-Based)

This experiment produces simple text renderings of factor trees and placeholder spiral coordinates. It is a starting point for mapping SIG structures without pulling in graphics dependencies.

## Goals

- Convert SIG-like trees into readable, indented text.
- Experiment with assigning radial levels and angles to nodes to approximate spiral positions.
- Provide hooks for later visualization pipelines.

## How to Use

1. Modify `generator.ts` to adjust sample data or coordinate strategies.
2. Run with `ts-node` or compile with `tsc` to view text outputs.
3. Extend the coordinate calculation to plug into downstream visualization tools.

## Notes

- The coordinate math is intentionally simple and can be swapped for more rigorous geometry later.
- Outputs are console-based to remain dependency-light.
