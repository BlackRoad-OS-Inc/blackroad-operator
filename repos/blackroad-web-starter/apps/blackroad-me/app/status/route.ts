import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "BlackRoad Identity",
    status: "ok",
    time: new Date().toISOString(),
  });
}
