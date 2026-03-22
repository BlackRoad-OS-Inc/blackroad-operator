import { err, isErr, isOk, ok } from "../src/results/result";

describe("Result helpers", () => {
  it("creates ok results", () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  it("creates error results", () => {
    const error = new Error("boom");
    const result = err(error);
    expect(result).toEqual({ ok: false, error });
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });
});
