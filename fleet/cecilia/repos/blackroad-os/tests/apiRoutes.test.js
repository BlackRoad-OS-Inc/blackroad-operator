import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createApp } from "../src/app";
import { createServer } from "../src/index";
vi.mock("../src/utils/buildInfo", () => ({
    getBuildInfo: () => ({ version: "test-version", commit: "test-commit", buildTime: "now" })
}));
describe("Express internal routes", () => {
    const app = createApp();
    it("returns health", async () => {
        const response = await request(app).get("/internal/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
    it("returns version", async () => {
        const response = await request(app).get("/internal/version");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ version: "test-version", commit: "test-commit" });
    });
});
describe("Fastify public routes", () => {
    let server;
    beforeEach(async () => {
        server = await createServer();
    });
    it("returns health", async () => {
        const response = await server.inject({ method: "GET", url: "/health" });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok" });
    });
    it("returns version", async () => {
        const response = await server.inject({ method: "GET", url: "/version" });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ version: "test-version", commit: "test-commit" });
    });
});
