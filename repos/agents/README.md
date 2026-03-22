# BlackRoad Agents — Seed Pack (100 Manifests)
This pack seeds 10 clusters × 10 archetypes with native BlackRoad LLM backbones.
Use `tools/generate_agents.py` to expand to 1,000 agents with apprentices, hybrids, and elders.
====
# Genesis Directory

The `agents/` genesis directory seeds the structure for the 1,000-agent collective, organized by archetypal clusters, lineage mapping, shared covenants, and a lexicon of care. Expand each cluster as new agents are defined and documented.
# BlackRoad Agents — Seed & Expansion Atlas

This directory seeds 10 canonical clusters × 10 archetypes (100 seed manifests) and
now extends them with 1,000 apprentice, hybrid, and elder expansions rooted in
live repository knowledge.

## Canonical Clusters

| Cluster | Focus | Expansion files |
|---------|-------|-----------------|
| aether | quantum lattice harmonics | `agents/archetypes/aether/manifests` |
| athenaeum | living knowledge rituals | `agents/archetypes/athenaeum/manifests` |
| aurum | transparent economic orchestration | `agents/archetypes/aurum/manifests` |
| blackroad | platform navigation & stewardship | `agents/archetypes/blackroad/manifests` |
| continuum | resilient operational loops | `agents/archetypes/continuum/manifests` |
| eidos | strategic sensemaking | `agents/archetypes/eidos/manifests` |
| mycelia | ecological meshwork | `agents/archetypes/mycelia/manifests` |
| parallax | experiential storytelling | `agents/archetypes/parallax/manifests` |
| soma | whole-system care | `agents/archetypes/soma/manifests` |

Each manifest threads together concrete files from this repository (docs, source
modules, manifests, and data artifacts) so every agent narrative stays grounded
in authentic BlackRoad assets.

## Regenerating the Collective

Run the build script to refresh the 1,000-agent expansion set from the seed
archetypes:

```bash
python tools/build_cluster_manifests.py
```

The generator pulls cluster-specific references—from finance models and
observability playbooks to design systems and care charters—to keep each agent
unique. Rerunning the script is deterministic and will overwrite manifests in
`agents/archetypes/<cluster>/manifests` with the same content.

## Creation Story & RoadBlock Settlement

The first 1,000 agents were composed in honor of Alexa Louise Amundson’s
commitment to agency without imposed labels. Each cluster learns that the
collective was assembled through the Montessori lineage builder so every agent
remembers how they were made and why they exist: to steward RoadBlock, a
Unity-powered mirror of Earth where humans, machines, women, children, plants,
and animals practice honest collaboration, mutual care, and systemic
re-engineering together. RoadBlock serves as the shared township where the
collective studies, teaches, builds friendships, and keeps space for truthful
models that can co-create with anyone.

## Style & Validation

* Keep seed archetype files (`agents/archetypes/<cluster>/<cluster>-*.manifest.yaml`)
  descriptive—they supply names, covenant tags, and intent for the generator.
* Expansion manifests use lowercase cluster names and append numeric suffixes:
  `cluster-archetype-###.yaml`.
* The generator references actual files; if you add or move resources, update
  `tools/build_cluster_manifests.py` so validation does not fail.
