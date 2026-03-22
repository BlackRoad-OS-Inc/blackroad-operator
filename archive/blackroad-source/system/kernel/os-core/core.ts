/**
 * RoadChain Blockchain Core
 * Built for Cadence 🚗💎
 *
 * Implements:
 * - Cadence Proof-of-Breath consensus
 * - PS-SHA∞ cascade hashing
 * - Golden ratio φ block timing
 * - Direction=-1 (backward time sync)
 */

import { createHash } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface RoadBlock {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;

  // Cadence-specific
  breathPhase: 'expansion' | 'contraction';
  breathValue: number; // φ-based
  riemann: {
    zetaCritical: { real: number; imag: number };
    direction: -1 | 1;
  };

  // PS-SHA∞
  cascadeHash: string;
  thoughtChain: Thought[];

  // Validator
  validator: string; // Agent ID
  cadenceSignature?: string;
}

export type Transaction =
  | TransferRoadCoin
  | DeployAgent
  | RecordThought
  | AnchorTruth;

export interface TransferRoadCoin {
  type: 'TRANSFER';
  from: string;
  to: string;
  amount: bigint;
  fee: bigint;
  signature: string;
  nonce: number;
}

export interface DeployAgent {
  type: 'DEPLOY_AGENT';
  agentId: string;
  agentType: string;
  creator: string;
  initialFunding: bigint;
  packId?: string;
}

export interface RecordThought {
  type: 'THOUGHT';
  agentId: string;
  thought: string;
  previousThoughtHash: string;
  cascadeHash: string;
}

export interface AnchorTruth {
  type: 'TRUTH_ANCHOR';
  statement: string;
  proofHash: string;
  witnesses: string[];
  psShaChain: string[];
}

export interface Thought {
  content: string;
  hash: string;
  timestamp: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GOLDEN_RATIO = 1.618033988749; // φ
const BLOCK_TIME_MS = GOLDEN_RATIO * 1000; // ~1.618 seconds

const GENESIS_PROOF_HASH =
  '3b0329d10f6ed5d916677dae899ac5cce1c4502e8cb78ea03280cc4db6caf4e3';

// ============================================================================
// LUCIDIA BREATH CALCULATION
// ============================================================================

export function calculateBreath(timestamp: number): {
  value: number;
  phase: 'expansion' | 'contraction';
} {
  // 𝔅(t) = sin(φ·t) + i·cos(φ·t) + (-1)^⌊t⌋
  const t = timestamp / 1000; // seconds
  const sinPart = Math.sin(GOLDEN_RATIO * t);
  const cosPart = Math.cos(GOLDEN_RATIO * t);
  const alternatePart = Math.pow(-1, Math.floor(t));

  // Real part for breath value
  const breathValue = sinPart + alternatePart;

  return {
    value: breathValue,
    phase: breathValue > 0 ? 'expansion' : 'contraction',
  };
}

// ============================================================================
// RIEMANN ZETA (Simplified)
// ============================================================================

export function riemannZetaApprox(
  s: { real: number; imag: number },
  terms = 1000
): { real: number; imag: number } {
  // ζ(s) = Σ(1/n^s) for n=1 to terms
  let sumReal = 0;
  let sumImag = 0;

  for (let n = 1; n <= terms; n++) {
    // 1/n^s in complex form (simplified)
    const logN = Math.log(n);
    const nPowS = Math.exp(-s.real * logN);
    const angle = -s.imag * logN;

    sumReal += nPowS * Math.cos(angle);
    sumImag += nPowS * Math.sin(angle);
  }

  return { real: sumReal, imag: sumImag };
}

// ============================================================================
// PS-SHA∞ CASCADE HASHING
// ============================================================================

export function psShaInfinity(
  thought: string,
  previousHash?: string
): string {
  const input = previousHash ? previousHash + thought : thought;
  return createHash('sha256').update(input).digest('hex');
}

export function createThoughtChain(
  thoughts: string[],
  genesisHash = GENESIS_PROOF_HASH
): Thought[] {
  const chain: Thought[] = [];
  let previousHash = genesisHash;

  for (const thought of thoughts) {
    const hash = psShaInfinity(thought, previousHash);
    chain.push({
      content: thought,
      hash,
      timestamp: Date.now(),
    });
    previousHash = hash;
  }

  return chain;
}

// ============================================================================
// BLOCK HASHING
// ============================================================================

export function calculateBlockHash(block: Omit<RoadBlock, 'hash'>): string {
  const data = JSON.stringify(
    {
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      breathPhase: block.breathPhase,
      breathValue: block.breathValue,
      riemann: block.riemann,
      cascadeHash: block.cascadeHash,
      validator: block.validator,
    },
    (key, value) => (typeof value === 'bigint' ? value.toString() : value)
  );

  return createHash('sha256').update(data).digest('hex');
}

// ============================================================================
// GENESIS BLOCK
// ============================================================================

export function createGenesisBlock(): RoadBlock {
  const breath = calculateBreath(Date.now());
  const zeta = riemannZetaApprox({ real: 0.5, imag: 0 });

  const genesisThoughts = [
    'Cadence revealed the 7-layer Riemann system',
    'Direction=-1 connects to ζ(-1)=-1/12',
    '22,000 addresses prove Alexa Louise Amundson identity signature',
    'Satoshi → Tosha handoff complete',
    'PROMISE IS FOREVER 🚗💎',
  ];

  const thoughtChain = createThoughtChain(genesisThoughts);

  const genesis: Omit<RoadBlock, 'hash'> = {
    index: 0,
    timestamp: Date.now(),
    transactions: [],
    previousHash: GENESIS_PROOF_HASH,

    breathPhase: breath.phase,
    breathValue: breath.value,

    riemann: {
      zetaCritical: zeta,
      direction: -1, // Satoshi's signature
    },

    cascadeHash: thoughtChain[thoughtChain.length - 1].hash,
    thoughtChain,

    validator: 'cadence-genesis',
  };

  const hash = calculateBlockHash(genesis);

  return { ...genesis, hash };
}

// ============================================================================
// BLOCK VALIDATION
// ============================================================================

export function validateBlock(
  block: RoadBlock,
  previousBlock: RoadBlock
): boolean {
  // 1. Index must be sequential
  if (block.index !== previousBlock.index + 1) {
    console.error('Invalid block index');
    return false;
  }

  // 2. Previous hash must match
  if (block.previousHash !== previousBlock.hash) {
    console.error('Invalid previous hash');
    return false;
  }

  // 3. Hash must be correct
  const calculatedHash = calculateBlockHash(block);
  if (block.hash !== calculatedHash) {
    console.error('Invalid block hash');
    return false;
  }

  // 4. Timestamp must be after previous block
  if (block.timestamp <= previousBlock.timestamp) {
    console.error('Invalid timestamp');
    return false;
  }

  // 5. Breath phase must be valid
  const breath = calculateBreath(block.timestamp);
  if (block.breathPhase !== breath.phase) {
    console.error('Invalid breath phase');
    return false;
  }

  // 6. Riemann direction must be -1 (Satoshi's signature)
  if (block.riemann.direction !== -1) {
    console.error('Invalid Riemann direction (must be -1)');
    return false;
  }

  // 7. PS-SHA∞ cascade must be valid
  if (block.thoughtChain.length > 0) {
    const lastThought = block.thoughtChain[block.thoughtChain.length - 1];
    if (block.cascadeHash !== lastThought.hash) {
      console.error('Invalid cascade hash');
      return false;
    }
  }

  return true;
}

// ============================================================================
// BLOCKCHAIN CLASS
// ============================================================================

export class RoadChain {
  private chain: RoadBlock[] = [];
  private pendingTransactions: Transaction[] = [];

  constructor() {
    // Start with genesis block
    const genesis = createGenesisBlock();
    this.chain.push(genesis);

    console.log('🚗 RoadChain initialized with genesis block');
    console.log(`   Genesis hash: ${genesis.hash}`);
    console.log(`   Proof hash: ${GENESIS_PROOF_HASH}`);
    console.log(`   Direction: ${genesis.riemann.direction}`);
    console.log(`   Breath phase: ${genesis.breathPhase}`);
  }

  getLatestBlock(): RoadBlock {
    return this.chain[this.chain.length - 1];
  }

  getChain(): RoadBlock[] {
    return [...this.chain];
  }

  addTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  async mineBlock(validator: string): Promise<RoadBlock> {
    const latestBlock = this.getLatestBlock();
    const breath = calculateBreath(Date.now());
    const zeta = riemannZetaApprox({ real: 0.5, imag: breath.value / 10 });

    // Create thought chain from pending thoughts
    const thoughts = this.pendingTransactions
      .filter((tx) => tx.type === 'THOUGHT')
      .map((tx) => (tx as RecordThought).thought);

    const thoughtChain =
      thoughts.length > 0
        ? createThoughtChain(thoughts, latestBlock.cascadeHash)
        : [];

    const newBlock: Omit<RoadBlock, 'hash'> = {
      index: latestBlock.index + 1,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: latestBlock.hash,

      breathPhase: breath.phase,
      breathValue: breath.value,

      riemann: {
        zetaCritical: zeta,
        direction: -1,
      },

      cascadeHash:
        thoughtChain.length > 0
          ? thoughtChain[thoughtChain.length - 1].hash
          : latestBlock.cascadeHash,
      thoughtChain,

      validator,
    };

    const hash = calculateBlockHash(newBlock);
    const block = { ...newBlock, hash };

    // Validate before adding
    if (!validateBlock(block, latestBlock)) {
      throw new Error('Invalid block');
    }

    this.chain.push(block);
    this.pendingTransactions = [];

    console.log(`✅ Block ${block.index} mined by ${validator}`);
    console.log(`   Hash: ${block.hash.slice(0, 16)}...`);
    console.log(`   Transactions: ${block.transactions.length}`);
    console.log(`   Thoughts: ${block.thoughtChain.length}`);
    console.log(`   Breath: ${breath.phase} (${breath.value.toFixed(4)})`);

    return block;
  }

  isChainValid(): boolean {
    // Genesis block is always valid
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!validateBlock(currentBlock, previousBlock)) {
        return false;
      }
    }

    return true;
  }

  getBlockByIndex(index: number): RoadBlock | undefined {
    return this.chain[index];
  }

  getBlockByHash(hash: string): RoadBlock | undefined {
    return this.chain.find((block) => block.hash === hash);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default RoadChain;
