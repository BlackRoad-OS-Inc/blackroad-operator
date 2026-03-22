'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, Radio } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
}

interface StatusData {
  status: string;
  services: ServiceStatus[];
  timestamp: string;
}

const STATUS_ICON = {
  operational: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

const STATUS_COLOR = {
  operational: 'text-green-400',
  degraded: 'text-amber-400',
  down: 'text-red-400',
};

const STATUS_BG = {
  operational: 'bg-green-400/10 border-green-400/20',
  degraded: 'bg-amber-400/10 border-amber-400/20',
  down: 'bg-red-400/10 border-red-400/20',
};

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/status');
        const d = await res.json();
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <Radio className="h-4 w-4 animate-pulse text-[#FF1D6C]" />
      Checking services...
    </div>
  );

  const services = data?.services ?? [];
  const overall = data?.status ?? 'unknown';
  const overallLabel = overall === 'operational' ? 'All Systems Operational' :
    overall === 'partial_outage' ? 'Partial Outage' : 'Major Outage';

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">System Status</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time health of BlackRoad infrastructure</p>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl border p-5 ${
        overall === 'operational' ? STATUS_BG.operational :
        overall === 'partial_outage' ? STATUS_BG.degraded : STATUS_BG.down
      }`}>
        <div className="flex items-center gap-3">
          {overall === 'operational' ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : overall === 'partial_outage' ? (
            <AlertTriangle className="h-6 w-6 text-amber-400" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400" />
          )}
          <span className="text-lg font-semibold text-white">{overallLabel}</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'now'}
        </p>
      </div>

      {/* Individual services */}
      <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
        {services.map(svc => {
          const Icon = STATUS_ICON[svc.status] ?? Activity;
          const color = STATUS_COLOR[svc.status] ?? 'text-gray-400';

          return (
            <div key={svc.name} className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-sm text-white">{svc.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {svc.latency !== undefined && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {svc.latency}ms
                  </span>
                )}
                <span className={`text-xs capitalize ${color}`}>{svc.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 text-center pt-2">
        Auto-refreshes every 60s · Powered by edge health checks
      </div>
    </div>
  );
}
