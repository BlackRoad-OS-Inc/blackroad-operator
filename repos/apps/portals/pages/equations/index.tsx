import { useCallback, useEffect, useMemo, useState } from 'react';

type ChartSeries = {
  x: number[];
  y: number[];
};

type Am2Params = {
  gamma: number;
  kappa: number;
  eta: number;
  omega0: number;
  a0: number;
  theta0: number;
  T: number;
};

type TransportParams = {
  mu: number;
  offset: number;
  leftDepth: number;
  rightDepth: number;
};

type EnergyParams = {
  temperature: number;
  bits: number;
  a: number;
  theta: number;
  da: number;
  dtheta: number;
  omega: number;
};

const defaultAm2: Am2Params = {
  gamma: 0.3,
  kappa: 0.7,
  eta: 0.5,
  omega0: 1.0,
  a0: 0.2,
  theta0: 0.0,
  T: 5.0,
};

const defaultTransport: TransportParams = {
  mu: 0.6,
  offset: 0.8,
  leftDepth: 1.0,
  rightDepth: 0.6,
};

const defaultEnergy: EnergyParams = {
  temperature: 300,
  bits: 8,
  a: 0.2,
  theta: 0.3,
  da: 0.01,
  dtheta: 0.02,
  omega: 1e-21,
};

function formatNumber(value: number, digits = 4): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function toQuery(params: Record<string, number>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    search.set(key, value.toString());
  });
  return search.toString();
}

function buildTransportPayload(params: TransportParams) {
  const points = 96;
  const x: number[] = [];
  const A: number[] = [];
  const rho: number[] = [];
  for (let i = 0; i < points; i += 1) {
    const xi = -2 + (4 * i) / (points - 1);
    const leftWell = Math.exp(-Math.pow(xi + params.offset, 2));
    const rightWell = Math.exp(-Math.pow(xi - params.offset, 2));
    const envelope = Math.exp(-0.2 * xi * xi);
    x.push(xi);
    A.push(envelope * (leftWell + rightWell));
    rho.push(params.leftDepth * leftWell - params.rightDepth * rightWell);
  }
  return {
    x,
    A,
    rho,
    mu: params.mu,
    dt: 1e-3,
    steps: 60,
  };
}

function downloadSession(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `equations-lab-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function LineChart({ series, height = 200, color = '#2563eb' }: { series: ChartSeries; height?: number; color?: string }) {
  const { x, y } = series;
  if (!x.length || !y.length) {
    return <div className="h-48 rounded border border-dashed border-gray-400" />;
  }
  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const points = x.map((value, index) => {
    const px = ((value - minX) / rangeX) * 100;
    const py = 100 - ((y[index] - minY) / rangeY) * 100;
    return `${px},${py}`;
  });
  const viewBox = '0 0 100 100';
  return (
    <svg viewBox={viewBox} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points.join(' ')} />
      <line x1="0" x2="100" y1="100" y2="100" stroke="#d4d4d8" strokeWidth={0.5} />
    </svg>
  );
}

export default function EquationsLabPage() {
  const [am2Params, setAm2Params] = useState<Am2Params>(defaultAm2);
  const [am2Data, setAm2Data] = useState<{ a: ChartSeries; theta: ChartSeries; landauer?: any } | null>(null);
  const [transportParams, setTransportParams] = useState<TransportParams>(defaultTransport);
  const [transportData, setTransportData] = useState<{ x: number[]; A: number[]; mass_error: number } | null>(null);
  const [energyParams, setEnergyParams] = useState<EnergyParams>(defaultEnergy);
  const [energyData, setEnergyData] = useState<{ dE: number; E_min?: number; pass?: boolean } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const updateAm2 = useCallback(async (params: Am2Params) => {
    const query = toQuery({
      T: params.T,
      dt: 0.01,
      a0: params.a0,
      theta0: params.theta0,
      gamma: params.gamma,
      kappa: params.kappa,
      eta: params.eta,
      omega0: params.omega0,
    });
    const response = await fetch(`/api/ambr/sim/am2?${query}`);
    if (!response.ok) {
      throw new Error('AM-2 simulation failed');
    }
    const payload = await response.json();
    setAm2Data({
      a: { x: payload.t, y: payload.a },
      theta: { x: payload.t, y: payload.theta },
      landauer: payload.landauer,
    });
    setStatusMessage('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateAm2(am2Params).catch((error) => setStatusMessage(error.message));
    }, 200);
    return () => clearTimeout(timer);
  }, [am2Params, updateAm2]);

  useEffect(() => {
    const payload = buildTransportPayload(transportParams);
    fetch('/api/ambr/sim/transport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Transport simulation failed');
        }
        return res.json();
      })
      .then((data) => {
        setTransportData({ x: data.x, A: data.A, mass_error: data.mass_error });
        setStatusMessage('');
      })
      .catch((error) => setStatusMessage(error.message));
  }, [transportParams]);

  useEffect(() => {
    const payload = {
      T: energyParams.temperature,
      a: energyParams.a,
      theta: energyParams.theta,
      da: energyParams.da,
      dtheta: energyParams.dtheta,
      Omega: energyParams.omega,
      n_bits: energyParams.bits,
      temperature: energyParams.temperature,
    };
    fetch('/api/ambr/energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Energy ledger call failed');
        }
        return res.json();
      })
      .then((data) => {
        setEnergyData({ dE: data.dE, E_min: data.E_min, pass: data.pass });
        setStatusMessage('');
      })
      .catch((error) => setStatusMessage(error.message));
  }, [energyParams]);

  const session = useMemo(() => ({
    am2: { params: am2Params, data: am2Data },
    transport: { params: transportParams, data: transportData },
    energy: { params: energyParams, data: energyData },
  }), [am2Params, am2Data, transportParams, transportData, energyParams, energyData]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Equations Lab</h1>
        <p className="text-sm text-gray-600">
          Experiment with the Amundson–BlackRoad kernels directly from the browser. Adjust the parameters and observe
          how the invariants react in real time.
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{statusMessage || 'Ready for exploration.'}</span>
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
            onClick={() => downloadSession(session)}
          >
            Download session JSON
          </button>
        </div>
      </header>

      <section className="grid gap-6 rounded border border-gray-200 p-4 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">AM-2 Spiral</h2>
          <p className="text-sm text-gray-600">Tune the spiral coefficients and track the amplitude and angular dynamics.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {(['gamma', 'kappa', 'eta', 'omega0', 'a0', 'theta0', 'T'] as Array<keyof Am2Params>).map((key) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                <span className="flex justify-between">
                  <span>{key}</span>
                  <span className="font-mono">{formatNumber(am2Params[key] as number)}</span>
                </span>
                <input
                  type="range"
                  min={key === 'T' ? 1 : key === 'theta0' ? -Math.PI : 0}
                  max={key === 'T' ? 10 : key === 'theta0' ? Math.PI : 1.5}
                  step={key === 'theta0' ? 0.1 : 0.05}
                  value={am2Params[key] as number}
                  onChange={(event) =>
                    setAm2Params((prev) => ({
                      ...prev,
                      [key]: parseFloat(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <figure>
              <figcaption className="mb-2 text-xs uppercase tracking-wide text-gray-500">a(t)</figcaption>
              {am2Data ? <LineChart series={am2Data.a} color="#0ea5e9" /> : <div className="h-48 border border-dashed" />}
            </figure>
            <figure>
              <figcaption className="mb-2 text-xs uppercase tracking-wide text-gray-500">θ(t)</figcaption>
              {am2Data ? <LineChart series={am2Data.theta} color="#ec4899" /> : <div className="h-48 border border-dashed" />}
            </figure>
          </div>
          {am2Data?.landauer && (
            <p className="text-xs text-gray-500">
              Landauer ΔE<sub>min</sub>: {formatNumber(am2Data.landauer.delta_e_min, 6)} J
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 rounded border border-gray-200 p-4 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">BR-1/2 Transport</h2>
          <p className="text-sm text-gray-600">Shape the trust wells and observe the transport field response.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>μ</span>
                <span className="font-mono">{formatNumber(transportParams.mu)}</span>
              </span>
              <input
                type="range"
                min={0.1}
                max={1.2}
                step={0.05}
                value={transportParams.mu}
                onChange={(event) => setTransportParams((prev) => ({ ...prev, mu: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>Offset</span>
                <span className="font-mono">{formatNumber(transportParams.offset)}</span>
              </span>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.05}
                value={transportParams.offset}
                onChange={(event) => setTransportParams((prev) => ({ ...prev, offset: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>Left depth</span>
                <span className="font-mono">{formatNumber(transportParams.leftDepth)}</span>
              </span>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.05}
                value={transportParams.leftDepth}
                onChange={(event) => setTransportParams((prev) => ({ ...prev, leftDepth: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>Right depth</span>
                <span className="font-mono">{formatNumber(transportParams.rightDepth)}</span>
              </span>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.05}
                value={transportParams.rightDepth}
                onChange={(event) => setTransportParams((prev) => ({ ...prev, rightDepth: parseFloat(event.target.value) }))}
              />
            </label>
          </div>
          <figure>
            <figcaption className="mb-2 text-xs uppercase tracking-wide text-gray-500">A(x)</figcaption>
            {transportData ? (
              <LineChart series={{ x: transportData.x, y: transportData.A }} color="#16a34a" />
            ) : (
              <div className="h-48 border border-dashed" />
            )}
          </figure>
          {transportData && (
            <p className="text-xs text-gray-500">
              Mass error: {formatNumber(transportData.mass_error, 6)} (goal ≤ 1e-3)
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 rounded border border-gray-200 p-4 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">Energy Ledger</h2>
          <p className="text-sm text-gray-600">Check the AM-4 energy increment against the Landauer floor.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>Temperature (K)</span><span className="font-mono">{formatNumber(energyParams.temperature)}</span></span>
              <input
                type="range"
                min={250}
                max={360}
                step={1}
                value={energyParams.temperature}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, temperature: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>Bits</span><span className="font-mono">{formatNumber(energyParams.bits)}</span></span>
              <input
                type="range"
                min={1}
                max={64}
                step={1}
                value={energyParams.bits}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, bits: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>a</span><span className="font-mono">{formatNumber(energyParams.a)}</span></span>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.01}
                value={energyParams.a}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, a: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>θ</span><span className="font-mono">{formatNumber(energyParams.theta)}</span></span>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.02}
                value={energyParams.theta}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, theta: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>Δa</span><span className="font-mono">{formatNumber(energyParams.da, 5)}</span></span>
              <input
                type="range"
                min={0.001}
                max={0.05}
                step={0.001}
                value={energyParams.da}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, da: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>Δθ</span><span className="font-mono">{formatNumber(energyParams.dtheta, 5)}</span></span>
              <input
                type="range"
                min={0.001}
                max={0.05}
                step={0.001}
                value={energyParams.dtheta}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, dtheta: parseFloat(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between"><span>Ω</span><span className="font-mono">{energyParams.omega.toExponential(2)}</span></span>
              <input
                type="range"
                min={1e-22}
                max={5e-21}
                step={1e-22}
                value={energyParams.omega}
                onChange={(event) => setEnergyParams((prev) => ({ ...prev, omega: parseFloat(event.target.value) }))}
              />
            </label>
          </div>
          {energyData && (
            <p className="text-sm text-gray-600">
              ΔE = {formatNumber(energyData.dE, 6)} J, E<sub>min</sub> = {energyData.E_min ? formatNumber(energyData.E_min, 6) : '—'} J →
              {energyData.pass === false ? ' violation' : ' ok'}
            </p>
          )}
        </div>
      </section>
    </div>
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Am2Response {
  t: number[];
  a: number[];
  theta: number[];
  amp: number[];
  units: Record<string, string>;
  thermo?: Record<string, unknown>;
}

interface TransportResponse {
  x: number[];
  A: number[];
  flux: number[];
  mass: number;
  mass_initial: number;
  mass_error: number;
  mass_relative_error: number;
  units: Record<string, string>;
  invariants: Record<string, { tolerance: number; relative_error: number; pass: boolean }>;
  thermo?: Record<string, unknown>;
}

interface TruthTableResponse {
  expression: string;
  variables: string[];
  rows: Record<string, boolean>[];
}

interface PrimesResponse {
  limit: number;
  count: number;
  primes: number[];
}

const fetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

const fetchText = async (url: string, init?: RequestInit): Promise<string> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return await res.text();
};

const pretty = (value: unknown): string => JSON.stringify(value, null, 2);

const buildTransportPayload = () => {
  const points = 64;
  const xs = Array.from({ length: points }, (_, i) => -1 + (2 * i) / (points - 1));
  const A = xs.map((x) => Math.exp(-x * x));
  const rho = xs.map((x) => 1 - 0.2 * x * x);
  return {
    x: xs,
    A,
    rho,
    dt: 1e-3,
    steps: 50,
    bits: 8,
    temperature: 300,
  };
};

export default function EquationsPage() {
  const [am2, setAm2] = useState<Am2Response | null>(null);
  const [am2Svg, setAm2Svg] = useState<string>('');
  const [transport, setTransport] = useState<TransportResponse | null>(null);
  const [transportPgm, setTransportPgm] = useState<string>('');
  const [mandelbrot, setMandelbrot] = useState<string>('');
  const [waveSvg, setWaveSvg] = useState<string>('');
  const [primes, setPrimes] = useState<PrimesResponse | null>(null);
  const [truthTable, setTruthTable] = useState<TruthTableResponse | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const am2Data = await fetchJson<Am2Response>('/api/ambr/sim/am2?bits=8&temperature=300');
        setAm2(am2Data);
        const am2Plot = await fetchText('/api/ambr/plot/am2.svg?bits=8&temperature=300');
        setAm2Svg(am2Plot);

        const transportPayload = buildTransportPayload();
        const transportData = await fetchJson<TransportResponse>('/api/ambr/sim/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transportPayload),
        });
        setTransport(transportData);
        const pgm = await fetchText('/api/ambr/field/a.pgm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: transportData.A }),
        });
        setTransportPgm(pgm);

        const mandelbrotText = await fetchText('/api/math/fractals/mandelbrot.pgm?width=64&height=64&iter=64');
        setMandelbrot(mandelbrotText);

        const wave = await fetchText('/api/math/waves/sine.svg?samples=128&freq=1.5');
        setWaveSvg(wave);

        const primesData = await fetchJson<PrimesResponse>('/api/math/primes.json?limit=200');
        setPrimes(primesData);

        const tt = await fetchJson<TruthTableResponse>('/api/math/logic/truth-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression: 'a and (b or not c)', variables: ['a', 'b', 'c'] }),
        });
        setTruthTable(tt);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    void load();
  }, []);

  const renderSvg = (svg: string) => (
    <div
      className="overflow-auto rounded border border-neutral-300 bg-white p-4 shadow-sm"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  return (
    <>
      <Head>
        <title>Equations Lab — Text-Only Rendering</title>
        <meta name="description" content="Amundson–BlackRoad + Infinity Math rendered with text artefacts only." />
      </Head>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
        <header>
          <h1 className="text-3xl font-semibold">Equations Lab</h1>
          <p className="mt-2 text-sm text-neutral-600">
            All artefacts on this page are delivered as JSON, SVG, or ASCII PGM to honour the text-only policy.
          </p>
          {error ? <p className="mt-2 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}
        </header>

        <section>
          <h2 className="text-2xl font-semibold">AM-2 Spiral</h2>
          {am2 ? (
            <>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-900 p-3 text-xs text-lime-100">
                {pretty({ units: am2.units, thermo: am2.thermo })}
              </pre>
              {am2Svg ? <div className="mt-4">{renderSvg(am2Svg)}</div> : null}
            </>
          ) : (
            <p className="text-sm text-neutral-500">Loading AM-2 data…</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Transport Invariants</h2>
          {transport ? (
            <>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-900 p-3 text-xs text-sky-100">
                {pretty({
                  invariants: transport.invariants,
                  mass: transport.mass,
                  mass_initial: transport.mass_initial,
                  mass_error: transport.mass_error,
                  thermo: transport.thermo,
                })}
              </pre>
              {transportPgm ? (
                <pre className="mt-4 max-h-64 overflow-auto rounded bg-neutral-100 p-3 text-[10px] leading-tight text-neutral-700">
                  {transportPgm}
                </pre>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-neutral-500">Loading transport simulation…</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Mandelbrot (PGM)</h2>
          {mandelbrot ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-100 p-3 text-[10px] leading-tight text-neutral-700">
              {mandelbrot}
            </pre>
          ) : (
            <p className="text-sm text-neutral-500">Loading fractal…</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Waveform (SVG)</h2>
          {waveSvg ? <div>{renderSvg(waveSvg)}</div> : <p className="text-sm text-neutral-500">Loading wave…</p>}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Prime Constellations</h2>
          {primes ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-900 p-3 text-xs text-amber-100">
              {pretty({ limit: primes.limit, count: primes.count, sample: primes.primes.slice(0, 32) })}
            </pre>
          ) : (
            <p className="text-sm text-neutral-500">Loading primes…</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Logic Truth Table</h2>
          {truthTable ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-900 p-3 text-xs text-fuchsia-100">
              {pretty(truthTable.rows.slice(0, 8))}
            </pre>
          ) : (
            <p className="text-sm text-neutral-500">Loading truth table…</p>
          )}
        </section>
      </main>
    </>
  );
}
