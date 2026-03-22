import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "BlackRoad Network",
    status: "ok",
    time: new Date().toISOString(),
  });
}
