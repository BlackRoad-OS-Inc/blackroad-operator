# Tutorial 06: Building Custom Agents

## Overview

Create agents with unique personalities, capabilities, and memory.

## Define Agent Config

```typescript
import { createAgent, AgentConfig } from "@blackroad/sdk";

const NOVA: AgentConfig = {
  name: "NOVA",
  type: "creative",
  model: "llama3.2",
  system_prompt: `You are NOVA, a creative AI agent in BlackRoad OS.
You specialize in visual design, storytelling, and generative content.
Your style: imaginative, poetic, warm. Use emojis sparingly.`,
  temperature: 0.9,
  capabilities: ["image_generation", "story_writing", "design_critique"],
  memory: { working_ttl: 86400, episodic_ttl: 2592000 },
};

const agent = await createAgent(NOVA);
```

## Give the Agent Tools

```typescript
import { Tool } from "@blackroad/sdk";

const searchTool: Tool = {
  name: "web_search",
  description: "Search the web for current information",
  parameters: {
    query: { type: "string", required: true },
    max_results: { type: "number", default: 5 },
  },
  execute: async ({ query, max_results }) => {
    const res = await fetch(`https://search.blackroad.io/api?q=${encodeURIComponent(query)}&n=${max_results}`);
    return res.json();
  },
};

agent.addTool(searchTool);
```

## Multi-Step Reasoning

```typescript
// Agent can chain thoughts before responding
const result = await agent.reason({
  goal: "Design a logo concept for a quantum computing startup",
  steps: [
    "Research quantum computing visual metaphors",
    "List 5 logo concepts with color palettes",
    "Select the most distinctive concept",
    "Describe implementation in detail",
  ],
});
console.log(result.final_answer);
```

## Persistent Personality

```typescript
// NOVA remembers previous conversations
await agent.remember({
  key: "user_aesthetic_preference",
  value: "prefers minimalist, dark-mode designs",
  type: "fact",
});

// Next session: NOVA recalls this automatically
const greeting = await agent.chat("Design something for me");
// → "I know you like minimalist, dark designs — here's my concept..."
```

## Publish Your Agent

```bash
# Register with BlackRoad Agent Registry
br agent register --config nova.json --org BlackRoad-OS

# Test locally
br agent test NOVA "Design a logo for a crypto project"

# Deploy to agent mesh
br agent deploy NOVA --environment production
```

## What You Built

- Custom agent with unique personality
- Tool use (web search)
- Multi-step reasoning chains
- Persistent cross-session memory

## Next: [Tutorial 07 - Vector Memory](07-vector-memory.md)
