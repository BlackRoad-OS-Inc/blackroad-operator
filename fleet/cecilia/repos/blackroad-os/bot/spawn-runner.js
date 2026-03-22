const fs = require("fs");
const spawn = require("child_process").spawnSync;
const yaml = require("js-yaml");

const rules = yaml.load(fs.readFileSync("lucidia.spawn-rules.yml", "utf8"));
const signals = {
  escalations_last_7_days: 12,
  digest_count: 6,
  average_blocked_pct: 25,
  created_repos_last_72h: 8
};

function evaluateCondition(expr) {
  const [key, operator] = Object.entries(expr)[0];
  const value = parseFloat(operator.replace(/[^\d.]/g, ""));
  const signal = signals[key];

  if (!signal) return false;
  if (operator.includes(">")) return signal > value;
  if (operator.includes("<")) return signal < value;
  return false;
}

function runSpawn(agentId, config) {
  console.log(`🚀 Spawning new agent: ${agentId}`);
  spawn("node", ["scripts/spawn-agent.js", agentId], { stdio: "inherit" });

  if (config.ttl) {
    console.log(`⏳ TTL set: ${config.ttl} (manual enforcement needed)`);
  }
}

rules.spawn_rules.forEach((rule) => {
  if (evaluateCondition(rule.if)) {
    runSpawn(rule.then.spawn, rule.then.config);
  }
});
