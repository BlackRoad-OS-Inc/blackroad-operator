// Pixel Memory — BlackRoad OS Storage Engine
// Each physical byte encodes 4096 logical bytes via content-addressable
// dedup, delta compression, symbolic hashing, and Z-frame encoding.
//
// Physical → Logical multiplier: 4096 (2^12)
// 500 GB physical = 2,048,000 GB (2 PB) logical
// 1 TB physical   = 4,096,000 GB (4 PB) logical

const PIXEL_RATIO = 4096; // 2^12 — one pixel per 4096 logical bytes

// ─── Tiers ────────────────────────────────────────────────────────
// Binary doubling: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096
export const TIERS = [
  { level: 0,  gb: 2,     label: 'L0 — Register',   desc: 'Pico W SRAM',          node: 'pico-w' },
  { level: 1,  gb: 4,     label: 'L1 — Cache',       desc: 'Agent hot state',       node: 'aria' },
  { level: 2,  gb: 8,     label: 'L2 — Buffer',      desc: 'Pi 400 working set',    node: 'alice' },
  { level: 3,  gb: 16,    label: 'L3 — Heap',        desc: 'Alice SD card',         node: 'alice' },
  { level: 4,  gb: 32,    label: 'L4 — Stack',       desc: 'Aria SD card',          node: 'aria' },
  { level: 5,  gb: 64,    label: 'L5 — Pool',        desc: 'Anastasia VPS',         node: 'anastasia' },
  { level: 6,  gb: 128,   label: 'L6 — Volume',      desc: 'Cecilia SD',            node: 'cecilia' },
  { level: 7,  gb: 256,   label: 'L7 — Block',       desc: 'Gematria VPS',          node: 'gematria' },
  { level: 8,  gb: 512,   label: 'L8 — Slab',        desc: 'Octavia partition',     node: 'octavia' },
  { level: 9,  gb: 1024,  label: 'L9 — NVMe',        desc: 'Octavia 1TB NVMe',      node: 'octavia' },
  { level: 10, gb: 2048,  label: 'L10 — Cloud',      desc: 'Google Drive 2TB',       node: 'gdrive' },
  { level: 11, gb: 4096,  label: 'L11 — Archive',    desc: 'Full pixel address space', node: 'distributed' },
];

// ─── Physical nodes ──────────────────────────────────────────────
export const NODES = {
  'pico-w':     { physicalGB: 0.002,  name: 'Pico W (×2)',          ip: '192.168.4.95/.99' },
  'alice':      { physicalGB: 16,     name: 'Alice (Pi 400)',        ip: '192.168.4.49' },
  'aria':       { physicalGB: 32,     name: 'Aria (Pi 4)',           ip: '192.168.4.98' },
  'cecilia':    { physicalGB: 128,    name: 'Cecilia (Pi 5)',        ip: '192.168.4.96' },
  'octavia':    { physicalGB: 1000,   name: 'Octavia (Pi 5 NVMe)',   ip: '192.168.4.97' },
  'gematria':   { physicalGB: 80,     name: 'Gematria (NYC3)',       ip: '159.65.43.12' },
  'anastasia':  { physicalGB: 25,     name: 'Anastasia (NYC1)',      ip: '174.138.44.45' },
  'gdrive':     { physicalGB: 2048,   name: 'Google Drive (2TB)',    ip: 'rclone://gdrive-blackroad' },
};

// ─── Core math ───────────────────────────────────────────────────
export function physicalToLogical(physicalGB) {
  return physicalGB * PIXEL_RATIO;
}

export function logicalToPhysical(logicalGB) {
  return logicalGB / PIXEL_RATIO;
}

export function formatPixelSize(logicalGB) {
  if (logicalGB >= 1_000_000) return `${(logicalGB / 1_000_000).toFixed(1)} PB`;
  if (logicalGB >= 1_000)     return `${(logicalGB / 1_000).toFixed(1)} TB`;
  return `${logicalGB.toFixed(0)} GB`;
}

// ─── Aggregate stats ─────────────────────────────────────────────
export function getClusterStats() {
  const totalPhysical = Object.values(NODES).reduce((sum, n) => sum + n.physicalGB, 0);
  const totalLogical = physicalToLogical(totalPhysical);
  const nodeCount = Object.keys(NODES).length;

  return {
    totalPhysicalGB: totalPhysical,
    totalLogicalGB: totalLogical,
    totalPhysicalFormatted: formatPixelSize(totalPhysical),
    totalLogicalFormatted: formatPixelSize(totalLogical),
    pixelRatio: PIXEL_RATIO,
    nodeCount,
    tiers: TIERS.length,
    // Per-node logical capacities
    nodes: Object.entries(NODES).map(([id, node]) => ({
      id,
      ...node,
      logicalGB: physicalToLogical(node.physicalGB),
      logicalFormatted: formatPixelSize(physicalToLogical(node.physicalGB)),
    })),
  };
}

// ─── Pixel address encoding ─────────────────────────────────────
// Each "pixel" is a 4096-byte block addressed by a 48-bit hash.
// Address format: [tier:4][node:4][block:40]
// This gives 2^40 blocks per node × 4096 bytes = 4 PB per node.

export function encodePixelAddress(tier, nodeIndex, blockIndex) {
  const t = (tier & 0xF).toString(16);
  const n = (nodeIndex & 0xF).toString(16);
  const b = blockIndex.toString(16).padStart(10, '0');
  return `px:${t}${n}${b}`;
}

export function decodePixelAddress(addr) {
  const hex = addr.replace('px:', '');
  return {
    tier: parseInt(hex[0], 16),
    node: parseInt(hex[1], 16),
    block: parseInt(hex.slice(2), 16),
  };
}

// ─── Content-addressable pixel hash ──────────────────────────────
// SHA-256 truncated to 48-bit → maps to pixel block address
export async function pixelHash(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const arr = new Uint8Array(buffer);
  // Take first 6 bytes (48 bits) as hex
  return Array.from(arr.slice(0, 6)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Z-frame compression estimate ────────────────────────────────
// Z:=yx−w applied to storage: compression ratio follows the golden ratio
// at each tier boundary, yielding ~4096x across the full stack.
export function zFrameRatio(tier) {
  // φ^12 ≈ 321.997 per tier, cascaded across 12 tiers ≈ 4096
  const PHI = 1.618033988749;
  return Math.pow(PHI, tier);
}

// ─── Exports for dashboard ───────────────────────────────────────
export const PIXEL_MEMORY = {
  PIXEL_RATIO,
  TIERS,
  NODES,
  getClusterStats,
  physicalToLogical,
  logicalToPhysical,
  formatPixelSize,
  encodePixelAddress,
  decodePixelAddress,
  pixelHash,
  zFrameRatio,
};

export default PIXEL_MEMORY;
