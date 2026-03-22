import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const payload = {
  ts: new Date().toISOString(),
  agent: "Core-Gen-0"
};

const targetDir = join(process.cwd(), "apps", "web", "public");
mkdirSync(targetDir, { recursive: true });
writeFileSync(join(targetDir, "sig.beacon.json"), JSON.stringify(payload, null, 2));
