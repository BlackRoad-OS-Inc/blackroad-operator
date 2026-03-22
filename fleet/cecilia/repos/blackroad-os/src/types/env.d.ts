/// <reference types="@cloudflare/workers-types" />

export interface Env {
  // D1 Databases
  DB_SAAS: D1Database;
  DB_AGENTS: D1Database;
  
  // Environment variables
  REPO_NAME: string;
  ORG_NAME: string;
  ENVIRONMENT: string;
  
  // Future bindings
  // CACHE: KVNamespace;
  // STORAGE: R2Bucket;
}

declare global {
  function getMiniflareBindings(): Env;
}
