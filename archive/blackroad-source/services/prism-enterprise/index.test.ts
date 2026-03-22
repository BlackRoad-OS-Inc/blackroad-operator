import { test } from 'node:test';
import assert from 'node:assert/strict';
import { c, abs, transport, dLog, spiralStep, circularMean } from './index.js';

test('transport scales and rotates', () => {
  const z = c(1, 0);
  const z2 = transport(z, Math.PI / 2, 0.0);
  assert.ok(Math.abs(z2.re) < 1e-9 && Math.abs(z2.im - 1) < 1e-9);
});

test('log-spiral metric symmetry-ish', () => {
  const a = c(2, 0), b = c(0, 2);
  const dab = dLog(a, b); const dba = dLog(b, a);
  assert.ok(Math.abs(dab - dba) < 1e-9);
});

test('spiral step damping', () => {
  const z0 = c(1, 0);
  const z1 = spiralStep(z0, 0.1, -1.0, 0);
  assert.ok(abs(z1) < 1);
});

test('circular mean', () => {
  const { kappa } = circularMean([c(1,0), c(0,1)]);
  assert.ok(kappa > 0 && kappa < 1);
});
