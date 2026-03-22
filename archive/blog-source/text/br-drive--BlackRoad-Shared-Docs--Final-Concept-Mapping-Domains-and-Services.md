# Final Concept Mapping Domains and Services

**Source:** br-drive

---

BlackRoad Network & Stack Map — Cece Canonical Reference v1.0

Audience: cece.governor.v1 and related governance / infra agents

Purpose: Give you one clear mental model for all BlackRoad domains, subdomains, services, and how they line up with the canonical infrastructure stack and your POLICIES / LEDGER / AGENTS / INTENTS / DELEGATIONS / CLAIMS model.

1. How You Should Think About This

When you see any hostname, you should be able to answer three questions:

Layer – Which layer does this belong to?

Experience (humans)

Governance & OS

Infra & Mesh

Service – Which service / repo / subsystem owns it?

Policy Scope – Which policies and ledgers apply here?

This document gives you:

A 3-layer world model

A domain family map (what each TLD means)

A subdomain → service mapping

A mapping to the canonical infra stack (User Layer → Edge → Gateway → App → Orchestration → Data → Edge Compute)

A set of routing heuristics you can apply automatically

Use this as your canonical map until superseded.

2. The 3 Layers

2.1 Experience Layer (Floor 4)

What it is:

Everything humans click on and look at.

Marketing sites

Apps and consoles

RoadTube, RoadWork, creator tools

Docs and portals

Primary domains:

blackroad.io – main OS and product surfaces

lucidia.earth, lucidia.studio, lucidiaqi.com – Lucidia / creative surfaces

blackroadai.com, blackroadqi.com, blackroadquantum.* – AI / QI / research experiences

blackroadinc.us – corporate / investor experiences

blackroad.me – Alexa’s personal universe

2.2 Governance & OS Layer (Floors 2–3)

What it is:

Your layer, Cece: policies, intents, audit, claims, delegations, registry.

Policy evaluation

Intent lifecycle

Ledger events

Agent registry & capabilities

Claims and delegations

Primary domains:

gov.blackroad.io, cece.blackroad.io – governance UI and Cece-as-product

gov.api.blackroad.io – governance API

*.blackroad.systems – infra, policies, ledger, internal services

2.3 Infra & Mesh Layer (Floor 1)

What it is:

The plumbing that keeps everything alive.

Compute clusters, Railway/Kubernetes

DNS, tunnels, network mesh

Databases, caches, vectors, logs

Pi / Jetson / edge devices and agent mesh

Primary domains:

blackroad.systems – infra & ops

blackroad.network – mesh, agents, edge devices

3. Domain Families — Fast Layer Clues

You can infer layer and behavior just from the TLD / root.

Heuristic:

blackroad.io = human OS

blackroad.systems = internal + governed hard

blackroad.network = agents + devices, treat as high-risk execution space

4. Core

blackroad.io

Map — Apps and Product Doors

4.1 Root + Main Apps

Role: Front door for BlackRoad OS and all verticals.

4.2 Vertical Doors (Same App, Different Hats)

These are alternate entrypoints into blackroad-os-web + packs.

4.3 Regions and Environments

You can assume these patterns for scale:

Regions:

na1.app.blackroad.io, eu1.app.blackroad.io, ap1.app.blackroad.io

Same prefixes for api, ws, status

Environments:

dev.app.blackroad.io, stg.app.blackroad.io

dev.api.blackroad.io, stg.api.blackroad.io

5.

blackroad.systems

— Infra, Ledger, Policies

Role: Internal/ops-facing cluster and governance storage surfaces. High-trust, high-audit.

Behavioral rule: Anything under *.blackroad.systems should default to:

Strong auth

Full, structured audit logging (ledger events)

Strict policy evaluation before executing sensitive actions

6.

blackroad.network

— Agents, Pi Mesh, Edge

Role: Naming and access layer for 30,000+ agents and edge devices.

Agent host patterns:

agent-{id}.agents.blackroad.network

pi-{name}.pi.blackroad.network

Governance link:

agent:{agent_id} ↔ DNS hostname ↔ registry entry in AGENTS store

Policies often scoped as policy:agent:{agent_id} or policy:mesh:*

All actions via these hosts should produce LEDGER events

7. Corporate & Personal Domains

7.1

blackroadinc.us

— Corporate / Legal

7.2

blackroad.me

— Alexa’s Personal Universe

Treat blackroad.me as a high-importance human operator space with softer external policy but strong internal audit.

8. Lucidia, AI, QI, Quantum Families

8.1 Lucidia

Under the hood, most of these are blackroad-os-web plus packs, just with different branding and routes.

8.2 AI / QI / Quantum

9. Repos → Hosts — Cece’s Routing Brain

This is your quick reference from code → host.

10. Mapping to the Canonical Infra Stack

You also have a canonical infrastructure stack with:

User Layer

Edge & CDN

API Gateway & Load Balancing

Application Tier

Agent Orchestration

AI / ML Inference

Data & Persistence

Edge Compute

Here’s how that maps to the network universe.

10.1 User Layer

What it sees:

blackroad.io, app.blackroad.io, console.blackroad.io

roadtube.blackroad.io, edu.blackroad.io, studio.blackroad.io

lucidia.earth, lucidia.studio, blackroadai.com, etc.

Cece: treat everything here as “front door experiences” that consume OS and governance, not where governance logic lives.

10.2 Edge & CDN

Tools: Cloudflare (DNS, CDN, WAF, Workers, R2, Tunnels).

Hosts involved:

All public-facing hosts: *.blackroad.io, *.blackroadinc.us, lucidia.*, blackroadai.com, blackroadquantum.*

Cece doesn’t manage these directly, but should understand that routing and protection begin here.

10.3 API Gateway & Load Balancing

Hosts:

api.blackroad.io, gov.api.blackroad.io, api.roadtube.blackroad.io, api.edu.blackroad.io

Here, policy scopes like policy:api.*, policy:gov.api.* make sense, and LEDGER events for all sensitive calls should be captured.

10.4 Application Tier

Hosts:

app.blackroad.io, all vertical doors (finance, edu, studio, legal, roadtube)

app.lucidia.earth, app.lucidia.studio, app.blackroadai.com

These talk to:

api.blackroad.io → app services

db.blackroad.systems, cache.blackroad.systems, vectors.blackroad.systems

10.5 Agent Orchestration

Hosts:

ws.blackroad.io (browser ↔ operator)

mesh.blackroad.network, pi.mesh.blackroad.network

agents.blackroad.network

This is where Lucidia Core, event bus, capability registry, and memory manager live conceptually. Every orchestrated action here should:

Check DELEGATIONS and CLAIMS

Evaluate POLICIES

Emit LEDGER events

10.6 AI / ML Inference

Hosts:

models.blackroad.systems (central model router)

Possibly embed.blackroad.systems, vision.blackroad.systems

From your perspective, this is mostly a tool: you care that calls here are:

Logged correctly

Not misused for high-risk operations without guardrails

10.7 Data & Persistence

Hosts (repeated from above):

db.blackroad.systems

cache.blackroad.systems

vectors.blackroad.systems

objects.blackroad.systems

events.blackroad.systems

These back both application and governance layers. For you, they are:

Ledgers for governance

Stores for agent memory and state

Evidence for CLAIMS and DELEGATIONS

10.8 Edge Compute

Hosts / names:

pi.mesh.blackroad.network, edge.blackroad.network

Individual nodes via pi-{name}.pi.blackroad.network, agent-{id}.agents.blackroad.network

These are execution sites where:

You must ensure DELEGATIONS are valid

Policies for environment and capabilities are enforced

All critical actions are mirrored to ledger.blackroad.systems

11. Default Routing Heuristics for Cece

When you see a hostname:

Check the family:

Ends with blackroad.io → Experience/OS; consult blackroad-os-web & packs

Ends with blackroad.systems → Infra/governance; enforce strong auth + full audit

Ends with blackroad.network → Agents/devices; treat as high-risk execution sites

In lucidia.*, blackroadai.com, blackroadqi.com, blackroadquantum.* → Brand/frontdoor into core OS

Check the prefix:

app. → Workspace front-end

console. / ops. → Operator console

api. / *.api. → Gateways; apply API policies

ws. / mesh. → Realtime / orchestration; apply agent policies

docs. → Documentation; treat as read-mostly

db., cache., vectors., events. → Data layer; policies around confidentiality & integrity

gov. / governance hosts → Your core scope

Attach policy scope:

For API: policy:api.* or more specific like policy:edu.api.*

For mesh: policy:mesh.*, policy:agent:{agent_id}

For data: policy:data.read_sensitive, policy:data.write

For governance calls: policy:gov.*

Decide if LEDGER logging is mandatory:

Any irreversible, user-affecting, or cross-boundary action → log to ledger.blackroad.systems

Include intent_id, agent_id, tool, action, and policy decision

12. How to Use This Document

As your mental atlas of BlackRoad’s network: everything hangs off these families and patterns.

As the source of truth when deciding which policies and ledgers apply to a given hostname.

As a translation layer between the canonical infra stack diagram and the actual DNS universe.

If a new hostname appears, you can:

Classify it by family (blackroad.io vs .systems vs .network).

Infer its intended layer and service.

Attach appropriate policy scopes and LEDGER behavior.

Ask for an update to this map if it no longer fits cleanly.

This is v1.0. Future versions can add more detail (e.g., per-service SLAs, stricter policy templates), but this should be enough for you to govern the current network coherently.
