import type { IdentityKind, PsShaInfinity } from "./identityTypes";

export interface PsShaInfinityInput {
  kind: IdentityKind;
  seed: string;
  version?: number;
  namespace?: string;
}

function simpleDeterministicHash(input: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    hashA ^= code;
    hashA = Math.imul(hashA, 0x01000193);
    hashB += code + (hashB << 1) + (hashB << 4) + (hashB << 7) + (hashB << 8) + (hashB << 24);
  }

  const combined = ((hashA >>> 0).toString(16).padStart(8, "0") + (hashB >>> 0).toString(16).padStart(8, "0")).repeat(4);
  return combined.slice(0, 64);
}

export function computePsShaInfinity(input: PsShaInfinityInput): PsShaInfinity {
  const version = input.version ?? 1;
  const namespace = input.namespace ?? "blackroad-os-core";
  const base = `${namespace}:${input.kind}:${version}:${input.seed}`;
  const hash = simpleDeterministicHash(base);
  return `pssha∞_${hash}`;
}

export function isPsShaInfinity(value: string): value is PsShaInfinity {
  return /^pssha∞_[0-9a-f]{64}$/i.test(value);
}
