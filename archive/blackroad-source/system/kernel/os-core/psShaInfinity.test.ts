import { computePsShaInfinity, isPsShaInfinity } from "../src/identity/psShaInfinity";

describe("computePsShaInfinity", () => {
  it("produces deterministic ids for identical input", () => {
    const input = { kind: "agent", seed: "alpha", namespace: "test" as const };
    const id1 = computePsShaInfinity(input);
    const id2 = computePsShaInfinity(input);

    expect(id1).toBe(id2);
    expect(isPsShaInfinity(id1)).toBe(true);
  });

  it("rejects non-matching strings", () => {
    expect(isPsShaInfinity("not-a-hash")).toBe(false);
    expect(isPsShaInfinity("pssha∞_short")).toBe(false);
  });
});
