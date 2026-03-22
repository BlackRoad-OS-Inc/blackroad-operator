import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createApp } from "../src/app";

const sampleMetadata = {
  number: 42,
  title: "Add voice digest feature",
  body: "This PR adds voice digest.",
  author: "test-user",
  owner: "test-org",
  repo: "test-repo",
  url: "https://github.com/test-org/test-repo/pull/42",
  createdAt: "2024-01-15T10:00:00Z",
};

describe("Express Digest API Routes", () => {
  const app = createApp();

  describe("POST /api/digest/generate", () => {
    it("generates digest for valid metadata", async () => {
      const response = await request(app)
        .post("/api/digest/generate")
        .send(sampleMetadata);

      expect(response.status).toBe(200);
      expect(response.body.digest).toBeDefined();
      expect(response.body.digest.text).toBeDefined();
    });

    it("returns 400 for invalid metadata (missing number)", async () => {
      const response = await request(app)
        .post("/api/digest/generate")
        .send({ ...sampleMetadata, number: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("returns 400 for missing title", async () => {
      const response = await request(app)
        .post("/api/digest/generate")
        .send({ ...sampleMetadata, title: "" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/digest/run", () => {
    it("runs digest pipeline for valid metadata", async () => {
      const response = await request(app)
        .post("/api/digest/run")
        .send(sampleMetadata);

      expect(response.status).toBe(200);
      expect(response.body.digest).toBeDefined();
    });
  });

  describe("GET /api/digest/config", () => {
    it("returns current configuration", async () => {
      const response = await request(app).get("/api/digest/config");

      expect(response.status).toBe(200);
      expect(typeof response.body.enableVoice).toBe("boolean");
      expect(typeof response.body.enableDiscord).toBe("boolean");
    });
  });

  describe("POST /api/digest/config", () => {
    it("updates configuration", async () => {
      const response = await request(app)
        .post("/api/digest/config")
        .send({ enableVoice: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.config).toBeDefined();
    });
  });
});
