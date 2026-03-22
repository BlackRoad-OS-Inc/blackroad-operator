import { useEffect, useState } from 'react';

type MinerTile = {
  id: string;
  label: string;
  value: string;
  helper?: string | null;
  intent?: 'good' | 'warning' | 'critical' | string | null;
};

type MinerTilesResponse = {
  miner_id: string;
  updated_at: string;
  tiles: MinerTile[];
};

type Props = {
  minerId?: string;
  refreshMs?: number;
};

const INTENT_COLORS: Record<string, string> = {
  good: '#16a34a',
  warning: '#facc15',
  critical: '#ef4444',
};

function borderColor(intent?: string | null): string {
  if (!intent) return 'var(--accent)';
  return INTENT_COLORS[intent] ?? 'var(--accent)';
}

export default function MinerTiles({ minerId = 'xmrig', refreshMs = 30000 }: Props) {
  const [state, setState] = useState<MinerTilesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/miners/tiles?miner_id=${encodeURIComponent(minerId)}`);
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const json: MinerTilesResponse = await response.json();
        if (!cancelled) {
          setState(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    load();
    const interval = window.setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [minerId, refreshMs]);

  if (error) {
    return (
      <div className="card p-4 border border-red-500 text-sm text-red-200">
        Miner telemetry unavailable: {error}
      </div>
    );
  }

  if (!state) {
    return (
      <div className="card p-4 text-sm text-slate-300" role="status">
        Loading miner telemetry…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400">Miner {state.miner_id} · updated {new Date(state.updated_at).toLocaleTimeString()}</div>
      <div className="grid grid-cols-2 gap-3">
        {state.tiles.map((tile) => (
          <div
            key={tile.id}
            className="card p-4 space-y-1 border"
            style={{ borderColor: borderColor(tile.intent), minHeight: '96px' }}
          >
            <div className="text-xs uppercase tracking-wide text-slate-400">{tile.label}</div>
            <div className="text-xl font-semibold text-white">{tile.value}</div>
            {tile.helper ? <div className="text-xs text-slate-400">{tile.helper}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
