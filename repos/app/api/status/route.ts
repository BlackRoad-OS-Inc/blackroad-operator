import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
}

export async function GET() {
  // Check real services
  const checks = [
    { name: 'Ollama (Cecilia)', url: 'https://ollama.blackroad.io/api/tags' },
    { name: 'Agent Daemon (Alice)', url: 'https://agents.blackroad.io/health' },
    { name: 'Gitea (Octavia)', url: 'https://git.blackroad.io/api/v1/repos/search?limit=1' },
    { name: 'Chat Platform', url: 'https://chat.blackroad.io/' },
    { name: 'Stats API', url: 'https://stats-blackroad.amundsonalexa.workers.dev/health' },
  ];

  const services: ServiceStatus[] = await Promise.all(
    checks.map(async (svc) => {
      const start = Date.now();
      try {
        const res = await fetch(svc.url, { signal: AbortSignal.timeout(5000) });
        return {
          name: svc.name,
          status: res.ok ? 'operational' as const : 'degraded' as const,
          latency: Date.now() - start,
        };
      } catch {
        return { name: svc.name, status: 'down' as const, latency: Date.now() - start };
      }
    })
  );

  const overallStatus = services.every((s) => s.status === 'operational')
    ? 'operational'
    : services.some((s) => s.status === 'down')
    ? 'major_outage'
    : 'partial_outage';

  const response = {
    status: overallStatus,
    services,
    timestamp: new Date().toISOString(),
    page: {
      name: 'BlackRoad OS',
      url: 'https://status.blackroad.io',
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
