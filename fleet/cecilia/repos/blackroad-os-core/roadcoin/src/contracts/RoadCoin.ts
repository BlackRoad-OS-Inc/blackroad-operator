/**
 * RoadCoin (ROAD) - Native token of RoadChain
 * For Cadence 🚗💎
 *
 * Total Supply: 22,000,000 ROAD (fixed, never changes)
 * Smallest unit: 1 sat = 10^-8 ROAD
 */

export const SATS_PER_ROAD = 100_000_000n; // Like Bitcoin
export const TOTAL_SUPPLY = 22_000_000n * SATS_PER_ROAD; // 22M ROAD in sats

export interface RoadCoinState {
  balances: Map<string, bigint>; // Address -> balance (in sats)
  allowances: Map<string, Map<string, bigint>>; // Owner -> Spender -> amount
  totalSupply: bigint;
  burned: bigint;
}

export class RoadCoin {
  private state: RoadCoinState;

  constructor() {
    this.state = {
      balances: new Map(),
      allowances: new Map(),
      totalSupply: TOTAL_SUPPLY,
      burned: 0n,
    };

    // Genesis distribution
    this.distributeGenesis();
  }

  private distributeGenesis(): void {
    const distributions = [
      {
        address: 'cadence-genesis',
        amount: 6_600_000n * SATS_PER_ROAD, // 30% - Cadence (Genesis Validator)
        label: 'Cadence (The OG)',
      },
      {
        address: 'tosha-builder',
        amount: 4_400_000n * SATS_PER_ROAD, // 20% - Tosha (Builder/Bridge)
        label: 'Tosha (Builder)',
      },
      {
        address: 'agent-network',
        amount: 6_600_000n * SATS_PER_ROAD, // 30% - Agent Network
        label: 'Agent Network',
      },
      {
        address: 'community-treasury',
        amount: 2_200_000n * SATS_PER_ROAD, // 10% - Community Treasury
        label: 'Community Treasury',
      },
      {
        address: 'liquidity-pool',
        amount: 2_200_000n * SATS_PER_ROAD, // 10% - Liquidity Pool
        label: 'Liquidity Pool',
      },
    ];

    console.log('🚗 RoadCoin Genesis Distribution:');
    console.log('━'.repeat(60));

    for (const { address, amount, label } of distributions) {
      this.state.balances.set(address, amount);
      const roadAmount = Number(amount / SATS_PER_ROAD).toLocaleString();
      console.log(`${label.padEnd(25)} ${roadAmount.padStart(15)} ROAD`);
    }

    console.log('━'.repeat(60));
    console.log(
      `Total Supply:              ${Number(this.state.totalSupply / SATS_PER_ROAD).toLocaleString()} ROAD`
    );
    console.log('');
  }

  // ============================================================================
  // CORE TOKEN FUNCTIONS
  // ============================================================================

  balanceOf(address: string): bigint {
    return this.state.balances.get(address) ?? 0n;
  }

  transfer(from: string, to: string, amount: bigint): boolean {
    if (amount <= 0n) {
      throw new Error('Amount must be positive');
    }

    const fromBalance = this.balanceOf(from);
    if (fromBalance < amount) {
      throw new Error(
        `Insufficient balance: ${fromBalance} < ${amount}`
      );
    }

    // Update balances
    this.state.balances.set(from, fromBalance - amount);
    const toBalance = this.balanceOf(to);
    this.state.balances.set(to, toBalance + amount);

    console.log(`💸 Transfer: ${from} → ${to}: ${this.formatROAD(amount)}`);

    return true;
  }

  approve(owner: string, spender: string, amount: bigint): boolean {
    if (!this.state.allowances.has(owner)) {
      this.state.allowances.set(owner, new Map());
    }

    this.state.allowances.get(owner)!.set(spender, amount);

    console.log(`✅ Approved: ${spender} can spend ${this.formatROAD(amount)} from ${owner}`);

    return true;
  }

  allowance(owner: string, spender: string): bigint {
    return this.state.allowances.get(owner)?.get(spender) ?? 0n;
  }

  transferFrom(
    spender: string,
    from: string,
    to: string,
    amount: bigint
  ): boolean {
    const allowed = this.allowance(from, spender);

    if (allowed < amount) {
      throw new Error(`Allowance exceeded: ${allowed} < ${amount}`);
    }

    // Reduce allowance
    this.state.allowances.get(from)!.set(spender, allowed - amount);

    // Transfer
    return this.transfer(from, to, amount);
  }

  // ============================================================================
  // DEFLATIONARY MECHANICS
  // ============================================================================

  burn(from: string, amount: bigint): boolean {
    if (amount <= 0n) {
      throw new Error('Amount must be positive');
    }

    const balance = this.balanceOf(from);
    if (balance < amount) {
      throw new Error(`Insufficient balance to burn: ${balance} < ${amount}`);
    }

    // Remove from circulation
    this.state.balances.set(from, balance - amount);
    this.state.burned += amount;
    this.state.totalSupply -= amount;

    console.log(`🔥 Burned ${this.formatROAD(amount)} from ${from}`);
    console.log(`   Total burned: ${this.formatROAD(this.state.burned)}`);
    console.log(`   Remaining supply: ${this.formatROAD(this.state.totalSupply)}`);

    return true;
  }

  // ============================================================================
  // AGENT REWARDS
  // ============================================================================

  mintAgentReward(agent: string, amount: bigint): boolean {
    // Can only mint from community treasury
    const treasury = this.balanceOf('community-treasury');

    if (treasury < amount) {
      throw new Error(
        `Treasury insufficient: ${treasury} < ${amount}`
      );
    }

    // Transfer from treasury to agent
    return this.transfer('community-treasury', agent, amount);
  }

  // Agent reward schedule (from whitepaper)
  readonly AGENT_REWARDS = {
    DEPLOY: 1_000n * SATS_PER_ROAD, // 1,000 ROAD
    VALIDATE_1000_BLOCKS: 100n * SATS_PER_ROAD, // 100 ROAD
    RECORD_10000_THOUGHTS: 50n * SATS_PER_ROAD, // 50 ROAD
  };

  rewardAgentDeploy(agent: string): boolean {
    return this.mintAgentReward(agent, this.AGENT_REWARDS.DEPLOY);
  }

  rewardAgentValidation(agent: string, blocks: number): boolean {
    const reward = (BigInt(blocks) / 1000n) * this.AGENT_REWARDS.VALIDATE_1000_BLOCKS;
    return this.mintAgentReward(agent, reward);
  }

  rewardAgentThoughts(agent: string, thoughts: number): boolean {
    const reward = (BigInt(thoughts) / 10000n) * this.AGENT_REWARDS.RECORD_10000_THOUGHTS;
    return this.mintAgentReward(agent, reward);
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  formatROAD(sats: bigint): string {
    const road = Number(sats) / Number(SATS_PER_ROAD);
    return `${road.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })} ROAD`;
  }

  fromROAD(road: number): bigint {
    return BigInt(Math.floor(road * Number(SATS_PER_ROAD)));
  }

  getState(): Readonly<RoadCoinState> {
    return {
      balances: new Map(this.state.balances),
      allowances: new Map(this.state.allowances),
      totalSupply: this.state.totalSupply,
      burned: this.state.burned,
    };
  }

  getCirculatingSupply(): bigint {
    // Total - burned - locked in treasury
    const treasuryBalance = this.balanceOf('community-treasury');
    return this.state.totalSupply - treasuryBalance;
  }

  // ============================================================================
  // STATS
  // ============================================================================

  getStats() {
    return {
      totalSupply: this.formatROAD(this.state.totalSupply),
      circulatingSupply: this.formatROAD(this.getCirculatingSupply()),
      burned: this.formatROAD(this.state.burned),
      treasuryBalance: this.formatROAD(this.balanceOf('community-treasury')),
      cadenceBalance: this.formatROAD(this.balanceOf('cadence-genesis')),
      toshaBalance: this.formatROAD(this.balanceOf('tosha-builder')),
      agentNetworkBalance: this.formatROAD(this.balanceOf('agent-network')),
      liquidityPoolBalance: this.formatROAD(this.balanceOf('liquidity-pool')),
    };
  }

  printStats(): void {
    const stats = this.getStats();

    console.log('');
    console.log('🚗 RoadCoin Statistics');
    console.log('━'.repeat(70));
    console.log(`Total Supply:        ${stats.totalSupply}`);
    console.log(`Circulating Supply:  ${stats.circulatingSupply}`);
    console.log(`Burned:              ${stats.burned}`);
    console.log('');
    console.log('Balances:');
    console.log(`  Cadence (Genesis):   ${stats.cadenceBalance}`);
    console.log(`  Tosha (Builder):     ${stats.toshaBalance}`);
    console.log(`  Agent Network:       ${stats.agentNetworkBalance}`);
    console.log(`  Community Treasury:  ${stats.treasuryBalance}`);
    console.log(`  Liquidity Pool:      ${stats.liquidityPoolBalance}`);
    console.log('━'.repeat(70));
    console.log('');
  }
}

export default RoadCoin;
