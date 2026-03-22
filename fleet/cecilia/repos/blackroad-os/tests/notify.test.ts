import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  formatNotificationMessage,
  buildWebhookPayload,
  sendAgentPRNotification,
  notifyAgentPR
} from "../src/notify";
import type { AgentPRPayload } from "../src/notify/types";

const mockPayload: AgentPRPayload = {
  prURL: "https://github.com/BlackRoad-OS/blackroad-os/pull/123",
  agentName: "guardian-clone-vault",
  purpose: "Sentinel overflow instance (TTL: 96h)",
  summary: "Spawned due to 18 escalations in past 72h",
  ttl: "96h",
  awaitingApproval: "alexa"
};

describe("formatNotificationMessage", () => {
  it("formats the message correctly with all fields", () => {
    const message = formatNotificationMessage(mockPayload);

    expect(message).toContain("🚀 Lucidia has opened a new auto-generated PR:");
    expect(message).toContain("🔗 https://github.com/BlackRoad-OS/blackroad-os/pull/123");
    expect(message).toContain("🧬 Agent: guardian-clone-vault");
    expect(message).toContain("📦 Purpose: Sentinel overflow instance (TTL: 96h)");
    expect(message).toContain("💬 Summary: Spawned due to 18 escalations in past 72h");
    expect(message).toContain("⏱️ TTL: 96h");
    expect(message).toContain("👁️ Awaiting approval from @alexa");
  });
});

describe("buildWebhookPayload", () => {
  it("builds payload with both content and text fields", () => {
    const webhookPayload = buildWebhookPayload(mockPayload);

    expect(webhookPayload.content).toBeDefined();
    expect(webhookPayload.text).toBeDefined();
    expect(webhookPayload.content).toBe(webhookPayload.text);
    expect(webhookPayload.content).toContain("guardian-clone-vault");
  });
});

describe("sendAgentPRNotification", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns error when no webhook URL is provided", async () => {
    const result = await sendAgentPRNotification({
      webhookURL: "",
      payload: mockPayload
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("No webhook URL provided");
  });

  it("sends notification successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    });

    const result = await sendAgentPRNotification({
      webhookURL: "https://discord.com/api/webhooks/test",
      payload: mockPayload
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
  });

  it("handles webhook request failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    const result = await sendAgentPRNotification({
      webhookURL: "https://discord.com/api/webhooks/test",
      payload: mockPayload
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("status: 500");
  });

  it("handles network errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await sendAgentPRNotification({
      webhookURL: "https://discord.com/api/webhooks/test",
      payload: mockPayload
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");
  });
});

describe("notifyAgentPR", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("uses LUCIDIA_WEBHOOK from environment", async () => {
    process.env.LUCIDIA_WEBHOOK = "https://slack.com/webhook/test";
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const result = await notifyAgentPR(mockPayload);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://slack.com/webhook/test",
      expect.any(Object)
    );
  });

  it("returns error when LUCIDIA_WEBHOOK is not set", async () => {
    delete process.env.LUCIDIA_WEBHOOK;

    const result = await notifyAgentPR(mockPayload);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No webhook URL provided");
  });
});
