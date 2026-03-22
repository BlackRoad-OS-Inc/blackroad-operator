'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  AMUNDSON_COMMIT_REFERENCE,
  acri,
  acriRadius,
  amundsonBudget,
  angleDistortion,
  logAreaDistortion,
  thetaFromRadius,
  vswrFromGammaMagnitude,
} from '@amundson/projections';
import {
  ORIGIN_BADGES,
  ProvenanceCard,
  checkLicenseStatus,
  createArtifactStamp,
  normalizeCard,
} from '@amundson/provenance';

const Z0 = 50;
const SPHERE_RADIUS = 1;
const CANVAS_SIZE = 320;
const THETA_LIMIT = Math.PI / 2 - 0.05;
const GEO_PHIS = [-Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2];
const VSWR_BANDS = [1.2, 1.5, 2, 3];

const provenanceCards: ProvenanceCard[] = [
  {
    id: 'CL-SPHERE-METRIC',
    title: 'Sphere metric',
    kind: 'axiom',
    statementRef: 'ds^2 = R^2(dθ^2 + sin^2θ dφ^2)',
    origin: 'public-domain',
    license: 'Public domain',
    sources: ['Std. differential geometry texts'],
    proofStatus: 'accepted',
    inputs: ['θ', 'φ', 'R'],
  },
  {
    id: 'CL-SMITH-MAP',
    title: 'Impedance↔Reflection',
    kind: 'formula',
    statementRef: 'Γ = (Z − Z0)/(Z + Z0), Z = Z0(1 + Γ)/(1 − Γ)',
    origin: 'public-domain',
    license: 'Public domain',
    sources: ['RF engineering canon'],
    proofStatus: 'accepted',
    inputs: ['Γ', 'Z', 'Z0'],
  },
  {
    id: 'AM-ACRI-0001',
    title: 'Amundson Conformal-Radial Interpolation (ACRI)',
    kind: 'definition',
    statementRef: 'r_γ(θ) = (2R tan(θ/2))^γ (R tan θ)^{1−γ}',
    origin: 'amundson-original',
    license: '© BlackRoad Inc., all rights reserved',
    authors: ['A. L. Amundson'],
    proofStatus: 'sketch',
    inputs: ['θ', 'φ', 'R', 'γ'],
    commit: AMUNDSON_COMMIT_REFERENCE,
    dependencies: ['CL-SPHERE-METRIC'],
  },
  {
    id: 'AM-DISTORTION-BUDGET',
    title: 'Amundson Distortion Budget',
    kind: 'metric',
    statementRef: 'AB(α) = α·(angle error) + (1−α)·(log-area error)',
    origin: 'amundson-original',
    license: '© BlackRoad Inc., all rights reserved',
    authors: ['A. L. Amundson'],
    proofStatus: 'sketch',
    inputs: ['α', 'angle error', 'log-area error'],
    commit: AMUNDSON_COMMIT_REFERENCE,
    dependencies: ['AM-ACRI-0001'],
  },
  {
    id: 'TP-CLS-UTILITY',
    title: 'clsx',
    kind: 'library',
    statementRef: 'Utility for constructing className strings',
    origin: 'third-party',
    license: 'MIT',
    url: 'https://github.com/lukeed/clsx',
    proofStatus: 'accepted',
  },
].map(normalizeCard);

type Complex = { re: number; im: number };

type Path = { d: string; label: string };

type ProjectionSketch = {
  smithPaths: Path[];
  spherePaths: Path[];
  vswrCircles: { radius: number; label: string }[];
  vswrLatitudes: { theta: number; label: string }[];
  smithScale: number;
  sphereScale: number;
};

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function smithToImpedance(gamma: Complex, z0: number): Complex {
  const numRe = 1 + gamma.re;
  const numIm = gamma.im;
  const denRe = 1 - gamma.re;
  const denIm = -gamma.im;
  const denom = denRe * denRe + denIm * denIm;
  if (denom === 0) {
    return { re: Number.POSITIVE_INFINITY, im: Number.POSITIVE_INFINITY };
  }
  const real = (numRe * denRe + numIm * denIm) / denom;
  const imag = (numIm * denRe - numRe * denIm) / denom;
  return { re: z0 * real, im: z0 * imag };
}

function magnitude(z: Complex) {
  return Math.hypot(z.re, z.im);
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '∞';
  }
  if (Math.abs(value) >= 1000) {
    return value.toFixed(0);
  }
  if (Math.abs(value) < 0.001) {
    return value.toExponential(2);
  }
  return value.toFixed(3);
}

function buildPaths(gamma: number): ProjectionSketch {
  const maxRadius = (() => {
    const limit = acriRadius(THETA_LIMIT, SPHERE_RADIUS, gamma);
    if (Number.isFinite(limit) && limit > 0) {
      return limit;
    }
    return 1;
  })();
  const smithScale = (CANVAS_SIZE / 2 - 16) / maxRadius;
  const smithPaths: Path[] = GEO_PHIS.map((phi) => {
    const points: string[] = [];
    const samples = 48;
    for (let i = 0; i < samples; i += 1) {
      const theta = (i / (samples - 1)) * THETA_LIMIT;
      const { x, y } = acri(theta, phi, SPHERE_RADIUS, gamma);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const sx = CANVAS_SIZE / 2 + x * smithScale;
      const sy = CANVAS_SIZE / 2 - y * smithScale;
      points.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`);
    }
    return {
      d: points.join(' '),
      label: `φ = ${(phi * 180) / Math.PI}°`,
    };
  }).filter((path) => path.d.length > 0);

  const sphereScale = (CANVAS_SIZE / 2 - 16) / SPHERE_RADIUS;
  const spherePaths: Path[] = GEO_PHIS.map((phi) => {
    const points: string[] = [];
    const samples = 48;
    for (let i = 0; i < samples; i += 1) {
      const theta = (i / (samples - 1)) * THETA_LIMIT;
      const x = SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi);
      const y = SPHERE_RADIUS * Math.cos(theta);
      const sx = CANVAS_SIZE / 2 + x * sphereScale;
      const sy = CANVAS_SIZE / 2 - y * sphereScale;
      points.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`);
    }
    return {
      d: points.join(' '),
      label: `Great circle φ = ${(phi * 180) / Math.PI}°`,
    };
  });

  const vswrCircles = VSWR_BANDS.map((band) => {
    const magnitude = (band - 1) / (band + 1);
    return { radius: magnitude * smithScale, label: `VSWR ${band.toFixed(1)}` };
  });

  const vswrLatitudes = VSWR_BANDS.map((band) => {
    const magnitude = (band - 1) / (band + 1);
    const theta = thetaFromRadius(magnitude, SPHERE_RADIUS, gamma);
    if (theta == null) {
      return null;
    }
    return { theta, label: `VSWR ${band.toFixed(1)}` };
  }).filter((entry): entry is { theta: number; label: string } => Boolean(entry));

  return { smithPaths, spherePaths, vswrCircles, vswrLatitudes, smithScale, sphereScale };
}

function toneClasses(tone: 'slate' | 'emerald' | 'amber' | 'indigo') {
  switch (tone) {
    case 'emerald':
      return 'bg-emerald-900/50 text-emerald-200 border-emerald-700';
    case 'amber':
      return 'bg-amber-900/60 text-amber-200 border-amber-700';
    case 'indigo':
      return 'bg-indigo-900/60 text-indigo-200 border-indigo-700';
    default:
      return 'bg-slate-900/60 text-slate-200 border-slate-700';
  }
}

export function BridgeTile() {
  const [gamma, setGamma] = useState(0.5);
  const [alpha, setAlpha] = useState(0.5);
  const [gammaMagnitude, setGammaMagnitude] = useState(0.45);
  const [gammaPhaseDeg, setGammaPhaseDeg] = useState(30);

  const gammaPhase = toRadians(gammaPhaseDeg);
  const gammaComplex: Complex = {
    re: gammaMagnitude * Math.cos(gammaPhase),
    im: gammaMagnitude * Math.sin(gammaPhase),
  };

  const theta = useMemo(() => {
    const candidate = thetaFromRadius(gammaMagnitude, SPHERE_RADIUS, gamma);
    if (candidate != null) {
      return candidate;
    }
    return Math.atan(gammaMagnitude / SPHERE_RADIUS);
  }, [gammaMagnitude, gamma]);

  const point = useMemo(() => acri(theta, gammaPhase, SPHERE_RADIUS, gamma), [theta, gammaPhase, gamma]);
  const impedance = useMemo(() => smithToImpedance(gammaComplex, Z0), [gammaComplex]);

  const angleError = useMemo(() => angleDistortion(theta, SPHERE_RADIUS, gamma), [theta, gamma]);
  const logAreaError = useMemo(() => logAreaDistortion(theta, SPHERE_RADIUS, gamma), [theta, gamma]);
  const budget = useMemo(() => amundsonBudget(alpha, angleError, logAreaError), [alpha, angleError, logAreaError]);

  const vswr = useMemo(() => vswrFromGammaMagnitude(gammaMagnitude), [gammaMagnitude]);

  const sketch = useMemo(() => buildPaths(gamma), [gamma]);

  const artifact = useMemo(
    () =>
      createArtifactStamp({
        inputs: {
          gamma,
          alpha,
          gammaMagnitude,
          gammaPhaseDeg,
        },
        formulaIds: provenanceCards.map((card) => card.id),
        codeSeed: `bridge-tile:${AMUNDSON_COMMIT_REFERENCE}`,
        dataSeed: 'amundson-bridge',
      }),
    [gamma, alpha, gammaMagnitude, gammaPhaseDeg]
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/20">
      <header className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Smith ↔ Sphere Bridge</h2>
          <p className="text-sm text-slate-400">
            Amundson ACRI dial couples Smith chart phasors with spherical geodesics while tracking distortion.
          </p>
        </div>
        <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow', toneClasses('amber'))}>
          {ORIGIN_BADGES['amundson-original'].label}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-200">
                ACRI γ
                <span className="font-mono text-slate-300">{gamma.toFixed(2)}</span>
              </label>
              <input
                aria-label="ACRI gamma"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={gamma}
                onChange={(event) => setGamma(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-200">
                Distortion weight α
                <span className="font-mono text-slate-300">{alpha.toFixed(2)}</span>
              </label>
              <input
                aria-label="Distortion weight"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={alpha}
                onChange={(event) => setAlpha(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-200">
                  |Γ|
                  <span className="font-mono text-slate-300">{gammaMagnitude.toFixed(2)}</span>
                </label>
                <input
                  aria-label="Gamma magnitude"
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={gammaMagnitude}
                  onChange={(event) => setGammaMagnitude(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-200">
                  ∠Γ (deg)
                  <span className="font-mono text-slate-300">{gammaPhaseDeg.toFixed(0)}</span>
                </label>
                <input
                  aria-label="Gamma phase"
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={gammaPhaseDeg}
                  onChange={(event) => setGammaPhaseDeg(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">Sphere coordinates</h3>
                <p className="font-mono text-base text-white">θ = {(theta * 180) / Math.PI < 0 ? '0' : ((theta * 180) / Math.PI).toFixed(2)}°</p>
                <p className="font-mono text-base text-white">φ = {gammaPhaseDeg.toFixed(2)}°</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">Plane</h3>
                <p className="font-mono text-base text-white">x = {formatNumber(point.x)}</p>
                <p className="font-mono text-base text-white">y = {formatNumber(point.y)}</p>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">Impedance Z</h3>
                <p className="font-mono text-base text-white">Re = {formatNumber(impedance.re)}</p>
                <p className="font-mono text-base text-white">Im = {formatNumber(impedance.im)}</p>
                <p className="font-mono text-sm text-slate-300">|Z| = {formatNumber(magnitude(impedance))}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">Distortion</h3>
                <p className="font-mono text-base text-white">∠ error = {formatNumber(angleError)}</p>
                <p className="font-mono text-base text-white">log-area error = {formatNumber(logAreaError)}</p>
                <p className="font-mono text-base text-brand-200">AB(α) = {formatNumber(budget)}</p>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">VSWR</h3>
                <p className="font-mono text-base text-white">{Number.isFinite(vswr) ? vswr.toFixed(3) : '∞'}</p>
                <p className="text-xs text-slate-400">(1 + |Γ|)/(1 − |Γ|)</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-400">ACRI radius</h3>
                <p className="font-mono text-base text-white">rγ = {formatNumber(point.r)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-sm font-semibold text-white">Bridge sketch</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <figure className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                <figcaption className="mb-2 text-xs uppercase tracking-wide text-slate-400">Smith chart plane</figcaption>
                <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} role="img" aria-label="Smith chart projection">
                  <circle
                    cx={CANVAS_SIZE / 2}
                    cy={CANVAS_SIZE / 2}
                    r={CANVAS_SIZE / 2 - 16}
                    className="fill-transparent stroke-slate-700"
                  />
                  {sketch.vswrCircles.map((circle) => (
                    <circle
                      key={circle.label}
                      cx={CANVAS_SIZE / 2}
                      cy={CANVAS_SIZE / 2}
                      r={circle.radius}
                      className="fill-transparent stroke-amber-500/60"
                    />
                  ))}
                  {sketch.smithPaths.map((path, index) => (
                    <path
                      key={path.label}
                      d={path.d}
                      className={clsx('fill-none opacity-80', index === 2 ? 'stroke-brand-300' : 'stroke-slate-500')}
                      strokeWidth={1.5}
                    />
                  ))}
                  <circle
                    cx={CANVAS_SIZE / 2 + point.x * sketch.smithScale}
                    cy={CANVAS_SIZE / 2 - point.y * sketch.smithScale}
                    r={4}
                    className="fill-brand-300"
                  />
                </svg>
              </figure>
              <figure className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                <figcaption className="mb-2 text-xs uppercase tracking-wide text-slate-400">Sphere lift</figcaption>
                <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} role="img" aria-label="Sphere projection">
                  <circle
                    cx={CANVAS_SIZE / 2}
                    cy={CANVAS_SIZE / 2}
                    r={CANVAS_SIZE / 2 - 16}
                    className="fill-slate-900/40 stroke-slate-700"
                  />
                  {sketch.vswrLatitudes.map((entry) => {
                    const points: string[] = [];
                    const samples = 72;
                    const radius = SPHERE_RADIUS * Math.sin(entry.theta);
                    const height = SPHERE_RADIUS * Math.cos(entry.theta);
                    const scale = (CANVAS_SIZE / 2 - 16) / SPHERE_RADIUS;
                    for (let i = 0; i < samples; i += 1) {
                      const phi = (i / (samples - 1)) * 2 * Math.PI;
                      const x = radius * Math.cos(phi);
                      const y = height;
                      const sx = CANVAS_SIZE / 2 + x * scale;
                      const sy = CANVAS_SIZE / 2 - y * scale;
                      points.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`);
                    }
                    return <path key={entry.label} d={points.join(' ')} className="fill-none stroke-amber-500/60" />;
                  })}
                  {sketch.spherePaths.map((path, index) => (
                    <path
                      key={path.label}
                      d={path.d}
                      className={clsx('fill-none opacity-80', index === 2 ? 'stroke-brand-300' : 'stroke-slate-500')}
                      strokeWidth={1.5}
                    />
                  ))}
                  <circle
                    cx={CANVAS_SIZE / 2 + SPHERE_RADIUS * Math.sin(theta) * Math.cos(gammaPhase) * sketch.sphereScale}
                    cy={CANVAS_SIZE / 2 - SPHERE_RADIUS * Math.cos(theta) * sketch.sphereScale}
                    r={4}
                    className="fill-brand-300"
                  />
                </svg>
              </figure>
            </div>
          </div>

          <div className="grid gap-3">
            {provenanceCards.map((card) => {
              const badge = ORIGIN_BADGES[card.origin];
              const licenseStatus = checkLicenseStatus(card.license);
              return (
                <article
                  key={card.id}
                  className={clsx(
                    'rounded-2xl border bg-slate-900/40 p-4 text-sm shadow-inner shadow-slate-950/30',
                    licenseStatus === 'allowed' ? 'border-slate-800' : 'border-amber-500 bg-amber-900/30'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-white">{card.title}</h3>
                    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide', toneClasses(badge.tone))}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-slate-200">{card.statementRef}</p>
                  <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">ID</dt>
                      <dd className="font-mono text-slate-200">{card.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">Kind</dt>
                      <dd className="text-slate-200">{card.kind}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">License</dt>
                      <dd className="text-slate-200">{card.license}</dd>
                    </div>
                    {card.commit && (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">Commit</dt>
                        <dd className="font-mono text-slate-200">{card.commit}</dd>
                      </div>
                    )}
                  </dl>
                  {(card.authors || card.sources) && (
                    <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                      {card.authors && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-400">Authors</dt>
                          <dd className="text-slate-200">{card.authors.join(', ')}</dd>
                        </div>
                      )}
                      {card.sources && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-400">Sources</dt>
                          <dd className="text-slate-200">{card.sources.join('; ')}</dd>
                        </div>
                      )}
                    </div>
                  )}
                  <pre className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-slate-950/70 p-3 text-xs text-slate-300">
                    {JSON.stringify(card, null, 2)}
                  </pre>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="font-semibold text-slate-200">Inputs</span>{' '}
            <code className="font-mono text-slate-100">
              γ={gamma.toFixed(2)}, α={alpha.toFixed(2)}, |Γ|={gammaMagnitude.toFixed(2)}, ∠Γ={gammaPhaseDeg.toFixed(0)}°
            </code>
          </div>
          <div>
            <span className="font-semibold text-slate-200">Formula IDs</span>{' '}
            <code className="font-mono text-slate-100">{artifact.formulaIds.join(', ')}</code>
          </div>
          <div>
            <span className="font-semibold text-slate-200">Code hash</span>{' '}
            <code className="font-mono text-slate-100">{artifact.codeHash}</code>
          </div>
          <div>
            <span className="font-semibold text-slate-200">Data hash</span>{' '}
            <code className="font-mono text-slate-100">{artifact.dataHash}</code>
          </div>
          <div>
            <span className="font-semibold text-slate-200">Timestamp</span>{' '}
            <time className="font-mono text-slate-100">{artifact.timestamp}</time>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default BridgeTile;
