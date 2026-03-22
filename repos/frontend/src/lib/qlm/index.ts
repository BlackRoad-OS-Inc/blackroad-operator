import loveConfig from './love.config.json'

export type Complex = { re: number; im: number }
export type ComplexLike = Complex | number
export type ComplexVector = Complex[]
export type ComplexMatrix = Complex[][]

export interface LoveWeights {
  user: number
  team: number
  world: number
}

export interface Telemetry {
  compliance: number
  transparency: number
  entropy: number
  weights?: {
    compliance?: number
    transparency?: number
    entropy?: number
  }
}

export interface EmitGate {
  projector?: ComplexMatrix | null
  trust: number
  threshold: number
  epsilon?: number
}

export interface EvolveOptions {
  dt?: number
  nu?: number
}

const { user: defaultUser, team: defaultTeam, world: defaultWorld } = loveConfig as LoveWeights

export const DEFAULT_LOVE_WEIGHTS: LoveWeights = {
  user: defaultUser ?? 0.45,
  team: defaultTeam ?? 0.25,
  world: defaultWorld ?? 0.3,
}

const ZERO_COMPLEX: Complex = { re: 0, im: 0 }
const NEGATIVE_I: Complex = { re: 0, im: -1 }

function toComplex(value: ComplexLike): Complex {
  if (typeof value === 'number') {
    return { re: value, im: 0 }
  }
  return value
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

function complexSubtract(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im }
}

function complexMultiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }
}

function complexScale(a: Complex, scalar: number): Complex {
  return { re: a.re * scalar, im: a.im * scalar }
}

function vectorAdd(a: ComplexVector, b: ComplexVector): ComplexVector {
  if (a.length !== b.length) {
    throw new Error('Vector size mismatch in addition')
  }
  return a.map((value, index) => complexAdd(value, b[index]))
}

function matrixAdd(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  if (a.length !== b.length) {
    throw new Error('Matrix size mismatch in addition')
  }
  return a.map((row, rowIndex) => {
    if (row.length !== b[rowIndex].length) {
      throw new Error('Matrix size mismatch in addition')
    }
    return row.map((value, colIndex) => complexAdd(value, b[rowIndex][colIndex]))
  })
}

function matrixVectorMultiply(matrix: ComplexMatrix, vector: ComplexVector): ComplexVector {
  if (matrix.length === 0) return []
  if (matrix[0].length !== vector.length) {
    throw new Error('Matrix and vector dimensions do not align')
  }
  return matrix.map(row =>
    row.reduce((acc, entry, index) => {
      const product = complexMultiply(toComplex(entry), vector[index])
      return complexAdd(acc, product)
    }, { ...ZERO_COMPLEX })
  )
}

function makeLoveMatrix(weights?: LoveWeights | null): ComplexMatrix {
  const source = weights ?? DEFAULT_LOVE_WEIGHTS
  return [
    [{ re: source.user, im: 0 }, { ...ZERO_COMPLEX }, { ...ZERO_COMPLEX }],
    [{ ...ZERO_COMPLEX }, { re: source.team, im: 0 }, { ...ZERO_COMPLEX }],
    [{ ...ZERO_COMPLEX }, { ...ZERO_COMPLEX }, { re: source.world, im: 0 }],
  ]
}

export function norm(vector: ComplexVector): number {
  const energy = vector.reduce((sum, value) => sum + value.re * value.re + value.im * value.im, 0)
  return Math.sqrt(energy)
}

export function normalize(vector: ComplexVector): ComplexVector {
  const magnitude = norm(vector)
  if (magnitude === 0) {
    return vector.map(() => ({ ...ZERO_COMPLEX }))
  }
  return vector.map(value => ({ re: value.re / magnitude, im: value.im / magnitude }))
}

export function project(projector: ComplexMatrix | null | undefined, vector: ComplexVector): ComplexVector {
  if (!projector) {
    return [...vector]
  }
  return matrixVectorMultiply(projector, vector)
}

function resolveLoveMatrix(love: ComplexMatrix | LoveWeights | null | undefined): ComplexMatrix {
  if (!love) {
    return makeLoveMatrix({ user: 0, team: 0, world: 0 })
  }
  if (Array.isArray(love)) {
    return love.map(row => row.map(entry => toComplex(entry)))
  }
  return makeLoveMatrix(love)
}

function asMatrix(matrix: ComplexMatrix | number[][]): ComplexMatrix {
  return matrix.map(row => row.map(entry => toComplex(entry)))
}

function applyGenerator(
  generator: ComplexMatrix,
  state: ComplexVector,
  dt: number,
): ComplexVector {
  const action = matrixVectorMultiply(generator, state)
  const scaled = action.map(value => complexMultiply(NEGATIVE_I, complexScale(value, dt)))
  return vectorAdd(state, scaled)
}

export function evolve(
  taskHamiltonian: ComplexMatrix | number[][],
  love: ComplexMatrix | LoveWeights | null,
  projectorMatrix: ComplexMatrix | null,
  state: ComplexVector,
  options: EvolveOptions = {},
): ComplexVector {
  const dt = options.dt ?? 1
  const nu = options.nu ?? 1
  const h = asMatrix(taskHamiltonian)
  const l = resolveLoveMatrix(love)
  const scaledLove = l.map(row => row.map(entry => complexScale(entry, nu)))
  const generator = matrixAdd(h, scaledLove)
  const evolved = applyGenerator(generator, state, dt)
  const projected = project(projectorMatrix, evolved)
  return normalize(projected)
}

export function trust(telemetry: Telemetry): number {
  const {
    compliance,
    transparency,
    entropy,
    weights: { compliance: alphaC = 1.2, transparency: alphaTau = 1.0, entropy: alphaE = 0.8 } = {},
  } = telemetry
  const score = alphaC * compliance + alphaTau * transparency - alphaE * entropy
  return 1 / (1 + Math.exp(-score))
}

function vectorsClose(a: ComplexVector, b: ComplexVector, epsilon: number): boolean {
  if (a.length !== b.length) return false
  return a.every((value, index) => {
    const delta = complexSubtract(value, b[index])
    return Math.hypot(delta.re, delta.im) <= epsilon
  })
}

export function emit(gate: EmitGate, proposal: ComplexVector): ComplexVector | null {
  const { projector: projectorMatrix, trust: trustScore, threshold, epsilon = 1e-3 } = gate
  if (trustScore < threshold) {
    return null
  }
  if (!projectorMatrix) {
    return proposal
  }
  const projected = project(projectorMatrix, proposal)
  if (!vectorsClose(projected, proposal, epsilon)) {
    return null
  }
  return proposal
}

export function toRealVector(values: number[]): ComplexVector {
  return values.map(value => ({ re: value, im: 0 }))
}

export function probabilities(vector: ComplexVector): number[] {
  const squared = vector.map(value => value.re * value.re + value.im * value.im)
  const total = squared.reduce((sum, value) => sum + value, 0)
  if (total === 0) {
    return squared.map(() => 0)
  }
  return squared.map(value => value / total)
}

export function entropy(vector: ComplexVector): number {
  const probs = probabilities(vector)
  return probs.reduce((sum, p) => (p > 0 ? sum - p * Math.log(p) : sum), 0)
}

export function overlap(vector: ComplexVector, projectorMatrix: ComplexMatrix): number {
  const projected = project(projectorMatrix, vector)
  const product = vector.reduce((acc, value, index) => {
    const conjugate = { re: value.re, im: -value.im }
    const dot = complexMultiply(conjugate, projected[index])
    return acc + dot.re
  }, 0)
  return Math.max(0, Math.min(1, product))
}

export function prepareState(state: ComplexVector): ComplexVector {
  return normalize(state)
}

export const LOVE_MATRIX = makeLoveMatrix(DEFAULT_LOVE_WEIGHTS)
