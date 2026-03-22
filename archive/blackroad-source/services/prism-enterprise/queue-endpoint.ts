/*
 * Prism Console merge queue endpoint
 * ----------------------------------
 * This Cloudflare Worker (or any Fetch-compatible runtime) coordinates
 * a lightweight merge queue with the GitHub repository as the source of truth.
 *
 * Responsibilities:
 * - Maintain ops/queue.json (queue + paused flag).
 * - Append JSONL audit entries to ops/audit.log.jsonl.
 * - Comment on PRs for observable actions.
 * - Drive merges after verifying a PR is ready.
 * - Offer a Slack-compatible slash command for queue control.
 */

interface QueueState {
  queue: number[];
  paused: boolean;
}

interface AuditEntry {
  ts: string;
  actor: string;
  type: string;
  pr?: number;
  details?: Record<string, unknown>;
}

export interface Env {
  GITHUB_TOKEN: string;
  REPO: string; // e.g. "blackroad-ai/blackroad-prism-console"
  MQ_TOKEN: string;
  DEFAULT_BRANCH?: string;
  MERGE_METHOD?: string;
}

const QUEUE_PATH = "ops/queue.json";
const AUDIT_PATH = "ops/audit.log.jsonl";
const MERGE_LABEL = "ready-to-merge";
const MERGE_COMMIT_TITLE_PREFIX = "Merge";

function now() {
  return new Date().toISOString();
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "prism-merge-queue",
    Accept: "application/vnd.github+json"
  };
}

async function fetchJSON<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

function decodeContent(value: string) {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeContent(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function readFile(env: Env, path: string) {
  const url = `https://api.github.com/repos/${env.REPO}/contents/${encodeURIComponentPath(path)}?ref=${env.DEFAULT_BRANCH ?? "main"}`;
  const res = await fetch(url, { headers: headers(env.GITHUB_TOKEN) });
  if (res.status === 404) {
    return { content: "", sha: undefined };
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to read ${path}: ${res.status} ${text}`);
  }
  const json = await res.json();
  const content = json.content ? decodeContent(json.content) : "";
  return { content, sha: json.sha as string | undefined };
}

function encodeURIComponentPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function writeFile(env: Env, path: string, content: string, message: string, sha?: string) {
  const body = {
    message,
    content: encodeContent(content),
    sha,
    branch: env.DEFAULT_BRANCH ?? "main"
  };
  const url = `https://api.github.com/repos/${env.REPO}/contents/${encodeURIComponentPath(path)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...headers(env.GITHUB_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to write ${path}: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.content.sha as string;
}

async function appendAudit(env: Env, entry: AuditEntry) {
  const { content, sha } = await readFile(env, AUDIT_PATH);
  const line = JSON.stringify(entry);
  const merged = content ? `${content.replace(/\s*$/, "")}\n${line}\n` : `${line}\n`;
  await writeFile(env, AUDIT_PATH, merged, `chore(merge-queue): audit ${entry.type}`, sha);
}

async function readQueue(env: Env): Promise<{ state: QueueState; sha?: string }> {
  const { content, sha } = await readFile(env, QUEUE_PATH);
  if (!content.trim()) {
    return { state: { queue: [], paused: false }, sha };
  }
  try {
    const parsed = JSON.parse(content) as Partial<QueueState> | number[];
    if (Array.isArray(parsed)) {
      return { state: { queue: parsed, paused: false }, sha };
    }
    return {
      state: {
        queue: Array.isArray(parsed.queue) ? parsed.queue : [],
        paused: Boolean(parsed.paused)
      },
      sha
    };
  } catch (error) {
    throw new Error(`Invalid queue file: ${(error as Error).message}`);
  }
}

async function writeQueue(env: Env, state: QueueState, sha?: string) {
  const body = JSON.stringify(state, null, 2) + "\n";
  return writeFile(env, QUEUE_PATH, body, "chore(merge-queue): update queue", sha);
}

async function postPRComment(env: Env, pr: number, body: string) {
  const url = `https://api.github.com/repos/${env.REPO}/issues/${pr}/comments`;
  await fetchJSON(url, {
    method: "POST",
    headers: {
      ...headers(env.GITHUB_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ body })
  });
}

async function getPullRequest(env: Env, pr: number) {
  return fetchJSON<any>(`https://api.github.com/repos/${env.REPO}/pulls/${pr}`, {
    headers: headers(env.GITHUB_TOKEN)
  });
}

async function enqueue(env: Env, pr: number, actor: string) {
  const { state, sha } = await readQueue(env);
  let added = false;
  if (!state.queue.includes(pr)) {
    state.queue.push(pr);
    await writeQueue(env, state, sha);
    added = true;
  }
  const entry: AuditEntry = { ts: now(), actor, type: "enqueue", pr };
  await appendAudit(env, entry);
  if (added) {
    await postPRComment(env, pr, `🔁 Added to merge queue by ${actor}. Position: ${state.queue.indexOf(pr) + 1}.`);
  }
  return state;
}

async function unqueue(env: Env, pr: number, actor: string) {
  const { state, sha } = await readQueue(env);
  if (!state.queue.includes(pr)) {
    return state;
  }
  state.queue = state.queue.filter((p) => p !== pr);
  await writeQueue(env, state, sha);
  const entry: AuditEntry = { ts: now(), actor, type: "unqueue", pr };
  await appendAudit(env, entry);
  await postPRComment(env, pr, `🚫 Removed from merge queue by ${actor}.`);
  return state;
}

async function setPaused(env: Env, paused: boolean, actor: string) {
  const { state, sha } = await readQueue(env);
  state.paused = paused;
  await writeQueue(env, state, sha);
  await appendAudit(env, { ts: now(), actor, type: paused ? "pause" : "resume" });
  return state;
}

async function recordMerge(env: Env, pr: number, actor: string, mergeSha: string) {
  await appendAudit(env, {
    ts: now(),
    actor,
    type: "merge",
    pr,
    details: { sha: mergeSha }
  });
  await postPRComment(env, pr, `✅ Merged by merge queue (commit ${mergeSha}).`);
}

async function tick(env: Env, actor: string) {
  const { state, sha } = await readQueue(env);
  if (state.paused) {
    return { status: "paused", state };
  }
  if (!state.queue.length) {
    return { status: "empty", state };
  }
  const prNumber = state.queue[0];
  const pr = await getPullRequest(env, prNumber);
  if (!pr || pr.state !== "open") {
    state.queue.shift();
    await writeQueue(env, state, sha);
    await appendAudit(env, { ts: now(), actor, type: "pr-closed", pr: prNumber });
    return { status: "skipped", state, pr: prNumber };
  }
  if (pr.draft) {
    return { status: "draft", state, pr: prNumber };
  }
  const labels = Array.isArray(pr.labels) ? pr.labels.map((l: any) => l.name) : [];
  if (!labels.includes(MERGE_LABEL)) {
    state.queue.shift();
    await writeQueue(env, state, sha);
    await appendAudit(env, { ts: now(), actor, type: "missing-label", pr: prNumber });
    return { status: "missing-label", state, pr: prNumber };
  }
  if (pr.mergeable_state !== "clean") {
    return { status: pr.mergeable_state ?? "unknown", state, pr: prNumber };
  }

  const mergeMethod = env.MERGE_METHOD ?? "squash";
  const title = `${MERGE_COMMIT_TITLE_PREFIX}: ${pr.title}`;
  const mergeRes = await fetch(`https://api.github.com/repos/${env.REPO}/pulls/${prNumber}/merge`, {
    method: "PUT",
    headers: {
      ...headers(env.GITHUB_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      merge_method: mergeMethod,
      commit_title: `${title} (#${prNumber})`
    })
  });
  if (!mergeRes.ok) {
    const text = await mergeRes.text();
    await appendAudit(env, {
      ts: now(),
      actor,
      type: "merge-error",
      pr: prNumber,
      details: { status: mergeRes.status, body: text }
    });
    return { status: "merge-error", state, pr: prNumber, body: text };
  }
  const mergeJson = await mergeRes.json();
  const mergeSha = mergeJson.sha as string;
  state.queue.shift();
  await writeQueue(env, state, sha);
  await recordMerge(env, prNumber, actor, mergeSha);
  return { status: "merged", state, pr: prNumber, sha: mergeSha };
}

async function latestMerged(env: Env): Promise<{ pr: number; sha: string; nodeId?: string } | null> {
  const { content } = await readFile(env, AUDIT_PATH);
  const lines = content.trim().split(/\n+/).filter(Boolean).reverse();
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as AuditEntry & { details?: { sha?: string; nodeId?: string } };
      if (entry.type === "merge" && entry.pr && entry.details?.sha) {
        return { pr: entry.pr, sha: entry.details.sha, nodeId: entry.details.nodeId as string | undefined };
      }
    } catch (error) {
      // skip invalid lines
    }
  }
  return null;
}

async function revertMerge(env: Env, pr: number | "last", actor: string) {
  let target = await latestMerged(env);
  if (pr !== "last") {
    const info = await getPullRequest(env, pr);
    if (!info || !info.merge_commit_sha) {
      throw new Error(`PR #${pr} has not been merged.`);
    }
    target = { pr, sha: info.merge_commit_sha, nodeId: info.node_id };
  }
  if (!target) {
    throw new Error("No merged PR found to revert.");
  }
  const prInfo = await getPullRequest(env, target.pr);
  const nodeId = prInfo.node_id;
  const mutation = {
    query: `mutation Revert($pullRequestId: ID!) {\n      revertPullRequest(input: {pullRequestId: $pullRequestId}) {\n        pullRequest { number url }\n      }\n    }`,
    variables: { pullRequestId: nodeId }
  };
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...headers(env.GITHUB_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mutation)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Failed to revert PR #${target.pr}: ${text}`);
  }
  const json = JSON.parse(text);
  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? "Unknown revert error");
  }
  const revertPr = json.data?.revertPullRequest?.pullRequest;
  await appendAudit(env, {
    ts: now(),
    actor,
    type: "revert",
    pr: target.pr,
    details: { revertPullRequest: revertPr }
  });
  return { original: target.pr, revert: revertPr };
}

function formatStatus(state: QueueState) {
  if (!state.queue.length) {
    return state.paused ? "Queue is paused and empty." : "Queue is empty.";
  }
  const lines = state.queue.map((pr, idx) => `${idx === 0 ? "➡️" : "•"} #${pr}`);
  const prefix = state.paused ? "⏸️ Queue paused." : "▶️ Queue active.";
  return `${prefix}\n${lines.join("\n")}`;
}

async function handleSlack(env: Env, text: string, actor: string) {
  const [command, ...rest] = text.trim().split(/\s+/);
  switch ((command || "status").toLowerCase()) {
    case "pause": {
      const state = await setPaused(env, true, actor);
      return `⏸️ Merge queue paused. ${state.queue.length} PR(s) waiting.`;
    }
    case "resume": {
      const state = await setPaused(env, false, actor);
      return `▶️ Merge queue resumed. ${state.queue.length} PR(s) waiting.`;
    }
    case "status": {
      const { state } = await readQueue(env);
      return formatStatus(state);
    }
    case "unqueue": {
      const pr = Number(rest[0]);
      if (!pr) {
        throw new Error("Provide a PR number to unqueue.");
      }
      const state = await unqueue(env, pr, actor);
      return `Removed #${pr} from queue. ${state.queue.length} remaining.`;
    }
    case "revert": {
      const target = rest[0] === "last" || !rest[0] ? "last" : Number(rest[0]);
      const reverted = await revertMerge(env, target as any, actor);
      if (!reverted?.revert) {
        return "No revert PR created.";
      }
      return `Revert for #${reverted.original} opened: ${reverted.revert.url}`;
    }
    default:
      return "Commands: pause, resume, status, unqueue <pr>, revert <pr|last>.";
  }
}

function parseForm(body: string) {
  const pairs = body.split("&").map((kv) => kv.split("="));
  const result: Record<string, string> = {};
  for (const [key, value] of pairs) {
    if (!key) continue;
    result[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
  }
  return result;
}

function authorized(req: Request, env: Env, form?: Record<string, string>) {
  const header = req.headers.get("authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7) === env.MQ_TOKEN;
  }
  if (form && form.token) {
    return form.token === env.MQ_TOKEN;
  }
  return false;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    let actor = "automation";
    const url = new URL(req.url);

    if (req.method === "POST" && req.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const form = parseForm(text);
      if (!authorized(req, env, form)) {
        return new Response("unauthorized", { status: 401 });
      }
      actor = form.user_name ?? "slack";
      try {
        const response = await handleSlack(env, form.text ?? "status", actor);
        return Response.json({ response_type: "in_channel", text: response });
      } catch (error) {
        const message = (error as Error).message;
        return Response.json({ response_type: "ephemeral", text: `⚠️ ${message}` }, { status: 400 });
      }
    }

    if (!authorized(req, env)) {
      return new Response("unauthorized", { status: 401 });
    }

    try {
      if (req.method === "POST" && url.pathname === "/enqueue") {
        const body = await req.json();
        const pr = Number(body.pr);
        actor = body.source ?? "workflow";
        if (!pr) {
          throw new Error("Missing PR number");
        }
        const state = await enqueue(env, pr, actor);
        return Response.json({ ok: true, state });
      }
      if (req.method === "POST" && url.pathname === "/unqueue") {
        const body = await req.json();
        const pr = Number(body.pr);
        actor = body.source ?? "workflow";
        if (!pr) {
          throw new Error("Missing PR number");
        }
        const state = await unqueue(env, pr, actor);
        return Response.json({ ok: true, state });
      }
      if (req.method === "POST" && url.pathname === "/tick") {
        const result = await tick(env, actor);
        return Response.json({ ok: true, ...result });
      }
      if (req.method === "POST" && url.pathname === "/revert") {
        const body = await req.json();
        const target = body.pr ?? "last";
        const result = await revertMerge(env, target, actor);
        return Response.json({ ok: true, result });
      }
      if (req.method === "GET" && url.pathname === "/status") {
        const { state } = await readQueue(env);
        return Response.json({ ok: true, state });
      }
      return new Response("ok");
    } catch (error) {
      const message = (error as Error).message;
      await appendAudit(env, { ts: now(), actor, type: "error", details: { message } });
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }
};
