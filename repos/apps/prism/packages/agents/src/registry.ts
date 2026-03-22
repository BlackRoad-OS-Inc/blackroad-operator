import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

export type AgentTrigger = {
  kind: string;
  match: string;
};

export type AgentManifest = {
  name: string;
  role: string;
  version: string;
  capabilities: string[];
  triggers: AgentTrigger[];
  inputs: string[];
  outputs: string[];
  tools: string[];
  policyHints?: Record<string, any>;
  sourcePath: string;
};

const manifestSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  version: z.string().min(1),
  capabilities: z.array(z.string()),
  triggers: z
    .array(
      z.object({
        kind: z.string().min(1),
        match: z.string().min(1),
      })
    )
    .default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  policyHints: z.record(z.any()).optional(),
});

function readManifest(filePath: string): AgentManifest {
  const text = fs.readFileSync(filePath, "utf8");
  const raw = parse(text);
  const manifest = manifestSchema.parse(raw);
  return {
    ...manifest,
    triggers: manifest.triggers.map((trigger) => ({ ...trigger })),
    inputs: [...manifest.inputs],
    outputs: [...manifest.outputs],
    tools: [...manifest.tools],
    policyHints: manifest.policyHints ? { ...manifest.policyHints } : undefined,
    sourcePath: filePath,
  };
}

export function loadAgents(dir = path.join(process.cwd(), "apps/prism/configs/agents")): AgentManifest[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => path.join(dir, file));
  return files.map(readManifest);
}

export function loadAgentByName(name: string, dir?: string): AgentManifest | undefined {
  return loadAgents(dir).find((manifest) => manifest.name === name);
}
