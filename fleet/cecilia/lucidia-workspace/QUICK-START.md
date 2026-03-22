# Lucidia Workspace - Quick Start

## 🚀 Install & Run

```bash
cd ~/blackroad/lucidia-workspace
npm install
npm run build
npm start
```

## 📱 Connect iOS App

Open **Pixel Office** on your iPhone/iPad → Auto-discovers bridge on local network → Pair with code

## 🗺️ Zones

| Zone | Triggers |
|------|----------|
| 🏛️ Plaza | Chat |
| 📚 Library | Search, .md files |
| 💻 Dev Lab | Git (infra), YAML |
| 📡 Comm Tower | NATS, deploys |
| 🌳 Innovation | Experiments |

## 🔌 With NATS

```bash
# Terminal 1: Start NATS
nats-server

# Terminal 2: Start Lucidia with NATS
NATS_URL=nats://localhost:4222 npm start

# Terminal 3: Publish test event
nats pub blackroad.dev.commit '{"message":"feat: deploy"}'
```

## 🧪 Test

```bash
node test-lucidia.js
```

## 📊 API Example

```javascript
import { LucidiaBridge } from './dist/src/lucidia-bridge.js';

const bridge = new LucidiaBridge({ enableNats: true });
await bridge.start();

bridge.on('zone_changed', e => console.log(e.to.name));
bridge.handlePixelEvent('git_commit', { message: 'feat: deploy' });
```

## 🔗 Links

- **Fork:** https://github.com/blackboxprogramming/lucidia-workspace
- **Original:** https://github.com/waynedev9598/PixelHQ-bridge
- **Docs:** See LUCIDIA-SETUP-COMPLETE.md

---

*Forked from PixelHQ (MIT) • Extended by BlackRoad OS*
