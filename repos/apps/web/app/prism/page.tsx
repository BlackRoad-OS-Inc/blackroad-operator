import Tile from '@/components/Tile';
import { getFlags, isOn } from '@/lib/flags';

async function fetchSeries(path: string) {
import { Suspense } from 'react';

type SeriesPoint = { t: string; v: number };

type Timeseries = SeriesPoint[];

async function fetchSeries(path: string): Promise<Timeseries> {
type SeriesPoint = { t: string; v: number };

async function fetchSeries(path: string): Promise<SeriesPoint[]> {
  const base = process.env.NEXT_PUBLIC_API || 'https://api.blackroad.io';
  const res = await fetch(`${base}${path}`, {
    cache: 'no-store',
    headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' },
  });
  if (!res.ok) return [];
  return (await res.json()) as SeriesPoint[];
}

function buildDemoSeries(): SeriesPoint[] {
  const now = Date.now();
  return Array.from({ length: 7 }, (_, idx) => ({
    t: new Date(now - (6 - idx) * 24 * 60 * 60 * 1000).toISOString(),
    v: 20 + idx * 3,
  }));
}

export default async function PrismDashboard() {
  // “from=-P7D” is ISO-8601 relative (handle this in your API or swap to explicit dates)
  const [events, errors, ghOpened, ghClosed, ghBugs] = await Promise.all([
    fetchSeries('/v1/metrics/events?from=-P7D'),
    fetchSeries('/v1/metrics/errors?from=-P7D'),
    fetchSeries('/v1/metrics/github/issues_opened?from=-P7D'),
    fetchSeries('/v1/metrics/github/issues_closed?from=-P7D'),
    fetchSeries('/v1/metrics/github/open_bugs'),
  const [events, errors, linCreated, linCompleted, linBurndown] = await Promise.all([
    fetchSeries('/v1/metrics/events?from=-P7D'),
    fetchSeries('/v1/metrics/errors?from=-P7D'),
    fetchSeries('/v1/metrics/linear/issues_created?from=-P7D'),
    fetchSeries('/v1/metrics/linear/issues_completed?from=-P7D'),
    fetchSeries(`/v1/metrics/linear/burndown?team=ENG&cycleStart=${encodeURIComponent('2025-10-01')}&cycleEnd=${encodeURIComponent('2025-10-14')}`),
  const [events, errors, charges, activeSubs, mrr] = await Promise.all([
    fetchSeries('/v1/metrics/events?from=-P7D'),
    fetchSeries('/v1/metrics/errors?from=-P7D'),
    fetchSeries('/v1/metrics/stripe/charges?from=-P7D'),
    fetchSeries('/v1/metrics/stripe/active_subs'),
    fetchSeries('/v1/metrics/stripe/mrr'),
  const flags = getFlags();

  const [githubOpened, linearCycleTime, stripeArr] = await Promise.all([
    isOn('prism.github.tiles')
      ? fetchSeries('/v1/github/issues/opened?from=-P7D')
      : Promise.resolve<SeriesPoint[]>([]),
    isOn('prism.linear.tiles')
      ? fetchSeries('/v1/linear/cycle-time?from=-P7D')
      : Promise.resolve<SeriesPoint[]>([]),
    isOn('prism.stripe.tiles')
      ? fetchSeries('/v1/stripe/arr?from=-P30D')
      : Promise.resolve<SeriesPoint[]>([]),
  ]);

  const hasTiles =
    isOn('prism.github.tiles') ||
    isOn('prism.linear.tiles') ||
    isOn('prism.stripe.tiles') ||
    flags.demo_mode;

  return (
    <main style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h1>PRISM</h1>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        <Tile title="Events (7d)" series={events} />
        <Tile title="Errors (7d)" series={errors} />
        <Tile title="GH Issues Opened (7d)" series={ghOpened} />
        <Tile title="GH Issues Closed (7d)" series={ghClosed} />
        <Tile title="Open Bugs (now)" series={ghBugs} />
        <Tile title="Linear Created (7d)" series={linCreated} />
        <Tile title="Linear Completed (7d)" series={linCompleted} />
        <Tile title="Linear Burndown (cycle)" series={linBurndown} />
        <Tile title="Stripe: New Charges (7d, $)" series={charges} rangeLabel="7d" />
        <Tile title="Stripe: Active Subs (now)" series={activeSubs} rangeLabel="now" />
        <Tile title="Stripe: MRR (now, $)" series={mrr} rangeLabel="now" />
      </div>

  if (!res.ok) {
    return [];
  }

  return res.json();
}

const Tile = ({ title, series }: { title: string; series: Timeseries }) => (
  <div
    style={{
      padding: 16,
      border: '1px solid #eee',
      borderRadius: 12,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <h3 style={{ margin: 0 }}>{title}</h3>
    <div
      style={{
        height: 120,
        display: 'grid',
        placeItems: 'center',
        fontSize: 12,
        color: '#555',
        background: '#fafafa',
        borderRadius: 8,
      }}
    >
      <span>{series.reduce((a, p) => a + (p?.v ?? 0), 0)} total (7d)</span>
    </div>
  </div>
);

async function Tiles() {
  const [events, errors] = await Promise.all([
    fetchSeries('/v1/metrics/events?from=-P7D'),
    fetchSeries('/v1/metrics/errors?from=-P7D'),
  ]);

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      }}
    >
      <Tile title="Events (7d)" series={events} />
      <Tile title="Errors (7d)" series={errors} />
    </div>
  );
}

export default function PrismDashboardPage() {
  return (
    <main
      style={{
        padding: 24,
        display: 'grid',
        gap: 24,
        background: '#f6f7fb',
        minHeight: '100vh',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0 }}>PRISM</h1>
        <p style={{ margin: 0, color: '#555' }}>
          Weekly health snapshot of events and errors across your connected sources.
        </p>
      </header>
      <Suspense fallback={<p>Loading…</p>}>
        {/* Render async data tiles */}
        <Tiles />
      </Suspense>
      {hasTiles ? (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {isOn('prism.github.tiles') && (
            <Tile title="GH Issues Opened (7d)" series={githubOpened} />
          )}
          {isOn('prism.linear.tiles') && (
            <Tile
              title="Linear Cycle Time (7d)"
              series={linearCycleTime}
            />
          )}
          {isOn('prism.stripe.tiles') && (
            <Tile
              title="Stripe ARR (30d)"
              series={stripeArr}
              rangeLabel="30d"
            />
          )}
          {flags.demo_mode && (
            <Tile
              title="Demo: Sample Series"
              series={buildDemoSeries()}
            />
          )}
        </div>
      ) : (
        <p style={{ color: '#666' }}>
          No PRISM tiles are currently enabled. Toggle a feature flag in{' '}
          <code>config/flags.json</code> to bring a tile online.
        </p>
      )}
    </main>
  );
}
