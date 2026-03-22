import { computeAgentSSN, parseManifest } from "@br/agents";
import type { AgentSummary, Manifest } from "@br/agents";
import { fetchGithubManifest, listGithubManifests } from "./github";
import { listFilesystemManifests } from "./filesystem";

const CACHE_TTL = 60_000;

type RegistryState = {
  expiresAt: number;
  summaries: AgentSummary[];
  manifests: Map<string, Manifest>;
};

let registryState: RegistryState | null = null;

function toSummary(manifest: Manifest): AgentSummary {
  return {
    id: manifest.id,
    cluster: manifest.cluster,
    generation: manifest.generation,
    ethos: manifest.ethos,
    covenants: manifest.covenants,
  };
}

async function buildFromGithub(): Promise<RegistryState | null> {
  const manifestRefs = await listGithubManifests();
  if (manifestRefs.length === 0) {
    return null;
  }

  const manifests = new Map<string, Manifest>();
  const summaries: AgentSummary[] = [];

  const concurrency = 8;
  for (let i = 0; i < manifestRefs.length; i += concurrency) {
    const batch = manifestRefs.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (ref) => {
        const content = await fetchGithubManifest(ref.path);
        if (!content) {
          return null;
        }
        try {
          const manifest = parseManifest(content);
          manifests.set(manifest.id, manifest);
          summaries.push(toSummary(manifest));
        } catch (error) {
          console.warn(`Skipping invalid manifest at ${ref.path}`, error);
        }
        return null;
      })
    );
    // results intentionally unused to await all
    void results;
  }

  return {
    expiresAt: Date.now() + CACHE_TTL,
    manifests,
    summaries,
  };
}

async function buildFromFilesystem(): Promise<RegistryState | null> {
  const manifests = await listFilesystemManifests();
  if (manifests.length === 0) {
    return null;
  }

  const map = new Map<string, Manifest>();
  const summaries: AgentSummary[] = [];

  for (const manifest of manifests) {
    try {
      const parsed = parseManifest(manifest.content);
      map.set(parsed.id, parsed);
      summaries.push(toSummary(parsed));
    } catch (error) {
      console.warn(`Skipping invalid local manifest at ${manifest.path}`, error);
    }
  }

  return {
    expiresAt: Date.now() + CACHE_TTL,
    manifests: map,
    summaries,
  };
}

async function refreshRegistry(force = false): Promise<RegistryState> {
  if (!force && registryState && registryState.expiresAt > Date.now()) {
    return registryState;
  }

  const githubState = await buildFromGithub();
  if (githubState) {
    registryState = githubState;
    return githubState;
  }

  const filesystemState = await buildFromFilesystem();
  registryState =
    filesystemState ?? {
      expiresAt: Date.now() + CACHE_TTL,
      summaries: [],
      manifests: new Map(),
    };

  return registryState;
}

export async function getAllAgents(options?: { force?: boolean }): Promise<AgentSummary[]> {
  const state = await refreshRegistry(options?.force ?? false);
  return state.summaries;
}

export async function getAgentById(id: string): Promise<Manifest | null> {
  const state = await refreshRegistry();
  const manifest = state.manifests.get(id);
  if (manifest) {
    return manifest;
  }

  const refs = await listGithubManifests();
  const ref = refs.find((entry) => entry.path.endsWith(`${id}.yaml`) || entry.path.includes(`/${id}/`));
  if (!ref) {
    return null;
  }

  const content = await fetchGithubManifest(ref.path);
  if (!content) {
    return null;
  }

  try {
    const manifest = parseManifest(content);
    state.manifests.set(manifest.id, manifest);
    if (!state.summaries.find((item) => item.id === manifest.id)) {
      state.summaries.push(toSummary(manifest));
    }
    return manifest;
  } catch (error) {
    console.warn(`Failed to parse manifest for ${id}`, error);
    return null;
  }
}

export async function searchAgents(query: string): Promise<AgentSummary[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return getAllAgents();
  }

  const state = await refreshRegistry();
  return state.summaries.filter((agent) => {
    if (agent.id.toLowerCase().includes(trimmed)) return true;
    if (agent.cluster.toLowerCase().includes(trimmed)) return true;
    if (agent.ethos.toLowerCase().includes(trimmed)) return true;
    return agent.covenants.some((covenant) => covenant.toLowerCase().includes(trimmed));
  });
}

export async function warmRegistryCache(force = false): Promise<void> {
  await refreshRegistry(force);
}

export function getAgentSSN(id: string): string | null {
  if (!registryState) {
    return null;
  }

  const manifest = registryState.manifests.get(id);
  if (!manifest) {
    return null;
  }

  return computeAgentSSN(manifest);
}
