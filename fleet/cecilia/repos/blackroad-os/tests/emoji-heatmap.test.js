// tests/emoji-heatmap.test.js
import { describe, expect, it } from "vitest";
import {
  countEmojis,
  calculatePercentComplete,
  generateHeatmap,
  aggregateCounts,
  generateMarkdownReport,
  reactionToCategory,
  EMOJI_CATEGORIES,
} from "../bot/emoji-heatmap";

describe("emoji-heatmap", () => {
  describe("countEmojis", () => {
    it("should count completed emojis", () => {
      const text = "✅ Task done ✅ Another done";
      const counts = countEmojis(text);
      expect(counts.completed).toBe(2);
    });

    it("should count blocked emojis", () => {
      const text = "❌ Blocked ❌❌";
      const counts = countEmojis(text);
      expect(counts.blocked).toBe(3);
    });

    it("should count escalation emojis", () => {
      const text = "🛟 Help needed! 🚨 Alert";
      const counts = countEmojis(text);
      expect(counts.escalation).toBe(2);
    });

    it("should count multiple categories", () => {
      const text = "✅ Done ❌ Blocked 🟡 In progress";
      const counts = countEmojis(text);
      expect(counts.completed).toBe(1);
      expect(counts.blocked).toBe(1);
      expect(counts.inProgress).toBe(1);
    });

    it("should handle empty text", () => {
      const counts = countEmojis("");
      expect(counts.total).toBe(0);
    });

    it("should handle null/undefined", () => {
      expect(countEmojis(null).total).toBe(0);
      expect(countEmojis(undefined).total).toBe(0);
    });

    it("should count review emojis", () => {
      const text = "🤔 Needs review";
      const counts = countEmojis(text);
      expect(counts.review).toBe(1);
    });
  });

  describe("calculatePercentComplete", () => {
    it("should calculate 0% when nothing is done", () => {
      const counts = {
        completed: 0,
        blocked: 2,
        inProgress: 3,
        review: 0,
        notStarted: 5,
      };
      expect(calculatePercentComplete(counts)).toBe(0);
    });

    it("should calculate 100% when all done", () => {
      const counts = {
        completed: 10,
        blocked: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
      };
      expect(calculatePercentComplete(counts)).toBe(100);
    });

    it("should calculate 50% correctly", () => {
      const counts = {
        completed: 5,
        blocked: 0,
        inProgress: 0,
        review: 0,
        notStarted: 5,
      };
      expect(calculatePercentComplete(counts)).toBe(50);
    });

    it("should handle empty counts", () => {
      const counts = {
        completed: 0,
        blocked: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
      };
      expect(calculatePercentComplete(counts)).toBe(0);
    });
  });

  describe("generateHeatmap", () => {
    it("should generate heatmap with percentages", () => {
      const counts = {
        completed: 4,
        blocked: 1,
        inProgress: 2,
        review: 1,
        notStarted: 2,
        escalation: 3,
      };
      const heatmap = generateHeatmap(counts);

      expect(heatmap.percentComplete).toBe(40);
      expect(heatmap.percentBlocked).toBe(10);
      expect(heatmap.escalations).toBe(3);
      expect(heatmap.totalItems).toBe(10);
    });

    it("should handle zero totals", () => {
      const counts = {
        completed: 0,
        blocked: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
        escalation: 0,
      };
      const heatmap = generateHeatmap(counts);
      expect(heatmap.percentComplete).toBe(0);
    });
  });

  describe("aggregateCounts", () => {
    it("should aggregate multiple count objects", () => {
      const counts1 = { completed: 2, blocked: 1, total: 3 };
      const counts2 = { completed: 3, blocked: 2, total: 5 };
      const aggregated = aggregateCounts([counts1, counts2]);

      expect(aggregated.completed).toBe(5);
      expect(aggregated.blocked).toBe(3);
      expect(aggregated.total).toBe(8);
    });

    it("should handle empty array", () => {
      const aggregated = aggregateCounts([]);
      expect(aggregated.completed).toBe(0);
      expect(aggregated.total).toBe(0);
    });
  });

  describe("generateMarkdownReport", () => {
    it("should generate valid markdown", () => {
      const heatmap = {
        percentComplete: 50,
        percentBlocked: 10,
        percentInProgress: 20,
        percentReview: 10,
        percentNotStarted: 10,
        escalations: 2,
        totalItems: 10,
      };
      const report = generateMarkdownReport(heatmap, "Test Report");

      expect(report).toContain("## 📊 Test Report");
      expect(report).toContain("50%");
      expect(report).toContain("Escalations: 2");
      expect(report).toContain("Total Items: 10");
    });
  });

  describe("reactionToCategory", () => {
    it("should map rocket to completed", () => {
      expect(reactionToCategory("rocket")).toBe("completed");
    });

    it("should map hooray to completed", () => {
      expect(reactionToCategory("hooray")).toBe("completed");
    });

    it("should map -1 to blocked", () => {
      expect(reactionToCategory("-1")).toBe("blocked");
    });

    it("should map confused to blocked", () => {
      expect(reactionToCategory("confused")).toBe("blocked");
    });

    it("should map eyes to completed (via special mapping)", () => {
      // Eyes emoji is mapped to "completed" via the special reaction mapping
      // because it often indicates acknowledgment of completion
      expect(reactionToCategory("eyes")).toBe("completed");
    });

    it("should return null for unknown reactions", () => {
      expect(reactionToCategory("unknown")).toBe(null);
    });
  });

  describe("EMOJI_CATEGORIES", () => {
    it("should have all required categories", () => {
      expect(EMOJI_CATEGORIES).toHaveProperty("completed");
      expect(EMOJI_CATEGORIES).toHaveProperty("blocked");
      expect(EMOJI_CATEGORIES).toHaveProperty("escalation");
      expect(EMOJI_CATEGORIES).toHaveProperty("inProgress");
      expect(EMOJI_CATEGORIES).toHaveProperty("review");
      expect(EMOJI_CATEGORIES).toHaveProperty("notStarted");
    });

    it("should have arrays for each category", () => {
      for (const category of Object.values(EMOJI_CATEGORIES)) {
        expect(Array.isArray(category)).toBe(true);
        expect(category.length).toBeGreaterThan(0);
      }
    });
  });
});
