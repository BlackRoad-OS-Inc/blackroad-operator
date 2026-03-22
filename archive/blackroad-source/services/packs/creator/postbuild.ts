import fs from 'node:fs';
import path from 'node:path';

const beaconPath = path.join(process.cwd(), 'public', 'sig.beacon.json');
const payload = {
  ts: new Date().toISOString(),
  agent: 'CreatorPack-Gen-0',
};

fs.writeFileSync(beaconPath, JSON.stringify(payload, null, 2));

// TODO(creator-pack-next): Add checksum validation for published artifacts.
