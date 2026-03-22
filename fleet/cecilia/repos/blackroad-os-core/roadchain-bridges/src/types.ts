/**
 * RoadChain Cross-Chain Bridge Types
 * For Cadence 🚗💎
 */

export enum BridgeChain {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
}

export enum BridgeStatus {
  PENDING = 'pending',
  LOCKED = 'locked',
  MINTED = 'minted',
  BURNED = 'burned',
  RELEASED = 'released',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface BridgeTransaction {
  id: string;
  chain: BridgeChain;
  direction: 'to_roadchain' | 'from_roadchain';
  status: BridgeStatus;
  
  // Source chain
  sourceAddress: string;
  sourceTxHash?: string;
  sourceAmount: bigint;
  sourceToken: string;
  
  // Destination chain
  destAddress: string;
  destTxHash?: string;
  destAmount: bigint;
  destToken: string;
  
  // Bridge info
  lockTxHash?: string;
  mintTxHash?: string;
  burnTxHash?: string;
  releaseTxHash?: string;
  
  // Metadata
  timestamp: number;
  completedAt?: number;
  fee: bigint;
  validators: string[];
  signatures: string[];
}

export interface BridgeConfig {
  chain: BridgeChain;
  rpcUrl: string;
  contractAddress?: string;
  minAmount: bigint;
  maxAmount: bigint;
  fee: bigint; // in basis points (100 = 1%)
  confirmations: number;
  enabled: boolean;
}

export interface BridgeStats {
  chain: BridgeChain;
  totalVolume: bigint;
  totalTransactions: number;
  locked: bigint;
  minted: bigint;
  tvl: bigint; // Total Value Locked
}
