export const QUANTUM_EQUATIONS = [
  "iħ ∂ψ/∂t = Ĥ ψ   (Time-dependent Schrödinger)",
  "Ĥ ψ = E ψ        (Time-independent Schrödinger)",
  "H = p²/2m + V(x)",
  "⟨x|p⟩ = (1/√(2πħ)) e^(i p x / ħ)",
  "[x,p] = iħ",
  "|ψ⟩ = Σₙ cₙ |φₙ⟩",
  "Path integral: ∫ D[x(t)] e^(i S[x]/ħ)",
  "Dirac: (iγᵘ ∂ᵤ - m)ψ = 0",
];

export const FRAMES = [".", "o", "O", "@", "*", "◉"];

export const QUANTUM_UPDATE_INTERVAL_MS = 60;
export const PHASE_STEP = 0.06;
export const WAVE_NUMBER = 0.25;
export const WAVE_THRESHOLD = 0.2;
export const WAVE_LIMIT = 30;
export const WAVE_STEP = 2;

export const QUANTUM_HEADER = [
  "╔═══════════════════════════════════════════════════════════════╗",
  "║           QUANTUM MATH VISUALIZATION                         ║",
  "╚═══════════════════════════════════════════════════════════════╝",
];

export function computePhase(frame, index, phaseStep = PHASE_STEP) {
  const t = frame * phaseStep;
  return Math.cos(t + index * 0.5);
}

export function markerFor(frame, index, frames = FRAMES) {
  return frames[(frame + index) % frames.length];
}

export function buildWaveLine(
  frame,
  {
    phaseStep = PHASE_STEP,
    waveNumber = WAVE_NUMBER,
    waveThreshold = WAVE_THRESHOLD,
    waveLimit = WAVE_LIMIT,
    waveStep = WAVE_STEP,
  } = {}
) {
  const t = frame * phaseStep;
  let output = "";
  for (let x = -waveLimit; x <= waveLimit; x += waveStep) {
    output += Math.cos(waveNumber * x - t) > waveThreshold ? "◼" : "·";
  }
  return output;
}

export function buildQuantumVisualization(
  frame,
  options = {}
) {
  const lines = [...QUANTUM_HEADER, ""];
  QUANTUM_EQUATIONS.forEach((equation, index) => {
    const phase = computePhase(frame, index, options.phaseStep ?? PHASE_STEP);
    const marker = markerFor(frame, index, options.frames ?? FRAMES);
    lines.push(
      `${equation}   phase=${phase.toFixed(2)} ${marker}`
    );
  });
  lines.push("");
  lines.push(buildWaveLine(frame, options));
  return lines;
}
