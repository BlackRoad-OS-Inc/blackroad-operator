# Lucidia Workspace

**Forked from:** [PixelHQ](https://github.com/waynedev9598/PixelHQ-bridge) by waynedev9598  
**Extended by:** BlackRoad OS for multi-agent visualization

## What's New

Lucidia adds multi-zone support and NATS integration to PixelHQ:

- 🗺️ **5 Zones:** Plaza, Library, Dev Lab, Comm Tower, Innovation Park
- 🔌 **NATS Integration:** Connect to BlackRoad event bus  
- 🎯 **Smart Switching:** Auto-switch zones based on activity
- 📊 **Event Viz:** Real-time message flow visualization

## Quick Start

```bash
npm install
npm run build
npm start  # Works standalone

# With NATS
NATS_URL=nats://localhost:4222 npm start
```

## Usage

```typescript
import { LucidiaBridge } from './src/lucidia-bridge.js';

const bridge = new LucidiaBridge({
  natsUrl: 'nats://localhost:4222',
  enableNats: true
});

await bridge.start();
```

## Credits

Original PixelHQ by [waynedev9598](https://github.com/waynedev9598) - MIT License  
Lucidia extensions by BlackRoad OS Team
