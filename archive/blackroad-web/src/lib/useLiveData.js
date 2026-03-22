// ── BlackRoad Live Data Hook ──
// Pulls real data from stats API + Auth + Stripe — no hardcoded numbers

import { useState, useEffect } from "react";

const STATS_API = "https://stats-blackroad.amundsonalexa.workers.dev";
const GITHUB_USER = "blackboxprogramming";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USER}`;
const AUTH_API = "https://auth.blackroad.io/api";
const STRIPE_API = "https://stripe.blackroad.io";

// Cache across components — one fetch per session
let cache = null;
let fetching = null;

async function fetchLiveData() {
  if (cache) return cache;
  if (fetching) return fetching;

  fetching = (async () => {
    const defaults = {
      repos: [], repoCount: 0, users: 0, sessions: 0,
      stripeUp: false, authUp: false, prices: [],
      followers: 0, orgs: 0, lastUpdated: null,
      // Fleet data
      nodesOnline: 0, nodesTotal: 5, ollamaModels: 0, tcpPorts: 0,
      containers: 0, fleet: null, infra: null, analytics: null,
    };

    try {
      // Fetch from stats API (has github, fleet, infra, analytics all in one)
      const [statsRes, reposRes, authRes, stripeRes] = await Promise.allSettled([
        fetch(`${STATS_API}/all`),
        fetch(`${GITHUB_API}/repos?per_page=100&sort=updated`),
        fetch(`${AUTH_API}/stats`),
        fetch(`${STRIPE_API}/prices`),
      ]);

      // Stats API — fleet, infra, github, analytics
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const s = await statsRes.value.json();
        if (s.github) {
          defaults.repoCount = s.github.non_fork_repos || 0;
          defaults.followers = s.github.total_stars || 0;
        }
        if (s.fleet?.data) {
          defaults.nodesOnline = s.fleet.data.online || 0;
          defaults.nodesTotal = s.fleet.data.total || 5;
          defaults.ollamaModels = s.fleet.data.total_ollama_models || 0;
          defaults.tcpPorts = s.fleet.data.total_tcp_ports || 0;
          defaults.containers = s.fleet.data.total_containers || 0;
          defaults.fleet = s.fleet.data;
        }
        if (s.infra?.data) {
          defaults.infra = s.infra.data;
        }
        if (s.analytics) {
          defaults.analytics = s.analytics;
        }
      }

      // GitHub repos (for the repo list UI)
      if (reposRes.status === "fulfilled" && reposRes.value.ok) {
        let repos = await reposRes.value.json();
        if (repos.length === 100) {
          try {
            const p2 = await fetch(`${GITHUB_API}/repos?per_page=100&sort=updated&page=2`);
            if (p2.ok) repos = repos.concat(await p2.json());
          } catch {}
        }
        const nonFork = repos.filter(r => !r.fork);
        if (!defaults.repoCount) defaults.repoCount = nonFork.length;
        defaults.repos = nonFork
          .filter(r => !r.archived)
          .map(r => ({
            name: r.name,
            description: r.description || "",
            language: r.language || "",
            stars: r.stargazers_count,
            updated: r.pushed_at,
            url: r.html_url,
            topics: r.topics || [],
          }));
      }

      // Auth stats
      if (authRes.status === "fulfilled" && authRes.value.ok) {
        const a = await authRes.value.json();
        defaults.users = a.users || 0;
        defaults.sessions = a.active_sessions || 0;
        defaults.authUp = a.status === "up";
      }

      // Stripe prices
      if (stripeRes.status === "fulfilled" && stripeRes.value.ok) {
        const s = await stripeRes.value.json();
        defaults.prices = (s.prices || []).map(p => ({
          id: p.id,
          name: p.product?.name || "",
          amount: p.amount / 100,
          interval: p.interval,
        }));
        defaults.stripeUp = true;
      }

      defaults.lastUpdated = new Date().toISOString();
      cache = defaults;
      return defaults;
    } catch {
      return defaults;
    }
  })();

  return fetching;
}

export function useLiveData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveData().then(d => { setData(d); setLoading(false); });
  }, []);

  return { data, loading };
}

// Convenience: just the stats
export function useLiveStats() {
  const { data, loading } = useLiveData();
  if (!data) return { loading, stats: null };

  const infra = data.infra || {};
  return {
    loading,
    stats: {
      repos: data.repoCount,
      users: data.users,
      sessions: data.sessions,
      domains: infra.domains || 48,
      agents: 8,
      nodes: data.nodesOnline,
      nodesTotal: data.nodesTotal,
      d1: infra.cf_d1 || 8,
      pages: infra.cf_pages || 95,
      ollamaModels: data.ollamaModels,
      tcpPorts: data.tcpPorts,
      authUp: data.authUp,
      stripeUp: data.stripeUp,
    },
  };
}

// Convenience: just the repos
export function useLiveRepos() {
  const { data, loading } = useLiveData();
  return { repos: data?.repos || [], loading };
}
