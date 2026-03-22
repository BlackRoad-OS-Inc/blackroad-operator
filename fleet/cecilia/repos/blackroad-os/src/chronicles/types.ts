export interface ChronicleEpisode {
  id: string;
  episode: number;
  title: string;
  agentId: string;
  role: string;
  reason: string;
  escalations?: number;
  ttlHours: number;
  audioUrl?: string;
  docUrl?: string;
  narrator: string;
  protocolVersion: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy?: string;
}

export interface ChroniclesRegistry {
  version: string;
  narrator: string;
  episodes: ChronicleEpisode[];
  scheduledEpisodes: ScheduledEpisode[];
}

export interface ScheduledEpisode {
  id: string;
  title: string;
  scheduledFor: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

export const CHRONICLE_WORTHY_TOKEN_THRESHOLD = 300;
export interface Episode {
  id: string;
  title: string;
  agent: string;
  date: string;
  mp3: string;
  transcript: boolean;
}

export interface Chronicles {
  episodes: Episode[];
}

export interface EpisodeFrontmatter {
  id: string;
  title: string;
  agent: string;
  date: string;
  voice: string;
  transcript: boolean;
}
