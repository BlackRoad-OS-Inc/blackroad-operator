import { minimatch } from "minimatch";

const GITHUB_API_BASE = "https://api.github.com";
const CACHE_TTL = 60_000;

type ManifestRef = {
  path: string;
  sha: string;
};

type ManifestListCache = {
  data: ManifestRef[];
  etag?: string;
  lastFetched: number;
};

type ManifestContentCache = {
  content: string;
  etag?: string;
  lastModified?: string;
  lastFetched: number;
};

const listCache: ManifestListCache = {
  data: [],
  lastFetched: 0,
};

const contentCache = new Map<string, ManifestContentCache>();

function getRepo(): string | null {
  return process.env.AGENT_SOURCE_REPO ?? null;
}

function getGlob(): string {
  return process.env.AGENT_MANIFEST_GLOB ?? "agents/archetypes/**/manifests/*.yaml";
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "blackroad-registry",
  };

  if (process.env.GH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
  }

  return headers;
}

function shouldUseCachedList(): boolean {
  return Date.now() - listCache.lastFetched < CACHE_TTL && listCache.data.length > 0;
}

export async function listGithubManifests(): Promise<ManifestRef[]> {
  const repo = getRepo();
  if (!repo) {
    return [];
  }

  if (shouldUseCachedList()) {
    return listCache.data;
  }

  const url = `${GITHUB_API_BASE}/repos/${repo}/git/trees/HEAD?recursive=1`;
  const headers = new Headers(authHeaders());
  if (listCache.etag) {
    headers.set("If-None-Match", listCache.etag);
  }

  const response = await fetch(url, { headers });

  if (response.status === 304) {
    listCache.lastFetched = Date.now();
    return listCache.data;
  }

  if (!response.ok) {
    console.warn(`Unable to list manifests from GitHub: ${response.status}`);
    return listCache.data;
  }

  const payload: { tree?: Array<{ path: string; type: string; sha: string }> } =
    await response.json();
  const glob = getGlob();

  const entries = (payload.tree ?? [])
    .filter((item) => item.type === "blob" && minimatch(item.path, glob))
    .map((item) => ({ path: item.path, sha: item.sha }));

  listCache.data = entries;
  listCache.lastFetched = Date.now();
  const etag = response.headers.get("etag") ?? undefined;
  if (etag) {
    listCache.etag = etag;
  }

  return entries;
}

function shouldUseCachedContent(path: string): ManifestContentCache | null {
  const cached = contentCache.get(path);
  if (!cached) {
    return null;
  }

  if (Date.now() - cached.lastFetched < CACHE_TTL) {
    return cached;
  }

  return null;
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function fetchGithubManifest(path: string): Promise<string | null> {
  const repo = getRepo();
  if (!repo) {
    return null;
  }

  const cached = shouldUseCachedContent(path);
  if (cached) {
    return cached.content;
  }

  const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${encodePath(path)}`;
  const headers = new Headers(authHeaders());
  headers.set("Accept", "application/vnd.github.raw");

  const previous = contentCache.get(path);
  if (previous?.etag) {
    headers.set("If-None-Match", previous.etag);
  }
  if (previous?.lastModified) {
    headers.set("If-Modified-Since", previous.lastModified);
  }

  const response = await fetch(url, { headers });

  if (response.status === 304 && previous) {
    previous.lastFetched = Date.now();
    return previous.content;
  }

  if (response.status === 404) {
    contentCache.delete(path);
    return null;
  }

  if (!response.ok) {
    console.warn(`Unable to fetch manifest ${path}: ${response.status}`);
    return null;
  }

  const content = await response.text();
  const etag = response.headers.get("etag") ?? undefined;
  const lastModified = response.headers.get("last-modified") ?? undefined;

  contentCache.set(path, {
    content,
    etag,
    lastModified,
    lastFetched: Date.now(),
  });

  return content;
}
