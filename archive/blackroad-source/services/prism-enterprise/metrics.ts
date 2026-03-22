import express from 'express';
import client from 'prom-client';

const metricsRouter = express.Router();

const registry = new client.Registry();

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export const errorRate = new client.Counter({
  name: 'error_rate',
  help: 'Count of 5xx responses',
  labelNames: ['method', 'route', 'status_code'],
});

export const uptimeGauge = new client.Gauge({
  name: 'app_uptime_seconds',
  help: 'Application uptime in seconds',
  collect() {
    this.set(process.uptime());
  },
});

registry.registerMetric(httpDuration);
registry.registerMetric(errorRate);
registry.registerMetric(uptimeGauge);
client.collectDefaultMetrics({ register: registry });

metricsRouter.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  const token = process.env.METRICS_AUTH_TOKEN;
  if (token && req.get('authorization') !== `Bearer ${token}`) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  res.send(await registry.metrics());
});

export const metricsMiddleware: express.RequestHandler = async (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route: req.route?.path ?? req.path,
      status_code: String(res.statusCode),
    };
    httpDuration.labels(labels.method, labels.route, labels.status_code).observe(duration);
    if (res.statusCode >= 500) {
      errorRate.labels(labels.method, labels.route, labels.status_code).inc();
    }
  });
  next();
};

export { metricsRouter };
