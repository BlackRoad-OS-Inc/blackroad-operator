"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  projectName: string;
  projectUrl: string;
  deployUrl: string;
  refreshIntervalMs?: number;
};

export function CsrPulse({
  projectName,
  projectUrl,
  deployUrl,
  refreshIntervalMs = 5000,
}: Props) {
  const [timestamp, setTimestamp] = useState(() => new Date());
  const [pulses, setPulses] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
      setPulses((value) => value + 1);
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [refreshIntervalMs]);

  const formatted = timestamp.toLocaleTimeString();

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-100 shadow-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Client pipeline</p>
        <h4 className="mt-2 text-xl font-semibold text-white">Hydration heartbeat</h4>
        <p className="mt-3 text-sm text-slate-300">
          Rendering confirmed in the browser. Last pulse at <span className="font-semibold text-white">{formatted}</span>.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
          <span className="text-sm font-medium text-slate-300">Pulse count</span>
          <span className="text-lg font-semibold text-emerald-400">{pulses}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vercel project</p>
            <p className="mt-2 text-base font-semibold text-white">{projectName}</p>
          </div>
          <Link href={projectUrl} className="block text-indigo-300 hover:text-indigo-200" target="_blank" rel="noreferrer">
            Open project dashboard →
          </Link>
          <Link href={deployUrl} className="block text-indigo-300 hover:text-indigo-200" target="_blank" rel="noreferrer">
            Trigger fresh deploy →
          </Link>
        </div>
      </div>
    </div>
  );
}
