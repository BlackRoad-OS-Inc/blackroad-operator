import { describe, it, expect } from "vitest";

describe("Debug imports", () => {
  it("should import createApp", async () => {
    console.log("Importing createApp...");
    const { createApp } = await import("../src/app");
    console.log("createApp imported:", !!createApp);
    
    // Check if app.ts actually imports the digest router
    const app = createApp();
    console.log("App created:", !!app);
    
    // Print all layers
    const router = (app as any)._router;
    console.log("Router layers count:", router?.stack?.length);
    
    router?.stack?.forEach((layer: any, i: number) => {
      console.log(`Layer ${i}:`, layer.name, layer.regexp?.toString());
    });
    
    expect(true).toBe(true);
  });
});
