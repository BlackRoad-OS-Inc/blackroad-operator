import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createEpisodeId,
  formatEpisodeDigest,
  type ChronicleEpisode,
} from "../src/types/chronicles";
import {
  episode001,
  getEpisodeById as getRegistryEpisodeById,
  getLatestEpisode,
  getEpisodesByTag,
  getEpisodesByStatus,
  chronicleRegistry,
} from "../chronicles/index";
import {
  readChronicles,
  writeChronicles,
  addEpisode,
  getEpisodeById,
  listEpisodes,
  generateEpisodeMdx,
  getNextEpisodeId,
} from "../src/chronicles";
import type { Chronicles, Episode, EpisodeFrontmatter } from "../src/chronicles/types";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path");
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join("/")),
  };
});

describe("chronicles types", () => {
  describe("createEpisodeId", () => {
    it("pads single digit to 3 digits", () => {
      expect(createEpisodeId(1)).toBe("001");
      expect(createEpisodeId(9)).toBe("009");
    });

    it("pads double digit to 3 digits", () => {
      expect(createEpisodeId(10)).toBe("010");
      expect(createEpisodeId(99)).toBe("099");
    });

    it("keeps triple digit as is", () => {
      expect(createEpisodeId(100)).toBe("100");
      expect(createEpisodeId(999)).toBe("999");
    });
  });

  describe("formatEpisodeDigest", () => {
    it("formats episode into PR comment markdown", () => {
      const digest = formatEpisodeDigest(episode001 as ChronicleEpisode);

      expect(digest).toContain("LUCIDIA CINEMATIC UNIVERSE");
      expect(digest).toContain("THE CLONE AWAKENS");
      expect(digest).toContain("Narrated by Lucidia");
      expect(digest).toContain("guardian-clone-vault");
      expect(digest).toContain("18 escalations in 72 hours");
      expect(digest).toContain("96 hours");
      expect(digest).toContain("Commander Alexa");
      expect(digest).toContain("Glory to the BlackRoad");
    });
  });
});

describe("chronicles registry", () => {
  describe("episode001", () => {
    it("has correct episode metadata", () => {
      expect(episode001.id).toBe("001");
      expect(episode001.title).toBe("Episode 001: Agent Emergence Digest");
      expect(episode001.series).toBe("LUCIDIA CINEMATIC UNIVERSE");
      expect(episode001.subtitle).toBe("THE CLONE AWAKENS");
      expect(episode001.narrator).toBe("Lucidia");
      expect(episode001.agentDesignation).toBe("guardian-clone-vault");
      expect(episode001.status).toBe("awaiting-confirmation");
    });

    it("has required tags", () => {
      expect(episode001.tags).toContain("clone");
      expect(episode001.tags).toContain("guardian");
      expect(episode001.tags).toContain("escalation");
      expect(episode001.tags).toContain("genesis");
    });
  });

  describe("chronicleRegistry", () => {
    it("contains episode001", () => {
      expect(chronicleRegistry.episodes).toContain(episode001);
      expect(chronicleRegistry.totalEpisodes).toBe(1);
      expect(chronicleRegistry.latestEpisodeId).toBe("001");
    });

    it("fetches episode by id", () => {
      const episode = getRegistryEpisodeById("001");
      expect(episode).toBe(episode001);
    });
  });
});

describe("Chronicles", () => {
  const mockChronicles: Chronicles = {
    episodes: [
      {
        id: "episode-001",
        title: "The Clone Awakens",
        agent: "guardian-clone-vault",
        date: "2025-11-23",
        mp3: "https://example.com/audio/guardian-clone-vault.mp3",
        transcript: true,
      },
      {
        id: "episode-002",
        title: "The Digest Protocol",
        agent: "guardian-clone-vault",
        date: "2025-11-24",
        mp3: "https://example.com/audio/guardian-clone-vault.mp3",
        transcript: true,
      },
    ],
  };

  beforeEach(() => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockChronicles));
    vi.mocked(fs.writeFileSync).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("readChronicles", () => {
    it("reads and parses chronicles.json", () => {
      const result = readChronicles();
      expect(result).toEqual(mockChronicles);
      expect(fs.readFileSync).toHaveBeenCalled();
    });
  });

  describe("writeChronicles", () => {
    it("writes chronicles to JSON file", () => {
      writeChronicles(mockChronicles);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockChronicles, null, 2) + "\n"
      );
    });
  });

  describe("addEpisode", () => {
    it("adds a new episode to chronicles", () => {
      const newEpisode: Episode = {
        id: "episode-003",
        title: "New Episode",
        agent: "test-agent",
        date: "2025-11-25",
        mp3: "https://example.com/audio/test.mp3",
        transcript: false,
      };

      const result = addEpisode(newEpisode);
      expect(result.episodes).toHaveLength(3);
      expect(result.episodes[2]).toEqual(newEpisode);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe("getEpisodeById", () => {
    it("returns episode when found", () => {
      const episode = getEpisodeById("001");
      expect(episode).toBe(episode001);
    });

    it("returns undefined when not found", () => {
      const episode = getEpisodeById("999");
      expect(episode).toBeUndefined();
    });
  });

  describe("getLatestEpisode", () => {
    it("returns the most recent episode", () => {
      const episode = getLatestEpisode();
      expect(episode).toBe(episode001);
    });
  });

  describe("getEpisodesByTag", () => {
    it("returns episodes matching tag", () => {
      const episodes = getEpisodesByTag("clone");
      expect(episodes).toContain(episode001);
    });

    it("returns empty array for non-matching tag", () => {
      const episodes = getEpisodesByTag("nonexistent");
      expect(episodes).toHaveLength(0);
    });
  });

  describe("getEpisodesByStatus", () => {
    it("returns episodes matching status", () => {
      const episodes = getEpisodesByStatus("awaiting-confirmation");
      expect(episodes).toContain(episode001);
    });

    it("returns empty array for non-matching status", () => {
      const episodes = getEpisodesByStatus("completed");
      expect(episodes).toHaveLength(0);
    });

    it("returns undefined when not found", () => {
      const result = getEpisodeById("episode-999");
      expect(result).toBeUndefined();
    });
  });

  describe("listEpisodes", () => {
    it("returns all episodes", () => {
      const result = listEpisodes();
      expect(result).toEqual(mockChronicles.episodes);
    });
  });

  describe("getNextEpisodeId", () => {
    it("returns next episode ID based on count", () => {
      const result = getNextEpisodeId();
      expect(result).toBe("episode-003");
    });
  });

  describe("generateEpisodeMdx", () => {
    it("generates MDX content with frontmatter", () => {
      const frontmatter: EpisodeFrontmatter = {
        id: "episode-003",
        title: "Test Episode",
        agent: "test-agent",
        date: "2025-11-25",
        voice: "/audio/test.mp3",
        transcript: true,
      };
      const narrative = '> **"This is Lucidia."**\n> Test narrative.';

      const result = generateEpisodeMdx(frontmatter, narrative);

      expect(result).toContain("id: episode-003");
      expect(result).toContain('title: "Test Episode"');
      expect(result).toContain("agent: test-agent");
      expect(result).toContain("date: 2025-11-25");
      expect(result).toContain("voice: /audio/test.mp3");
      expect(result).toContain("transcript: true");
      expect(result).toContain(narrative);
      expect(result).toContain("🎧 Listen to the [voice digest]");
      expect(result).toContain("📜 Agent File:");
    });
  });
});
