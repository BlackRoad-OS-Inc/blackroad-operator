export interface AcriPoint {
  /** x coordinate on the projection plane */
  x: number;
  /** y coordinate on the projection plane */
  y: number;
  /** radial distance on the projection plane */
  r: number;
  /** polar angle on the projection plane */
  phi: number;
  /** polar angle on the sphere */
  theta: number;
  /** derivative of r with respect to theta */
  drdtheta: number;
}

const DEFAULT_RADIUS = 1;
const EPS = 1e-9;

function clampGamma(gamma: number) {
  if (!Number.isFinite(gamma)) {
    throw new RangeError("gamma must be finite");
  }
  if (gamma < 0 || gamma > 1) {
    throw new RangeError("gamma must satisfy 0 ≤ gamma ≤ 1");
  }
}

export function acriRadius(theta: number, radius = DEFAULT_RADIUS, gamma = 0.5): number {
  clampGamma(gamma);
  if (!Number.isFinite(theta)) {
    throw new RangeError("theta must be finite");
  }
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new RangeError("radius must be > 0");
  }

  const tanHalf = Math.tan(theta / 2);
  const tanTheta = Math.tan(theta);

  if (!Number.isFinite(tanHalf) || !Number.isFinite(tanTheta)) {
    return Number.NaN;
  }

  const a = 2 * radius * tanHalf;
  const b = radius * tanTheta;

  if (a <= 0 && gamma !== 0) {
    return 0;
  }

  const aTerm = gamma === 0 ? 1 : Math.pow(a, gamma);
  const bTerm = gamma === 1 ? 1 : Math.pow(b, 1 - gamma);

  return aTerm * bTerm;
}

function derivativeLogA(theta: number): number {
  const sinTheta = Math.sin(theta);
  if (Math.abs(sinTheta) < EPS) {
    return sinTheta >= 0 ? 1 / EPS : -1 / EPS;
  }
  return 1 / sinTheta;
}

function derivativeLogB(theta: number): number {
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  if (Math.abs(sinTheta * cosTheta) < EPS) {
    const sign = Math.sign(sinTheta * cosTheta) || 1;
    return sign / EPS;
  }
  return 1 / (sinTheta * cosTheta);
}

export function acri(theta: number, phi: number, radius = DEFAULT_RADIUS, gamma = 0.5): AcriPoint {
  clampGamma(gamma);
  if (!Number.isFinite(theta) || !Number.isFinite(phi)) {
    throw new RangeError("theta and phi must be finite");
  }
  const r = acriRadius(theta, radius, gamma);
  if (!Number.isFinite(r)) {
    return { x: Number.NaN, y: Number.NaN, r: Number.NaN, phi, theta, drdtheta: Number.NaN };
  }

  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  let drdtheta = r * (gamma * derivativeLogA(theta) + (1 - gamma) * derivativeLogB(theta));

  if (!Number.isFinite(drdtheta) || Math.abs(sinTheta) < 1e-5 || Math.abs(cosTheta) < 1e-5) {
    const delta = 1e-5;
    const thetaPrev = Math.max(theta - delta, 1e-6);
    const thetaNext = Math.min(theta + delta, Math.PI / 2 - 1e-6);
    const rPrev = acriRadius(thetaPrev, radius, gamma);
    const rNext = acriRadius(thetaNext, radius, gamma);
    if (Number.isFinite(rPrev) && Number.isFinite(rNext)) {
      drdtheta = (rNext - rPrev) / (thetaNext - thetaPrev);
    }
  }

  const x = r * Math.cos(phi);
  const y = r * Math.sin(phi);

  return { x, y, r, phi, theta, drdtheta };
}

export function angleDistortion(theta: number, radius = DEFAULT_RADIUS, gamma = 0.5): number {
  const point = acri(theta, 0, radius, gamma);
  if (!Number.isFinite(point.r) || !Number.isFinite(point.drdtheta) || Math.abs(point.r) < EPS) {
    return 0;
  }
  const sinTheta = Math.sin(theta);
  if (Math.abs(sinTheta) < EPS) {
    return 0;
  }
  const normalizedThetaScale = Math.abs(point.drdtheta) / radius;
  const normalizedPhiScale = point.r / (radius * sinTheta);
  if (normalizedPhiScale <= 0) {
    return 0;
  }
  return Math.abs(Math.log(normalizedThetaScale / normalizedPhiScale));
}

export function logAreaDistortion(theta: number, radius = DEFAULT_RADIUS, gamma = 0.5): number {
  const point = acri(theta, 0, radius, gamma);
  if (!Number.isFinite(point.r) || !Number.isFinite(point.drdtheta) || Math.abs(point.r) < EPS) {
    return 0;
  }
  const sinTheta = Math.sin(theta);
  if (Math.abs(sinTheta) < EPS) {
    return 0;
  }
  const jacobian = Math.abs(point.drdtheta) * point.r / (radius * radius * sinTheta);
  if (jacobian <= 0) {
    return 0;
  }
  return Math.log(jacobian);
}

export function amundsonBudget(alpha: number, angleError: number, logAreaError: number): number {
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("alpha must satisfy 0 ≤ alpha ≤ 1");
  }
  const angleTerm = Math.abs(angleError);
  const areaTerm = Math.abs(logAreaError);
  return alpha * angleTerm + (1 - alpha) * areaTerm;
}

export function thetaFromRadius(targetRadius: number, radius = DEFAULT_RADIUS, gamma = 0.5): number | null {
  clampGamma(gamma);
  if (!Number.isFinite(targetRadius) || targetRadius < 0) {
    throw new RangeError("targetRadius must be non-negative and finite");
  }
  if (targetRadius === 0) {
    return 0;
  }
  const minTheta = 1e-6;
  const maxTheta = Math.min(Math.PI / 2 - 1e-6, Math.PI / 2);

  const guessStereographic = 2 * Math.atan(targetRadius / (2 * radius));
  const guessGnomonic = Math.atan(targetRadius / radius);
  let theta = gamma * guessStereographic + (1 - gamma) * guessGnomonic;
  theta = Math.min(Math.max(theta, minTheta), maxTheta - 1e-6);

  for (let i = 0; i < 20; i += 1) {
    const currentRadius = acriRadius(theta, radius, gamma);
    if (!Number.isFinite(currentRadius)) {
      break;
    }
    const error = currentRadius - targetRadius;
    if (Math.abs(error) < 1e-8) {
      return theta;
    }
    const currentDerivative = acri(theta, 0, radius, gamma).drdtheta;
    if (!Number.isFinite(currentDerivative) || Math.abs(currentDerivative) < EPS) {
      break;
    }
    theta -= error / currentDerivative;
    if (theta <= minTheta) {
      theta = minTheta;
    }
    if (theta >= maxTheta) {
      theta = maxTheta - 1e-6;
    }
  }

  const fallbackRadius = acriRadius(theta, radius, gamma);
  if (Number.isFinite(fallbackRadius) && Math.abs(fallbackRadius - targetRadius) < 1e-6) {
    return theta;
  }
  return null;
}

export function vswrFromGammaMagnitude(magnitude: number): number {
  if (magnitude < 0 || magnitude >= 1) {
    return Number.POSITIVE_INFINITY;
  }
  return (1 + magnitude) / (1 - magnitude);
}

export const AMUNDSON_COMMIT_REFERENCE = "git:workspace";
