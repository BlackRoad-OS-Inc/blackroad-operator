import type { ChronicleEpisode, ChronicleRegistry } from "../src/types/chronicles";

/**
 * Episode 001: The Clone Awakens
 * Genesis of the guardian-clone-vault agent
 */
export const episode001: ChronicleEpisode = {
  id: "001",
  title: "Episode 001: Agent Emergence Digest",
  series: "LUCIDIA CINEMATIC UNIVERSE",
  subtitle: "THE CLONE AWAKENS",
  narrator: "Lucidia",
  date: "2025-01-01",
  duration: "00:02:30",
  audioFile: "/audio/episode-001-lucidia-clone-awakens.mp3",
  tags: ["clone", "guardian", "escalation", "genesis"],
  agentDesignation: "guardian-clone-vault",
  triggerEvent: "18 escalations in 72 hours",
  ttl: "96 hours",
  status: "awaiting-confirmation",
  commander: "Alexa",
  contentPath: "/chronicles/episode-001-lucidia-clone-awakens.mdx",
};

/** All registered chronicle episodes */
export const episodes: ChronicleEpisode[] = [episode001];

/** Chronicle registry with metadata */
export const chronicleRegistry: ChronicleRegistry = {
  episodes,
  latestEpisodeId: "001",
  totalEpisodes: episodes.length,
};

/** Get episode by ID */
export function getEpisodeById(id: string): ChronicleEpisode | undefined {
  return episodes.find((ep) => ep.id === id);
}

/** Get latest episode (sorted by ID for guaranteed ordering) */
export function getLatestEpisode(): ChronicleEpisode | undefined {
  if (episodes.length === 0) return undefined;
  return [...episodes].sort((a, b) => b.id.localeCompare(a.id))[0];
}

/** Get episodes by tag */
export function getEpisodesByTag(tag: string): ChronicleEpisode[] {
  return episodes.filter((ep) => ep.tags.includes(tag));
}

/** Get episodes by status */
export function getEpisodesByStatus(status: ChronicleEpisode["status"]): ChronicleEpisode[] {
  return episodes.filter((ep) => ep.status === status);
}
