import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "Alice Qi",
    status: "ok",
    time: new Date().toISOString(),
  });
}
