// bot/agent-math-utils.js
// Utility functions for tracking agent activity and emoji heatmaps

/**
 * Track agent trigger counts
 */
class AgentTracker {
  constructor() {
    this.triggers = {};
  }

  /**
   * Record an agent trigger
   * @param {string} agentName - The name of the agent triggered
   */
  recordTrigger(agentName) {
    if (!this.triggers[agentName]) {
      this.triggers[agentName] = 0;
    }
    this.triggers[agentName]++;
  }

  /**
   * Get trigger count for a specific agent
   * @param {string} agentName - The name of the agent
   * @returns {number} - The trigger count
   */
  getTriggerCount(agentName) {
    return this.triggers[agentName] || 0;
  }

  /**
   * Get all trigger counts
   * @returns {Object} - All agent trigger counts
   */
  getAllTriggers() {
    return { ...this.triggers };
  }

  /**
   * Reset all trigger counts
   */
  reset() {
    this.triggers = {};
  }
}

/**
 * Track emoji usage and generate heatmaps
 */
class EmojiHeatmap {
  constructor() {
    this.counts = {};
    this.total = 0;
  }

  /**
   * Record an emoji occurrence
   * @param {string} emoji - The emoji character
   * @param {number} [count=1] - Number of occurrences to add
   */
  record(emoji, count = 1) {
    if (!this.counts[emoji]) {
      this.counts[emoji] = 0;
    }
    this.counts[emoji] += count;
    this.total += count;
  }

  /**
   * Get count for a specific emoji
   * @param {string} emoji - The emoji character
   * @returns {number} - The count
   */
  getCount(emoji) {
    return this.counts[emoji] || 0;
  }

  /**
   * Get percentage for a specific emoji
   * @param {string} emoji - The emoji character
   * @returns {number} - The percentage (0-100)
   */
  getPercentage(emoji) {
    if (this.total === 0) return 0;
    return ((this.counts[emoji] || 0) / this.total) * 100;
  }

  /**
   * Get all emoji counts
   * @returns {Object} - All emoji counts
   */
  getAllCounts() {
    return { ...this.counts };
  }

  /**
   * Get percentage breakdown for all emojis
   * @returns {Object} - Emoji to percentage mapping
   */
  getPercentageBreakdown() {
    const breakdown = {};
    for (const emoji of Object.keys(this.counts)) {
      breakdown[emoji] = this.getPercentage(emoji);
    }
    return breakdown;
  }

  /**
   * Get total count
   * @returns {number} - Total emoji count
   */
  getTotal() {
    return this.total;
  }

  /**
   * Reset heatmap
   */
  reset() {
    this.counts = {};
    this.total = 0;
  }
}

/**
 * Generate a visual progress bar using emojis
 * @param {Object} options - Progress bar options
 * @param {number} options.completed - Number of completed items
 * @param {number} options.inProgress - Number of in-progress items
 * @param {number} options.total - Total number of items
 * @param {number} [options.width=10] - Width of progress bar in characters
 * @returns {string} - Visual progress bar
 */
function generateProgressBar({ completed, inProgress, total, width = 10 }) {
  if (total === 0) return "⬜".repeat(width);

  // Clamp values to prevent overflow when completed + inProgress > total
  const safeCompleted = Math.min(completed, total);
  const safeInProgress = Math.min(inProgress, total - safeCompleted);

  const completedRatio = safeCompleted / total;
  const inProgressRatio = safeInProgress / total;

  const completedSlots = Math.round(completedRatio * width);
  const inProgressSlots = Math.round(inProgressRatio * width);
  const remainingSlots = width - completedSlots - inProgressSlots;

  return (
    "✅".repeat(completedSlots) +
    "🟡".repeat(inProgressSlots) +
    "⬜".repeat(Math.max(0, remainingSlots))
  );
}

/**
 * Calculate sprint progress statistics
 * @param {Array<Object>} items - Array of sprint items with status
 * @returns {Object} - Sprint statistics
 */
function calculateSprintProgress(items) {
  const stats = {
    total: items.length,
    done: 0,
    inProgress: 0,
    notStarted: 0,
    blocked: 0,
    needsReview: 0,
    escalation: 0
  };

  for (const item of items) {
    const status = item.status?.toLowerCase();
    switch (status) {
      case "done":
        stats.done++;
        break;
      case "in progress":
        stats.inProgress++;
        break;
      case "not started":
        stats.notStarted++;
        break;
      case "blocked":
        stats.blocked++;
        break;
      case "needs review":
        stats.needsReview++;
        break;
      case "escalation":
        stats.escalation++;
        break;
      default:
        stats.notStarted++;
    }
  }

  stats.completionPercentage =
    stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
  stats.progressBar = generateProgressBar({
    completed: stats.done,
    inProgress: stats.inProgress,
    total: stats.total
  });

  return stats;
}

/**
 * Format emoji statistics as a human-readable report
 * @param {EmojiHeatmap} heatmap - The emoji heatmap instance
 * @returns {string} - Formatted report
 */
function formatHeatmapReport(heatmap) {
  const breakdown = heatmap.getPercentageBreakdown();
  const lines = ["📊 Emoji Heatmap Report", ""];

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  for (const [emoji, percentage] of entries) {
    const count = heatmap.getCount(emoji);
    lines.push(`${emoji} ${percentage.toFixed(1)}% (${count} occurrences)`);
  }

  lines.push("");
  lines.push(`Total: ${heatmap.getTotal()} emojis tracked`);

  return lines.join("\n");
}

module.exports = {
  AgentTracker,
  EmojiHeatmap,
  generateProgressBar,
  calculateSprintProgress,
  formatHeatmapReport
};
