import { NextResponse } from "next/server";
import { computeAgentSSN } from "@br/agents";
import { getAgentById, getAllAgents, searchAgents } from "@br/registry";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  const summaries = query ? await searchAgents(query) : await getAllAgents();

  const items = (
    await Promise.all(
      summaries.map(async (summary) => {
        const manifest = await getAgentById(summary.id);
        if (!manifest) {
          return null;
        }

        return {
          ...summary,
          ssn: computeAgentSSN(manifest),
        };
      })
    )
  ).filter((item): item is NonNullable<typeof item> => item !== null);

  return NextResponse.json({
    total: items.length,
    items,
  });
}
