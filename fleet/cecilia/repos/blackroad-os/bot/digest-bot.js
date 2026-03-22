// bot/digest-bot.js

/**
 * Weekly Emoji Digest Bot
 * Calculates emoji reaction statistics and generates a markdown digest.
 * Runs via GitHub Actions every Monday.
 */

const fs = require("fs");

/**
 * Parses reaction data and calculates statistics.
 * @param {Array} reactions - Array of reaction objects with content field
 * @returns {Object} - Statistics object
 */
function calculateEmojiStats(reactions) {
  const emojiCounts = {};
  const agentCounts = {};
  const blockedIssues = {};

  // Count reactions by emoji type
  for (const reaction of reactions) {
    const emoji = reaction.content;
    emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;

    // Track agent activity if available
    if (reaction.user) {
      agentCounts[reaction.user] = (agentCounts[reaction.user] || 0) + 1;
    }

    // Track blocked issues
    if (emoji === "-1" || emoji === "confused") {
      const issueKey = reaction.issue || "unknown";
      blockedIssues[issueKey] = (blockedIssues[issueKey] || 0) + 1;
    }
  }

  const total = reactions.length;

  // Map internal reaction names to display emojis
  const emojiMap = {
    "+1": "✅",
    hooray: "✅",
    rocket: "✅",
    "-1": "❌",
    confused: "❌",
    eyes: "👀",
    heart: "❤️",
    laugh: "😄",
    // Custom mappings for project status
    rotating_light: "🛟",
    thinking_face: "🤔",
  };

  // Calculate percentages and format
  const stats = Object.entries(emojiCounts)
    .map(([emoji, count]) => ({
      emoji: emojiMap[emoji] || emoji,
      rawEmoji: emoji,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Find most active agent
  const mostActiveAgent = Object.entries(agentCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Find most blocked issue
  const mostBlocked = Object.entries(blockedIssues).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    total,
    stats,
    mostActiveAgent: mostActiveAgent ? mostActiveAgent[0] : null,
    mostBlocked: mostBlocked ? mostBlocked[0] : null,
    blockedCount: stats
      .filter((s) => s.emoji === "❌")
      .reduce((acc, s) => acc + s.count, 0),
    escalationCount: stats
      .filter((s) => s.rawEmoji === "rotating_light")
      .reduce((acc, s) => acc + s.count, 0),
    reviewCount: stats
      .filter((s) => s.rawEmoji === "thinking_face")
      .reduce((acc, s) => acc + s.count, 0),
  };
}

/**
 * Generates a markdown digest from the statistics.
 * @param {Object} stats - Statistics object from calculateEmojiStats
 * @param {Date} date - Date for the digest header
 * @returns {string} - Markdown formatted digest
 */
function generateDigestMarkdown(stats, date = new Date()) {
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let markdown = `# 📊 Weekly Agent Emoji Digest (${dateStr})\n\n`;

  markdown += `| Emoji | Count | % |\n`;
  markdown += `|-------|-------|----|\n`;

  // Show top reactions (limit to 10)
  const topStats = stats.stats.slice(0, 10);
  for (const stat of topStats) {
    markdown += `| ${stat.emoji} | ${stat.count} | ${stat.percentage}% |\n`;
  }

  markdown += `\n`;

  // Add summary metrics
  if (stats.mostActiveAgent) {
    markdown += `🔥 Most active agent: \`${stats.mostActiveAgent}\`\n`;
  }

  if (stats.mostBlocked) {
    markdown += `🛑 Most blocked: \`${stats.mostBlocked}\`\n`;
  }

  if (stats.escalationCount > 0) {
    markdown += `🛟 Escalations: ${stats.escalationCount} cases\n`;
  }

  if (stats.reviewCount > 0) {
    markdown += `🤔 Review queue: ${stats.reviewCount} issues\n`;
  }

  return markdown;
}

/**
 * Fetches reactions from GitHub API for a repository.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Array of reactions
 */
async function fetchReactions(owner, repo, days = 7) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Fetch recent issues
  const issuesResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=all&since=${since.toISOString()}&per_page=100`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!issuesResponse.ok) {
    throw new Error(`Failed to fetch issues: ${issuesResponse.status}`);
  }

  const issues = await issuesResponse.json();
  const allReactions = [];

  // Fetch reactions for each issue
  for (const issue of issues) {
    const reactionsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/reactions`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (reactionsResponse.ok) {
      const reactions = await reactionsResponse.json();
      for (const reaction of reactions) {
        allReactions.push({
          content: reaction.content,
          user: reaction.user?.login,
          issue: issue.title,
          created_at: reaction.created_at,
        });
      }
    }
  }

  // Filter reactions to only include those from the specified time period
  const sinceTimestamp = since.getTime();
  return allReactions.filter(
    (r) => new Date(r.created_at).getTime() >= sinceTimestamp
  );
}

/**
 * Posts a comment to a GitHub issue.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number to comment on
 * @param {string} body - Comment body
 */
async function postDigestComment(owner, repo, issueNumber, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post comment: ${response.status} - ${error}`);
  }

  console.log("✅ Digest comment posted successfully");
  return response.json();
}

/**
 * Main function to run the digest bot.
 */
async function main() {
  const owner = process.env.REPO_OWNER || "BlackRoad-OS";
  const repo = process.env.REPO_NAME || "blackroad-os";
  const digestIssueNumber = parseInt(process.env.DIGEST_ISSUE_NUMBER || "1", 10);
  const daysToLookBack = parseInt(process.env.DAYS_TO_LOOK_BACK || "7", 10);

  console.log("📊 Starting Weekly Emoji Digest Bot...");
  console.log(`Repository: ${owner}/${repo}`);
  console.log(`Looking back ${daysToLookBack} days`);

  try {
    // Fetch reactions
    const reactions = await fetchReactions(owner, repo, daysToLookBack);
    console.log(`Found ${reactions.length} reactions`);

    // Calculate statistics
    const stats = calculateEmojiStats(reactions);

    // Generate markdown
    const digest = generateDigestMarkdown(stats);
    console.log("\n--- Generated Digest ---");
    console.log(digest);

    // Post to tracking issue if configured
    if (digestIssueNumber && process.env.POST_COMMENT === "true") {
      await postDigestComment(owner, repo, digestIssueNumber, digest);
    }

    // Also save to file for reference
    const outputPath = process.env.OUTPUT_PATH || "./digest.md";
    fs.writeFileSync(outputPath, digest);
    console.log(`\n✅ Digest saved to ${outputPath}`);
  } catch (error) {
    console.error("❌ Error running digest bot:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  calculateEmojiStats,
  generateDigestMarkdown,
  fetchReactions,
  postDigestComment,
};
