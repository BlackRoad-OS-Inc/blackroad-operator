// bot/handlers/digest-bot.js

/**
 * Weekly Emoji Digest Bot
 * Calculates reaction statistics and generates a markdown digest report.
 */

/**
 * Fetches issues with reaction data from the repository.
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {string} since - ISO 8601 date string to filter issues updated since this date
 */
async function fetchIssuesWithReactions(owner, repo, since) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const query = `
    query GetIssuesWithReactions($owner: String!, $repo: String!, $since: DateTime) {
      repository(owner: $owner, name: $repo) {
        issues(first: 100, filterBy: { since: $since }, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            number
            title
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
            reactions(first: 100) {
              nodes {
                content
                user {
                  login
                }
              }
            }
            comments(first: 50) {
              nodes {
                author {
                  login
                }
                reactions(first: 100) {
                  nodes {
                    content
                    user {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { owner, repo, since };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.repository.issues.nodes;
}

/**
 * Maps GitHub reaction content to emoji characters.
 */
const REACTION_EMOJI_MAP = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  LAUGH: "😄",
  HOORAY: "🎉",
  CONFUSED: "😕",
  HEART: "❤️",
  ROCKET: "🚀",
  EYES: "👀",
};

/**
 * Maps emoji statuses used in the system.
 */
const STATUS_EMOJI_MAP = {
  "✅": "Done",
  "❌": "Blocked",
  "🛟": "Escalation",
  "🤔": "Needs Review",
};

/**
 * Calculates reaction statistics from issues data.
 */
function calculateReactionStats(issues) {
  const stats = {
    total: 0,
    byEmoji: {},
    byAgent: {},
    blockedIssues: [],
    escalations: [],
    reviewQueue: [],
    mostActiveAgent: null,
    mostBlockedRepo: null,
  };

  const agentCounts = {};
  const issueLabels = {};

  for (const issue of issues) {
    // Process issue reactions
    for (const reaction of issue.reactions?.nodes || []) {
      stats.total++;
      const emoji = REACTION_EMOJI_MAP[reaction.content] || reaction.content;
      stats.byEmoji[emoji] = (stats.byEmoji[emoji] || 0) + 1;

      // Track agent activity
      const agent = reaction.user?.login || "unknown";
      agentCounts[agent] = (agentCounts[agent] || 0) + 1;

      // Track blocked/escalation/review based on reaction type
      if (reaction.content === "THUMBS_DOWN" || reaction.content === "CONFUSED") {
        if (!stats.blockedIssues.includes(issue.number)) {
          stats.blockedIssues.push(issue.number);
        }
      }
    }

    // Process comment reactions
    for (const comment of issue.comments?.nodes || []) {
      for (const reaction of comment.reactions?.nodes || []) {
        stats.total++;
        const emoji = REACTION_EMOJI_MAP[reaction.content] || reaction.content;
        stats.byEmoji[emoji] = (stats.byEmoji[emoji] || 0) + 1;

        const agent = reaction.user?.login || "unknown";
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      }
    }

    // Track issues by label for most blocked detection
    for (const label of issue.labels?.nodes || []) {
      issueLabels[label.name] = (issueLabels[label.name] || 0) + 1;
    }
  }

  // Find most active agent
  let maxAgentCount = 0;
  for (const [agent, count] of Object.entries(agentCounts)) {
    if (count > maxAgentCount) {
      maxAgentCount = count;
      stats.mostActiveAgent = agent;
    }
  }

  // Find most blocked (labeled) area
  let maxLabelCount = 0;
  for (const [label, count] of Object.entries(issueLabels)) {
    if (count > maxLabelCount) {
      maxLabelCount = count;
      stats.mostBlockedRepo = label;
    }
  }

  stats.byAgent = agentCounts;
  return stats;
}

/**
 * Generates a markdown digest from the calculated statistics.
 */
function generateDigestMarkdown(stats, dateStr) {
  const lines = [];

  lines.push(`# 📊 Weekly Agent Emoji Digest (${dateStr})`);
  lines.push("");
  lines.push("| Emoji | Count | % |");
  lines.push("|-------|-------|---|");

  // Sort emojis by count descending
  const sortedEmojis = Object.entries(stats.byEmoji)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10

  for (const [emoji, count] of sortedEmojis) {
    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    lines.push(`| ${emoji} | ${count} | ${percentage}% |`);
  }

  lines.push("");
  lines.push(`**Total Reactions:** 🧮 ${stats.total}`);
  lines.push("");

  if (stats.mostActiveAgent) {
    lines.push(`🔥 Most active agent: \`@${stats.mostActiveAgent}\``);
  }

  if (stats.mostBlockedRepo) {
    lines.push(`🛑 Most active label: \`${stats.mostBlockedRepo}\``);
  }

  if (stats.blockedIssues.length > 0) {
    lines.push(`❌ Blocked issues: ${stats.blockedIssues.length}`);
  }

  if (stats.escalations.length > 0) {
    lines.push(`🛟 Escalations: ${stats.escalations.length}`);
  }

  if (stats.reviewQueue.length > 0) {
    lines.push(`🤔 Review queue: ${stats.reviewQueue.length}`);
  }

  return lines.join("\n");
}

/**
 * Posts a comment to a GitHub issue.
 */
async function postDigestComment(owner, repo, issueNumber, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Digest comment posted: ${data.html_url}`);
  return data;
}

/**
 * Main function to generate and post the weekly digest.
 */
async function runWeeklyDigest(owner, repo, digestIssueNumber) {
  // Calculate date range for the past week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  console.log(`📊 Generating weekly digest for ${owner}/${repo}...`);
  console.log(`📅 Date range: ${weekAgo.toISOString()} to ${now.toISOString()}`);

  // Fetch issues with reactions from the past week
  const issues = await fetchIssuesWithReactions(owner, repo, weekAgo.toISOString());
  console.log(`📦 Fetched ${issues.length} issues`);

  // Calculate statistics
  const stats = calculateReactionStats(issues);
  console.log(`🧮 Total reactions: ${stats.total}`);

  // Generate markdown digest
  const markdown = generateDigestMarkdown(stats, dateStr);
  console.log(`📝 Generated digest:\n${markdown}`);

  // Post comment if digest issue number is provided
  if (digestIssueNumber) {
    await postDigestComment(owner, repo, digestIssueNumber, markdown);
  }

  return { stats, markdown };
}

module.exports = {
  fetchIssuesWithReactions,
  calculateReactionStats,
  generateDigestMarkdown,
  postDigestComment,
  runWeeklyDigest,
  REACTION_EMOJI_MAP,
  STATUS_EMOJI_MAP,
};
