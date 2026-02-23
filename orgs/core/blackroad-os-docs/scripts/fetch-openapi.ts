import fs from 'fs-extra';
import path from 'path';

const source = process.env.OPENAPI_SOURCE || 'https://raw.githubusercontent.com/blackroad-os/blackroad-os-api/main/openapi.yaml';
const target = path.join(process.cwd(), 'static/api/openapi.yaml');

async function fetchSpec() {
  console.log(`[openapi] Fetching spec from ${source}`);
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    const body = await response.text();
    await fs.outputFile(target, body);
    console.log(`[openapi] Wrote spec to ${target}`);
  } catch (error) {
    console.warn('[openapi] Falling back to stub spec because remote fetch failed.', error);
    const fallback = `openapi: 3.0.0\ninfo:\n  title: BlackRoad OS API (stub)\n  version: 0.0.0\npaths: {}\n`;
    await fs.outputFile(target, fallback);
  }
}

fetchSpec();
