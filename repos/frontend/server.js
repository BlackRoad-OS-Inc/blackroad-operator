import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from './package.json' assert { type: 'json' }
import config from './src/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, 'dist')
const app = express()

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
  })
})

app.get('/version', (_req, res) => {
  res.json({
    service: 'prism-console-web',
    appVersion: pkg.version,
    commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA || null,
    buildTime: process.env.BUILD_TIME || null,
    environment: config.environment,
  })
})

app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const port = process.env.PORT || 4173
app.listen(port, () => {
  console.log(`Prism Console running on :${port}`)
})
