export interface ChronicleEpisode {
  /** Episode number (e.g., "001", "002") */
  id: string;
  /** Full title of the episode */
  title: string;
  /** Series name */
  series: string;
  /** Subtitle for the episode */
  subtitle: string;
  /** Narrator name */
  narrator: string;
  /** Publication date (ISO format) */
  date: string;
  /** Episode duration (HH:MM:SS format) */
  duration: string;
  /** Path to the audio file */
  audioFile: string;
  /** Searchable tags */
  tags: string[];
  /** Agent designation if applicable */
  agentDesignation?: string;
  /** Event that triggered the episode */
  triggerEvent?: string;
  /** Time-to-live for temporary agents */
  ttl?: string;
  /** Current status */
  status: ChronicleStatus;
  /** Commander or authority figure */
  commander?: string;
  /** Path to the MDX content file */
  contentPath: string;
}

export type ChronicleStatus =
  | "awaiting-confirmation"
  | "active"
  | "completed"
  | "archived"
  | "expired";

export interface ChronicleDigest {
  /** Brief narrated message */
  message: string;
  /** Channel where digest was posted */
  channel: DigestChannel;
  /** Timestamp of posting */
  postedAt: string;
  /** URL to the digest */
  url?: string;
}

export type DigestChannel =
  | "github"
  | "slack"
  | "discord"
  | "prism-console"
  | "codex-prompt-log"
  | "lucidia-library";

export interface ChronicleRegistry {
  /** All registered episodes */
  episodes: ChronicleEpisode[];
  /** Latest episode ID */
  latestEpisodeId: string;
  /** Total episode count */
  totalEpisodes: number;
}

/** Creates a new episode ID based on the count */
export function createEpisodeId(episodeNumber: number): string {
  return episodeNumber.toString().padStart(3, "0");
}

/** Formats episode for PR comment digest */
export function formatEpisodeDigest(episode: ChronicleEpisode): string {
  const details = [
    episode.agentDesignation && `Agent Designation: \`${episode.agentDesignation}\``,
    episode.triggerEvent && `Trigger: ${episode.triggerEvent}`,
    episode.ttl && `TTL: ${episode.ttl}`,
    episode.commander && `Awaiting confirmation from Commander ${episode.commander}`,
  ].filter(Boolean);

  const detailsBlock = details.length > 0
    ? details.map((d) => `> ${d}`).join("\n")
    : "";

  return `
## 🎙️ ${episode.series}: ${episode.subtitle}

### ${episode.title}

> **Narrated by ${episode.narrator}**
${detailsBlock}

📅 ${episode.date} | ⏱️ ${episode.duration}

🔗 [Listen to Episode](${episode.audioFile}) | [Read Transcript](${episode.contentPath})

---
*Lucidia Chronicles - Glory to the BlackRoad*
`.trim();
}
