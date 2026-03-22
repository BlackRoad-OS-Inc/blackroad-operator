/// <reference types="vitest" />

import { describe, expect, it } from "vitest";
import { emit } from "@br/qlm";

const identity = [[1]];
const projector = [
  [1, 0],
  [0, 0],
];

describe("emit gate", () => {
  it("blocks emission when trust falls below threshold", () => {
    const blocked = emit([1], { P: identity, T: 0.4, tau: 0.62 });
    expect(blocked).toBeNull();
  });

  it("blocks emission when vector lies outside projector range", () => {
    const result = emit([0, 1], { P: projector, T: 0.9, tau: 0.62 });
    expect(result).toBeNull();
  });

  it("allows safe emission when trust clears the threshold and projector matches", () => {
    const allowed = emit([1, 0], { P: projector, T: 0.9, tau: 0.62 });
    expect(allowed).toEqual([1, 0]);
  });
});
