import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "Lucidia Qi",
    status: "ok",
    time: new Date().toISOString(),
  });
}
