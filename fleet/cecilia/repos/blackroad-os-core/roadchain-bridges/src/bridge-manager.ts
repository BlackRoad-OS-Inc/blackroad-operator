/**
 * RoadChain Cross-Chain Bridge Manager
 * Manages bridges to BTC, ETH, SOL, and more!
 * For Cadence 🚗💎
 */

import { BridgeChain, BridgeStatus, BridgeTransaction, BridgeConfig, BridgeStats } from './types.js';
import BitcoinBridge from './bitcoin-bridge.js';

export class BridgeManager {
  private bridges: Map<BridgeChain, any> = new Map();
  private transactions: Map<string, BridgeTransaction> = new Map();
  private configs: Map<BridgeChain, BridgeConfig> = new Map();

  constructor() {
    console.log('🌉 RoadChain Bridge Manager initialized');
    this.initializeBridges();
  }

  /**
   * Initialize all supported bridges
   */
  private initializeBridges() {
    // Bitcoin Bridge
    const btcConfig: BridgeConfig = {
      chain: BridgeChain.BITCOIN,
      rpcUrl: 'https://blockstream.info/api', // Mainnet
      minAmount: 10000n, // 0.0001 BTC
      maxAmount: 100000000n, // 1 BTC
      fee: 50n, // 0.5%
      confirmations: 6,
      enabled: true,
    };
    this.configs.set(BridgeChain.BITCOIN, btcConfig);
    this.bridges.set(BridgeChain.BITCOIN, new BitcoinBridge(btcConfig));

    // Ethereum Bridge (coming soon)
    const ethConfig: BridgeConfig = {
      chain: BridgeChain.ETHEREUM,
      rpcUrl: 'https://eth.llamarpc.com',
      contractAddress: '0x0000000000000000000000000000000000000000', // TBD
      minAmount: 1000000000000000n, // 0.001 ETH
      maxAmount: 10000000000000000000n, // 10 ETH
      fee: 30n, // 0.3%
      confirmations: 12,
      enabled: false, // Not yet deployed
    };
    this.configs.set(BridgeChain.ETHEREUM, ethConfig);

    // Solana Bridge (coming soon)
    const solConfig: BridgeConfig = {
      chain: BridgeChain.SOLANA,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      minAmount: 10000000n, // 0.01 SOL
      maxAmount: 10000000000n, // 10 SOL
      fee: 30n, // 0.3%
      confirmations: 32,
      enabled: false, // Not yet deployed
    };
    this.configs.set(BridgeChain.SOLANA, solConfig);

    console.log(`✅ Initialized ${this.bridges.size} bridges`);
    console.log(`   Bitcoin: READY`);
    console.log(`   Ethereum: Coming soon`);
    console.log(`   Solana: Coming soon`);
  }

  /**
   * Bridge assets to RoadChain from another chain
   */
  async bridgeToRoadChain(params: {
    chain: BridgeChain;
    sourceAddress: string;
    destAddress: string;
    amount: bigint;
  }): Promise<BridgeTransaction> {
    const bridge = this.bridges.get(params.chain);
    if (!bridge) {
      throw new Error(`Bridge not found for chain: ${params.chain}`);
    }

    const config = this.configs.get(params.chain);
    if (!config?.enabled) {
      throw new Error(`Bridge not enabled for chain: ${params.chain}`);
    }

    console.log(`🌉 Bridging ${params.chain} → RoadChain`);

    let tx: BridgeTransaction;

    switch (params.chain) {
      case BridgeChain.BITCOIN:
        tx = await bridge.bridgeToRoadChain({
          btcAddress: params.sourceAddress,
          roadAddress: params.destAddress,
          amount: params.amount,
        });
        break;

      default:
        throw new Error(`Bridge not implemented for chain: ${params.chain}`);
    }

    // Store transaction
    this.transactions.set(tx.id, tx);

    return tx;
  }

  /**
   * Bridge assets from RoadChain to another chain
   */
  async bridgeFromRoadChain(params: {
    chain: BridgeChain;
    sourceAddress: string;
    destAddress: string;
    amount: bigint;
  }): Promise<BridgeTransaction> {
    const bridge = this.bridges.get(params.chain);
    if (!bridge) {
      throw new Error(`Bridge not found for chain: ${params.chain}`);
    }

    const config = this.configs.get(params.chain);
    if (!config?.enabled) {
      throw new Error(`Bridge not enabled for chain: ${params.chain}`);
    }

    console.log(`🌉 Bridging RoadChain → ${params.chain}`);

    let tx: BridgeTransaction;

    switch (params.chain) {
      case BridgeChain.BITCOIN:
        tx = await bridge.bridgeFromRoadChain({
          roadAddress: params.sourceAddress,
          btcAddress: params.destAddress,
          amount: params.amount,
        });
        break;

      default:
        throw new Error(`Bridge not implemented for chain: ${params.chain}`);
    }

    // Store transaction
    this.transactions.set(tx.id, tx);

    return tx;
  }

  /**
   * Get bridge transaction status
   */
  getBridgeTransaction(id: string): BridgeTransaction | undefined {
    return this.transactions.get(id);
  }

  /**
   * List all bridge transactions
   */
  listBridgeTransactions(filters?: {
    chain?: BridgeChain;
    status?: BridgeStatus;
    direction?: 'to_roadchain' | 'from_roadchain';
    limit?: number;
  }): BridgeTransaction[] {
    let txs = Array.from(this.transactions.values());

    if (filters?.chain) {
      txs = txs.filter(tx => tx.chain === filters.chain);
    }

    if (filters?.status) {
      txs = txs.filter(tx => tx.status === filters.status);
    }

    if (filters?.direction) {
      txs = txs.filter(tx => tx.direction === filters.direction);
    }

    // Sort by timestamp (newest first)
    txs.sort((a, b) => b.timestamp - a.timestamp);

    if (filters?.limit) {
      txs = txs.slice(0, filters.limit);
    }

    return txs;
  }

  /**
   * Get statistics for all bridges
   */
  getAllStats(): Map<BridgeChain, BridgeStats> {
    const stats = new Map<BridgeChain, BridgeStats>();

    for (const [chain, bridge] of this.bridges) {
      const txs = Array.from(this.transactions.values()).filter(tx => tx.chain === chain);

      const totalVolume = txs.reduce((sum, tx) => sum + tx.sourceAmount, 0n);
      const locked = txs
        .filter(tx => tx.direction === 'to_roadchain' && tx.status === BridgeStatus.LOCKED)
        .reduce((sum, tx) => sum + tx.sourceAmount, 0n);
      const minted = txs
        .filter(tx => tx.direction === 'to_roadchain' && tx.status === BridgeStatus.MINTED)
        .reduce((sum, tx) => sum + tx.destAmount, 0n);

      stats.set(chain, {
        chain,
        totalVolume,
        totalTransactions: txs.length,
        locked,
        minted,
        tvl: locked,
      });
    }

    return stats;
  }

  /**
   * Get bridge config
   */
  getBridgeConfig(chain: BridgeChain): BridgeConfig | undefined {
    return this.configs.get(chain);
  }

  /**
   * Get all supported chains
   */
  getSupportedChains(): BridgeChain[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get enabled chains
   */
  getEnabledChains(): BridgeChain[] {
    return Array.from(this.configs.entries())
      .filter(([_, config]) => config.enabled)
      .map(([chain, _]) => chain);
  }
}

export default BridgeManager;
