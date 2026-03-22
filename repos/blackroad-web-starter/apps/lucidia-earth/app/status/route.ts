import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "Lucidia Earth",
    status: "ok",
    time: new Date().toISOString(),
  });
}
