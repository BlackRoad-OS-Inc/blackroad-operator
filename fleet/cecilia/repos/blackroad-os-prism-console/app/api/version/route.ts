import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? 'dev-local';
  return NextResponse.json({ version: '0.0.1', commit });
}
