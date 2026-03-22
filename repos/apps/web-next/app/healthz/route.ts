import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ status: 'ok', build_sha: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local' });
}
