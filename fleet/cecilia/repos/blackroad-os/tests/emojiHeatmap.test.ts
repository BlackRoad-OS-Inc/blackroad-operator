import { describe, it, expect } from "vitest";
const calculateEmojiStats = require("../bot/utils/emoji-heatmap");

describe("calculateEmojiStats", () => {
  it("calculates stats for sample reactions", () => {
    const sampleReactions = [
      { content: "✅" },
      { content: "✅" },
      { content: "❌" },
      { content: "🛟" },
    ];

    const result = calculateEmojiStats(sampleReactions);

    expect(result.total).toBe(4);
    expect(result.confirmed).toBe(2);
    expect(result.blocked).toBe(1);
    expect(result.escalated).toBe(1);
    expect(result.review).toBe(0);
    expect(result.report["✅"]).toBe("50%");
    expect(result.report["❌"]).toBe("25%");
    expect(result.report["🛟"]).toBe("25%");
    expect(result.report["🤔"]).toBe("0%");
  });

  it("returns zero stats for empty reactions", () => {
    const result = calculateEmojiStats([]);

    expect(result.total).toBe(0);
    expect(result.confirmed).toBe(0);
    expect(result.blocked).toBe(0);
    expect(result.escalated).toBe(0);
    expect(result.review).toBe(0);
    expect(result.report["✅"]).toBe("0%");
    expect(result.report["❌"]).toBe("0%");
    expect(result.report["🛟"]).toBe("0%");
    expect(result.report["🤔"]).toBe("0%");
  });

  it("handles default parameter (undefined)", () => {
    const result = calculateEmojiStats();

    expect(result.total).toBe(0);
    expect(result.confirmed).toBe(0);
    expect(result.blocked).toBe(0);
    expect(result.escalated).toBe(0);
    expect(result.review).toBe(0);
  });

  it("ignores untracked reactions", () => {
    const mixedReactions = [
      { content: "✅" },
      { content: "🤔" },
      { content: "👍" }, // not tracked
      { content: "❌" },
      { content: "🛟" },
    ];

    const result = calculateEmojiStats(mixedReactions);

    expect(result.total).toBe(4); // 👍 is not counted
    expect(result.confirmed).toBe(1);
    expect(result.blocked).toBe(1);
    expect(result.escalated).toBe(1);
    expect(result.review).toBe(1);
    expect(result.report["✅"]).toBe("25%");
    expect(result.report["❌"]).toBe("25%");
    expect(result.report["🛟"]).toBe("25%");
    expect(result.report["🤔"]).toBe("25%");
  });

  it("rounds percentages correctly", () => {
    const reactions = [
      { content: "✅" },
      { content: "✅" },
      { content: "❌" },
    ];

    const result = calculateEmojiStats(reactions);

    expect(result.total).toBe(3);
    expect(result.report["✅"]).toBe("67%"); // 2/3 = 66.67% rounded
    expect(result.report["❌"]).toBe("33%"); // 1/3 = 33.33% rounded
  });

  it("handles reactions with missing content property", () => {
    const reactionsWithMissing = [
      { content: "✅" },
      {}, // missing content
      { content: "❌" },
      { otherProp: "value" }, // different property
    ];

    const result = calculateEmojiStats(reactionsWithMissing);

    expect(result.total).toBe(2);
    expect(result.confirmed).toBe(1);
    expect(result.blocked).toBe(1);
  });
});
