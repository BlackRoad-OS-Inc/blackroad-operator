import type { Environment } from "../src/types";

const mockEnvironments: Environment[] = [
  { id: "env_1", name: "Development", region: "us-east-1", status: "healthy" },
  { id: "env_2", name: "Staging", region: "eu-west-1", status: "degraded" }
];

export async function getEnvironments(): Promise<Environment[]> {
  return mockEnvironments;
}

export async function getEnvById(id: string): Promise<Environment | undefined> {
  return mockEnvironments.find((env) => env.id === id);
}

export async function getHealth(): Promise<{ status: string; uptime: number }> {
  return { status: "ok", uptime: process.uptime() };
}

export async function getVersion(): Promise<{ version: string; commit: string }> {
  const version = process.env.APP_VERSION || "1.0.0";
  const commit = process.env.APP_COMMIT || "unknown";
  return { version, commit };
}
