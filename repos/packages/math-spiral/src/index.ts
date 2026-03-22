// Core complex helpers in TS using number pairs [re, im]
export type C = { re: number; im: number };
export const c = (re = 0, im = 0): C => ({ re, im });
export const add = (a: C, b: C): C => c(a.re + b.re, a.im + b.im);
export const sub = (a: C, b: C): C => c(a.re - b.re, a.im - b.im);
export const mul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const conj = (z: C): C => c(z.re, -z.im);
export const abs = (z: C): number => Math.hypot(z.re, z.im);
export const arg = (z: C): number => Math.atan2(z.im, z.re);
export const scale = (z: C, s: number): C => c(z.re * s, z.im * s);
export const fromPolar = (r: number, theta: number): C => c(r * Math.cos(theta), r * Math.sin(theta));
export const unit = (z: C): C => {
  const a = abs(z); return a === 0 ? c(1, 0) : scale(z, 1 / a);
};

// 1) Exponential transport U(θ,a) z = e^{(a+i)θ} z
export function transport(z: C, theta: number, a = 0): C {
  const r = Math.exp(a * theta);
  const rot = fromPolar(1, theta);
  return mul(scale(z, r), rot);
}

// 4) Spiral ODE discretization (Euler step)
// z_{t+1} = e^{(a+iω)Δt} z_t
export function spiralStep(z: C, dt: number, a: number, omega: number): C {
  const growth = Math.exp(a * dt);
  const rot = fromPolar(1, omega * dt);
  return mul(scale(z, growth), rot);
}

// 5) Log-spiral distance
export function dLog(z1: C, z2: C): number {
  const r1 = Math.log(Math.max(abs(z1), 1e-12));
  const r2 = Math.log(Math.max(abs(z2), 1e-12));
  let dphi = arg(z2) - arg(z1);
  while (dphi > Math.PI) dphi -= 2 * Math.PI;
  while (dphi < -Math.PI) dphi += 2 * Math.PI;
  return Math.hypot(r2 - r1, dphi);
}

// 6) Phase-aligned regression loss
export function phaseLoss(z: C, zh: C): number {
  const dot = z.re * zh.re + z.im * zh.im; // Re(z * conj(zh))
  const denom = abs(zh) ** 2 || 1e-12;
  const cosphi = Math.min(1, Math.max(-1, dot / Math.sqrt((abs(z) ** 2 || 1e-12) * denom)));
  const phi = Math.acos(cosphi);
  const rot = fromPolar(1, phi);
  const zhAligned = mul(zh, rot);
  const dx = z.re - zhAligned.re; const dy = z.im - zhAligned.im;
  return dx * dx + dy * dy;
}

// 7) Complex EMA with phase snapping
export function emaPhase(mPrev: C, z: C, beta: number): C {
  const mag = abs(mPrev);
  const u = unit(z);
  return add(scale(mPrev, beta), scale(scale(u, mag || abs(z)), 1 - beta));
}

// 9) Phase-difference operator for sequences
export function phaseDiff(xk: C, xk1: C): number {
  let d = arg(mul(xk, conj(xk1)));
  // keep in [-pi, pi]
  if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// 13) Policy-filtered update: projection callback
export type Projector = (z: C) => C;
export function safeUpdate(z: C, g: C, dt: number, a: number, omega: number, eta: number, proj: Projector): C {
  const step = transport(g, omega * dt, a * dt);
  return proj(add(z, scale(step, eta)));
}

// 14) Audit hash-link: returns new hex hash (SHA-256 over prev||rounded re,im)
export async function auditHash(prevHex: string, z: C, decimals = 6): Promise<string> {
  const round = (n: number) => Number(n.toFixed(decimals));
  const payload = new TextEncoder().encode(`${prevHex}|${round(z.re)},${round(z.im)}`);
  const buf = await crypto.subtle.digest("SHA-256", payload);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// 15) Circle consensus
export function circularMean(us: C[]): { mean: C; kappa: number } {
  if (us.length === 0) return { mean: c(1, 0), kappa: 0 };
  const sum = us.reduce((s, u) => add(s, unit(u)), c(0, 0));
  const m = scale(sum, 1 / us.length);
  return { mean: unit(m), kappa: Math.min(1, abs(m)) };
}
