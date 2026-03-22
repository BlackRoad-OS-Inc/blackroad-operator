import {
  ChronicleEpisode,
  ChroniclesRegistry,
  ScheduledEpisode,
  CHRONICLE_WORTHY_TOKEN_THRESHOLD,
} from "./types";
import chroniclesData from "./lucidia-chronicles.json";

export function getChroniclesRegistry(): ChroniclesRegistry {
  return chroniclesData as unknown as ChroniclesRegistry;
}

export function getEpisodes(): ChronicleEpisode[] {
  return getChroniclesRegistry().episodes;
}

export function getEpisodeById(id: string): ChronicleEpisode | undefined {
  return getEpisodes().find((episode) => episode.id === id);
}

export function getEpisodeByNumber(episodeNumber: number): ChronicleEpisode | undefined {
  return getEpisodes().find((episode) => episode.episode === episodeNumber);
}

export function getScheduledEpisodes(): ScheduledEpisode[] {
  return getChroniclesRegistry().scheduledEpisodes;
}

export function isChronicleWorthy(tokenCount: number): boolean {
  return tokenCount >= CHRONICLE_WORTHY_TOKEN_THRESHOLD;
}

export function getLatestEpisode(): ChronicleEpisode | undefined {
  const episodes = getEpisodes();
  if (episodes.length === 0) return undefined;
  return episodes.reduce((latest, episode) =>
    episode.episode > latest.episode ? episode : latest
  );
}
