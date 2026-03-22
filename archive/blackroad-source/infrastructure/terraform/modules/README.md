# blackroad-terraform-state

> Remote Terraform state backend with locking, versioning, drift detection, workspace isolation, and backup. SQLite backed.

## Features

- **Workspace isolation** — separate state per workspace (default / prod / staging / …)
- **State locking** — exclusive locks with optional expiry and force-unlock
- **Versioning** — every `store_state` increments serial and archives previous version
- **Resource queries** — list/get resources by address or type filter
- **Drift detection** — compare stored vs. provided resource lists
- **Backup** — export timestamped `.tfstate.json` files
- **Terraform-compatible JSON** — `state.to_tf_json()` matches real Terraform format
- **SQLite persistence** — `~/.blackroad/terraform_state.db`

## Quick start

```bash
pip install -r requirements.txt

# Lock workspace
python src/terraform_state.py lock production ci-runner-1

# Push state (reads JSON from stdin)
terraform show -json | python src/terraform_state.py push production

# Pull state
python src/terraform_state.py pull production

# List resources
python src/terraform_state.py list production --type aws_instance

# Drift detection
python src/terraform_state.py drift production

# Backup
python src/terraform_state.py backup production

# Unlock
python src/terraform_state.py unlock production ci-runner-1
```

## API

```python
from src.terraform_state import (
    lock_state, unlock_state, store_state, get_state,
    list_resources, get_drift, backup_state,
)

# Lock
ok = lock_state("production", "ci-runner-1", operation="apply")

# Store state (from Terraform JSON)
import json
state_dict = json.load(open("terraform.tfstate"))
state = store_state("production", state_dict)

# Get state
state = get_state("production")
print(state.serial, len(state.resources))

# List resources
instances = list_resources("production", type_filter="aws_instance")

# Drift
drift_items = get_drift("production", actual_resources=live_resources)
for d in drift_items:
    print(d.summary())  # "MODIFIED aws_instance.web"

# Backup
path = backup_state("production")
# ~/.blackroad/tf-backups/production/terraform.tfstate.20240101T120000.v5.json

# Unlock
unlock_state("production", "ci-runner-1")
```

## Testing

```bash
pytest tests/ -v
```
