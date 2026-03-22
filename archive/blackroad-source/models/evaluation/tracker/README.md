# BlackRoad Experiment Tracker

[![CI](https://github.com/BlackRoad-Labs/blackroad-experiment-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-Labs/blackroad-experiment-tracker/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-proprietary-red)](#license)
[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS%20Platform-black)](https://blackroadlabs.com)

> **Production-grade ML experiment tracking and comparison for the BlackRoad OS platform.**  
> Track hyperparameters, metrics, and artifacts across every model run — with SQLite persistence, side-by-side comparison, and one-command Markdown reports.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Installation](#installation)
   - [Python (pip)](#python-pip)
   - [BlackRoad OS Platform (npm)](#blackroad-os-platform-npm)
5. [Quick Start](#quick-start)
6. [CLI Reference](#cli-reference)
   - [create](#create)
   - [log](#log)
   - [finish](#finish)
   - [get](#get)
   - [list](#list)
   - [compare](#compare)
   - [best](#best)
   - [report](#report)
7. [Python API](#python-api)
8. [Configuration](#configuration)
9. [Stripe Integration](#stripe-integration)
10. [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [End-to-End Tests](#end-to-end-tests)
11. [Database Schema](#database-schema)
12. [Contributing](#contributing)
13. [License](#license)

---

## Overview

**BlackRoad Experiment Tracker** is the canonical experiment-management layer for the [BlackRoad OS](https://blackroadlabs.com) platform. Whether you are training a ResNet from scratch or fine-tuning a large language model, the tracker gives every run a unique ID, records every hyperparameter, stores every metric at every step, and lets you instantly compare runs or export a full Markdown report — all backed by a zero-dependency SQLite store.

---

## Features

| Feature | Description |
|---------|-------------|
| **Experiment lifecycle** | Create, run, and finish experiments with full status tracking (`running`, `completed`, `failed`) |
| **Hyperparameter tracking** | Store arbitrary JSON hyperparameters per run |
| **Per-step metric logging** | Record any named metric at any step for fine-grained loss/accuracy curves |
| **Artifact management** | Attach model checkpoints, dataset references, or any file path to a run |
| **Side-by-side comparison** | Compare multiple runs on metrics and hyperparameters in one call |
| **Best-run selection** | Find the top run for any metric — maximize *or* minimize |
| **Markdown report export** | One command generates a full `report.md` with tables, metric logs, and notes |
| **SQLite persistence** | Zero external services required; WAL-mode SQLite for concurrent writes |
| **Tag support** | Annotate runs with arbitrary string tags for filtering and grouping |

---

## Requirements

- Python **3.11** or higher
- No third-party Python dependencies (stdlib only)
- Node.js **18+** / npm **9+** (for BlackRoad OS platform integration only)

---

## Installation

### Python (pip)

The tracker ships as a single-file module. Clone the repository and use it directly:

```bash
git clone https://github.com/BlackRoad-Labs/blackroad-experiment-tracker.git
cd blackroad-experiment-tracker
python main.py --help
```

To use it as a library inside your own project, copy `main.py` into your package or install via pip once a distribution is published:

```bash
# Coming soon on PyPI
pip install blackroad-experiment-tracker
```

### BlackRoad OS Platform (npm)

The experiment tracker is bundled with the BlackRoad OS platform SDK. Install the platform package to access the tracker via the unified CLI and JavaScript/TypeScript client:

```bash
npm install @blackroad/os-sdk
```

After installation, the tracker is available under the `blackroad experiments` sub-command:

```bash
npx blackroad experiments create "ResNet Run 1" resnet50 --hyperparams '{"lr": 0.001}'
```

Refer to the [BlackRoad OS SDK documentation](https://docs.blackroadlabs.com/sdk) for full platform integration details.

---

## Quick Start

```bash
# 1. Create an experiment
python main.py create "ResNet Run 1" resnet50 --hyperparams '{"lr": 0.001, "epochs": 10}'
# => prints JSON with "id": "<uuid>"

# 2. Log metrics at each training step
python main.py log <id> accuracy 0.82 --step 1
python main.py log <id> loss    0.45 --step 1
python main.py log <id> accuracy 0.91 --step 2
python main.py log <id> loss    0.28 --step 2

# 3. Mark the run complete
python main.py finish <id>

# 4. Compare two runs
python main.py compare <id1> <id2>

# 5. Find the best run by accuracy
python main.py best accuracy

# 6. Export a full Markdown report
python main.py report <id>
```

---

## CLI Reference

All commands read/write to the database specified by the `EXPERIMENT_DB` environment variable (default: `~/.blackroad/experiments.db`).

### `create`

Create a new experiment and return its ID.

```bash
python main.py create <name> <model> [--hyperparams <json>] [--tags <json-array>]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Human-readable experiment name |
| `model` | Yes | Model identifier (e.g. `resnet50`, `gpt2`) |
| `--hyperparams` | No | JSON object of hyperparameters (default: `{}`) |
| `--tags` | No | JSON array of string tags (default: `[]`) |

### `log`

Log a scalar metric value at a given training step.

```bash
python main.py log <id> <metric> <value> [--step <int>]
```

### `finish`

Mark an experiment as complete (or failed).

```bash
python main.py finish <id> [--status completed|failed]
```

### `get`

Retrieve full details for a single experiment.

```bash
python main.py get <id>
```

### `list`

List all experiments, optionally filtered by status or model.

```bash
python main.py list [--status running|completed|failed] [--model <name>]
```

### `compare`

Compare two or more experiments side-by-side.

```bash
python main.py compare <id1> <id2> [<id3> ...]
```

Output includes `metric_comparison` (last value per metric per run) and `hyperparam_comparison`.

### `best`

Find the single best experiment for a given metric across all completed runs.

```bash
python main.py best <metric> [--minimize]
```

Use `--minimize` for metrics like `loss` or `rmse` where lower is better.

### `report`

Export a full Markdown report for an experiment.

```bash
python main.py report <id> [--output <path>]
```

Default output path: `experiment_<short-id>_report.md`

---

## Python API

Use `ExperimentTracker` directly in your training scripts:

```python
from main import ExperimentTracker, init_db

init_db()
tracker = ExperimentTracker()

# Create
exp = tracker.create("BERT Fine-tune", "bert-base-uncased",
                     hyperparams={"lr": 2e-5, "batch_size": 32},
                     tags=["nlp", "classification"])

# Log metrics at each epoch
for epoch, (acc, loss) in enumerate(training_loop(), start=1):
    tracker.log_metric(exp.id, "accuracy", acc, step=epoch)
    tracker.log_metric(exp.id, "loss",     loss, step=epoch)

# Finish
tracker.finish(exp.id)

# Find best
best = tracker.best_run("accuracy", maximize=True)
print(best)

# Export report
tracker.export_report(exp.id, output_path="run_report.md")
```

**`ExperimentTracker` methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `create` | `(name, model, hyperparams?, tags?, notes?) → Experiment` | Create and persist a new experiment |
| `log_metric` | `(exp_id, name, value, step?) → None` | Append a scalar metric entry |
| `log_artifact` | `(exp_id, name, path, artifact_type?) → None` | Attach an artifact path |
| `finish` | `(exp_id, status?) → None` | Set final status |
| `get` | `(exp_id) → Experiment` | Fetch a single experiment |
| `list` | `(status?, model?) → list[dict]` | List experiments with optional filters |
| `compare` | `(ids) → dict` | Side-by-side metric + hyperparam comparison |
| `best_run` | `(metric, maximize?, status?) → dict \| None` | Find the best completed run |
| `export_report` | `(exp_id, output_path?) → str` | Write a Markdown report and return its path |

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `EXPERIMENT_DB` | `~/.blackroad/experiments.db` | Path to the SQLite database file |

Example — use a project-local database:

```bash
export EXPERIMENT_DB=./my_project/experiments.db
python main.py create "Run 1" resnet50
```

---

## Stripe Integration

The BlackRoad OS platform uses [Stripe](https://stripe.com) for subscription billing and usage-based metering of platform features (including experiment tracking quotas on hosted tiers).

**Self-hosted / open-core usage** (this repository) has **no dependency on Stripe** — all features run fully offline.

For **hosted BlackRoad OS** subscriptions:

1. Log in to the [BlackRoad dashboard](https://app.blackroadlabs.com) and navigate to **Billing**.
2. Your Stripe customer ID and active plan are shown under **Subscription**.
3. Experiment tracking quotas (number of runs, retention period, artifact storage) are enforced per your plan tier.
4. Upgrade or manage payment methods directly from the dashboard — powered by [Stripe Customer Portal](https://stripe.com/docs/customer-management).

For questions about billing or enterprise licensing, contact **[billing@blackroadlabs.com](mailto:billing@blackroadlabs.com)**.

---

## Testing

### Unit Tests

The full unit-test suite covers experiment creation, metric logging, artifact tracking, comparison, best-run selection, report export, and status filtering.

```bash
python -m pytest test_experiment_tracker.py -v
```

All tests use an isolated temporary SQLite database — no shared state between runs.

**Current test coverage:**

| Test | Description |
|------|-------------|
| `test_create_experiment` | Verifies UUID assignment and default status |
| `test_log_metric` | Logs two steps and confirms persistence |
| `test_finish_experiment` | Marks complete and reads back status |
| `test_compare_experiments` | Two-run metric + hyperparam comparison |
| `test_best_run` | Selects higher-accuracy run from two completed experiments |
| `test_export_report` | Writes Markdown and validates model name appears |
| `test_list_by_status` | Filters list by `completed` status |

### End-to-End Tests

E2E tests exercise the full CLI from subprocess — no Python imports — to validate the tracker exactly as a user (or platform integration) would invoke it.

```bash
python -m pytest test_experiment_tracker.py -v -k "e2e"
```

> **Note:** E2E CLI tests are included in the test suite via the `TestExperimentTrackerE2E` class. They spawn `python main.py` subprocesses, parse JSON output, and assert on exit codes and field values — matching the same flow documented in [Quick Start](#quick-start).

---

## Database Schema

The SQLite database contains three tables:

### `experiments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `name` | TEXT | Human-readable name |
| `model` | TEXT | Model identifier |
| `status` | TEXT | `running` \| `completed` \| `failed` |
| `hyperparams` | TEXT | JSON object |
| `metrics` | TEXT | JSON summary `{name: [{step, value}]}` |
| `artifacts` | TEXT | JSON array `[{name, path, type}]` |
| `tags` | TEXT | JSON array of strings |
| `created_at` | TEXT | ISO 8601 UTC timestamp |
| `updated_at` | TEXT | ISO 8601 UTC timestamp |
| `notes` | TEXT | Free-form notes |

### `metric_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `experiment_id` | TEXT FK | References `experiments(id)` |
| `name` | TEXT | Metric name |
| `value` | REAL | Scalar value |
| `step` | INTEGER | Training step |
| `logged_at` | TEXT | ISO 8601 UTC timestamp |

Indexed on `(experiment_id)` and `(name)` for fast filtering.

### `artifact_refs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `experiment_id` | TEXT FK | References `experiments(id)` |
| `name` | TEXT | Artifact label |
| `path` | TEXT | File system path |
| `artifact_type` | TEXT | e.g. `file`, `model`, `dataset` |
| `size_bytes` | INTEGER | File size at log time (nullable) |
| `created_at` | TEXT | ISO 8601 UTC timestamp |

---

## Contributing

This repository is part of the proprietary BlackRoad OS platform. External contributions are not accepted at this time.

For internal contributors:

1. Branch from `main` with a descriptive branch name.
2. Run `python -m pytest test_experiment_tracker.py -v` before opening a PR — all tests must pass.
3. Update this README for any new CLI commands, API methods, or configuration variables.
4. Every new feature requires a corresponding test in `test_experiment_tracker.py`.

---

## License

Copyright © 2024–2026 BlackRoad OS, Inc. All Rights Reserved.  
Founder, CEO & Sole Stockholder: Alexa Louise Amundson.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for full terms.

