import type { Env } from "../types/env";

/**
 * D1 Database utilities for BlackRoad OS
 */

// Generic query helper with error handling
export async function query<T = unknown>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results;
}

// Single row query
export async function queryOne<T = unknown>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await db.prepare(sql).bind(...params).first<T>();
  return result;
}

// Execute (INSERT/UPDATE/DELETE)
export async function execute(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run();
}

// Batch execute
export async function batch(
  db: D1Database,
  statements: { sql: string; params?: unknown[] }[]
): Promise<D1Result[]> {
  const prepared = statements.map((s) =>
    db.prepare(s.sql).bind(...(s.params || []))
  );
  return db.batch(prepared);
}

// SaaS DB shortcuts
export const saas = {
  query: <T>(env: Env, sql: string, params?: unknown[]) =>
    query<T>(env.DB_SAAS, sql, params),
  queryOne: <T>(env: Env, sql: string, params?: unknown[]) =>
    queryOne<T>(env.DB_SAAS, sql, params),
  execute: (env: Env, sql: string, params?: unknown[]) =>
    execute(env.DB_SAAS, sql, params),
};

// Agent Registry DB shortcuts  
export const agents = {
  query: <T>(env: Env, sql: string, params?: unknown[]) =>
    query<T>(env.DB_AGENTS, sql, params),
  queryOne: <T>(env: Env, sql: string, params?: unknown[]) =>
    queryOne<T>(env.DB_AGENTS, sql, params),
  execute: (env: Env, sql: string, params?: unknown[]) =>
    execute(env.DB_AGENTS, sql, params),
};
