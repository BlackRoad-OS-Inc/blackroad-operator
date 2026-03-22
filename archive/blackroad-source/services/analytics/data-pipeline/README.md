# blackroad-data-pipeline

[![CI](https://github.com/BlackRoad-Labs/blackroad-data-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-Labs/blackroad-data-pipeline/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-proprietary-red)](LICENSE)
[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS-ffffff?labelColor=000000)](https://github.com/enterprises/blackroad-os)
[![BlackRoad Labs](https://img.shields.io/badge/BlackRoad-Labs-ffffff?labelColor=000000)](https://github.com/BlackRoad-Labs)

**BlackRoad Data Pipeline** — ETL data pipeline framework for the [BlackRoad OS](https://github.com/enterprises/blackroad-os) platform, built by [BlackRoad-Labs](https://github.com/BlackRoad-Labs).

> Part of the **BlackRoad** infrastructure ecosystem: BlackRoad AI · BlackRoad Cloud · BlackRoad OS · BlackRoad Security · BlackRoad Quantum · BlackRoad Foundation · BlackRoad Education · BlackRoad Gov · BlackRoad Hardware · BlackRoad Interactive · BlackRoad Media · BlackRoad Studio · BlackRoad Ventures · BlackRoad Archive · Blackbox Enterprises

## Features

- **Sources**: CSV, JSON, SQLite, inline data
- **Transforms**: filter, map, aggregate, join, sort, deduplicate, select, rename
- **Sinks**: stdout, JSON file, CSV file, SQLite database
- **Dependency graph** execution with ordered transform chaining
- **Schema validation** — auto-infer field types from live data

## Usage

```bash
python main.py create "My Pipeline"
python main.py run <pipeline-id>
python main.py list
python main.py validate <source-id>
```

## Testing

```bash
python -m pytest test_data_pipeline.py -v
```

## Directory

The [`index.html`](index.html) in this repository is a reusable, SEO-optimized **BlackRoad Infrastructure Directory** page listing the full BlackRoad GitHub enterprise, all 15 GitHub organizations, and all 19 registered domains.

**BlackRoad GitHub Enterprise**: [`github.com/enterprises/blackroad-os`](https://github.com/enterprises/blackroad-os)

**BlackRoad Organizations** (15):
[Blackbox-Enterprises](https://github.com/Blackbox-Enterprises) ·
[BlackRoad-AI](https://github.com/BlackRoad-AI) ·
[BlackRoad-Archive](https://github.com/BlackRoad-Archive) ·
[BlackRoad-Cloud](https://github.com/BlackRoad-Cloud) ·
[BlackRoad-Education](https://github.com/BlackRoad-Education) ·
[BlackRoad-Foundation](https://github.com/BlackRoad-Foundation) ·
[BlackRoad-Gov](https://github.com/BlackRoad-Gov) ·
[BlackRoad-Hardware](https://github.com/BlackRoad-Hardware) ·
[BlackRoad-Interactive](https://github.com/BlackRoad-Interactive) ·
[BlackRoad-Labs](https://github.com/BlackRoad-Labs) ·
[BlackRoad-Media](https://github.com/BlackRoad-Media) ·
[BlackRoad-OS](https://github.com/BlackRoad-OS) ·
[BlackRoad-Security](https://github.com/BlackRoad-Security) ·
[BlackRoad-Studio](https://github.com/BlackRoad-Studio) ·
[BlackRoad-Ventures](https://github.com/BlackRoad-Ventures)

**BlackRoad Domains** (19):
`blackboxprogramming.io` · `blackroad.company` · `blackroad.io` · `blackroad.me` · `blackroad.network` · `blackroad.systems` · `blackroadai.com` · `blackroadinc.us` · `blackroadqi.com` · `blackroadquantum.com` · `blackroadquantum.info` · `blackroadquantum.net` · `blackroadquantum.shop` · `blackroadquantum.store` · `lucidia.earth` · `lucidia.studio` · `lucidiaqi.com` · `roadchain.io` · `roadcoin.io`

---

**BlackRoad OS, Inc.** — Delaware C-Corp
