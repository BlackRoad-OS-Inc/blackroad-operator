export * from "./types";
export * from "./chronicles";
import * as fs from "fs";
import * as path from "path";
import type { Chronicles, Episode, EpisodeFrontmatter } from "./types";
import { getEpisodeById as getRegistryEpisodeById } from "../../chronicles/index";

const CHRONICLES_DIR = path.join(process.cwd(), "lucidia-chronicles");
const CHRONICLES_JSON = path.join(CHRONICLES_DIR, "chronicles.json");

export function readChronicles(): Chronicles {
  const data = fs.readFileSync(CHRONICLES_JSON, "utf-8");
  return JSON.parse(data) as Chronicles;
}

export function writeChronicles(chronicles: Chronicles): void {
  fs.writeFileSync(CHRONICLES_JSON, JSON.stringify(chronicles, null, 2) + "\n");
}

export function addEpisode(episode: Episode): Chronicles {
  const chronicles = readChronicles();
  chronicles.episodes.push(episode);
  writeChronicles(chronicles);
  return chronicles;
}

export function getEpisodeById(id: string): Episode | undefined {
  const registryEpisode = getRegistryEpisodeById(id);
  if (registryEpisode) {
    return registryEpisode as Episode;
  }
  const chronicles = readChronicles();
  const normalizedId = id.startsWith("episode-") ? id : `episode-${id}`;
  return chronicles.episodes.find((ep) => ep.id === id || ep.id === normalizedId);
}

export function listEpisodes(): Episode[] {
  return readChronicles().episodes;
}

export function generateEpisodeMdx(frontmatter: EpisodeFrontmatter, narrative: string): string {
  return `---
id: ${frontmatter.id}
title: "${frontmatter.title}"
agent: ${frontmatter.agent}
date: ${frontmatter.date}
voice: ${frontmatter.voice}
transcript: ${frontmatter.transcript}
---

${narrative}

🎧 Listen to the [voice digest](https://example.com${frontmatter.voice})

📜 Agent File: [\`${frontmatter.agent}.agent.json\`](../agents/${frontmatter.agent}.agent.json)
`;
}

export function getNextEpisodeId(): string {
  const chronicles = readChronicles();
  const nextNum = chronicles.episodes.length + 1;
  return `episode-${String(nextNum).padStart(3, "0")}`;
}

export function createEpisodeFile(filename: string, content: string): void {
  const filepath = path.join(CHRONICLES_DIR, filename);
  fs.writeFileSync(filepath, content);
}
