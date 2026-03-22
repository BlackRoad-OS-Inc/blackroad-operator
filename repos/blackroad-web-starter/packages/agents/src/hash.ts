import { createHash } from "crypto";
import type { Manifest } from "./types";

export function computeAgentSSN(manifest: Pick<Manifest, "id" | "cluster" | "lineage">): string {
  const payload = `${manifest.id}:${manifest.cluster}:${manifest.lineage.guardian}`;
  return createHash("sha256").update(payload).digest("hex");
}
