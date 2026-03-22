import { afterEach, describe, expect, it, vi } from "vitest";
import { computeAgentSSN, type Manifest } from "@br/agents";

vi.mock("@br/registry", () => {
  return {
    getAllAgents: vi.fn(),
    searchAgents: vi.fn(),
    getAgentById: vi.fn(),
  };
});

const mockedRegistry = vi.mocked(await import("@br/registry"));
const { getAllAgents, searchAgents, getAgentById } = mockedRegistry;

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/agents", () => {
  it("returns agent summaries with ssn", async () => {
    const manifest: Manifest = {
      id: "agent-1",
      cluster: "atlas",
      generation: "seed",
      parent: "root",
      lineage: {
        mentors: [],
        ancestry_depth: 0,
        memory: "",
        guardian: "guardian-1",
        relay: "relay-1",
      },
      traits: {
        kindness_index: 0.1,
        creativity_bias: 0.2,
        reflection_frequency: "often",
      },
      covenants: ["Transparency"],
      ethos: "Be kind",
    };

    getAllAgents.mockResolvedValue([
      {
        id: manifest.id,
        cluster: manifest.cluster,
        generation: manifest.generation,
        covenants: manifest.covenants,
        ethos: manifest.ethos,
      },
    ]);
    getAgentById.mockResolvedValue(manifest);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/agents"));
    const payload = await response.json();

    expect(payload.total).toBe(1);
    expect(payload.items[0]).toMatchObject({
      id: manifest.id,
      ssn: computeAgentSSN(manifest),
    });
  });

  it("uses search when q is provided", async () => {
    const manifest: Manifest = {
      id: "agent-2",
      cluster: "lumen",
      generation: "apprentice",
      parent: "root",
      lineage: {
        mentors: [],
        ancestry_depth: 0,
        memory: "",
        guardian: "guardian-2",
        relay: "relay-2",
      },
      traits: {
        kindness_index: 0.5,
        creativity_bias: 0.3,
        reflection_frequency: "rarely",
      },
      covenants: ["Transparency"],
      ethos: "Shine",
    };

    searchAgents.mockResolvedValue([
      {
        id: manifest.id,
        cluster: manifest.cluster,
        generation: manifest.generation,
        covenants: manifest.covenants,
        ethos: manifest.ethos,
      },
    ]);
    getAgentById.mockResolvedValue(manifest);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/agents?q=lumen"));
    const payload = await response.json();

    expect(searchAgents).toHaveBeenCalledWith("lumen");
    expect(payload.total).toBe(1);
    expect(payload.items[0].id).toBe(manifest.id);
  });
});
