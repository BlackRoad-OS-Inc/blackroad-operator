'use client';

import { useMemo } from 'react';
import { useMinerEvents } from '@/features/use-miner-events';
import type { MinerSample } from '@/features/miners-api';
import { Skeleton } from './Skeleton';

function formatHashrate(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return '–';
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} MH/s`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} kH/s`;
  }
  return `${value.toFixed(0)} H/s`;
}

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return '–';
  }
  return value.toLocaleString();
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return '–';
  }
  return `${(value * 100).toFixed(1)}%`;
}

interface SparklineProps {
  series: number[];
  color: string;
  ariaLabel: string;
}

function Sparkline({ series, color, ariaLabel }: SparklineProps) {
  const width = 120;
  const height = 36;
  const values = series.length === 1 ? [...series, series[0]] : series;

  if (values.length === 0) {
    return <div className="h-10 w-full rounded-md bg-slate-800/70" aria-label={`${ariaLabel} (no data)`} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || (max !== 0 ? Math.abs(max) : 1);

  const points = values.map((value, index) => {
    const x = values.length <= 1 ? width : (index / (values.length - 1)) * width;
    const normalized = (value - min) / range;
    const y = height - normalized * height;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildSeries(samples: MinerSample[], selector: (sample: MinerSample) => number | null | undefined) {
  return samples
    .map((sample) => selector(sample))
    .filter((value): value is number => value != null && Number.isFinite(value));
}

export function MinersPanel() {
  const { data, isLoading, error } = useMinerEvents({ limit: 48 });

  const latest = data?.samples.at(-1);

  const { hashrateSeries, acceptedSeries, staleSeries } = useMemo(() => {
    const samples = data?.samples ?? [];
    return {
      hashrateSeries: buildSeries(samples, (sample) => sample.hashrate_1m ?? sample.hashrate_15m ?? null),
      acceptedSeries: buildSeries(samples, (sample) => sample.shares_accepted ?? null),
      staleSeries: buildSeries(samples, (sample) =>
        sample.stale_rate != null ? sample.stale_rate * 100 : null
      ),
    };
  }, [data]);

  if (isLoading) {
    return (
      <section className="card" aria-labelledby="miners-heading">
        <h2 id="miners-heading" className="text-xl font-semibold mb-3">
          Miners
        </h2>
        <Skeleton className="h-32" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="card" aria-labelledby="miners-heading">
        <h2 id="miners-heading" className="text-xl font-semibold mb-3">
          Miners
        </h2>
        <p className="text-sm text-rose-400">Failed to load miner telemetry.</p>
      </section>
    );
  }

  if (!data || data.samples.length === 0) {
    return (
      <section className="card" aria-labelledby="miners-heading">
        <h2 id="miners-heading" className="text-xl font-semibold mb-3">
          Miners
        </h2>
        <p className="text-sm text-slate-400">No miner.sample events recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="card" aria-labelledby="miners-heading">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="miners-heading" className="text-xl font-semibold">
            Miners
          </h2>
          <p className="text-sm text-slate-300">Live hashrate and shares from miner.sample events.</p>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-500">updates ~15s</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Hashrate (1m)</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatHashrate(latest?.hashrate_1m)}</div>
          <div className="mt-3 h-16">
            <Sparkline series={hashrateSeries} color="#38bdf8" ariaLabel="Hashrate trend" />
          </div>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Accepted shares</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatNumber(latest?.shares_accepted)}
          </div>
          <div className="mt-3 h-16">
            <Sparkline series={acceptedSeries} color="#34d399" ariaLabel="Accepted shares trend" />
          </div>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Stale rate</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatPercent(latest?.stale_rate)}</div>
          <div className="mt-3 h-16">
            <Sparkline series={staleSeries} color="#f472b6" ariaLabel="Stale rate trend" />
          </div>
        </article>
      </div>
    </section>
  );
}
