import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createPatch } from 'diff';
import { buildServer, bus } from '../src/index';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
describe('run and approvals', () => {
    let app;
    let cwdSpy;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prism-run-'));
    const dbPath = path.join(tmp, 'runs.db');
    beforeAll(async () => {
        cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
        app = await buildServer(dbPath);
        await app.ready();
    });
    afterAll(async () => {
        await app.close();
        cwdSpy.mockRestore();
    });
    afterEach(() => {
        delete process.env.PRISM_RUN_ALLOW;
    });
    it('emits run events', async () => {
        process.env.PRISM_RUN_ALLOW = 'node';
        const events = [];
        const handler = (e) => {
            if (e.kind === 'run.start')
                events.push('start');
            if (e.kind === 'run.out' && e.data.chunk.trim() === 'hello')
                events.push('out');
            if (e.kind === 'run.end')
                events.push('end');
        };
        bus.on('event', handler);
        await supertest(app.server)
            .post('/run')
            .send({ projectId: 'p', sessionId: 's', cmd: "node -e \"console.log('hello')\"" })
            .expect(200);
        await sleep(500);
        bus.off('event', handler);
        expect(events).toEqual(['start', 'out', 'end']);
    });
    it('handles escaped quotes in run command', async () => {
        process.env.PRISM_RUN_ALLOW = 'node';
        const events = [];
        const handler = (e) => {
            if (e.kind === 'run.start')
                events.push('start');
            if (e.kind === 'run.out' && e.data.chunk.trim() === 'hi')
                events.push('out');
            if (e.kind === 'run.end')
                events.push('end');
        };
        bus.on('event', handler);
        await supertest(app.server)
            .post('/run')
            .send({ projectId: 'p', sessionId: 's', cmd: 'node -e "console.log(\\"hi\\")"' })
            .expect(200);
        await sleep(500);
        bus.off('event', handler);
        expect(events).toEqual(['start', 'out', 'end']);
    });
    it('emits completion when a command cannot be spawned', async () => {
        process.env.PRISM_RUN_ALLOW = 'definitely-not-real';
        const events = [];
        const handler = (e) => {
            if (e.kind === 'run.err' || e.kind === 'run.end') {
                events.push(e);
            }
        };
        bus.on('event', handler);
        await supertest(app.server)
            .post('/run')
            .send({ projectId: 'p', sessionId: 's', cmd: 'definitely-not-real --flag' })
            .expect(200);
        await sleep(500);
        bus.off('event', handler);
        const endEvent = events.find((e) => e.kind === 'run.end');
        expect(endEvent).toBeDefined();
        expect(endEvent.data.status).toBe('error');
    });
    it('requires approval for diffs when policy is review', async () => {
        await supertest(app.server).put('/mode').send({ mode: 'dev' }).expect(200);
        const patch = createPatch('test.txt', '', 'hello\n');
        const diff = { path: 'test.txt', beforeSha: '', afterSha: '', patch };
        const res = await supertest(app.server)
            .post('/diffs/apply')
            .send({ diffs: [diff], message: 'm' })
            .expect(200);
        expect(res.body.status).toBe('pending');
        const approvalId = res.body.approvalId;
        const list = await supertest(app.server).get('/approvals?status=pending');
        expect(list.body[0].id).toBe(approvalId);
        await supertest(app.server).post(`/approvals/${approvalId}/approve`).send({}).expect(200);
        const content = fs.readFileSync(path.join(tmp, 'work/test.txt'), 'utf8').trim();
        expect(content).toBe('hello');
    });
});
