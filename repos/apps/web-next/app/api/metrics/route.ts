import client from 'prom-client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const registry = new client.Registry();
const httpDuration = new client.Histogram({
  name: 'web_request_duration_seconds',
  help: 'Duration of web requests in seconds',
  labelNames: ['route'],
});
const uptimeGauge = new client.Gauge({
  name: 'web_uptime_seconds',
  help: 'Uptime of the Next.js process',
  collect() {
    this.set(process.uptime());
  },
});

if (!registry.getSingleMetric("web_request_duration_seconds")) {
  registry.registerMetric(httpDuration);
}
if (!registry.getSingleMetric("web_uptime_seconds")) {
  registry.registerMetric(uptimeGauge);
}
client.collectDefaultMetrics({ register: registry });

export async function GET() {
  const token = process.env.METRICS_AUTH_TOKEN;
  const authorization = headers().get('authorization');
  if (token && authorization !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return new NextResponse(await registry.metrics(), {
    status: 200,
    headers: { 'content-type': registry.contentType },
  });
}
