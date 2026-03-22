import { NextResponse } from "next/server";
import { loadMentorGraph } from "../../agents/data";

export async function GET() {
  const graph = await loadMentorGraph();
  return NextResponse.json(graph);
}
