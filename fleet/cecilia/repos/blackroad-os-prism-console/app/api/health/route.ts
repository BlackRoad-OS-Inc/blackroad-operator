import { NextResponse } from 'next/server';

const startTime = Date.now();
export const runtime = 'edge';

const SERVICE_NAME = process.env.SERVICE_NAME ?? 'blackroad-prism-console';

export async function GET() {
  const uptime = Math.round((Date.now() - startTime) / 1000);
  return NextResponse.json({
    status: 'ok',
    service: SERVICE_NAME,
    uptime
  });
}
