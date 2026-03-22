import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtemp, rm, stat } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

let app;
let cleanupDir;

describe("POST /export", () => {
  beforeAll(async () => {
    cleanupDir = await mkdtemp(path.join(tmpdir(), "unity-exporter-"));
    process.env.UNITY_EXPORT_ROOT = cleanupDir;

    const module = await import("../server.js");
    app = module.app;
  });

  afterAll(async () => {
    delete process.env.UNITY_EXPORT_ROOT;
    try {
      await rm(cleanupDir, { recursive: true, force: true });
    } catch (err) {
      console.warn("Cleanup failed in afterAll:", err);
    }
  });

  it("creates a Unity archive and returns metadata", async () => {
    const response = await request(app)
      .post("/export")
      .send({
        projectName: "TestProject",
        scenes: [{ name: "Gameplay" }],
        packages: ["com.unity.inputsystem"],
      })
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.project).toMatchObject({
      name: "TestProject",
      companyName: "BlackRoad",
    });
    expect(response.body.scenes).toEqual([
      {
        name: "Gameplay",
        path: "Assets/Scenes/Gameplay.unity",
        enabled: true,
      },
    ]);
    expect(response.body.requestedPackages).toEqual([
      { name: "com.unity.inputsystem", version: "latest" },
    ]);

    const archivePath = path.resolve(
      process.cwd(),
      response.body.archive.path,
    );
    const archiveStat = await stat(archivePath);

    expect(archiveStat.size).toBeGreaterThan(0);
  });
});
