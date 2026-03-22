import YAML from "yaml";
import { manifestSchema } from "./schema";
import type { Manifest } from "./types";

export function parseManifestFromObject(value: unknown): Manifest {
  return manifestSchema.parse(value);
}

export function parseManifest(yamlSource: string): Manifest {
  const parsed = YAML.parse(yamlSource);

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Agent manifest must be a YAML object");
  }

  return parseManifestFromObject(parsed);
}
