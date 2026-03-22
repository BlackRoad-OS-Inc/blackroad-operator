import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { computeAgentSSN } from "@br/agents";
import { getAgentById, getAllAgents } from "@br/registry";

async function syncAgents() {
  if (!process.env.GH_TOKEN) {
    console.warn("[agents:sync] GH_TOKEN not set. Results may be empty if GitHub API access is required.");
  }

  const summaries = await getAllAgents({ force: true });
  const records = await Promise.all(
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
  );

  const agents = records.filter((record): record is NonNullable<typeof record> => Boolean(record));

  const cacheDir = resolve(".cache");
  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    resolve(cacheDir, "agents-index.json"),
    JSON.stringify(agents, null, 2),
    "utf-8"
  );

  const sitemapDir = resolve("apps/blackroad-network/public");
  await mkdir(sitemapDir, { recursive: true });
  const sitemap = agents.map((agent) => ({ id: agent.id, cluster: agent.cluster }));
  await writeFile(resolve(sitemapDir, "agents.json"), JSON.stringify(sitemap, null, 2), "utf-8");

  console.log(`[agents:sync] cached ${agents.length} agents`);
}

syncAgents().catch((error) => {
  console.error("[agents:sync] failed", error);
  process.exitCode = 1;
});
