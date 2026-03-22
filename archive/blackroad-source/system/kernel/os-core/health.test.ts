import request from 'supertest';
import express from 'express';

// Mock Express app for testing health route
const app = express();
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'core' });
});

describe('Health Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return correct health status', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toEqual({
      status: 'ok',
      service: 'core',
    });
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
