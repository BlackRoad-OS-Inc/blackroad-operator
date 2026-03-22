process.env.BR_TEST_DISABLE_DB = '1'

const express = require('express')
const request = require('supertest')
const lucidia = require('../src/routes/lucidia')

describe('Lucidia routes', () => {
  it('GET /lucidia/health responds with ok payload', async () => {
    const app = express()
    app.use('/lucidia', lucidia)

    const res = await request(app).get('/lucidia/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, service: 'lucidia' })
  })
})
