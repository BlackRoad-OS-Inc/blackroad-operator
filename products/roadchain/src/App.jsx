import { useState, useEffect, useCallback, useMemo } from 'react';

// =============================================================================
// UTILITY HELPERS
// =============================================================================

function randomHash(len = 64) {
  const chars = '0123456789abcdef';
  let h = '';
  for (let i = 0; i < len; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

function randomAddr() {
  return '0x' + randomHash(40);
}

function randomBtcAddr() {
  const prefixes = ['bc1q', '3', '1'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = '0123456789abcdefghjkmnpqrstuvwxyz';
  let a = p;
  for (let i = 0; i < (p === 'bc1q' ? 38 : 33); i++) a += chars[Math.floor(Math.random() * chars.length)];
  return a;
}

function timeAgo(seconds) {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatNum(n, decimals = 2) {
  if (n >= 1e12) return (n / 1e12).toFixed(decimals) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
  return n.toFixed(decimals);
}

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatCrypto(n, decimals = 6) {
  return n.toFixed(decimals);
}

// =============================================================================
// DATA GENERATORS
// =============================================================================

function generateBlocks(count = 20) {
  const blocks = [];
  const baseHeight = 884231;
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    const txCount = Math.floor(Math.random() * 3000) + 500;
    const size = (Math.random() * 1.8 + 0.2).toFixed(2);
    const reward = 3.125;
    blocks.push({
      height: baseHeight - i,
      hash: '0x' + randomHash(64),
      parentHash: '0x' + randomHash(64),
      miner: randomAddr(),
      timestamp: baseTime - i * (Math.random() * 20 + 8) * 1000,
      txCount,
      size: parseFloat(size),
      gasUsed: Math.floor(Math.random() * 30000000),
      gasLimit: 30000000,
      reward,
      difficulty: (Math.random() * 5 + 80).toFixed(2) + 'T',
      nonce: '0x' + randomHash(16),
    });
  }
  return blocks;
}

function generateTransactions(count = 30) {
  const types = ['transfer', 'swap', 'stake', 'unstake', 'contract', 'mint'];
  const tokens = ['BTC', 'ETH', 'ROAD', 'USDT', 'USDC'];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending'];
  const txs = [];
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = type === 'transfer' && token === 'BTC'
      ? (Math.random() * 2 + 0.001).toFixed(6)
      : type === 'swap'
        ? (Math.random() * 5000 + 10).toFixed(2)
        : (Math.random() * 100 + 0.1).toFixed(4);
    txs.push({
      hash: '0x' + randomHash(64),
      from: randomAddr(),
      to: randomAddr(),
      type,
      token,
      amount: parseFloat(amount),
      fee: (Math.random() * 0.005 + 0.0001).toFixed(6),
      status,
      timestamp: baseTime - i * (Math.random() * 300 + 30) * 1000,
      block: 884231 - Math.floor(Math.random() * 10),
      confirmations: status === 'confirmed' ? Math.floor(Math.random() * 50) + 1 : 0,
    });
  }
  return txs;
}

function generatePriceHistory(days = 30, basePrice = 97000, volatility = 0.02) {
  const data = [];
  let price = basePrice;
  for (let i = days; i >= 0; i--) {
    const change = price * volatility * (Math.random() * 2 - 1);
    price = Math.max(price * 0.8, price + change);
    data.push({
      day: i,
      price: price,
      volume: Math.random() * 50e9 + 10e9,
    });
  }
  return data;
}

function generateHashrateHistory(count = 48) {
  const data = [];
  let rate = 580;
  for (let i = 0; i < count; i++) {
    rate = Math.max(400, Math.min(750, rate + (Math.random() * 40 - 20)));
    data.push(rate);
  }
  return data;
}

function generateLotteryHistory() {
  return [
    { round: 47, winner: randomBtcAddr(), prize: 12.5, tickets: 2500, date: '2026-02-27' },
    { round: 46, winner: randomBtcAddr(), prize: 10.8, tickets: 2180, date: '2026-02-20' },
    { round: 45, winner: randomBtcAddr(), prize: 15.2, tickets: 3100, date: '2026-02-13' },
    { round: 44, winner: randomBtcAddr(), prize: 8.9, tickets: 1800, date: '2026-02-06' },
    { round: 43, winner: randomBtcAddr(), prize: 11.3, tickets: 2290, date: '2026-01-30' },
  ];
}

// =============================================================================
// SPARKLINE COMPONENT
// =============================================================================

function Sparkline({ data, color = 'var(--hot-pink)', height = 40, large = false }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className={`sparkline${large ? ' sparkline-large' : ''}`} style={{ height }}>
      {data.map((val, i) => {
        const h = ((val - min) / range) * 100;
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className="sparkline-bar"
            style={{
              height: `${Math.max(4, h)}%`,
              background: isLast ? color : `${color}88`,
            }}
          />
        );
      })}
    </div>
  );
}

// =============================================================================
// TAB: EXPLORER
// =============================================================================

function ExplorerTab() {
  const [blocks] = useState(() => generateBlocks(20));
  const [txs] = useState(() => generateTransactions(30));
  const [view, setView] = useState('blocks');
  const [selectedBlock, setSelectedBlock] = useState(null);

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">Blockchain Explorer</h2>
        <p className="section-subtitle">Real-time block and transaction data on the RoadChain network</p>
      </div>

      {/* Block chain visual */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Latest Blocks</span>
          <span className="badge badge-green">Live</span>
        </div>
        <div className="block-chain-visual">
          {blocks.slice(0, 8).map((b) => (
            <div
              key={b.height}
              className="block-visual"
              onClick={() => setSelectedBlock(b)}
            >
              <div className="block-number">#{b.height.toLocaleString()}</div>
              <div className="block-hash-preview">{b.hash.slice(0, 22)}...</div>
              <div className="block-meta">
                <span>{b.txCount} txs</span>
                <span>{b.size} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block detail modal inline */}
      {selectedBlock && (
        <div className="card" style={{ borderColor: 'var(--electric-blue)' }}>
          <div className="card-header">
            <span className="card-title">Block #{selectedBlock.height.toLocaleString()}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedBlock(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <div className="stat-row">
              <span className="stat-label">Block Hash</span>
              <span className="stat-value mono hash truncate" style={{ maxWidth: 300 }}>{selectedBlock.hash}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Parent Hash</span>
              <span className="stat-value mono hash truncate" style={{ maxWidth: 300 }}>{selectedBlock.parentHash}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Miner</span>
              <span className="stat-value mono truncate" style={{ maxWidth: 300 }}>{selectedBlock.miner}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">{selectedBlock.txCount.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Size</span>
              <span className="stat-value">{selectedBlock.size} MB</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Gas Used</span>
              <span className="stat-value">{selectedBlock.gasUsed.toLocaleString()} / {selectedBlock.gasLimit.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Reward</span>
              <span className="stat-value">{selectedBlock.reward} BTC</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Difficulty</span>
              <span className="stat-value">{selectedBlock.difficulty}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Nonce</span>
              <span className="stat-value mono">{selectedBlock.nonce}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Timestamp</span>
              <span className="stat-value">{new Date(selectedBlock.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Blocks / Transactions */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 4 }}>
        <button className={`btn btn-sm ${view === 'blocks' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('blocks')}>Blocks</button>
        <button className={`btn btn-sm ${view === 'transactions' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('transactions')}>Transactions</button>
      </div>

      {view === 'blocks' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Height</th>
                  <th>Hash</th>
                  <th>Miner</th>
                  <th>Txs</th>
                  <th>Size</th>
                  <th>Reward</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.height} onClick={() => setSelectedBlock(b)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{b.height.toLocaleString()}</td>
                    <td><span className="hash truncate">{b.hash}</span></td>
                    <td><span className="mono truncate" style={{ maxWidth: 120 }}>{b.miner}</span></td>
                    <td>{b.txCount.toLocaleString()}</td>
                    <td>{b.size} MB</td>
                    <td>{b.reward} BTC</td>
                    <td style={{ color: 'var(--gray-500)' }}>{timeAgo(Math.floor((Date.now() - b.timestamp) / 1000))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.hash}>
                    <td><span className="hash truncate">{tx.hash}</span></td>
                    <td><span className={`badge badge-${tx.type === 'transfer' ? 'blue' : tx.type === 'swap' ? 'pink' : tx.type === 'stake' ? 'violet' : 'amber'}`}>{tx.type}</span></td>
                    <td><span className="mono truncate" style={{ maxWidth: 100 }}>{tx.from}</span></td>
                    <td><span className="mono truncate" style={{ maxWidth: 100 }}>{tx.to}</span></td>
                    <td style={{ fontWeight: 600 }}>{tx.amount} {tx.token}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{tx.fee}</td>
                    <td>
                      <span className={`badge ${tx.status === 'confirmed' ? 'badge-green' : 'badge-amber'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{timeAgo(Math.floor((Date.now() - tx.timestamp) / 1000))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TAB: WALLET
// =============================================================================

function WalletTab() {
  const [walletAddr] = useState(() => randomAddr());
  const [balances] = useState({
    BTC: { amount: 2.4837, usd: 241283.10, change: 3.42 },
    ETH: { amount: 18.2941, usd: 60370.53, change: -1.18 },
    ROAD: { amount: 125000, usd: 31250.00, change: 12.8 },
    USDT: { amount: 15420.50, usd: 15420.50, change: 0.01 },
  });
  const [txHistory] = useState(() => generateTransactions(15));
  const [sendForm, setSendForm] = useState({ to: '', amount: '', token: 'ROAD' });
  const [showSend, setShowSend] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const totalUSD = Object.values(balances).reduce((s, b) => s + b.usd, 0);
  const priceData = useMemo(() => generatePriceHistory(30, 97000), []);

  const handleSend = () => {
    if (!sendForm.to || !sendForm.amount) return;
    setSendResult({
      hash: '0x' + randomHash(64),
      status: 'pending',
    });
    setTimeout(() => setSendResult((prev) => prev ? { ...prev, status: 'confirmed' } : null), 2000);
  };

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">Wallet Dashboard</h2>
        <p className="section-subtitle">
          <span className="mono" style={{ color: 'var(--electric-blue)' }}>{walletAddr.slice(0, 8)}...{walletAddr.slice(-6)}</span>
        </p>
      </div>

      {/* Total balance */}
      <div className="card" style={{ borderColor: 'var(--gray-700)' }}>
        <div className="card-header">
          <span className="card-title">Total Portfolio Value</span>
          <span className="card-change positive">+4.2% (24h)</span>
        </div>
        <div className="card-value">{formatUSD(totalUSD)}</div>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <Sparkline data={priceData.map((p) => p.price)} color="var(--green)" height={50} />
        </div>
      </div>

      {/* Asset cards */}
      <div className="grid-4">
        {Object.entries(balances).map(([token, data]) => {
          const colors = { BTC: '#F7931A', ETH: '#627EEA', ROAD: 'var(--hot-pink)', USDT: '#26A17B' };
          const icons = { BTC: '\u20BF', ETH: '\u039E', ROAD: '\u26D3', USDT: '$' };
          return (
            <div key={token} className="card">
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.2rem', color: colors[token] }}>{icons[token]}</span>
                  <span className="card-title">{token}</span>
                </span>
                <span className={`card-change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                  {data.change >= 0 ? '+' : ''}{data.change}%
                </span>
              </div>
              <div className="card-value" style={{ fontSize: '1.3rem' }}>
                {token === 'ROAD' ? data.amount.toLocaleString() : formatCrypto(data.amount, token === 'USDT' ? 2 : 4)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 4 }}>
                {formatUSD(data.usd)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Send / Receive */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Send</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setShowSend(!showSend)}>
              {showSend ? 'Cancel' : 'New Transfer'}
            </button>
          </div>
          {showSend && (
            <div className="gap-md" style={{ marginTop: 'var(--space-sm)' }}>
              <div className="input-group">
                <label>Recipient Address</label>
                <input
                  className="input"
                  placeholder="0x..."
                  value={sendForm.to}
                  onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Amount</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0.00"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  />
                </div>
                <div className="input-group" style={{ width: 120 }}>
                  <label>Token</label>
                  <select className="input" value={sendForm.token} onChange={(e) => setSendForm({ ...sendForm, token: e.target.value })}>
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>ROAD</option>
                    <option>USDT</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSend}>Send Transaction</button>
              {sendResult && (
                <div style={{ padding: 'var(--space-sm)', background: 'var(--gray-800)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Transaction Hash</div>
                  <div className="hash mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{sendResult.hash}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`badge ${sendResult.status === 'confirmed' ? 'badge-green' : 'badge-amber'}`}>{sendResult.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {!showSend && (
            <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', padding: 'var(--space-md) 0' }}>
              Click "New Transfer" to send tokens to another wallet address.
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Receive</span>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-sm) 0' }}>
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-md)',
              background: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-sm)',
            }}>
              {/* Simulated QR code using CSS grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(11, 8px)',
                gap: '2px',
              }}>
                {Array.from({ length: 121 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      background: Math.random() > 0.45 ? 'var(--black)' : 'transparent',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--electric-blue)', wordBreak: 'break-all', padding: '0 var(--space-md)' }}>
              {walletAddr}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-sm)' }}
              onClick={() => navigator.clipboard?.writeText(walletAddr)}
            >
              Copy Address
            </button>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Transactions</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{txHistory.length} transactions</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {txHistory.map((tx) => (
                <tr key={tx.hash}>
                  <td><span className="hash truncate">{tx.hash}</span></td>
                  <td><span className={`badge badge-${tx.type === 'transfer' ? 'blue' : tx.type === 'swap' ? 'pink' : 'violet'}`}>{tx.type}</span></td>
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ color: Math.random() > 0.5 ? 'var(--green)' : 'var(--red)' }}>
                      {Math.random() > 0.5 ? '+' : '-'}{tx.amount} {tx.token}
                    </span>
                  </td>
                  <td><span className={`badge ${tx.status === 'confirmed' ? 'badge-green' : 'badge-amber'}`}>{tx.status}</span></td>
                  <td style={{ color: 'var(--gray-500)' }}>{timeAgo(Math.floor((Date.now() - tx.timestamp) / 1000))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB: MINING & STAKING
// =============================================================================

function MiningTab() {
  const [isMining, setIsMining] = useState(true);
  const [hashrateHistory] = useState(() => generateHashrateHistory(48));
  const [stakingPools] = useState([
    { name: 'ROAD Validator', apy: 14.2, staked: 2500000, minStake: 1000, token: 'ROAD', status: 'active' },
    { name: 'BTC Lightning', apy: 5.8, staked: 145.5, minStake: 0.01, token: 'BTC', status: 'active' },
    { name: 'ETH Beacon', apy: 4.1, staked: 3200, minStake: 0.1, token: 'ETH', status: 'active' },
    { name: 'ROAD LP Farm', apy: 28.5, staked: 890000, minStake: 100, token: 'ROAD', status: 'active' },
  ]);
  const [myStakes] = useState([
    { pool: 'ROAD Validator', staked: 50000, rewards: 1842.5, token: 'ROAD', since: '2026-01-15' },
    { pool: 'ETH Beacon', staked: 5.0, rewards: 0.0512, token: 'ETH', since: '2026-02-01' },
  ]);

  const currentHashrate = hashrateHistory[hashrateHistory.length - 1];
  const avgHashrate = hashrateHistory.reduce((s, h) => s + h, 0) / hashrateHistory.length;

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">Mining & Staking</h2>
        <p className="section-subtitle">Earn rewards by mining blocks or staking tokens in validator pools</p>
      </div>

      {/* Mining overview */}
      <div className="grid-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mining Status</span>
            <div className="mining-status">
              <div className={`mining-dot ${isMining ? 'active' : 'inactive'}`} />
              <span style={{ fontSize: '0.8rem', color: isMining ? 'var(--green)' : 'var(--gray-500)' }}>
                {isMining ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
          <div className="card-value">{currentHashrate.toFixed(1)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>TH/s Hashrate</div>
          <button
            className={`btn btn-sm btn-full ${isMining ? 'btn-ghost' : 'btn-green'}`}
            style={{ marginTop: 'var(--space-sm)' }}
            onClick={() => setIsMining(!isMining)}
          >
            {isMining ? 'Pause Mining' : 'Start Mining'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">24h Earnings</span></div>
          <div className="card-value" style={{ color: 'var(--green)' }}>0.00847</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>BTC (~$823.14)</div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Blocks Mined</span></div>
          <div className="card-value">142</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Last 30 days</div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Avg. Hashrate</span></div>
          <div className="card-value">{avgHashrate.toFixed(1)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>TH/s (48h avg)</div>
        </div>
      </div>

      {/* Hashrate chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Hashrate (48h)</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>TH/s</span>
        </div>
        <div className="hashrate-chart">
          {hashrateHistory.map((val, i) => {
            const max = Math.max(...hashrateHistory);
            const min = Math.min(...hashrateHistory);
            const range = max - min || 1;
            const h = ((val - min) / range) * 100;
            const pct = (val - min) / range;
            return (
              <div
                key={i}
                className="hashrate-bar"
                style={{
                  height: `${Math.max(8, h)}%`,
                  background: `linear-gradient(180deg, hsl(${120 + pct * 180}, 80%, 55%) 0%, hsl(${120 + pct * 180}, 80%, 35%) 100%)`,
                }}
                title={`${val.toFixed(1)} TH/s`}
              />
            );
          })}
        </div>
      </div>

      {/* Staking pools */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Staking Pools</span>
          <span className="badge badge-green">{stakingPools.length} Active</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pool</th>
                <th>APY</th>
                <th>Total Staked</th>
                <th>Min. Stake</th>
                <th>Token</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stakingPools.map((pool) => (
                <tr key={pool.name}>
                  <td style={{ fontWeight: 600 }}>{pool.name}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700 }}>{pool.apy}%</td>
                  <td>{pool.staked.toLocaleString()} {pool.token}</td>
                  <td>{pool.minStake} {pool.token}</td>
                  <td><span className="badge badge-pink">{pool.token}</span></td>
                  <td><span className="badge badge-green">{pool.status}</span></td>
                  <td><button className="btn btn-sm btn-primary">Stake</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My stakes */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Stakes</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pool</th>
                <th>Staked</th>
                <th>Rewards Earned</th>
                <th>Since</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myStakes.map((s) => (
                <tr key={s.pool}>
                  <td style={{ fontWeight: 600 }}>{s.pool}</td>
                  <td>{s.staked.toLocaleString()} {s.token}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>+{s.rewards} {s.token}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{s.since}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-green">Claim</button>
                      <button className="btn btn-sm btn-ghost">Unstake</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB: SWAP
// =============================================================================

function SwapTab() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('ROAD');
  const [fromAmount, setFromAmount] = useState('');
  const [swapResult, setSwapResult] = useState(null);

  const rates = {
    'ETH-ROAD': 13250,
    'ROAD-ETH': 0.0000754,
    'BTC-ROAD': 388000,
    'ROAD-BTC': 0.00000258,
    'ETH-BTC': 0.0293,
    'BTC-ETH': 34.12,
    'USDT-ROAD': 4.0,
    'ROAD-USDT': 0.25,
    'BTC-USDT': 97100,
    'USDT-BTC': 0.0000103,
    'ETH-USDT': 3300,
    'USDT-ETH': 0.000303,
  };

  const tokens = ['BTC', 'ETH', 'ROAD', 'USDT'];
  const pair = `${fromToken}-${toToken}`;
  const rate = rates[pair] || 1;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(fromToken === 'ROAD' ? 8 : 2) : '';

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  };

  const executeSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    setSwapResult({
      hash: '0x' + randomHash(64),
      from: `${fromAmount} ${fromToken}`,
      to: `${toAmount} ${toToken}`,
      rate: rate,
      status: 'confirmed',
    });
  };

  const recentSwaps = useMemo(() => [
    { from: '2.5 ETH', to: '33,125 ROAD', time: '2m ago', hash: '0x' + randomHash(12) + '...' },
    { from: '0.15 BTC', to: '58,200 ROAD', time: '5m ago', hash: '0x' + randomHash(12) + '...' },
    { from: '10,000 ROAD', to: '0.754 ETH', time: '8m ago', hash: '0x' + randomHash(12) + '...' },
    { from: '1.0 ETH', to: '3,300 USDT', time: '12m ago', hash: '0x' + randomHash(12) + '...' },
    { from: '50,000 ROAD', to: '12,500 USDT', time: '15m ago', hash: '0x' + randomHash(12) + '...' },
  ], []);

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">ROAD Token Swap</h2>
        <p className="section-subtitle">Instant cross-chain token swaps with minimal slippage</p>
      </div>

      <div className="grid-sidebar">
        <div className="gap-md">
          {/* Swap interface */}
          <div className="swap-card">
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <span className="card-title">Swap Tokens</span>
            </div>

            <div className="input-group">
              <label>From</label>
              <div className="swap-input-wrap">
                <input
                  className="swap-amount"
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
                <select
                  className="input"
                  style={{ width: 100, background: 'var(--gray-700)', border: 'none' }}
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                >
                  {tokens.filter((t) => t !== toToken).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="swap-arrow">
              <button className="swap-arrow-btn" onClick={handleSwap} title="Swap direction">
                &#8645;
              </button>
            </div>

            <div className="input-group">
              <label>To</label>
              <div className="swap-input-wrap">
                <input
                  className="swap-amount"
                  type="text"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                />
                <select
                  className="input"
                  style={{ width: 100, background: 'var(--gray-700)', border: 'none' }}
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                >
                  {tokens.filter((t) => t !== fromToken).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {fromAmount && (
              <div className="swap-details">
                <div className="stat-row">
                  <span className="stat-label">Rate</span>
                  <span className="stat-value" style={{ fontSize: '0.82rem' }}>
                    1 {fromToken} = {rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} {toToken}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Slippage Tolerance</span>
                  <span className="stat-value" style={{ fontSize: '0.82rem' }}>0.5%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Network Fee</span>
                  <span className="stat-value" style={{ fontSize: '0.82rem' }}>~0.002 ETH</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Route</span>
                  <span className="stat-value" style={{ fontSize: '0.82rem' }}>{fromToken} &rarr; {fromToken !== 'ROAD' && toToken !== 'ROAD' ? 'ROAD &rarr; ' : ''}{toToken}</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-full"
              style={{ marginTop: 'var(--space-md)' }}
              onClick={executeSwap}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            >
              {fromAmount ? `Swap ${fromAmount} ${fromToken}` : 'Enter an amount'}
            </button>

            {swapResult && (
              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'rgba(0, 230, 118, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.85rem' }}>Swap Complete</span>
                  <span className="badge badge-green">{swapResult.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-300)' }}>{swapResult.from} &rarr; {swapResult.to}</div>
                <div className="hash mono" style={{ fontSize: '0.72rem', marginTop: 4 }}>{swapResult.hash}</div>
              </div>
            )}
          </div>

          {/* Price info cards */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>ROAD/USD</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>$0.25</div>
              <div className="card-change positive" style={{ marginTop: 4 }}>+12.8%</div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>24h Volume</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>$48.2M</div>
              <div className="card-change positive" style={{ marginTop: 4 }}>+8.3%</div>
            </div>
          </div>
        </div>

        {/* Recent swaps */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Swaps</span>
            <span className="badge badge-blue">Live</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {recentSwaps.map((s, i) => (
              <div key={i} style={{ padding: 'var(--space-xs)', background: 'var(--gray-800)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.from} &rarr; {s.to}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{s.time}</span>
                </div>
                <div className="hash mono" style={{ fontSize: '0.7rem' }}>{s.hash}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB: LOTTERY
// =============================================================================

function LotteryTab() {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [lotteryHistory] = useState(generateLotteryHistory);
  const TOTAL_TICKETS = 50;
  const TICKET_PRICE = 0.005; // BTC
  const soldTickets = useMemo(() => {
    const sold = new Set();
    while (sold.size < 18) sold.add(Math.floor(Math.random() * TOTAL_TICKETS) + 1);
    return sold;
  }, []);

  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 47, s: 12 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTicket = (n) => {
    if (soldTickets.has(n)) return;
    setSelectedTickets((prev) =>
      prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n]
    );
  };

  const prizePool = ((soldTickets.size + selectedTickets.length) * TICKET_PRICE).toFixed(3);
  const currentRound = 48;

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">RoadLottery</h2>
        <p className="section-subtitle">The Bitcoin lottery powered by verifiable on-chain randomness</p>
      </div>

      {/* Hero */}
      <div className="lottery-hero">
        <div className="lottery-pool-label">Current Prize Pool</div>
        <div className="lottery-pool">{prizePool} BTC</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--gray-400)', marginTop: 4 }}>
          ~{formatUSD(parseFloat(prizePool) * 97100)}
        </div>
        <div className="lottery-timer">
          Draw in: {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 8 }}>
          Round #{currentRound} &middot; {soldTickets.size + selectedTickets.length}/{TOTAL_TICKETS} tickets sold &middot; {TICKET_PRICE} BTC per ticket
        </div>
      </div>

      <div className="grid-sidebar">
        <div className="gap-md">
          {/* Ticket grid */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Select Your Tickets</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                {selectedTickets.length} selected ({(selectedTickets.length * TICKET_PRICE).toFixed(3)} BTC)
              </span>
            </div>
            <div className="ticket-grid">
              {Array.from({ length: TOTAL_TICKETS }, (_, i) => {
                const n = i + 1;
                const isSold = soldTickets.has(n);
                const isSelected = selectedTickets.includes(n);
                return (
                  <div
                    key={n}
                    className={`ticket ${isSold ? 'ticket-sold' : isSelected ? 'ticket-selected' : 'ticket-available'}`}
                    onClick={() => toggleTicket(n)}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
            {selectedTickets.length > 0 && (
              <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  Buy {selectedTickets.length} Ticket{selectedTickets.length > 1 ? 's' : ''} ({(selectedTickets.length * TICKET_PRICE).toFixed(3)} BTC)
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedTickets([])}>Clear</button>
              </div>
            )}
          </div>

          {/* Past draws */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Past Draws</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Winner</th>
                    <th>Prize</th>
                    <th>Tickets</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {lotteryHistory.map((draw) => (
                    <tr key={draw.round}>
                      <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{draw.round}</td>
                      <td><span className="mono truncate hash" style={{ maxWidth: 140 }}>{draw.winner}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>{draw.prize} BTC</td>
                      <td>{draw.tickets.toLocaleString()}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{draw.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="gap-md">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>How It Works</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {[
                { step: '1', title: 'Buy Tickets', desc: 'Select numbered tickets at 0.005 BTC each' },
                { step: '2', title: 'Wait for Draw', desc: 'Draws happen every 7 days at UTC midnight' },
                { step: '3', title: 'Win Big', desc: 'Winner takes 90% of the prize pool' },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                  }}>{item.step}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>Prize Distribution</div>
            {[
              { label: 'Winner', pct: 90, color: 'var(--green)' },
              { label: 'ROAD Stakers', pct: 5, color: 'var(--hot-pink)' },
              { label: 'Development', pct: 3, color: 'var(--electric-blue)' },
              { label: 'Burn', pct: 2, color: 'var(--amber)' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 'var(--space-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--gray-300)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700 }}>{item.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>Lottery Stats</div>
            <div className="stat-row"><span className="stat-label">Total Rounds</span><span className="stat-value">48</span></div>
            <div className="stat-row"><span className="stat-label">Total Distributed</span><span className="stat-value">487.3 BTC</span></div>
            <div className="stat-row"><span className="stat-label">Unique Winners</span><span className="stat-value">41</span></div>
            <div className="stat-row"><span className="stat-label">Avg. Prize</span><span className="stat-value">10.15 BTC</span></div>
            <div className="stat-row"><span className="stat-label">Largest Prize</span><span className="stat-value" style={{ color: 'var(--amber)' }}>42.8 BTC</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB: NETWORK
// =============================================================================

function NetworkTab() {
  const [priceHistory] = useState(() => ({
    BTC: generatePriceHistory(30, 97000, 0.015),
    ETH: generatePriceHistory(30, 3300, 0.02),
    ROAD: generatePriceHistory(30, 0.25, 0.04),
  }));
  const [hashrateHistory] = useState(() => generateHashrateHistory(30));

  const networkStats = {
    nodes: 14827,
    activeValidators: 3892,
    totalStaked: '8.2B ROAD',
    avgBlockTime: '12.4s',
    tps: 2847,
    peakTps: 8500,
    difficulty: '83.7T',
    nextDiffAdj: '-2.1%',
    hashrate: '612.4 EH/s',
    mempool: 4283,
    mempoolSize: '42.8 MB',
    avgFee: '0.00012 BTC',
    medianFee: '0.00008 BTC',
    supply: '19,842,531 BTC',
    roadSupply: '10B ROAD',
    roadCirculating: '4.2B ROAD',
    roadBurned: '182M ROAD',
  };

  return (
    <div className="fade-in gap-md">
      <div>
        <h2 className="section-title">Network Stats & Charts</h2>
        <p className="section-subtitle">Real-time network metrics, price charts, and global statistics</p>
      </div>

      {/* Price charts */}
      <div className="grid-3">
        {[
          { token: 'BTC', price: 97128.42, change: 3.42, color: '#F7931A', data: priceHistory.BTC },
          { token: 'ETH', price: 3301.18, change: -1.18, color: '#627EEA', data: priceHistory.ETH },
          { token: 'ROAD', price: 0.25, change: 12.8, color: 'var(--hot-pink)', data: priceHistory.ROAD },
        ].map((item) => (
          <div key={item.token} className="card">
            <div className="card-header">
              <span className="card-title">{item.token}/USD</span>
              <span className={`card-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
            </div>
            <div className="card-value" style={{ fontSize: '1.4rem' }}>
              {item.token === 'ROAD' ? '$' + item.price.toFixed(4) : formatUSD(item.price)}
            </div>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <Sparkline
                data={item.data.map((d) => d.price)}
                color={item.change >= 0 ? 'var(--green)' : 'var(--red)'}
                height={60}
                large
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              <span>30d Low: {item.token === 'ROAD' ? '$' + Math.min(...item.data.map((d) => d.price)).toFixed(4) : formatUSD(Math.min(...item.data.map((d) => d.price)))}</span>
              <span>30d High: {item.token === 'ROAD' ? '$' + Math.max(...item.data.map((d) => d.price)).toFixed(4) : formatUSD(Math.max(...item.data.map((d) => d.price)))}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Network hashrate */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Network Hashrate (30d)</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{networkStats.hashrate}</span>
        </div>
        <Sparkline data={hashrateHistory} color="var(--electric-blue)" height={80} large />
      </div>

      {/* Stats grid */}
      <div className="grid-3">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>Network Overview</div>
          <div className="stat-row"><span className="stat-label">Active Nodes</span><span className="stat-value">{networkStats.nodes.toLocaleString()}</span></div>
          <div className="stat-row"><span className="stat-label">Active Validators</span><span className="stat-value">{networkStats.activeValidators.toLocaleString()}</span></div>
          <div className="stat-row"><span className="stat-label">Total Staked</span><span className="stat-value">{networkStats.totalStaked}</span></div>
          <div className="stat-row"><span className="stat-label">Avg Block Time</span><span className="stat-value">{networkStats.avgBlockTime}</span></div>
          <div className="stat-row"><span className="stat-label">Current TPS</span><span className="stat-value">{networkStats.tps.toLocaleString()}</span></div>
          <div className="stat-row"><span className="stat-label">Peak TPS</span><span className="stat-value">{networkStats.peakTps.toLocaleString()}</span></div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>Mining</div>
          <div className="stat-row"><span className="stat-label">Network Hashrate</span><span className="stat-value">{networkStats.hashrate}</span></div>
          <div className="stat-row"><span className="stat-label">Difficulty</span><span className="stat-value">{networkStats.difficulty}</span></div>
          <div className="stat-row"><span className="stat-label">Next Adjustment</span><span className="stat-value" style={{ color: 'var(--green)' }}>{networkStats.nextDiffAdj}</span></div>
          <div className="stat-row"><span className="stat-label">Mempool Txs</span><span className="stat-value">{networkStats.mempool.toLocaleString()}</span></div>
          <div className="stat-row"><span className="stat-label">Mempool Size</span><span className="stat-value">{networkStats.mempoolSize}</span></div>
          <div className="stat-row"><span className="stat-label">Avg Fee</span><span className="stat-value">{networkStats.avgFee}</span></div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>ROAD Token</div>
          <div className="stat-row"><span className="stat-label">Total Supply</span><span className="stat-value">{networkStats.roadSupply}</span></div>
          <div className="stat-row"><span className="stat-label">Circulating</span><span className="stat-value">{networkStats.roadCirculating}</span></div>
          <div className="stat-row"><span className="stat-label">Burned</span><span className="stat-value" style={{ color: 'var(--hot-pink)' }}>{networkStats.roadBurned}</span></div>
          <div className="stat-row"><span className="stat-label">Market Cap</span><span className="stat-value">{formatUSD(4.2e9 * 0.25)}</span></div>
          <div className="stat-row"><span className="stat-label">FDV</span><span className="stat-value">{formatUSD(10e9 * 0.25)}</span></div>
          <div className="stat-row"><span className="stat-label">BTC Supply</span><span className="stat-value">{networkStats.supply}</span></div>
        </div>
      </div>

      {/* Volume chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">24h Trading Volume (BTC)</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatNum(48.2e9)}</span>
        </div>
        <Sparkline
          data={priceHistory.BTC.map((d) => d.volume)}
          color="var(--violet)"
          height={60}
          large
        />
      </div>

      {/* Node distribution */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Node Distribution</span>
        </div>
        <div className="grid-4" style={{ marginTop: 'var(--space-sm)' }}>
          {[
            { region: 'North America', nodes: 4821, pct: 32.5, color: 'var(--electric-blue)' },
            { region: 'Europe', nodes: 5193, pct: 35.0, color: 'var(--violet)' },
            { region: 'Asia Pacific', nodes: 3412, pct: 23.0, color: 'var(--hot-pink)' },
            { region: 'Other', nodes: 1401, pct: 9.5, color: 'var(--amber)' },
          ].map((r) => (
            <div key={r.region} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: r.color }}>{r.pct}%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--gray-300)', fontWeight: 600 }}>{r.region}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{r.nodes.toLocaleString()} nodes</div>
              <div className="progress-bar" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================

const TABS = [
  { id: 'explorer', label: 'Explorer', icon: '\u26D3' },
  { id: 'wallet', label: 'Wallet', icon: '\uD83D\uDCB0' },
  { id: 'mining', label: 'Mining & Staking', icon: '\u26CF' },
  { id: 'swap', label: 'Swap', icon: '\u21C4' },
  { id: 'lottery', label: 'RoadLottery', icon: '\uD83C\uDFB0' },
  { id: 'network', label: 'Network', icon: '\uD83C\uDF10' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [blockHeight, setBlockHeight] = useState(884231);

  // Simulate block height incrementing
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((h) => h + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'explorer': return <ExplorerTab />;
      case 'wallet': return <WalletTab />;
      case 'mining': return <MiningTab />;
      case 'swap': return <SwapTab />;
      case 'lottery': return <LotteryTab />;
      case 'network': return <NetworkTab />;
      default: return <ExplorerTab />;
    }
  }, [activeTab]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">{'\u26D3'}</span>
          <span className="logo">RoadChain</span>
          <span className="network-badge">Mainnet</span>
        </div>
        <div className="header-right">
          <span className="header-price">ROAD: <strong>$0.25</strong></span>
          <span className="header-price">BTC: <strong>$97,128</strong></span>
          <span className="block-height">#{blockHeight.toLocaleString()}</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="main">
        {renderTab()}
      </main>

      {/* Footer */}
      <footer className="footer">
        RoadChain v1.0.0 &middot; BlackRoad OS, Inc. &middot; All Rights Reserved &middot; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
