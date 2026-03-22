import fs from 'fs'
import path from 'path'

const beacon = {
  agent: 'Orchestrator-Gen-0',
  ts: Date.now(),
}

const target = path.join(process.cwd(), 'public', 'sig.beacon.json')
fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, JSON.stringify(beacon, null, 2))
