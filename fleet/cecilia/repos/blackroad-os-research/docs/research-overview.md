# Research Overview

Welcome to the **BlackRoad OS Research Lab** 🧪🧠

This repository serves as the R&D hub for BlackRoad OS, containing theory, experiments, and conceptual foundations that inform production implementations.

## 📁 Repository Structure

### Core Directories

- **`/papers`** - Research papers and theoretical foundations
  - Text-based research (Markdown, LaTeX)
  - Organized by domain (SIG, QLM, agents, PS-SHA∞, etc.)
  - Each paper should include: abstract, motivation, definitions, and links to experiments

- **`/notebooks`** - Jupyter notebooks and exploratory scripts
  - `sig/` - Spiral Information Geometry explorations
  - `qlm/` - Quantum Language Model experiments
  - `orchestration/` - Orchestration strategy prototypes
  - Each notebook should start with a header cell explaining purpose and dependencies

- **`/experiments`** - Structured experiment folders
  - Use format: `domain/experiment-YYYY-MM-DD-name/`
  - Each experiment must include:
    - `README.md` (what, why, how, results, next steps)
    - `config.json` or `config.yaml` (parameters)
    - `results/` (summaries, small plots, findings)

- **`/src`** - Reusable research utilities (NOT production code)
  - Geometry helpers
  - Metrics and evaluation tools
  - Model wrappers
  - Must be typed and documented

- **`/data`** - Metadata and references only
  - NO large datasets in the repo
  - Document external data sources in `data/README.md`
  - Only small samples or synthetic data

- **`/schemas`** - JSON Schemas for core concepts
- **`/glossary`** - Canonical definitions and symbol tables
- **`/meta`** - Repository-level documentation and conventions

## 🎯 What Belongs Here

✅ **YES:**
- Theoretical papers and conceptual models
- Experimental prototypes and simulations
- Research notebooks with analysis
- Schemas and formal specifications
- Glossaries and reference materials
- Small synthetic datasets

❌ **NO:**
- Production API implementations
- Live services or web UIs
- Large datasets or binaries
- Secrets or API keys
- Messy, unstructured dumps

## 📝 Adding New Research

### Adding a Paper

1. Create a new file in `/papers/{domain}/`
2. Use frontmatter with: title, date, status, tags, version
3. Include: abstract, motivation, definitions, related work
4. Link to supporting experiments and notebooks
5. Add entry to `/index.md`

### Adding an Experiment

1. Create folder: `/experiments/{domain}/experiment-{date}-{name}/`
2. Add `README.md` answering:
   - What question are we exploring?
   - What setup/data/models were used?
   - What metrics did we track?
   - What did we learn?
   - What should we try next?
3. Include `config.json` with parameters
4. Store results in `results/` subdirectory
5. Reference from related papers

### Adding a Notebook

1. Create in `/notebooks/{domain}/`
2. Start with header cell explaining:
   - Purpose
   - Dependencies
   - Data sources
3. Use small datasets or samples
4. Avoid committing large outputs
5. Reference from experiments or papers

## 🔗 Cross-Repository Relationships

This repository **informs** but does not directly implement:

- **blackroad-os-core** - Types and core contracts inspired by research
- **blackroad-os-operator** - Orchestration strategies tested here
- **blackroad-os-docs** - User-facing documentation of concepts

Use text references, not code dependencies.

## ✅ Pre-Commit Checklist

Before committing:

- [ ] Files are text-based (no huge binaries)
- [ ] New experiments have clear README and config
- [ ] Notebooks have explanatory headers
- [ ] No secrets, API keys, or private data
- [ ] Research code is typed and documented
- [ ] Papers and experiments are cross-linked

## 🧭 Need Help?

- See `/docs/experiment-template.md` for experiment structure
- See `/docs/notebook-style-guide.md` for notebook conventions
- Check `/index.md` for a curated research map
- Review `/glossary/concepts.md` for standard definitions
