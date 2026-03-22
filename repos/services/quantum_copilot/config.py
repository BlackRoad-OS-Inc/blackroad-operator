"""Configuration values for the Quantum-Secure Compliance Copilot service."""

from __future__ import annotations

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path("data/quantum_copilot")
BUNDLE_DIR = DATA_DIR / "bundles"
LEAD_PATH = DATA_DIR / "leads.jsonl"
REVIEW_PATH = DATA_DIR / "reviews.jsonl"
METRICS_PATH = DATA_DIR / "metrics.json"
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
POLICY_DIR = Path("policies/compliance_copilot")
MANIFEST_SCHEMA_PATH = BASE_DIR / "attest" / "manifest.schema.json"

# Toggle storing generated bundles to disk for audit demonstrations.
STORE_BUNDLES = True

# Demo dataset used to exercise the vertical slice.
DEMO_DATASET_PATH = BASE_DIR / "demo.py"

# Deterministic seed used when generating rationale text.
RATIONALE_SEED = 42

# Identifier for the active policy version.
POLICY_VERSION = "2025.11.07"

# Version string embedded into manifest artifacts.
SERVICE_VERSION = "0.1.0"
