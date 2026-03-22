// BlackRoad OS — Hybrid Memory Architecture
// 12 distinct memory types, each with its own encoding, speed profile, and purpose.
//
// Binary (2^12 = 4,096×) — fast encode/decode
// Trinary (3^12 = 531,441×) — dense, 1.3× faster hashing
// Balanced ternary — free negation for Z:=yx−w
// Hybrid — binary routing + trinary blocks = 2.18B× multiplier
//
// ═══════════════════════════════════════════════════════════════
//  LAYER        TYPE        ENCODING     SPEED       DENSITY
// ═══════════════════════════════════════════════════════════════
//  Register     volatile    binary       15M/s       ×4,096
//  Cache        volatile    binary       15M/s       ×4,096
//  Heap         working     binary       15M/s       ×4,096
//  Stack        execution   binary       15M/s       ×4,096
//  Soul         identity    balanced     free neg    ×531,441
//  Aura         perception  trinary      hash 1.3×   ×531,441
//  Witness      audit       trinary      hash 1.3×   ×531,441
//  Chain        ledger      hybrid       best-of     ×2.18B
//  Pixel        content     hybrid       best-of     ×2.18B
//  Volume       block       trinary      dense       ×531,441
//  Archive      cold        trinary      dense       ×531,441
//  Dream        compressed  balanced     Z-frame     ×2.18B
// ═══════════════════════════════════════════════════════════════

// ─── Constants ───────────────────────────────────────────────────
const B = 4096;          // 2^12
const T = 531441;        // 3^12
const H = B * T;         // 2,176,782,336 (hybrid)
const PHI = 1.618033988749;

// ─── 12 Memory Layers ────────────────────────────────────────────
// Each layer has a level (power of 2: 2→4096), a type, encoding, and node assignment.
// Data is assigned to a layer based on its "x" value — the access frequency / importance.
// Higher x → lower layer (hotter, faster). Lower x → higher layer (colder, denser).
//
//  x=4096 → Register (fastest, smallest)
//  x=1    → Dream (densest, deepest)

export const MEMORY_LAYERS = [
  {
    level: 0,  x: 2,     gb: 2,
    id: 'register',  name: 'Register',
    encoding: 'binary',  prefix: 'rm',
    volatile: true,
    desc: 'CPU-level registers — Pico W SRAM, Pi GPIO state',
    speed: '15M/s',  nodes: ['pico-w'],  color: '#FF6B2B',
  },
  {
    level: 1,  x: 4,     gb: 4,
    id: 'cache',  name: 'Cache',
    encoding: 'binary',  prefix: 'cm',
    volatile: true,
    desc: 'Agent L1/L2 hot-state — instant recall, current conversation',
    speed: '15M/s',  nodes: ['alice', 'aria'],  color: '#FF2255',
  },
  {
    level: 2,  x: 8,     gb: 8,
    id: 'heap',  name: 'Heap',
    encoding: 'binary',  prefix: 'hm',
    volatile: false,
    desc: 'Dynamic allocation — working memory, active embeddings',
    speed: '15M/s',  nodes: ['aria'],  color: '#CC00AA',
  },
  {
    level: 3,  x: 16,    gb: 16,
    id: 'stack',  name: 'Stack',
    encoding: 'binary',  prefix: 'sm',
    volatile: false,
    desc: 'Execution frames — task queues, pipeline state, call chains',
    speed: '15M/s',  nodes: ['alice'],  color: '#8844FF',
  },
  {
    level: 4,  x: 32,    gb: 32,
    id: 'soul',  name: 'Soul',
    encoding: 'balanced',  prefix: 'sl',
    volatile: false,
    desc: 'Agent identity — PS-SHA journal, personality, Z-frame encoded',
    speed: 'free negate',  nodes: ['aria'],  color: '#8844FF',
  },
  {
    level: 5,  x: 64,    gb: 64,
    id: 'aura',  name: 'Aura',
    encoding: 'trinary',  prefix: 'au',
    volatile: false,
    desc: 'Perception layer — embeddings, context windows, sensory state',
    speed: '1.3× hash',  nodes: ['anastasia', 'gematria'],  color: '#4488FF',
  },
  {
    level: 6,  x: 128,   gb: 128,
    id: 'witness',  name: 'Witness',
    encoding: 'trinary',  prefix: 'wt',
    volatile: false,
    desc: 'Immutable audit trail — cryptographic witness of every action',
    speed: '1.3× hash',  nodes: ['cecilia'],  color: '#00D4FF',
  },
  {
    level: 7,  x: 256,   gb: 256,
    id: 'chain',  name: 'Chain',
    encoding: 'hybrid',  prefix: 'ch',
    volatile: false,
    desc: 'RoadChain ledger — binary routing headers, trinary content blocks',
    speed: 'best of both',  nodes: ['gematria'],  color: '#FF2255',
  },
  {
    level: 8,  x: 512,   gb: 512,
    id: 'pixel',  name: 'Pixel',
    encoding: 'hybrid',  prefix: 'px',
    volatile: false,
    desc: 'Content-addressable — dedup, delta, 4096-byte pixel blocks',
    speed: 'best of both',  nodes: ['octavia'],  color: '#FF6B2B',
  },
  {
    level: 9,  x: 1024,  gb: 1024,
    id: 'volume',  name: 'Volume',
    encoding: 'trinary',  prefix: 'vm',
    volatile: false,
    desc: 'Block storage — Docker volumes, Git objects, NVMe sectors',
    speed: '3M/s',  nodes: ['octavia'],  color: '#CC00AA',
  },
  {
    level: 10, x: 2048,  gb: 2048,
    id: 'archive',  name: 'Archive',
    encoding: 'trinary',  prefix: 'ar',
    volatile: false,
    desc: 'Cold storage — Google Drive 2TB, compressed backups, old versions',
    speed: '3M/s',  nodes: ['gdrive'],  color: '#4488FF',
  },
  {
    level: 11, x: 4096,  gb: 4096,
    id: 'dream',  name: 'Dream',
    encoding: 'balanced',  prefix: 'dr',
    volatile: false,
    desc: 'Z-frame compressed — φ-cascaded, balanced ternary, deepest layer',
    speed: 'Z:=yx−w',  nodes: ['distributed'],  color: '#8844FF',
  },
];

// ─── Decision routing: yes / no / machine ────────────────────────
// Every memory operation has a 3-state decision:
//   YES (1)     → human confirmed → binary encoding (fast, trusted)
//   NO  (T/-1)  → human rejected  → balanced ternary (negation, Z-frame)
//   MACHINE (0) → agent decided   → trinary encoding (dense, autonomous)
//
// This maps to balanced ternary: 1, T, 0
// And determines which encoding layer the data lands in.

export const DECISION = {
  YES:     1,   // human yes  → binary layers (register, cache, heap, stack)
  NO:      -1,  // human no   → balanced layers (soul, dream)
  MACHINE: 0,   // agent auto → trinary layers (aura, witness, volume, archive)
};

// Which encoding each decision routes to
const DECISION_ENCODING = {
  [DECISION.YES]:     'binary',    // human-confirmed → fast binary (trusted, hot)
  [DECISION.NO]:      'balanced',  // human-rejected  → balanced ternary (negation, reversal)
  [DECISION.MACHINE]: 'trinary',   // machine-decided → dense trinary (autonomous, cold)
};

// Route data to a layer based on x (frequency) AND decision (yes/no/machine)
export function routeMemory(x, decision = DECISION.MACHINE) {
  const targetEncoding = DECISION_ENCODING[decision];

  // First filter layers by matching encoding type
  // Hybrid layers accept all decisions
  const candidates = MEMORY_LAYERS.filter(
    l => l.encoding === targetEncoding || l.encoding === 'hybrid'
  );

  // Then pick by x threshold
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (x >= candidates[i].x) return candidates[i];
  }
  return candidates[0] || MEMORY_LAYERS[0];
}

// Simple x-only routing (backwards compat)
export function assignLayer(x) {
  for (let i = MEMORY_LAYERS.length - 1; i >= 0; i--) {
    if (x >= MEMORY_LAYERS[i].x) return MEMORY_LAYERS[i];
  }
  return MEMORY_LAYERS[0];
}

// Decision trit for addresses — prepended to every address
// Full address: [decision:1trit]:[prefix]:[body]
// Example: 1:px:a0:00000000000000001210  (YES → pixel layer)
//          T:sl:001001000000000000000000001T0  (NO → soul layer)
//          0:au:0002000000000000000012  (MACHINE → aura layer)
export function encodeWithDecision(decision, memType, tier, node, block) {
  const d = decision === 1 ? '1' : decision === -1 ? 'T' : '0';
  const addr = encode(memType, tier, node, block);
  return `${d}:${addr}`;
}

export function decodeWithDecision(fullAddr) {
  const d = fullAddr[0];
  const decision = d === '1' ? DECISION.YES : d === 'T' ? DECISION.NO : DECISION.MACHINE;
  const addr = fullAddr.slice(2);
  return { decision, decisionLabel: d === '1' ? 'YES' : d === 'T' ? 'NO' : 'MACHINE', ...decode(addr) };
}

// ─── Threshold addressing: O.O.O.O.B.L.A.C.K.R.O.A.D ──────────
// 0 and 1 are NOT states — they're thresholds.
// If threshold is met (1), the downstream address collapses to 0.
// The dot-notation maps device positions in the network:
//
//   O.O.O.O = IP octet thresholds (192.168.4.X)
//   B.L.A.C.K.R.O.A.D.O.S = device assignment chain
//   I.N.C = incorporation threshold (legal entity gate)
//   D.O.T = separator/routing boundary
//   C.O.M.M.U.N.I.C.A.T.I.O.N = message propagation chain
//
// Each letter is a threshold position. When a threshold fires (→1),
// everything downstream of that dot resets to 0.
// This gives natural cascading: a change at B propagates through L.A.C.K...

const THRESHOLD_CHAIN = 'O.O.O.O.B.L.A.C.K.R.O.A.D.O.S.I.N.C.D.O.T.C.O.M.M.U.N.I.C.A.T.I.O.N';
const POSITIONS = THRESHOLD_CHAIN.split('.');

// Device assignment map — each chain position maps to a physical node
const POSITION_DEVICES = {
  // O.O.O.O — IP octets (network layer)
  0: 'alice',      // first O  — gateway octet
  1: 'alice',      // second O — subnet octet
  2: 'alice',      // third O  — segment octet
  3: 'alice',      // fourth O — host octet (Alice routes all traffic)
  // B.L.A.C.K — core infrastructure
  4: 'octavia',    // B — backbone (NVMe compute)
  5: 'cecilia',    // L — lateral (edge storage)
  6: 'aria',       // A — agent orchestration
  7: 'gematria',   // C — cloud compute
  8: 'anastasia',  // K — key management (WireGuard hub)
  // R.O.A.D — routing
  9: 'alice',      // R — route (DNS gateway)
  10: 'octavia',   // O — origin (tunnel source)
  11: 'aria',      // A — agent relay
  12: 'octavia',   // D — data (primary storage)
  // O.S — operating system
  13: 'octavia',   // O — OS core
  14: 'octavia',   // S — services
  // I.N.C — incorporation (legal gate)
  15: 'gdrive',    // I — incorporation docs
  16: 'gdrive',    // N — notarized records
  17: 'gdrive',    // C — corporate filings
  // D.O.T — routing boundary
  18: 'alice',     // D — DNS
  19: 'alice',     // O — origin routing
  20: 'alice',     // T — tunnel
  // C.O.M.M.U.N.I.C.A.T.I.O.N — communication chain
  21: 'gematria',  // C — compute
  22: 'octavia',   // O — orchestration
  23: 'cecilia',   // M — message store
  24: 'cecilia',   // M — message relay
  25: 'aria',      // U — uplink
  26: 'anastasia', // N — network mesh
  27: 'gematria',  // I — inference
  28: 'aria',      // C — coordination
  29: 'alice',     // A — acknowledgment
  30: 'octavia',   // T — transaction
  31: 'gematria',  // I — intelligence
  32: 'octavia',   // O — output
  33: 'pico-w',    // N — notify (hardware signal)
};

// Fire a threshold at position — everything downstream collapses to 0
export function fireThreshold(state, position) {
  const newState = [...state];
  newState[position] = 1;
  // Cascade: everything after the next dot boundary resets to 0
  for (let i = position + 1; i < newState.length; i++) {
    newState[i] = 0;
  }
  return newState;
}

// Create initial state (all zeros — no thresholds fired)
export function initThresholdState() {
  return new Array(POSITIONS.length).fill(0);
}

// Get active device for a given threshold state
// The deepest fired threshold determines the active device
export function getActiveDevice(state) {
  let deepest = 0;
  for (let i = state.length - 1; i >= 0; i--) {
    if (state[i] === 1) { deepest = i; break; }
  }
  return {
    position: deepest,
    letter: POSITIONS[deepest],
    device: POSITION_DEVICES[deepest],
    node: NODES[POSITION_DEVICES[deepest]],
    chain: POSITIONS.map((p, i) => state[i] ? p : '.').join(''),
  };
}

// Encode a threshold state as a dot-address
// Fired thresholds show their letter, unfired show 0
// Example: O.0.0.O.B.0.0.0.K... = octets 1+4 fired, B+K fired
export function thresholdToAddress(state) {
  return state.map((s, i) => s ? POSITIONS[i] : '0').join('.');
}

// Map threshold to memory layer
// Count of fired thresholds → layer level (0-11)
export function thresholdToLayer(state) {
  const fired = state.filter(s => s === 1).length;
  const level = Math.min(11, Math.floor(fired * 11 / POSITIONS.length));
  return MEMORY_LAYERS[level];
}

export { THRESHOLD_CHAIN, POSITIONS, POSITION_DEVICES };

// Backwards compat alias
export const MEMORY_TYPES = MEMORY_LAYERS;

// ─── Node physical storage ───────────────────────────────────────
export const NODES = {
  'pico-w':     { gb: 0.004,  name: 'Pico W ×2',          ip: '192.168.4.95/.99' },
  'alice':      { gb: 16,     name: 'Alice (Pi 400)',       ip: '192.168.4.49' },
  'aria':       { gb: 32,     name: 'Aria (Pi 4)',          ip: '192.168.4.98' },
  'anastasia':  { gb: 25,     name: 'Anastasia (NYC1)',     ip: '174.138.44.45' },
  'cecilia':    { gb: 128,    name: 'Cecilia (Pi 5)',       ip: '192.168.4.96' },
  'gematria':   { gb: 80,     name: 'Gematria (NYC3)',      ip: '159.65.43.12' },
  'octavia':    { gb: 1000,   name: 'Octavia (Pi 5 NVMe)',  ip: '192.168.4.97' },
  'gdrive':     { gb: 2048,   name: 'Google Drive 2TB',     ip: 'rclone://' },
  'distributed':{ gb: 0,      name: 'All Nodes',            ip: 'mesh' },
};

// ─── Encoding engines ────────────────────────────────────────────

// Binary (fast)
function binEncode(tier, node, block) {
  return (tier & 0xF).toString(16) + (node & 0xF).toString(16) + block.toString(16).padStart(10, '0');
}
function binDecode(hex) {
  return { tier: parseInt(hex[0], 16), node: parseInt(hex[1], 16), block: parseInt(hex.slice(2), 16) };
}

// Trinary (dense)
function toTri(n) {
  if (n === 0) return '0';
  const t = []; let v = n;
  while (v > 0) { t.push(v % 3); v = Math.floor(v / 3); }
  return t.reverse().join('');
}
function fromTri(s) {
  let v = 0; for (const c of s) v = v * 3 + parseInt(c); return v;
}
function triEncode(tier, node, block) {
  return toTri(tier).padStart(2, '0') + toTri(node).padStart(2, '0') + toTri(block).padStart(20, '0');
}
function triDecode(tri) {
  return { tier: fromTri(tri.slice(0, 2)), node: fromTri(tri.slice(2, 4)), block: fromTri(tri.slice(4)) };
}

// Balanced ternary (Z-frame, free negation)
function toBal(n) {
  if (n === 0) return '0';
  const t = []; let v = Math.abs(n);
  while (v > 0) { let r = v % 3; v = Math.floor(v / 3); if (r === 2) { r = -1; v += 1; } t.push(r); }
  if (n < 0) t.forEach((_, i) => t[i] = -t[i]);
  return t.reverse().map(x => x === -1 ? 'T' : String(x)).join('');
}
function fromBal(s) {
  let v = 0; for (const c of s) { v *= 3; v += c === '1' ? 1 : c === 'T' ? -1 : 0; } return v;
}
function balNegate(s) {
  return s.split('').map(c => c === '1' ? 'T' : c === 'T' ? '1' : '0').join('');
}
function balEncode(tier, node, block) {
  return toBal(tier).padStart(3, '0') + toBal(node).padStart(3, '0') + toBal(block).padStart(24, '0');
}

// Hybrid (binary routing + trinary blocks)
function hybEncode(tier, node, block) {
  return (tier & 0xF).toString(16) + (node & 0xF).toString(16) + ':' + toTri(block).padStart(20, '0');
}
function hybDecode(addr) {
  const [hex, tri] = addr.split(':');
  return { tier: parseInt(hex[0], 16), node: parseInt(hex[1], 16), block: fromTri(tri) };
}

// ─── Trinary hash (1.3× faster than binary) ─────────────────────
async function triHash(data) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  const arr = new Uint8Array(buf);
  let num = BigInt(0);
  for (let i = 0; i < 8; i++) num = (num << BigInt(8)) | BigInt(arr[i]);
  const trits = [];
  for (let i = 0; i < 40; i++) { trits.push(Number(num % BigInt(3))); num = num / BigInt(3); }
  return trits.reverse().join('');
}

// ─── Universal encode/decode ─────────────────────────────────────
export function encode(memType, tier, node, block) {
  const mt = MEMORY_TYPES.find(m => m.id === memType);
  if (!mt) throw new Error(`Unknown memory type: ${memType}`);
  let body;
  switch (mt.encoding) {
    case 'binary':   body = binEncode(tier, node, block); break;
    case 'trinary':  body = triEncode(tier, node, block); break;
    case 'balanced': body = balEncode(tier, node, block); break;
    case 'hybrid':   body = hybEncode(tier, node, block); break;
  }
  return `${mt.prefix}:${body}`;
}

export function decode(addr) {
  const prefix = addr.slice(0, 2);
  const body = addr.slice(3);
  const mt = MEMORY_TYPES.find(m => m.prefix === prefix);
  if (!mt) throw new Error(`Unknown prefix: ${prefix}`);
  let decoded;
  switch (mt.encoding) {
    case 'binary':   decoded = binDecode(body); break;
    case 'trinary':  decoded = triDecode(body); break;
    case 'balanced': decoded = { tier: fromBal(body.slice(0, 3)), node: fromBal(body.slice(3, 6)), block: fromBal(body.slice(6)) }; break;
    case 'hybrid':   decoded = hybDecode(body); break;
  }
  return { ...decoded, type: mt.id, encoding: mt.encoding, mode: mt.prefix };
}

// ─── Z-frame: Z:=yx−w ───────────────────────────────────────────
export function zFrame(y, x, w) {
  const yx = y * x;
  const z = yx - w;
  return {
    z,
    yx,
    w,
    z_bal: toBal(z),
    yx_bal: toBal(yx),
    w_bal: toBal(w),
    neg_w: balNegate(toBal(w)),
    phi_ratio: Math.abs(z) > 0 ? (yx / z).toFixed(6) : 'inf',
  };
}

// ─── Format helpers ──────────────────────────────────────────────
function fmt(gb) {
  if (gb >= 1e12) return (gb / 1e12).toFixed(1) + ' ZB';
  if (gb >= 1e9)  return (gb / 1e9).toFixed(1) + ' EB';
  if (gb >= 1e6)  return (gb / 1e6).toFixed(1) + ' PB';
  if (gb >= 1e3)  return (gb / 1e3).toFixed(1) + ' TB';
  return gb.toFixed(0) + ' GB';
}

// ─── Cluster stats per memory type ───────────────────────────────
export function getStats() {
  const _totalPhysGB = Object.values(NODES).reduce((s, n) => s + n.gb, 0);

  return MEMORY_TYPES.map(mt => {
    // Sum physical GB across this type's assigned nodes
    const physGB = mt.nodes.reduce((s, nid) => s + (NODES[nid]?.gb || 0), 0);
    const logicalGB = physGB * mt.ratio;
    return {
      ...mt,
      physicalGB: physGB,
      logicalGB,
      physicalFormatted: fmt(physGB),
      logicalFormatted: fmt(logicalGB),
    };
  });
}

export function getTotals() {
  const stats = getStats();
  const totalPhys = Object.values(NODES).reduce((s, n) => s + n.gb, 0);
  // Each type addresses its own slice — total logical is the sum of all type address spaces
  const totalLogical = stats.reduce((s, m) => s + m.logicalGB, 0);
  return {
    physicalGB: totalPhys,
    physicalFormatted: fmt(totalPhys),
    logicalGB: totalLogical,
    logicalFormatted: fmt(totalLogical),
    typeCount: MEMORY_TYPES.length,
    nodeCount: Object.keys(NODES).length - 1, // exclude 'distributed'
    encodings: {
      binary:   { count: MEMORY_TYPES.filter(m => m.encoding === 'binary').length,   ratio: `×${B.toLocaleString()}` },
      trinary:  { count: MEMORY_TYPES.filter(m => m.encoding === 'trinary').length,  ratio: `×${T.toLocaleString()}` },
      balanced: { count: MEMORY_TYPES.filter(m => m.encoding === 'balanced').length,  ratio: `×${T.toLocaleString()}` },
      hybrid:   { count: MEMORY_TYPES.filter(m => m.encoding === 'hybrid').length,   ratio: `×${H.toLocaleString()}` },
    },
  };
}

// ─── Export ──────────────────────────────────────────────────────
export default {
  MEMORY_TYPES,
  NODES,
  RATIOS: { binary: B, trinary: T, hybrid: H },
  encode, decode,
  triHash, zFrame,
  toBal, fromBal, balNegate,
  toTri, fromTri,
  getStats, getTotals, fmt,
};
