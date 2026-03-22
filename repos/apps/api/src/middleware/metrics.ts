import type { NextFunction, Request, Response } from 'express';
import { trackHttpRequest } from '../metrics/metrics.js';

function resolveRouteLabel(req: Request): string {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}` || req.route.path;
  }
  if (req.baseUrl) {
    return req.baseUrl;
  }
  const original = req.originalUrl || req.url;
  return original ? original.split('?')[0] : 'unknown';
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const seconds = durationNs / 1_000_000_000;
    const routeLabel = resolveRouteLabel(req);
    trackHttpRequest(seconds, {
      method: req.method,
      route: routeLabel,
      status: String(res.statusCode)
    });
  });
  next();
}
