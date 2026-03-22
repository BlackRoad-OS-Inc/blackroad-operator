import { EmitParams, EvolutionParams, Love, Projector, Psi, TrustParams, Vector } from "./types";

const EPSILON = 1e-6;

function assertSquare(matrix: Projector | Love): void {
  const size = matrix.length;
  for (const row of matrix) {
    if (row.length !== size) {
      throw new Error("Matrix must be square");
    }
  }
}

function multiplyMatrixVector(matrix: Projector | Love, vector: Psi): Psi {
  return matrix.map((row) => row.reduce((acc, value, index) => acc + value * (vector[index] ?? 0), 0));
}

function addVectors(a: Vector, b: Vector): Vector {
  return a.map((value, index) => value + (b[index] ?? 0));
}

function scaleVector(vector: Vector, scalar: number): Vector {
  return vector.map((value) => value * scalar);
}

function addMatrices(a: Love, b: Love): Love {
  return a.map((row, i) => row.map((value, j) => value + (b[i]?.[j] ?? 0)));
}

function scaleMatrix(matrix: Love, scalar: number): Love {
  return matrix.map((row) => row.map((value) => value * scalar));
}

function frobeniusNorm(matrix: Love): number {
  return Math.sqrt(matrix.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value * value, 0), 0));
}

function identity(size: number): Love {
  return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 1 : 0)));
}

export function project(P: Projector, x: Psi): Psi {
  assertSquare(P);
  if (P.length !== x.length) {
    throw new Error("Projector and vector must share dimensions");
  }
  return multiplyMatrixVector(P, x);
}

export function normalize(x: Psi): Psi {
  const norm = Math.sqrt(x.reduce((sum, value) => sum + value * value, 0));
  if (norm <= EPSILON) {
    return [...x];
  }
  return x.map((value) => value / norm);
}

export function evolve(params: EvolutionParams, psi: Psi): Psi {
  const { H, L, P, dt } = params;
  if (psi.length === 0) {
    return psi;
  }
  assertSquare(H);
  assertSquare(L);
  assertSquare(P);
  const projected = project(P, psi);
  const loveStrength = frobeniusNorm(L);
  const generator = addMatrices(H, scaleMatrix(L, loveStrength || 1));
  const delta = multiplyMatrixVector(generator, projected);
  const updated = addVectors(projected, scaleVector(delta, -dt));
  return normalize(updated);
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function trust(params: TrustParams): number {
  const { C, Tr, S, alphaC, alphaT, alphaE } = params;
  const weighted = alphaC * C + alphaT * Tr - alphaE * S;
  return logistic(weighted);
}

function vectorsClose(a: Psi, b: Psi, tolerance = EPSILON): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > tolerance) {
      return false;
    }
  }
  return true;
}

export function emit(y: Psi, params: EmitParams): Psi | null {
  const { P, T, tau } = params;
  if (T < tau) {
    return null;
  }
  const projection = project(P, y);
  if (!vectorsClose(projection, y)) {
    return null;
  }
  return y;
}

export function coherenceBound(prev: Psi, next: Psi, epsilon: number): boolean {
  if (prev.length !== next.length) {
    return false;
  }
  const delta = Math.sqrt(
    prev.reduce((sum, value, index) => {
      const diff = value - next[index];
      return sum + diff * diff;
    }, 0),
  );
  return delta <= epsilon;
}

export function projectorFromDimension(dimension: number): Projector {
  return identity(dimension);
}
