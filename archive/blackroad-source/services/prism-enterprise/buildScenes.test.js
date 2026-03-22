import { describe, expect, it } from "vitest";

import {
  buildDependencies,
  buildScenes,
  normaliseText,
  sanitiseIdentifier,
} from "../server.js";

describe("buildScenes", () => {
  it("returns default scene when none provided", () => {
    const scenes = buildScenes();

    expect(scenes).toHaveLength(1);
    expect(scenes[0]).toMatchObject({
      name: "SampleScene",
      description: "Starter sandbox scene",
      enabled: true,
      fileName: "SampleScene",
    });
  });

  it("normalises string scene entries with generated metadata", () => {
    const scenes = buildScenes(["Main Menu"]);

    expect(scenes).toHaveLength(1);
    expect(scenes[0]).toMatchObject({
      name: "Main Menu",
      description: "Generated from request payload",
      fileName: "Main-Menu",
      enabled: true,
    });
  });

  it("ensures at least one scene remains enabled", () => {
    const scenes = buildScenes([
      { name: "Intro", enabled: false },
      { name: "Gameplay", enabled: false },
    ]);

    const enabledScenes = scenes.filter((scene) => scene.enabled !== false);

    expect(enabledScenes).toHaveLength(1);
    expect(enabledScenes[0].name).toBe("Intro");
  });
});

describe("buildDependencies", () => {
  it("merges package overrides with defaults", () => {
    const { dependencies, requestedPackages } = buildDependencies([
      "com.unity.inputsystem",
      { name: "com.custom.toolkit", version: "1.2.3" },
      "com.unity.timeline",
      " ",
    ]);

    expect(dependencies["com.unity.inputsystem"]).toBe("latest");
    expect(dependencies["com.custom.toolkit"]).toBe("1.2.3");
    expect(dependencies["com.unity.timeline"]).toBeDefined();
    expect(requestedPackages).toEqual([
      { name: "com.unity.inputsystem", version: "latest" },
      { name: "com.custom.toolkit", version: "1.2.3" },
      {
        name: "com.unity.timeline",
        version: dependencies["com.unity.timeline"],
      },
    ]);
  });
});

describe("utility helpers", () => {
  it("sanitises identifiers to Unity-friendly slugs", () => {
    expect(sanitiseIdentifier("  Hello World!  ")).toBe("Hello-World");
    expect(sanitiseIdentifier("***")).toBe("");
  });

  it("normalises free text with fallbacks", () => {
    expect(normaliseText("BlackRoad", "fallback")).toBe("BlackRoad");
    expect(normaliseText("   ", "fallback")).toBe("fallback");
  });
});
