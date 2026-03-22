import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "BlackRoad AI",
    status: "ok",
    time: new Date().toISOString(),
  });
}
