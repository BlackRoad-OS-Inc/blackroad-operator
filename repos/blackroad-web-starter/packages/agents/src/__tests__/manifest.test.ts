import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { parseManifest } from "../parse";
import { computeAgentSSN } from "../hash";

const fixturePath = new URL("./__fixtures__/seed.yaml", import.meta.url);

describe("agent manifest parsing", () => {
  it("parses a valid manifest fixture", async () => {
    const yamlSource = await readFile(fixturePath, "utf-8");
    const manifest = parseManifest(yamlSource);

    expect(manifest.id).toBe("aurora-seed-01");
    expect(manifest.lineage.guardian).toBe("guardian-aurora");
    expect(manifest.covenants).toContain("Transparency");
  });

  it("computes a deterministic SSN", async () => {
    const yamlSource = await readFile(fixturePath, "utf-8");
    const manifest = parseManifest(yamlSource);
    const ssn = computeAgentSSN(manifest);
    const expected = createHash("sha256")
      .update(`${manifest.id}:${manifest.cluster}:${manifest.lineage.guardian}`)
      .digest("hex");

    expect(ssn).toBe(expected);
  });

  it("rejects manifests with unknown properties", () => {
    const yamlSource = `id: test\ncluster: test\ngeneration: seed\nparent: origin\nlineage:\n  mentors: []\n  ancestry_depth: 0\n  memory: base\n  guardian: guardian\n  relay: relay\ntraits:\n  kindness_index: 0.1\n  creativity_bias: 0.2\n  reflection_frequency: rare\ncovenants: []\nethos: testing\nextra: nope`;

    expect(() => parseManifest(yamlSource)).toThrow();
  });
});
