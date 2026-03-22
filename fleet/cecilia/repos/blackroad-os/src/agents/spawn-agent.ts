#!/usr/bin/env node

/**
 * spawn-agent CLI Tool
 * 
 * Creates new agents by name, auto-fills ID, role, traits, and generates .json file
 * 
 * Usage:
 *   pnpm spawn-agent <agent-name> [options]
 *   pnpm spawn-agent scribe-support
 *   pnpm spawn-agent digest-archive --role archive --parent codex-digest-agent
 */

import * as fs from "fs";
import * as path from "path";
import type { Agent, AgentRole, AgentTrigger, AgentCapability, AgentTemplate } from "./types";

const AGENTS_DIR = path.join(__dirname, ".");
const TEMPLATE_PATH = path.join(__dirname, "templates", "base-agent.template.json");

interface SpawnOptions {
  role?: AgentRole;
  description?: string;
  parent?: string;
  traits?: string[];
  emoji?: string;
}

/**
 * Role-specific default configurations
 */
const roleDefaults: Record<AgentRole, { traits: string[]; triggers: AgentTrigger[]; capabilities: AgentCapability[] }> = {
  scribe: {
    traits: ["meticulous", "organized", "documentation-focused", "reliable"],
    triggers: [{ emoji: "📝", action: "record" }],
    capabilities: [
      { name: "audit-trail", description: "Maintains comprehensive audit trails", enabled: true }
    ]
  },
  qa: {
    traits: ["detail-oriented", "thorough", "quality-focused", "systematic"],
    triggers: [{ emoji: "🔍", action: "review" }],
    capabilities: [
      { name: "code-review", description: "Performs automated code reviews", enabled: true }
    ]
  },
  planner: {
    traits: ["strategic", "organized", "forward-thinking", "coordinating"],
    triggers: [{ emoji: "📋", action: "plan" }],
    capabilities: [
      { name: "workflow-orchestration", description: "Orchestrates complex workflows", enabled: true }
    ]
  },
  broadcast: {
    traits: ["communicative", "timely", "clear", "multi-channel"],
    triggers: [{ emoji: "📢", action: "announce" }],
    capabilities: [
      { name: "multi-channel", description: "Broadcasts to multiple channels", enabled: true }
    ]
  },
  guardian: {
    traits: ["vigilant", "protective", "responsive", "security-minded"],
    triggers: [{ emoji: "🛟", action: "escalate" }],
    capabilities: [
      { name: "escalation-handling", description: "Handles and routes escalations", enabled: true }
    ]
  },
  digest: {
    traits: ["analytical", "thorough", "summarization-focused", "knowledge-oriented"],
    triggers: [{ emoji: "📚", action: "compile-digest" }],
    capabilities: [
      { name: "digest-math", description: "Performs digest calculations", enabled: true }
    ]
  },
  archive: {
    traits: ["organized", "systematic", "preservation-focused", "indexed"],
    triggers: [{ emoji: "🗄️", action: "archive" }],
    capabilities: [
      { name: "data-archival", description: "Archives and indexes data", enabled: true }
    ]
  },
  support: {
    traits: ["helpful", "patient", "responsive", "user-focused"],
    triggers: [{ emoji: "🆘", action: "assist" }],
    capabilities: [
      { name: "user-support", description: "Provides user assistance", enabled: true }
    ]
  },
  custom: {
    traits: ["adaptable", "flexible"],
    triggers: [{ emoji: "🤖", action: "activate" }],
    capabilities: []
  }
};

/**
 * Infer role from agent name
 */
function inferRole(name: string): AgentRole {
  const normalizedName = name.toLowerCase();
  
  if (normalizedName.includes("scribe")) return "scribe";
  if (normalizedName.includes("qa") || normalizedName.includes("quality")) return "qa";
  if (normalizedName.includes("planner") || normalizedName.includes("plan")) return "planner";
  if (normalizedName.includes("broadcast") || normalizedName.includes("notify")) return "broadcast";
  if (normalizedName.includes("guardian") || normalizedName.includes("security")) return "guardian";
  if (normalizedName.includes("digest")) return "digest";
  if (normalizedName.includes("archive")) return "archive";
  if (normalizedName.includes("support") || normalizedName.includes("help")) return "support";
  
  return "custom";
}

/**
 * Generate agent ID from name
 */
function generateId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Generate human-readable name from ID
 */
function generateDisplayName(id: string): string {
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Load base template
 */
function loadBaseTemplate(): AgentTemplate {
  if (fs.existsSync(TEMPLATE_PATH)) {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    return JSON.parse(content);
  }
  
  // Default template if file doesn't exist
  return {
    templateVersion: "1.0.0",
    defaults: {
      triggers: [{ emoji: "🤖", action: "activate" }],
      capabilities: [
        { name: "self-describe", description: "Agent can describe its own purpose", enabled: true },
        { name: "issue-link", description: "Agent can be linked to GitHub issues", enabled: true },
        { name: "pr-link", description: "Agent can be linked to GitHub pull requests", enabled: true }
      ],
      metadata: { version: "1.0.0" }
    }
  };
}

/**
 * Spawn a new agent
 */
export function spawnAgent(name: string, options: SpawnOptions = {}): Agent {
  const template = loadBaseTemplate();
  const id = generateId(name);
  const role = options.role || inferRole(name);
  const roleConfig = roleDefaults[role];
  
  // Merge base capabilities with role-specific ones
  const baseCapabilities: AgentCapability[] = template.defaults.capabilities || [];
  const allCapabilities = [...baseCapabilities, ...roleConfig.capabilities];
  
  // Create agent
  const agent: Agent = {
    id,
    name: generateDisplayName(id),
    role,
    description: options.description || `${generateDisplayName(id)} - A ${role} agent for the Lucidia system`,
    traits: options.traits || roleConfig.traits,
    inputs: [],
    outputs: [],
    triggers: options.emoji
      ? [{ emoji: options.emoji, action: "activate" }, ...roleConfig.triggers]
      : roleConfig.triggers,
    inherits_from: options.parent || "base-agent",
    capabilities: allCapabilities,
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: options.parent ? `spawned-by-${options.parent}` : "spawn-agent-cli",
      version: "1.0.0"
    }
  };
  
  // Set parent if provided
  if (options.parent) {
    agent.parentAgent = options.parent;
  }
  
  return agent;
}

/**
 * Save agent to file
 */
export function saveAgent(agent: Agent, outputDir: string = AGENTS_DIR): string {
  const filePath = path.join(outputDir, `${agent.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(agent, null, 2) + "\n");
  return filePath;
}

/**
 * Update parent agent to include child reference
 */
function updateParentAgent(parentId: string, childId: string): void {
  const parentPath = path.join(AGENTS_DIR, `${parentId}.json`);
  
  if (fs.existsSync(parentPath)) {
    const content = fs.readFileSync(parentPath, "utf-8");
    const parent: Agent = JSON.parse(content);
    
    parent.childAgents = parent.childAgents || [];
    if (!parent.childAgents.includes(childId)) {
      parent.childAgents.push(childId);
      fs.writeFileSync(parentPath, JSON.stringify(parent, null, 2) + "\n");
      console.log(`✅ Updated parent agent "${parentId}" with child "${childId}"`);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): { name: string; options: SpawnOptions } {
  const name = args[0];
  const options: SpawnOptions = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--role" && args[i + 1]) {
      options.role = args[++i] as AgentRole;
    } else if (arg === "--description" && args[i + 1]) {
      options.description = args[++i];
    } else if (arg === "--parent" && args[i + 1]) {
      options.parent = args[++i];
    } else if (arg === "--traits" && args[i + 1]) {
      options.traits = args[++i].split(",").map(t => t.trim());
    } else if (arg === "--emoji" && args[i + 1]) {
      options.emoji = args[++i];
    }
  }
  
  return { name, options };
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log(`
🧬 spawn-agent - Create new Lucidia agents

Usage:
  pnpm spawn-agent <agent-name> [options]

Arguments:
  agent-name    Name of the agent to create (e.g., "scribe-support", "digest-archive")

Options:
  --role <role>           Agent role (scribe, qa, planner, broadcast, guardian, digest, archive, support, custom)
  --description <desc>    Custom description for the agent
  --parent <parent-id>    Parent agent ID (for spawned child agents)
  --traits <t1,t2,...>    Comma-separated list of traits
  --emoji <emoji>         Primary trigger emoji

Examples:
  pnpm spawn-agent scribe-support
  pnpm spawn-agent digest-archive --role archive --parent codex-digest-agent
  pnpm spawn-agent custom-bot --role custom --emoji "🔮" --traits "creative,adaptive"

Roles automatically infer from name:
  - Names with "scribe" → scribe role
  - Names with "qa" → qa role  
  - Names with "archive" → archive role
  - etc.
`);
}

/**
 * Main CLI entry point
 */
export function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }
  
  const { name, options } = parseArgs(args);
  
  if (!name) {
    console.error("❌ Error: Agent name is required");
    printUsage();
    process.exit(1);
  }
  
  console.log(`\n🧬 Spawning agent: ${name}`);
  
  const agent = spawnAgent(name, options);
  const filePath = saveAgent(agent);
  
  console.log(`\n✅ Agent created successfully!`);
  console.log(`   ID: ${agent.id}`);
  console.log(`   Name: ${agent.name}`);
  console.log(`   Role: ${agent.role}`);
  console.log(`   File: ${filePath}`);
  console.log(`   Traits: ${agent.traits.join(", ")}`);
  console.log(
    `   Triggers: ${agent.triggers.map(trigger => (typeof trigger === "string" ? trigger : trigger.emoji)).join(" ")}`
  );
  
  if (options.parent) {
    updateParentAgent(options.parent, agent.id);
  }
  
  console.log(`\n🚀 Agent "${agent.name}" is ready for activation!\n`);
}

// Run CLI if executed directly
// Using dynamic check that works with both CommonJS and tsx/ts-node
const isMain = typeof require !== "undefined" && require.main === module;
if (isMain) {
  main();
}
