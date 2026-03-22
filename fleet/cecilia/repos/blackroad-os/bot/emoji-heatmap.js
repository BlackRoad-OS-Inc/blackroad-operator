// bot/emoji-heatmap.js
// 🧠 Emoji Stats Engine: counts ✅, ❌, 🛟 and calculates percentages

/**
 * Emoji categories for tracking
 */
const EMOJI_CATEGORIES = {
  completed: ["✅", "🎉", "🚀", "👀"],
  blocked: ["❌", "🔴", "🛑"],
  escalation: ["🛟", "🚨", "🔥"],
  inProgress: ["🟡", "🔄", "🔁"],
  review: ["🤔", "👁️", "📝"],
  notStarted: ["⬜", "📋"],
};

/**
 * Maps reaction names to emojis
 */
const REACTION_TO_EMOJI = {
  "+1": "👍",
  "-1": "👎",
  laugh: "😄",
  hooray: "🎉",
  confused: "😕",
  heart: "❤️",
  rocket: "🚀",
  eyes: "👀",
};

/**
 * Count emojis in a text string
 * @param {string} text - The text to analyze
 * @returns {Object} - Emoji counts by category
 */
function countEmojis(text) {
  const counts = {
    completed: 0,
    blocked: 0,
    escalation: 0,
    inProgress: 0,
    review: 0,
    notStarted: 0,
    total: 0,
  };

  if (!text) return counts;

  for (const [category, emojis] of Object.entries(EMOJI_CATEGORIES)) {
    for (const emoji of emojis) {
      const regex = new RegExp(emoji, "g");
      const matches = text.match(regex);
      if (matches) {
        counts[category] += matches.length;
        counts.total += matches.length;
      }
    }
  }

  return counts;
}

/**
 * Calculate percentage complete from emoji counts
 * @param {Object} counts - Emoji counts object
 * @returns {number} - Percentage complete (0-100)
 */
function calculatePercentComplete(counts) {
  const total =
    counts.completed +
    counts.blocked +
    counts.inProgress +
    counts.review +
    counts.notStarted;

  if (total === 0) return 0;

  return Math.round((counts.completed / total) * 100);
}

/**
 * Generate a heatmap summary from emoji counts
 * @param {Object} counts - Emoji counts object
 * @returns {Object} - Heatmap summary with percentages and status
 */
function generateHeatmap(counts) {
  const total =
    counts.completed +
    counts.blocked +
    counts.inProgress +
    counts.review +
    counts.notStarted || 1;

  return {
    percentComplete: calculatePercentComplete(counts),
    percentBlocked: Math.round((counts.blocked / total) * 100),
    percentInProgress: Math.round((counts.inProgress / total) * 100),
    percentReview: Math.round((counts.review / total) * 100),
    percentNotStarted: Math.round((counts.notStarted / total) * 100),
    escalations: counts.escalation,
    totalItems: total,
  };
}

/**
 * Aggregate emoji counts from multiple sources
 * @param {Array<Object>} countsList - Array of emoji count objects
 * @returns {Object} - Aggregated counts
 */
function aggregateCounts(countsList) {
  const aggregated = {
    completed: 0,
    blocked: 0,
    escalation: 0,
    inProgress: 0,
    review: 0,
    notStarted: 0,
    total: 0,
  };

  for (const counts of countsList) {
    for (const key of Object.keys(aggregated)) {
      aggregated[key] += counts[key] || 0;
    }
  }

  return aggregated;
}

/**
 * Generate a markdown report from heatmap data
 * @param {Object} heatmap - Heatmap summary object
 * @param {string} title - Report title
 * @returns {string} - Markdown formatted report
 */
function generateMarkdownReport(heatmap, title = "Emoji Heatmap Report") {
  const progressBar = (percent) => {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  };

  return `## 📊 ${title}

| Status | Count | Progress |
|--------|-------|----------|
| ✅ Complete | ${heatmap.percentComplete}% | ${progressBar(heatmap.percentComplete)} |
| 🟡 In Progress | ${heatmap.percentInProgress}% | ${progressBar(heatmap.percentInProgress)} |
| 🤔 Review | ${heatmap.percentReview}% | ${progressBar(heatmap.percentReview)} |
| ❌ Blocked | ${heatmap.percentBlocked}% | ${progressBar(heatmap.percentBlocked)} |
| ⬜ Not Started | ${heatmap.percentNotStarted}% | ${progressBar(heatmap.percentNotStarted)} |

### 🛟 Escalations: ${heatmap.escalations}
### 📦 Total Items: ${heatmap.totalItems}
`;
}

/**
 * Convert GitHub reaction to emoji category
 * @param {string} reaction - GitHub reaction name
 * @returns {string|null} - Category name or null
 */
function reactionToCategory(reaction) {
  const emoji = REACTION_TO_EMOJI[reaction];
  if (!emoji) return null;

  for (const [category, emojis] of Object.entries(EMOJI_CATEGORIES)) {
    if (emojis.includes(emoji)) {
      return category;
    }
  }

  // Special mappings for reactions
  if (reaction === "rocket" || reaction === "hooray") return "completed";
  if (reaction === "-1" || reaction === "confused") return "blocked";
  if (reaction === "eyes") return "review";

  return null;
}

module.exports = {
  EMOJI_CATEGORIES,
  REACTION_TO_EMOJI,
  countEmojis,
  calculatePercentComplete,
  generateHeatmap,
  aggregateCounts,
  generateMarkdownReport,
  reactionToCategory,
};
