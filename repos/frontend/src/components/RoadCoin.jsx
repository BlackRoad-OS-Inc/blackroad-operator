import React, { useEffect, useState } from 'react';
import { fetchRoadcoinWallet, mintRoadcoin } from '../api';

export default function RoadCoin({ onUpdate }) {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const simulationEnabled = (
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_ROADCOIN_SIMULATION === '1') ||
    (typeof process !== 'undefined' && process?.env?.REACT_APP_ROADCOIN_SIMULATION === '1')
  );

  async function load() {
    if (!simulationEnabled) {
      return;
    }
    const data = await fetchRoadcoinWallet();
    setWallet(data);
    onUpdate && onUpdate(data);
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationEnabled]);

  async function mint() {
    if (!simulationEnabled) {
      return;
    }
    const data = await mintRoadcoin();
    setWallet(data);
    onUpdate && onUpdate(data);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-2">RoadCoin Wallet (Simulation)</h2>
        <p className="text-sm text-slate-400">
          RoadCoin is simulation-only. No custody, ledgers, or live chain interactions occur unless the
          <code className="ml-1">ROADCOIN_SIMULATION</code> flag is explicitly enabled for testing.
        </p>
        <div className="text-3xl font-bold" style={{ color: 'var(--accent-1)' }}>{wallet.balance} RC</div>
        <button
          className="btn mt-4"
          onClick={mint}
          disabled={!simulationEnabled}
          title={simulationEnabled ? 'Mint simulated RoadCoin' : 'Enable simulation flag to mint test tokens'}
        >
          {simulationEnabled ? 'Mint Simulated RoadCoin' : 'Simulation Disabled'}
        </button>
      </div>
      <div className="p-4 rounded-xl border border-slate-800">
        <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
        <ul className="space-y-1">
          {wallet.transactions.map(tx => (
            <li key={tx.id} className="flex justify-between">
              <span>{new Date(tx.date).toLocaleString()}</span>
              <span style={{ color: tx.type === 'credit' || tx.type === 'mint' ? 'var(--accent-2)' : 'var(--accent-3)' }}>
                {tx.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
