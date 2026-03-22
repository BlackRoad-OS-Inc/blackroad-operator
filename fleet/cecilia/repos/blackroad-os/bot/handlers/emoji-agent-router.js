const syncStatus = require("./project-status-sync");

module.exports = async function routeEmoji({ emoji, repo, issue }) {
  switch (emoji) {
    case "✅":
    case "🟡":
    case "❌":
    case "⬜":
      return await syncStatus(emoji, issue.number, repo);
    case "🛟":
      console.log("🛟 Escalation triggered — notify guardian agent");
      break;
    case "🤔":
      console.log("🤔 Assigning reviewer");
      break;
    default:
      console.log("No handler for emoji:", emoji);
  }
};
