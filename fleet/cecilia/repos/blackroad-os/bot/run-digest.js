// bot/run-digest.js
// 📊 Runner script for weekly emoji digest

const { createWeeklyEmojiDigest } = require("./weekly-emoji-digest");

async function main() {
  // Check for required environment variables
  const token = process.env.GITHUB_TOKEN;
  const dryRun = process.env.DRY_RUN === "true";
  
  // Support GitHub Enterprise with GITHUB_API_URL, default to public GitHub
  const apiUrl = process.env.GITHUB_API_URL || "https://api.github.com";
  const graphqlUrl = `${apiUrl}/graphql`;

  if (!token) {
    console.error("❌ GITHUB_TOKEN environment variable is required");
    process.exit(1);
  }

  // Parse repository from GITHUB_REPOSITORY env var
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    console.error("❌ GITHUB_REPOSITORY environment variable is required");
    process.exit(1);
  }

  const [owner, repoName] = repo.split("/");

  console.log(`📊 Generating weekly emoji digest for ${owner}/${repoName}`);
  console.log(`🔧 Dry run: ${dryRun}`);
  console.log(`🌐 API URL: ${apiUrl}`);

  // Create a minimal octokit-like client
  const octokit = {
    graphql: async (query, variables) => {
      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(
          `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
        );
      }

      return result.data;
    },
  };

  const digest = createWeeklyEmojiDigest(octokit);

  try {
    if (dryRun) {
      // Just generate and print the digest
      const data = await digest.generateWeeklyDigest(owner, repoName);
      console.log("\n📝 Generated Digest:\n");
      console.log(data.markdown);
      console.log("\n✅ Dry run complete - no comment posted");
    } else {
      // Generate and post the digest
      const result = await digest.generateAndPostDigest(owner, repoName);

      if (result.success) {
        console.log(`✅ Digest posted to issue #${result.issueNumber}`);
        console.log(`📝 Comment ID: ${result.commentId}`);
      } else {
        console.log(`⚠️ Could not post digest: ${result.reason}`);
        console.log("\n📝 Generated Digest:\n");
        console.log(result.digest.markdown);
      }
    }
  } catch (error) {
    console.error("❌ Error generating digest:", error.message);
    process.exit(1);
  }
}

main();
