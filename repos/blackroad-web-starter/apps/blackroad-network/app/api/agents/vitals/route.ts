import { NextResponse } from "next/server";
import { loadAgentVitals } from "../../agents/data";

export async function GET() {
  const vitals = await loadAgentVitals();
  return NextResponse.json(vitals);
}
