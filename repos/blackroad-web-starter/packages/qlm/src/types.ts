export type Scalar = number;

export type Vector = Scalar[];

export type Matrix = Scalar[][];

export type Psi = Vector;

export type Hermitian = Matrix;

export type Projector = Matrix;

export type Love = Matrix;

export interface EvolutionParams {
  H: Hermitian;
  L: Love;
  P: Projector;
  dt: number;
}

export interface TrustParams {
  C: number;
  Tr: number;
  S: number;
  alphaC: number;
  alphaT: number;
  alphaE: number;
}

export interface EmitParams {
  P: Projector;
  T: number;
  tau: number;
}
