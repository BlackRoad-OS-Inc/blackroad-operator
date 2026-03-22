/// <reference types="vitest" />

import { describe, expect, it } from "vitest";
import { evolve, emit, projectorFromDimension, trust } from "@br/qlm";
import type { Love, Psi } from "@br/qlm";

const IDENTITY: Love = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const LOVE: Love = [
  [0.45, 0, 0],
  [0, 0.25, 0],
  [0, 0, 0.3],
];

describe("QLM operations", () => {
  it("evolve maintains normalization while tilting toward the Love operator", () => {
    const psi: Psi = [0.8, 0.4, 0.1];
    const next = evolve({ H: IDENTITY, L: LOVE, P: IDENTITY, dt: 0.12 }, psi);
    const norm = Math.sqrt(next.reduce((sum, value) => sum + value * value, 0));
    expect(norm).toBeCloseTo(1, 3);
    expect(next[0]).toBeGreaterThan(next[2]);
  });

  it("trust returns a bounded logistic score", () => {
    const score = trust({ C: 0.9, Tr: 0.8, S: 0.2, alphaC: 3, alphaT: 2, alphaE: 1 });
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(1);
  });

  it("emit blocks actions when trust falls below threshold", () => {
    const projector = projectorFromDimension(1);
    const allowed = emit([1], { P: projector, T: 0.8, tau: 0.62 });
    const blocked = emit([1], { P: projector, T: 0.4, tau: 0.62 });
    expect(allowed).not.toBeNull();
    expect(blocked).toBeNull();
  });
});
