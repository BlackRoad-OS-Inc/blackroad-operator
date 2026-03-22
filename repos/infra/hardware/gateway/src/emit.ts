export function canEmit(inCov: boolean, T: number, tau = 0.62) {
  return inCov && T >= tau;
}
