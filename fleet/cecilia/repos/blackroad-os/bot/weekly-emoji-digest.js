// bot/weekly-emoji-digest.js
// 📅 Weekly Auto-Generated Emoji Digest - Posts agent heatmap reports

const {
  countEmojis,
  generateHeatmap,
  aggregateCounts,
  generateMarkdownReport,
} = require("./emoji-heatmap");

const { ADD_ISSUE_COMMENT } = require("./graphql-mutation-handler");

/**
 * GraphQL query to get repository issues with reactions
 */
const GET_REPO_ISSUES_WITH_REACTIONS = `
  query GetRepoIssuesWithReactions(
    $owner: String!
    $repo: String!
    $after: String
    $since: DateTime
  ) {
    repository(owner: $owner, name: $repo) {
      issues(first: 50, after: $after, filterBy: { since: $since }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          body
          reactions(first: 100) {
            nodes {
              content
            }
          }
          comments(first: 50) {
            nodes {
              body
              reactions(first: 50) {
                nodes {
                  content
                }
              }
            }
          }
          labels(first: 10) {
            nodes {
              name
            }
          }
          assignees(first: 5) {
            nodes {
              login
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query to find the digest issue
 */
const FIND_DIGEST_ISSUE = `
  query FindDigestIssue($owner: String!, $repo: String!, $title: String!) {
    repository(owner: $owner, name: $repo) {
      issues(
        first: 1
        filterBy: { labels: ["emoji-digest"] }
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        nodes {
          id
          number
          title
        }
      }
    }
  }
`;

/**
 * Map GitHub reaction content to emoji for counting
 */
const REACTION_CONTENT_TO_EMOJI = {
  THUMBS_UP: "✅",
  THUMBS_DOWN: "❌",
  LAUGH: "😄",
  HOORAY: "✅",
  CONFUSED: "❌",
  HEART: "❤️",
  ROCKET: "✅",
  EYES: "🤔",
};

/**
 * Agent labels to track
 */
const AGENT_LABELS = [
  "builder-agent",
  "planner-agent",
  "guardian-agent",
  "observer-agent",
  "human",
];

/**
 * Count reactions and convert to emoji counts
 * @param {Array} reactions - Array of reaction objects
 * @returns {Object} - Emoji counts
 */
function countReactions(reactions) {
  const counts = {
    completed: 0,
    blocked: 0,
    escalation: 0,
    inProgress: 0,
    review: 0,
    notStarted: 0,
    total: 0,
  };

  for (const reaction of reactions) {
    const emoji = REACTION_CONTENT_TO_EMOJI[reaction.content];
    if (emoji) {
      const textCounts = countEmojis(emoji);
      for (const key of Object.keys(counts)) {
        counts[key] += textCounts[key] || 0;
      }
    }
  }

  return counts;
}

/**
 * Extract all emojis and reactions from an issue
 * @param {Object} issue - Issue object from GraphQL
 * @returns {Object} - Aggregated emoji counts
 */
function extractIssueEmojis(issue) {
  const allCounts = [];

  // Count emojis in issue body
  if (issue.body) {
    allCounts.push(countEmojis(issue.body));
  }

  // Count reactions on issue
  if (issue.reactions?.nodes) {
    allCounts.push(countReactions(issue.reactions.nodes));
  }

  // Count emojis and reactions in comments
  if (issue.comments?.nodes) {
    for (const comment of issue.comments.nodes) {
      if (comment.body) {
        allCounts.push(countEmojis(comment.body));
      }
      if (comment.reactions?.nodes) {
        allCounts.push(countReactions(comment.reactions.nodes));
      }
    }
  }

  return aggregateCounts(allCounts);
}

/**
 * Group issues by agent based on labels
 * @param {Array} issues - Array of issue objects
 * @returns {Object} - Issues grouped by agent
 */
function groupIssuesByAgent(issues) {
  const groups = {};

  // Initialize groups for known agents
  for (const agent of AGENT_LABELS) {
    groups[agent] = [];
  }
  groups.unassigned = [];

  for (const issue of issues) {
    const labels = issue.labels?.nodes?.map((l) => l.name) || [];
    const agentLabel = labels.find((l) => AGENT_LABELS.includes(l));

    if (agentLabel) {
      groups[agentLabel].push(issue);
    } else {
      groups.unassigned.push(issue);
    }
  }

  return groups;
}

/**
 * Generate agent-specific heatmap data
 * @param {Object} groups - Issues grouped by agent
 * @returns {Object} - Heatmap data per agent
 */
function generateAgentHeatmaps(groups) {
  const heatmaps = {};

  for (const [agent, issues] of Object.entries(groups)) {
    if (issues.length === 0) continue;

    const counts = aggregateCounts(
      issues.map((issue) => extractIssueEmojis(issue))
    );
    heatmaps[agent] = {
      issueCount: issues.length,
      counts,
      heatmap: generateHeatmap(counts),
    };
  }

  return heatmaps;
}

/**
 * Generate weekly digest markdown report
 * @param {Object} data - Digest data
 * @returns {string} - Markdown report
 */
function generateDigestMarkdown(data) {
  const {
    repoName,
    weekStart,
    weekEnd,
    totalIssues,
    overallHeatmap,
    agentHeatmaps,
    topEscalations,
  } = data;

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  let markdown = `# 📊 Weekly Emoji Digest

**Repository:** ${repoName}  
**Period:** ${formatDate(weekStart)} → ${formatDate(weekEnd)}  
**Total Issues Analyzed:** ${totalIssues}

---

## 🌡️ Overall Status Heatmap

${generateMarkdownReport(overallHeatmap, "Repository Summary")}

---

## 🤖 Agent Performance

`;

  // Add per-agent heatmaps
  for (const [agent, data] of Object.entries(agentHeatmaps)) {
    const agentEmoji =
      agent === "builder-agent"
        ? "🏗️"
        : agent === "planner-agent"
        ? "📋"
        : agent === "guardian-agent"
        ? "🛡️"
        : agent === "observer-agent"
        ? "👁️"
        : agent === "human"
        ? "🧑"
        : "📦";

    markdown += `### ${agentEmoji} ${agent}
- **Issues:** ${data.issueCount}
- **% Complete:** ${data.heatmap.percentComplete}%
- **Escalations:** ${data.heatmap.escalations}
- **Blocked:** ${data.heatmap.percentBlocked}%

`;
  }

  // Add escalations section if any
  if (topEscalations && topEscalations.length > 0) {
    markdown += `---

## 🛟 Active Escalations

| Issue | Title | Assigned To |
|-------|-------|-------------|
`;
    for (const esc of topEscalations) {
      const assignees =
        esc.assignees?.nodes?.map((a) => `@${a.login}`).join(", ") ||
        "Unassigned";
      markdown += `| #${esc.number} | ${esc.title} | ${assignees} |\n`;
    }
  }

  markdown += `
---

## 📈 Emoji Legend

| Emoji | Meaning |
|-------|---------|
| ✅ | Completed |
| 🟡 | In Progress |
| ❌ | Blocked |
| 🤔 | Needs Review |
| 🛟 | Escalation |
| ⬜ | Not Started |

---

*Generated automatically by Emoji Bot 🤖*  
*Next digest: ${formatDate(new Date(weekEnd.getTime() + 7 * 24 * 60 * 60 * 1000))}*
`;

  return markdown;
}

/**
 * Create a weekly emoji digest generator
 * @param {Object} octokit - GitHub Octokit instance
 * @returns {Object} - Digest methods
 */
function createWeeklyEmojiDigest(octokit) {
  /**
   * Fetch all issues from the past week
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} - Array of issues
   */
  async function fetchWeeklyIssues(owner, repo) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allIssues = [];
    let after = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const result = await octokit.graphql(GET_REPO_ISSUES_WITH_REACTIONS, {
        owner,
        repo,
        after,
        since: oneWeekAgo.toISOString(),
      });

      const issues = result.repository?.issues?.nodes || [];
      allIssues.push(...issues);

      hasNextPage = result.repository?.issues?.pageInfo?.hasNextPage || false;
      after = result.repository?.issues?.pageInfo?.endCursor;
    }

    return allIssues;
  }

  /**
   * Find or create digest issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Digest issue
   */
  async function findDigestIssue(owner, repo) {
    const result = await octokit.graphql(FIND_DIGEST_ISSUE, {
      owner,
      repo,
      title: "emoji-digest",
    });

    return result.repository?.issues?.nodes?.[0] || null;
  }

  /**
   * Post digest comment to issue
   * @param {string} issueId - Issue node ID
   * @param {string} markdown - Markdown content
   * @returns {Promise<Object>} - Comment result
   */
  async function postDigestComment(issueId, markdown) {
    const result = await octokit.graphql(ADD_ISSUE_COMMENT, {
      subjectId: issueId,
      body: markdown,
    });

    return result.addComment.commentEdge.node;
  }

  /**
   * Generate weekly digest for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Digest data
   */
  async function generateWeeklyDigest(owner, repo) {
    const issues = await fetchWeeklyIssues(owner, repo);

    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Extract emoji counts from all issues once (optimization: reuse for escalation check)
    const issuesWithCounts = issues.map((issue) => ({
      issue,
      counts: extractIssueEmojis(issue),
    }));
    
    const allCounts = issuesWithCounts.map(({ counts }) => counts);
    const overallCounts = aggregateCounts(allCounts);
    const overallHeatmap = generateHeatmap(overallCounts);

    // Group by agent and generate per-agent heatmaps
    const agentGroups = groupIssuesByAgent(issues);
    const agentHeatmaps = generateAgentHeatmaps(agentGroups);

    // Find issues with escalations (reuse pre-computed counts)
    const topEscalations = issuesWithCounts
      .filter(({ counts }) => counts.escalation > 0)
      .map(({ issue }) => issue)
      .slice(0, 5);

    const digestData = {
      repoName: `${owner}/${repo}`,
      weekStart,
      weekEnd,
      totalIssues: issues.length,
      overallCounts,
      overallHeatmap,
      agentHeatmaps,
      topEscalations,
    };

    digestData.markdown = generateDigestMarkdown(digestData);

    return digestData;
  }

  /**
   * Generate and post weekly digest
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Result
   */
  async function generateAndPostDigest(owner, repo) {
    // Generate digest
    const digestData = await generateWeeklyDigest(owner, repo);

    // Find digest issue
    const digestIssue = await findDigestIssue(owner, repo);

    if (!digestIssue) {
      return {
        success: false,
        reason: "No emoji-digest issue found. Create an issue with 'emoji-digest' label.",
        digest: digestData,
      };
    }

    // Post comment
    const comment = await postDigestComment(digestIssue.id, digestData.markdown);

    return {
      success: true,
      issueNumber: digestIssue.number,
      commentId: comment.id,
      digest: digestData,
    };
  }

  return {
    fetchWeeklyIssues,
    findDigestIssue,
    postDigestComment,
    generateWeeklyDigest,
    generateAndPostDigest,
  };
}

module.exports = {
  GET_REPO_ISSUES_WITH_REACTIONS,
  FIND_DIGEST_ISSUE,
  REACTION_CONTENT_TO_EMOJI,
  AGENT_LABELS,
  countReactions,
  extractIssueEmojis,
  groupIssuesByAgent,
  generateAgentHeatmaps,
  generateDigestMarkdown,
  createWeeklyEmojiDigest,
};
