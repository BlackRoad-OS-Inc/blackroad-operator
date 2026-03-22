// bot/lucidia-spawn-runner.js
// 🧬 Lucidia Spawn Runner – Evaluates spawn rules and instantiates agents

const fs = require("fs");
const path = require("path");

/**
 * Parse YAML-like spawn rules (simple parser for our DSL)
 * @param {string} content - Raw YAML content
 * @returns {object} Parsed spawn rules
 */
function parseSpawnRules(content) {
  const rules = [];
  let currentRule = null;
  let inIf = false;
  let inThen = false;
  let inConfig = false;
  let currentIndent = 0;

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Detect rule start
    if (trimmed === "- if:") {
      if (currentRule) {
        rules.push(currentRule);
      }
      currentRule = { if: {}, then: {} };
      inIf = true;
      inThen = false;
      inConfig = false;
      continue;
    }

    if (trimmed === "then:") {
      inIf = false;
      inThen = true;
      inConfig = false;
      continue;
    }

    if (trimmed === "config:") {
      inConfig = true;
      if (!currentRule.then.config) {
        currentRule.then.config = {};
      }
      continue;
    }

    // Parse key-value pairs (supports alphanumeric, underscore, and hyphen in keys)
    const kvMatch = trimmed.match(/^([\w-]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2];

      // Handle quoted strings
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Handle arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim().replace(/^["']|["']$/g, ""));
      }

      if (inIf && currentRule) {
        currentRule.if[key] = value;
      } else if (inConfig && currentRule) {
        currentRule.then.config[key] = value;
      } else if (inThen && currentRule) {
        currentRule.then[key] = value;
      }
    }
  }

  // Push the last rule
  if (currentRule) {
    rules.push(currentRule);
  }

  return { spawn_rules: rules };
}

/**
 * Evaluate a condition against current metrics
 * @param {string} condition - Condition string (e.g., "> 10", "> 20%")
 * @param {number} value - Current metric value
 * @returns {boolean} Whether condition is met
 */
function evaluateCondition(condition, value) {
  if (typeof condition !== "string") return false;

  // Handle percentage conditions
  const isPct = condition.includes("%");
  const condStr = condition.replace("%", "").trim();

  const match = condStr.match(/^(>=|<=|!=|==|>|<|=)\s*(\d+(?:\.\d+)?)$/);
  if (!match) return false;

  const operator = match[1];
  const threshold = parseFloat(match[2]);

  switch (operator) {
    case ">":
      return value > threshold;
    case ">=":
      return value >= threshold;
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case "=":
    case "==":
      return value === threshold;
    case "!=":
      return value !== threshold;
    default:
      return false;
  }
}

/**
 * Evaluate all conditions in a rule's "if" block
 * @param {object} conditions - Object of condition key-value pairs
 * @param {object} metrics - Current system metrics
 * @returns {boolean} Whether all conditions are met
 */
function evaluateRule(conditions, metrics) {
  for (const [key, condition] of Object.entries(conditions)) {
    const value = metrics[key];
    if (value === undefined) {
      console.log(`⚠️  Metric "${key}" not found, skipping condition`);
      continue;
    }
    if (!evaluateCondition(condition, value)) {
      return false;
    }
  }
  return true;
}

/**
 * Spawn an agent based on the rule configuration
 * @param {object} spawnConfig - The "then" block from a spawn rule
 * @param {object} context - Additional context for spawning
 * @returns {object} Spawned agent info
 */
function spawnAgent(spawnConfig, context = {}) {
  const agentId = spawnConfig.spawn;
  const config = spawnConfig.config || {};

  const agent = {
    id: `${agentId}-${Date.now()}`,
    type: agentId,
    role: config.role || "worker",
    traits: config.traits || [],
    parent: config.parent || config.inherits_from || null,
    ttl: parseTTL(config.ttl),
    outputs: config.outputs || [],
    log_channel: config.log_channel || "agent.log",
    spawned_at: new Date().toISOString(),
    context,
  };

  console.log(`🧬 Spawning agent: ${agent.id}`);
  console.log(`   Role: ${agent.role}`);
  console.log(`   Traits: ${agent.traits.join(", ") || "none"}`);
  if (agent.parent) {
    console.log(`   Parent: ${agent.parent}`);
  }
  if (agent.ttl) {
    console.log(`   TTL: ${config.ttl}`);
  }

  return agent;
}

/**
 * Parse TTL string to milliseconds
 * @param {string} ttl - TTL string (e.g., "14d", "24h", "7d")
 * @returns {number|null} TTL in milliseconds or null
 */
function parseTTL(ttl) {
  if (!ttl) return null;

  const match = String(ttl).match(/^(\d+)([dhms])$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || 0);
}

/**
 * Run the spawn rule evaluator
 * @param {string} rulesPath - Path to spawn rules YAML file
 * @param {object} metrics - Current system metrics
 * @returns {object[]} Array of spawned agents
 */
function runSpawnEvaluator(rulesPath, metrics) {
  console.log("🧠 Lucidia Spawn Runner Activated");
  console.log(`📄 Loading rules from: ${rulesPath}`);

  if (!fs.existsSync(rulesPath)) {
    console.error(`🚫 Spawn rules file not found: ${rulesPath}`);
    return [];
  }

  const content = fs.readFileSync(rulesPath, "utf8");
  const parsed = parseSpawnRules(content);
  const rules = parsed.spawn_rules || [];

  console.log(`📋 Found ${rules.length} spawn rules`);
  console.log(`📊 Current metrics:`, JSON.stringify(metrics, null, 2));

  const spawnedAgents = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    console.log(`\n🔍 Evaluating rule ${i + 1}...`);

    if (evaluateRule(rule.if, metrics)) {
      console.log(`✅ Rule ${i + 1} conditions met!`);
      const agent = spawnAgent(rule.then, { rule_index: i, metrics });
      spawnedAgents.push(agent);
    } else {
      console.log(`⏭️  Rule ${i + 1} conditions not met, skipping`);
    }
  }

  console.log(`\n🧬 Total agents spawned: ${spawnedAgents.length}`);
  return spawnedAgents;
}

/**
 * Get default metrics (can be overridden by environment or external sources)
 * @returns {object} Default metrics object
 */
function getDefaultMetrics() {
  return {
    escalations_last_7_days: parseInt(process.env.ESCALATIONS_LAST_7_DAYS || "0", 10),
    digest_count: parseInt(process.env.DIGEST_COUNT || "0", 10),
    average_blocked_pct: parseFloat(process.env.AVERAGE_BLOCKED_PCT || "0"),
    created_repos_last_72h: parseInt(process.env.CREATED_REPOS_LAST_72H || "0", 10),
    overdue_issues_count: parseInt(process.env.OVERDUE_ISSUES_COUNT || "0", 10),
    emoji_threshold: parseInt(process.env.EMOJI_THRESHOLD || "0", 10),
    emoji_type: process.env.EMOJI_TYPE || "",
  };
}

// Main execution
if (require.main === module) {
  const rulesPath = path.resolve(__dirname, "../lucidia.spawn-rules.yml");
  const metrics = getDefaultMetrics();

  const spawnedAgents = runSpawnEvaluator(rulesPath, metrics);

  // Output spawned agents as JSON for downstream processing
  if (spawnedAgents.length > 0) {
    const outputPath = path.resolve(__dirname, "../spawned-agents.json");
    fs.writeFileSync(outputPath, JSON.stringify(spawnedAgents, null, 2));
    console.log(`\n📤 Spawned agents written to: ${outputPath}`);
  }
}

// Export functions for testing and external use
module.exports = {
  parseSpawnRules,
  evaluateCondition,
  evaluateRule,
  spawnAgent,
  parseTTL,
  runSpawnEvaluator,
  getDefaultMetrics,
};
