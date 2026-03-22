export function trust(C: number, Tr: number, S: number, aC = 0.8, aTr = 0.5, aE = 0.7) {
  const x = aC * C + aTr * Tr - aE * S;
  return 1 / (1 + Math.exp(-x));
}

export const inCovenant = (tags: string[]) => !tags.includes("forbid");
