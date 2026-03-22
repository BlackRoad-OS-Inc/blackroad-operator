import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function loadSchema(fileName: string) {
  const schemaPath = path.resolve(__dirname, '..', 'schemas', fileName);
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(raw);
}

function validateSamples(schemaFile: string, samples: unknown[]): void {
  const schema = loadSchema(schemaFile);
  const validate = ajv.compile(schema);
  samples.forEach((sample, index) => {
    const valid = validate(sample);
    if (!valid) {
      const errors = validate.errors?.map((err) => `${err.instancePath} ${err.message}`).join(', ');
      throw new Error(`${schemaFile} sample ${index + 1} failed: ${errors}`);
    }
  });
}

try {
  validateSamples('sig.beacon.spec.json', [
    {
      service: 'blackroad-os-web',
      version: '2025.11.23+githash',
      env: 'prod',
      status: 'healthy',
      url: 'https://web.blackroad.io/health',
      last_checked_at: new Date().toISOString(),
      meta: {
        region: 'us-central',
        agent_id: 'infra-steward-01',
        ps_sha_infinity: 'pssha∞:br:infra-steward-01:123',
      },
    },
  ]);

  validateSamples('sig.deploy-log.spec.json', [
    {
      service: 'blackroad-os-web',
      env: 'prod',
      git_sha: 'abc123',
      actor: 'deploy-bot',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      outcome: 'success',
      links: ['https://example.com/pr/1'],
    },
    {
      service: 'blackroad-os-api',
      env: 'staging',
      git_sha: 'def456',
      actor: 'engineer1',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      outcome: 'rollback',
      links: ['https://example.com/incident/77'],
    },
  ]);

  console.log('All SIG samples are valid.');
  process.exit(0);
} catch (error) {
  console.error('SIG validation failed:', (error as Error).message);
  process.exit(1);
}
