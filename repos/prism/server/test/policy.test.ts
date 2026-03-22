import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildServer } from '../src/index';

describe('policy guard', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prism-policy-'));
  const dbPath = path.join(tmp, 'policy.db');
  let app: Awaited<ReturnType<typeof buildServer>>;
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    app = await buildServer(dbPath);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    cwdSpy.mockRestore();
  });

  it('playground forbids write', async () => {
    await request(app.server).put('/mode').send({ mode: 'playground' }).expect(200);
    const res = await request(app.server).post('/diffs/apply').send({ diffs: [], message: 'noop' });
    expect(res.status).toBe(403);
  });

  it('dev requires review', async () => {
    await request(app.server).put('/mode').send({ mode: 'dev' }).expect(200);
    const res = await request(app.server).post('/diffs/apply').send({ diffs: [], message: 'noop' });
    expect(res.body.status).toBe('pending');
  });

  it('trusted auto applies', async () => {
    await request(app.server).put('/mode').send({ mode: 'trusted' }).expect(200);
    const res = await request(app.server).post('/diffs/apply').send({ diffs: [], message: 'noop' });
    expect(res.body.status).toBe('applied');
  });

  it('overrides approvals via /policy', async () => {
    await request(app.server).put('/mode').send({ mode: 'dev' }).expect(200);
    await request(app.server).put('/policy').send({ approvals: { write: 'auto' } }).expect(200);
    const policy = await request(app.server).get('/policy');
    expect(policy.body.approvals.write).toBe('auto');
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { buildServer } from '../src/index.js';

// Simple sanity check for the policy endpoint
// Ensures policy toggling works for approval gating

describe('policy endpoint', () => {
  it('updates write policy', async () => {
    const app = buildServer();
    await app.listen({ port: 0 });
    await supertest(app.server)
      .put('/policy')
      .send({ write: 'review' })
      .expect(200);
    const res = await supertest(app.server).get('/policy');
    await app.close();
    expect(res.body.write).toBe('review');
  });
});
