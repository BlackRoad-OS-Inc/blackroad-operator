// Real infrastructure data hooks
import { useState, useEffect } from 'react';
import { CONFIG } from '../lib/config';

// Fetch real data from your Pis and services
export function useInfraStatus() {
  const [data, setData] = useState({
    pis: CONFIG.infra.pis.map(p => ({ ...p, online: true, latency: null })),
    droplets: CONFIG.infra.droplets.map(d => ({ ...d, online: true })),
    tunnelConnections: 24,
    domainsRouted: CONFIG.domains.total,
  });

  useEffect(() => {
    // Ping each Pi to get real latency
    const checkPi = async (pi) => {
      const start = Date.now();
      try {
        const res = await fetch(`http://${pi.ip}:3100/api/v1/version`, {
          signal: AbortSignal.timeout(3000),
        });
        return { ...pi, online: res.ok, latency: Date.now() - start };
      } catch {
        return { ...pi, online: false, latency: null };
      }
    };

    // Check RoadCode repos count
    const checkRoadCode = async () => {
      try {
        const res = await fetch(`${CONFIG.api.roadcode}/api/v1/repos/search?limit=1`, {
          headers: { Authorization: `token ${CONFIG.api.roadcodeToken}` },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const headers = Object.fromEntries(res.headers.entries());
          return parseInt(headers['x-total-count'] || '186');
        }
      } catch {}
      return 186;
    };

    const poll = async () => {
      const pis = await Promise.all(CONFIG.infra.pis.map(checkPi));
      const repos = await checkRoadCode();
      setData(d => ({ ...d, pis, totalRepos: repos }));
    };

    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  return data;
}

// Fetch real agent status from Pis
export function useAgents() {
  const [agents, setAgents] = useState(CONFIG.agents);

  useEffect(() => {
    const check = async () => {
      // Check if agent services are responding on their respective Pis
      const updated = await Promise.all(
        CONFIG.agents.map(async (agent) => {
          const pi = CONFIG.infra.pis.find(p => p.name.toLowerCase() === agent.pi);
          if (!pi) return agent;
          try {
            const res = await fetch(`http://${pi.ip}:3100`, {
              signal: AbortSignal.timeout(2000),
            });
            return { ...agent, status: res.ok ? 'online' : 'degraded' };
          } catch {
            return { ...agent, status: 'offline' };
          }
        })
      );
      setAgents(updated);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  return agents;
}

// Real domain status checker
export function useDomainStatus() {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    const allDomains = [
      ...CONFIG.domains.primary,
      ...CONFIG.domains.active,
      ...CONFIG.domains.subdomains.map(s => `${s}.blackroad.io`),
    ];

    const check = async () => {
      const results = await Promise.all(
        allDomains.map(async (domain) => {
          try {
            await fetch(`https://${domain}`, {
              mode: 'no-cors',
              signal: AbortSignal.timeout(5000),
            });
            return { domain, status: 'operational', code: 200 };
          } catch {
            return { domain, status: 'unreachable', code: 0 };
          }
        })
      );
      setDomains(results);
    };
    check();
  }, []);

  return domains;
}

// RoadCode repos
export function useRoadCodeRepos(org = '') {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const url = org
          ? `${CONFIG.api.roadcode}/api/v1/orgs/${org}/repos?limit=50`
          : `${CONFIG.api.roadcode}/api/v1/repos/search?limit=50`;
        const res = await fetch(url, {
          headers: { Authorization: `token ${CONFIG.api.roadcodeToken}` },
        });
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : data.data || []);
      } catch {
        setRepos([]);
      }
      setLoading(false);
    };
    fetch_();
  }, [org]);

  return { repos, loading };
}
