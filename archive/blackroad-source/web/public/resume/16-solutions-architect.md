# Alexa Amundson

**Solutions Architect**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Designed a hybrid architecture that combines $700 in edge hardware with Cloudflare's global network — 178 cloud resources, 48+ domains, 7 nodes, 52 TOPS AI compute, all working as one system. The proof is that it's running right now.

---

## Experience

### BlackRoad OS | Founder & Solutions Architect | 2025–Present

**The Design Decision: Why Hybrid**
- Pure cloud: fast to start, expensive to scale, no data sovereignty. Pure edge: cheap to run, limited reach, hard to expose
- Combined both: Cloudflare for global CDN, edge compute, and serverless databases. Pi fleet for persistent workloads, AI inference, and data ownership
- WireGuard mesh connects everything. Cloudflare tunnels expose services. Tailscale provides management plane. Three networking layers, one unified system

**The Stack: 178 Cloudflare Resources + 7 Fleet Nodes**
- 99 Pages (global CDN) + 23 D1 (serverless SQL) + 47 KV (edge config) + 11 R2 (object storage) = 178 managed resources
- 5 Pi nodes for persistent compute: Docker, Ollama, PostgreSQL, Nginx. 2 cloud VMs for VPN hub and public services
- AI inference distributed across 3 nodes with 52 TOPS — requests route to the node with the right model loaded

**The Validation**
- This architecture runs 48+ production domains, serves real traffic, and costs under $50/month in cloud spend. The rest is hardware you own
- 283 databases across 5 engines — each one placed where the latency and consistency requirements demand it

---

## Technical Skills

system design, Cloudflare, WireGuard, distributed systems, edge computing, AI infrastructure

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| D1 Databases | *live* | cloudflare.sh — wrangler d1 list --json |
| KV Namespaces | *live* | cloudflare.sh — wrangler kv list |
| R2 Buckets | *live* | cloudflare.sh — wrangler r2 bucket list |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
