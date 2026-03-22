# Domains and Subdomains Mapping

**Source:** br-drive

---

Got you. This one will be “The Gospel According to DNS” for Cece – one document that explains:

the layers (Experience / Governance / Infra / Mesh)

every important domain + subdomain

what backs it (repo / service)

how Cece should think about routing and future expansion

You can literally paste this as-is into Cece’s world as a system / context doc.

BlackRoad DNS & Service Map — Cece Reference v0

Audience: cece.governor.v1 and related governance/infra agents

Goal: Explain what every major domain & subdomain means, which services/repos back it, and how to extend the map safely for millions of users and tens of thousands of agents.

1. Mental Model (How Cece Should Think About This)

The BlackRoad universe is organized into 3 layers:

Experience Layer (Floor 4)

What humans see and click: apps, portals, RoadTube, RoadWork, studios, docs.

Governance & OS Layer (Floors 2–3)

Cece, policies, intents, ledger, delegations, claims, agent registry.

Infra & Mesh Layer (Floor 1)

Clusters, regions, Pi mesh, edge devices, logging, monitoring.

DNS is the map that tells Cece:

Which experience a human (or agent) is trying to reach.

Which backend/service/repo owns that experience.

Which governance rules, policies and ledgers apply there.

When Cece sees a hostname, it should be able to answer:

“This belongs to LAYER, is powered by SERVICE/REPO, and is governed by POLICY_SCOPE.”

2. Global Naming Conventions

2.1 Layer Clues

blackroad.io → Experience / OS (user-facing)

blackroad.systems → Infra/Ops (internal / operator-facing)

blackroad.network → Agent & device mesh (agents, Pi, edge)

blackroadinc.us / blackroad.me → Corporate / personal

lucidia.*, blackroadai.com, blackroadqi.com, blackroadquantum.* → Brand universes / AI / QI / research

2.2 Patterns

Apps: app.<domain> → main app or workspace

Operator consoles: console.<domain> / ops.<domain>

APIs: api.<domain> or <scope>.api.<domain>

WebSockets / realtime: ws.<domain> or mesh.<domain>

Docs: docs.<domain>

Status: status.<domain>

Static/CDN: cdn.<domain> / static.<domain>

Envs: dev., stg. prefixes → non-prod

Regions: na1., eu1., ap1. prefixes → region sharding

2.3 Governance Objects

These DNS names tie into governance objects:

agent:{agent_id} ↔ agent-{id}.agents.blackroad.network

intent:{intent_id} ↔ traffic to relevant api.*/app.* endpoints

policy:{scope}:* ↔ gov.*, *.blackroad.systems

ledger:{intent_id}:{event_id} ↔ ledger.blackroad.systems

3. Core Domains and Subdomains

3.1

blackroad.io

— Main OS & Experience Layer

Role: Front door to BlackRoad OS and multi-tenant workspace.

Key Subdomains

Vertical “Doors” (still same app)

These are alternate personas/entrypoints into blackroad-os-web:

Regional & Env Variants

Regions for scaling to tens of millions of users:

na1.app.blackroad.io, eu1.app.blackroad.io, ap1.app.blackroad.io

na1.api.blackroad.io, eu1.api.blackroad.io, …

na1.ws.blackroad.io, etc.

Envs:

dev.app.blackroad.io, stg.app.blackroad.io

dev.api.blackroad.io, stg.api.blackroad.io

3.2

blackroad.systems

— Infra & Ops Plane

Role: Internal/ops-facing cluster & governance control plane.

Cece: treat all *.blackroad.systems as high-trust, internal-only surfaces where strong policy enforcement and rich logging are mandatory.

3.3

blackroad.network

— Agent & Device Mesh

Role: Naming and access layer for 30,000+ agents and devices.

Agent hostnames:

agent-{id}.agents.blackroad.network

pi-{name}.pi.blackroad.network

Cece: link these to governance objects:

agent:{agent_id} ↔ DNS hostname ↔ registry entry in blackroad-os-agents

Policies often scoped as policy:agent:{agent_id} or policy:mesh:*.

3.4

blackroadinc.us

— Corporate / Legal

Legal pack (blackroad-os-pack-legal) may surface flows here for enterprise accounts.

3.5

blackroad.me

— Alexa’s Personal Universe

Treat blackroad.me as a low-risk but high-importance human-operator space for Alexa.

4. Product / Brand Families

4.1 Lucidia

Domains: lucidia.earth, lucidia.studio, lucidiaqi.com

Under the hood, most of these are still blackroad-os-web plus packs.

4.2 AI / QI / Quantum

Domains: blackroadai.com, blackroadqi.com, blackroadquantum.*

4.3 RoadTube (Creator & Memory Platform)

Primarily under blackroad.io but conceptually its own product.

4.4 RoadWork / Homework / Education

4.5 Creator Suite & Tools

Aliases via Lucidia:

studio.lucidia.studio → canvas.blackroad.io

write.lucidia.earth → writing.blackroad.io

5. Repo → Host Mapping (for Cece’s Routing Brain)

This is the “service registry” view so Cece can infer where a request should go.

6. How Cece Should Use This Map

When Cece receives:

a hostname → map it to:

layer (Experience / Governance / Infra / Mesh)

service (repo / service group)

policy_scope (e.g., policy:edu:*, policy:mesh:*)

an intent (e.g., “spin up a new education environment”) → choose:

appropriate base domain (edu.blackroad.io for UX)

appropriate internal control (infra.blackroad.systems, ops.blackroad.systems)

an agent reference → map:

agent_id ↔ agent-{id}.agents.blackroad.network

look up registry in blackroad-os-agents

enforce policies on mesh.blackroad.network / ws.blackroad.io

Default routing heuristics for Cece:

If hostname ends with blackroad.io

 → default to Experience/OS layer, check blackroad-os-web and relevant pack.

If hostname ends with blackroad.systems

 → treat as internal/infra; ensure strong auth + logging; tie to governance ledger.

If hostname ends with blackroad.network

 → treat as agent/mesh; focus on agents, devices, delegation, safety.

If hostname is in lucidia.* / blackroadai.com / blackroadqi.com

 → treat as brand/AI/QI front into core OS, but with narrative/UX overlays.

If new subdomain is needed

Choose the domain family that matches the audience:

humans as users → blackroad.io

Alexa personal → blackroad.me

infra / ops → blackroad.systems

agents/devices → blackroad.network

corporate / legal → blackroadinc.us

Follow the patterns above (e.g., app., api., studio., mesh.).

If you want, I can next turn this into:

a mini “service_registry.json” that Cece can ingest directly (hostname → layer → service → policy scope), or

a Cloudflare DNS CSV starter with just the v1 records you should actually create first.

But this document as-is is ready to drop into Cece’s context as the “authoritative map of the BlackRoad naming universe.”
