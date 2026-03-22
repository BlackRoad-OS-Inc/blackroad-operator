# Memory Vault Utilities

This directory provides a minimal toolkit for maintaining an append-only, tamper-evident event log without relying on a blockchain. It implements the workflow described in the accompanying proposal:

* `write_event.py` appends JSONL events that are chained together with SHA-256 hashes.
* `snapshot.py` rolls the current day's log entries into a manifest that records a Merkle root and metadata.
* `verify.py` recomputes hashes for a given day to confirm the manifest matches the stored log.

At runtime the scripts create the following subdirectories, which are ignored by Git:

* `logs/` – append-only JSONL event files (one per day)
* `snapshots/` – daily snapshot manifests
* `attest/` – minisign signatures for manifests
* `sealed/` – age-encrypted snapshot archives
* `state/` – writer state (e.g., the latest chain hash) and key material

See the inline documentation in each script for usage details. Combine the scripts with external tools such as `minisign`, `age`, and OpenTimestamps to produce signed, sealed snapshots that can be rotated to off-site storage.
