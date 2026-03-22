#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_DIR = path.join(__dirname, "..", "agents");
const WORKFLOWS_DIR = path.join(__dirname, "..", ".github", "workflows");
const DOCS_DIR = path.join(__dirname, "..", "docs", "agents");

function toId(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function toTitle(id) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const rawName = process.argv[2];

if (!rawName) {
  console.error("Please provide an agent name");
  process.exit(1);
}

const agentId = toId(rawName);
const displayName = toTitle(agentId);

const agentJsonPath = path.join(AGENTS_DIR, `${agentId}.agent.json`);
const promptPath = path.join(AGENTS_DIR, `${agentId}.prompt.txt`);
const workflowPath = path.join(WORKFLOWS_DIR, `${agentId}.workflow.yml`);
const docsPath = path.join(DOCS_DIR, `${agentId}.mdx`);

fs.mkdirSync(AGENTS_DIR, { recursive: true });
fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });

const agentData = {
  id: agentId,
  name: displayName,
  role: "worker",
  traits: ["emoji-native", "autonomous"],
  inherits_from: "base-agent",
};

fs.writeFileSync(agentJsonPath, JSON.stringify(agentData, null, 2) + "\n");
fs.writeFileSync(promptPath, `SYSTEM:\nYou are the ${displayName} agent. Your job is to...`);
fs.writeFileSync(
  workflowPath,
  `name: ${displayName} Workflow\non:\n  workflow_dispatch:\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "${displayName} agent triggered!"`
);
fs.writeFileSync(
  docsPath,
  `# ${displayName} Agent\n\nAuto-generated documentation for ${displayName}.\n`
);

console.log(`Created agent: ${agentId}`);
console.log(agentJsonPath);
console.log(promptPath);
console.log(workflowPath);
console.log(docsPath);
