import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function withPrisma<T>(handler: (client: PrismaClient) => Promise<T>): Promise<T> {
  return handler(prisma);
}

export type { PrismaClient };

export * from "./types.js";
export { createInMemoryDb } from "./in-memory.js";

// Prisma binding is provided as a factory to avoid requiring a database for tests.
export { createPrismaComplianceDb } from "./prisma-adapter.js";
export * from "./types.js";
export { loadPrismaClient } from "./prisma.js";
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn']
});

export async function withPrisma<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
  return fn(prisma);
}

export * from '@prisma/client';
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Rulebook } from "@blackroad/core";

export function loadSeedRulebooks(baseDir: string): Rulebook[] {
  const directory = join(baseDir, "seeds", "rules");
  const entries = readdirSync(directory, { withFileTypes: true });
  const rulebooks: Rulebook[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || (!entry.name.endsWith(".yaml") && !entry.name.endsWith(".yml"))) {
      continue;
    }
    const content = readFileSync(join(directory, entry.name), "utf-8");
    const parsed = parse(content) as Rulebook;
    rulebooks.push(parsed);
  }
  return rulebooks;
}
