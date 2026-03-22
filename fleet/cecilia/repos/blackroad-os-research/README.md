# blackroad-os-research

blackroad-os-research is the research and theory hub for BlackRoad OS. It contains conceptual papers, reference mappings, schemas, and experiments that inform the architecture of agents, journaling, and orchestration.

For a curated map of the documents below, see [index.md](index.md).

## Repository Layout

- **/sig**: Core Spiral Information Geometry (SIG) documents and spatial mappings for factors, agents, and attractors.
- **/ps-sha-infinity**: Identity-first specifications for PS-SHA∞, including anchoring rules and hash ladders.
- **/lucidia**: Architecture notes for the Generation-0 Conscious Agent Kernel and its mesh routing behaviors.
- **/roadchain**: Ledger theory describing event journaling, block formation, and truth-step aggregation.
- **/papers**: Conceptual writeups structured like internal papers that capture PS-SHA∞, Spiral Information Geometry (SIG), contradiction handling, finance automation, and related architectures.
- **/library**: Structured JSON metadata catalogs for reference materials (such as external PDFs and notes) that the system depends on.
- **/schemas**: JSON Schemas that define core conceptual structures such as PS-SHA∞ journal entries, SIG nodes, agent identity, and journal entry shapes.
- **/experiments**: Lightweight prototype models and simulations for contradiction handling and SIG visualizations.
- **/glossary**: Canonical definitions of key concepts and symbols for consistent usage across repos.

## How this Repo is Used by Other Repos

- **blackroad-os-core** uses schemas to shape domain models for journaling, agent identity, and SIG mappings.
- **blackroad-os-operator** consumes conceptual papers for contradiction handling, PS-SHA∞ semantics, and persistent agent identity guarantees.
- **blackroad-os-docs** links to these resources for deeper dives and supporting references in public-facing explanations.

## Contributing Notes

This repository prioritizes structured, text-based research artifacts. Experiments should stay lightweight and avoid heavyweight dependencies. Add TODOs where deeper math or formalization is needed.
