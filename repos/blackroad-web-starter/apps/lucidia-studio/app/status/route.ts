import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "Lucidia Studio",
    status: "ok",
    time: new Date().toISOString(),
  });
}
