import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

type ServiceConfigInput = {
  id: string;
  name: string;
  env: string;
  health_url: string;
  region: string;
};

export type ServiceConfig = ServiceConfigInput;

let cachedServices: ServiceConfig[] | null = null;
let cachedPath: string | null = null;

function resolveConfigPath(): string {
  return path.resolve(
    process.cwd(),
    process.env.BEACON_SERVICES_CONFIG_PATH || 'config/services.example.yaml'
  );
}

function parseServices(filePath: string): ServiceConfig[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(raw) as { services?: ServiceConfigInput[] };

  if (!parsed?.services || !Array.isArray(parsed.services)) {
    throw new Error('Invalid services configuration: missing services array');
  }

  return parsed.services.map((service) => ({
    id: service.id,
    name: service.name,
    env: service.env,
    health_url: service.health_url,
    region: service.region,
  }));
}

export function clearServicesCache(): void {
  cachedServices = null;
  cachedPath = null;
}

export function getServices(configPath = resolveConfigPath()): ServiceConfig[] {
  const resolvedPath = path.resolve(configPath);

  if (cachedServices && cachedPath === resolvedPath) {
    return cachedServices;
  }
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Services configuration not found at ${resolvedPath}`);
  }

  cachedServices = parseServices(resolvedPath);
  cachedPath = resolvedPath;
  return cachedServices;
}

export const DEFAULT_CONFIG_PATH = resolveConfigPath;
