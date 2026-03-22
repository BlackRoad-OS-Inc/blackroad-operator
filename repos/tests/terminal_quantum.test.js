const path = require("path");
const { pathToFileURL } = require("url");

const moduleUrl = pathToFileURL(
  path.resolve(__dirname, "../sites/blackroad/src/lib/quantumVisualization.js")
).href;

describe("quantum terminal visualization", () => {
  let buildQuantumVisualization;
  let QUANTUM_EQUATIONS;
  let FRAMES;

  beforeAll(async () => {
    const module = await import(moduleUrl);
    buildQuantumVisualization = module.buildQuantumVisualization;
    QUANTUM_EQUATIONS = module.QUANTUM_EQUATIONS;
    FRAMES = module.FRAMES;
  });

  test("includes header and equation phases", () => {
    const lines = buildQuantumVisualization(0);
    expect(lines.slice(0, 3)).toEqual([
      "╔═══════════════════════════════════════════════════════════════╗",
      "║           QUANTUM MATH VISUALIZATION                         ║",
      "╚═══════════════════════════════════════════════════════════════╝",
    ]);

    const firstEquation = lines.find((line) =>
      line.startsWith(QUANTUM_EQUATIONS[0])
    );
    expect(firstEquation).toContain("phase=1.00");
    expect(firstEquation.trim().endsWith(FRAMES[0])).toBe(true);
  });

  test("cycles through frame markers", () => {
    const frameFive = buildQuantumVisualization(5);
    const eqLine = frameFive.find((line) =>
      line.startsWith(QUANTUM_EQUATIONS[0])
    );
    expect(eqLine).toBeDefined();
    expect(eqLine.trim().endsWith(FRAMES[5 % FRAMES.length])).toBe(true);
  });

  test("renders a wave line with the expected character set", () => {
    const lines = buildQuantumVisualization(2);
    const waveLine = lines[lines.length - 1];
    expect(waveLine).toMatch(/^[◼·]+$/u);
    expect(waveLine.length).toBe(31);
  });
});
