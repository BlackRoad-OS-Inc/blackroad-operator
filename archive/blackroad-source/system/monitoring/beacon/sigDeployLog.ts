import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export interface DeployRecord {
  service: string;
  env: string;
  git_sha: string;
  actor: string;
  started_at: string;
  completed_at: string;
  outcome: 'success' | 'rollback' | 'failed';
  links: string[];
  meta?: Record<string, unknown>;
}

export interface QueryOptions {
  service?: string;
  env?: string;
  limit?: number;
}

const schemaPath = path.resolve(__dirname, '../../schemas/sig.deploy-log.spec.json');
const defaultLogPath = path.resolve(
  process.cwd(),
  process.env.DEPLOY_LOG_PATH || './data/deploy-log.jsonl'
);

let validator: Ajv | null = null;
let validateDeploy: ((data: unknown) => boolean) | null = null;

function loadValidator(): void {
  if (validator && validateDeploy) return;
  const schemaRaw = fs.readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaRaw);
  validator = new Ajv({ allErrors: true });
  addFormats(validator);
  validateDeploy = validator.compile(schema);
}

function ensureLogDirectory(logPath: string): void {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function appendDeployRecord(record: DeployRecord, logPath = defaultLogPath): void {
  loadValidator();
  if (!validateDeploy || !validator) {
    throw new Error('Validator not initialized');
  }

  const valid = validateDeploy(record);
  if (!valid) {
    const errors = validator.errors?.map((err) => `${err.instancePath} ${err.message}`).join(', ');
    throw new Error(`Deploy record validation failed: ${errors}`);
  }

  ensureLogDirectory(logPath);
  fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`, 'utf-8');
}

export function queryDeployHistory(options: QueryOptions = {}, logPath = defaultLogPath): DeployRecord[] {
  if (!fs.existsSync(logPath)) {
    return [];
  }

  const lines = fs.readFileSync(logPath, 'utf-8').trim().split(/\n+/).filter(Boolean);
  const records: DeployRecord[] = lines
    .map((line) => {
      try {
        return JSON.parse(line) as DeployRecord;
      } catch {
        return null;
      }
    })
    .filter((record): record is DeployRecord => Boolean(record));

  const filtered = records.filter((record) => {
    if (options.service && record.service !== options.service) return false;
    if (options.env && record.env !== options.env) return false;
    return true;
  });

  filtered.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  const limit = options.limit && options.limit > 0 ? options.limit : filtered.length;
  return filtered.slice(0, limit);
}

export const DEFAULT_DEPLOY_LOG_PATH = defaultLogPath;
