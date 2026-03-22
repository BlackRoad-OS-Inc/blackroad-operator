import { NextResponse } from "next/server";
import { computeAgentSSN } from "@br/agents";
import { getAgentById } from "@br/registry";

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Params) {
  const manifest = await getAgentById(params.id);
  if (!manifest) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    manifest,
    ssn: computeAgentSSN(manifest),
  });
}
