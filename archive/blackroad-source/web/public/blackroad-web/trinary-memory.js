// Trinary Pixel Memory — BlackRoad OS
// Base-3 encoding: each trit holds log2(3) ≈ 1.585 bits
// 12 trinary digits = 3^12 = 531,441 (vs binary 2^12 = 4,096)
// Trinary multiplier is 129.7x larger than binary per address width
//
// Physical → Logical:
//   Binary:  ×4,096   (2^12)
//   Trinary: ×531,441 (3^12)
//   Ratio:   trinary is 129.7× denser

const BINARY_RATIO  = 4096;       // 2^12
const TRINARY_RATIO = 531441;     // 3^12
const DENSITY_GAIN  = TRINARY_RATIO / BINARY_RATIO; // 129.7×

// ─── Balanced ternary: {-1, 0, +1} ──────────────────────────────
// More efficient than unbalanced {0, 1, 2} for signed operations
// and self-complementing (negate = flip all trits)

export function toBalancedTernary(n) {
  if (n === 0) return '0';
  const trits = [];
  let val = Math.abs(n);
  while (val > 0) {
    let rem = val % 3;
    val = Math.floor(val / 3);
    if (rem === 2) { rem = -1; val += 1; }
    trits.push(rem);
  }
  if (n < 0) trits.forEach((t, i) => trits[i] = -t);
  return trits.reverse().map(t => t === -1 ? 'T' : t === 0 ? '0' : '1').join('');
}

export function fromBalancedTernary(str) {
  let val = 0;
  for (const ch of str) {
    val *= 3;
    val += ch === '1' ? 1 : ch === 'T' ? -1 : 0;
  }
  return val;
}

// ─── Unbalanced ternary {0, 1, 2} for addresses ─────────────────
export function toTernary(n) {
  if (n === 0) return '0';
  const trits = [];
  let val = n;
  while (val > 0) {
    trits.push(val % 3);
    val = Math.floor(val / 3);
  }
  return trits.reverse().join('');
}

export function fromTernary(str) {
  let val = 0;
  for (const ch of str) {
    val = val * 3 + parseInt(ch);
  }
  return val;
}

// ─── Trinary tiers ───────────────────────────────────────────────
// Powers of 3: 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049, 177147, 531441
export const TRINARY_TIERS = [
  { level: 0,  gb: 3,       label: 'T0 — Trit',     desc: 'Pico W ternary register' },
  { level: 1,  gb: 9,       label: 'T1 — Tryte',    desc: 'Agent trit-state cache' },
  { level: 2,  gb: 27,      label: 'T2 — Word',     desc: 'Alice working memory' },
  { level: 3,  gb: 81,      label: 'T3 — Page',     desc: 'Aria ternary heap' },
  { level: 4,  gb: 243,     label: 'T4 — Segment',  desc: 'Cecilia trit-volume' },
  { level: 5,  gb: 729,     label: 'T5 — Slab',     desc: 'Gematria ternary block' },
  { level: 6,  gb: 2187,    label: 'T6 — Volume',   desc: 'Octavia NVMe ternary' },
  { level: 7,  gb: 6561,    label: 'T7 — Cluster',  desc: 'Google Drive trinary' },
  { level: 8,  gb: 19683,   label: 'T8 — Region',   desc: 'Cross-node distributed' },
  { level: 9,  gb: 59049,   label: 'T9 — Domain',   desc: 'Full infrastructure' },
  { level: 10, gb: 177147,  label: 'T10 — Cosmos',  desc: 'Federated trinary mesh' },
  { level: 11, gb: 531441,  label: 'T11 — Absolute', desc: 'Complete trit address space' },
];

// ─── Trinary pixel address ──────────────────────────────────────
// Format: tx:[tier:2trits][node:2trits][block:20trits]
// 20 trinary digits = 3^20 = 3,486,784,401 blocks per node
// × 531,441 bytes per block = 1.85 exabytes per node

export function encodeTriAddress(tier, nodeIndex, blockIndex) {
  const t = toTernary(tier).padStart(2, '0');
  const n = toTernary(nodeIndex).padStart(2, '0');
  const b = toTernary(blockIndex).padStart(20, '0');
  return `tx:${t}${n}${b}`;
}

export function decodeTriAddress(addr) {
  const tri = addr.replace('tx:', '');
  return {
    tier: fromTernary(tri.slice(0, 2)),
    node: fromTernary(tri.slice(2, 4)),
    block: fromTernary(tri.slice(4)),
  };
}

// ─── Trinary hash (SHA-256 → base-3) ────────────────────────────
export async function trinaryHash(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const arr = new Uint8Array(buffer);
  // Convert first 8 bytes to trinary (gives ~40 trits)
  let num = BigInt(0);
  for (let i = 0; i < 8; i++) num = (num << BigInt(8)) | BigInt(arr[i]);
  const trits = [];
  for (let i = 0; i < 40; i++) {
    trits.push(Number(num % BigInt(3)));
    num = num / BigInt(3);
  }
  return trits.reverse().join('');
}

// ─── Comparison stats ────────────────────────────────────────────
export function compareEncodings(physicalGB) {
  const binaryLogical  = physicalGB * BINARY_RATIO;
  const trinaryLogical = physicalGB * TRINARY_RATIO;
  return {
    physicalGB,
    binary: {
      ratio: BINARY_RATIO,
      logicalGB: binaryLogical,
      addressBits: 48,
      blockSize: 4096,
      maxBlocks: Math.pow(2, 40),
    },
    trinary: {
      ratio: TRINARY_RATIO,
      logicalGB: trinaryLogical,
      addressTrits: 24,
      blockSize: 531441,
      maxBlocks: Math.pow(3, 20),
      densityGain: `${DENSITY_GAIN.toFixed(1)}×`,
    },
    gain: {
      multiplier: DENSITY_GAIN,
      extraLogicalGB: trinaryLogical - binaryLogical,
    },
  };
}

export const TRINARY_MEMORY = {
  BINARY_RATIO,
  TRINARY_RATIO,
  DENSITY_GAIN,
  TRINARY_TIERS,
  toBalancedTernary,
  fromBalancedTernary,
  toTernary,
  fromTernary,
  encodeTriAddress,
  decodeTriAddress,
  trinaryHash,
  compareEncodings,
};

export default TRINARY_MEMORY;
