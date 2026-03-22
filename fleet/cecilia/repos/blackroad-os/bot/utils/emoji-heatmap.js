// bot/utils/emoji-heatmap.js

module.exports = function calculateEmojiStats(reactions = []) {
  const stats = {
    "✅": 0,
    "❌": 0,
    "🛟": 0,
    "🤔": 0,
    total: 0,
  };

  reactions.forEach((reaction) => {
    const content = reaction?.content;
    if (content && content in stats) {
      stats[content]++;
      stats.total++;
    }
  });

  const percent = (count) =>
    stats.total > 0 ? `${Math.round((count / stats.total) * 100)}%` : "0%";

  return {
    total: stats.total,
    confirmed: stats["✅"],
    blocked: stats["❌"],
    escalated: stats["🛟"],
    review: stats["🤔"],
    report: {
      "✅": percent(stats["✅"]),
      "❌": percent(stats["❌"]),
      "🛟": percent(stats["🛟"]),
      "🤔": percent(stats["🤔"]),
    },
  };
};
