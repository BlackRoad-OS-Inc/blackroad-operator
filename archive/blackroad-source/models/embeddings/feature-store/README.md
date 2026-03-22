# blackroad-feature-store

> ML feature store with versioning and point-in-time serving

Register feature definitions, group them by entity, write feature values, and retrieve them with full point-in-time correctness for training data generation.

## Features

- 📋 **Feature registry** — Register features with dtype, entity type, and source query
- 🗂️ **Feature groups** — Logical groupings for coordinated serving
- ⏱️ **Point-in-time joins** — Retrieve features as-of any timestamp to prevent leakage
- 📈 **Statistics** — Count, mean, min, max, null count per feature
- 🔄 **Versioning** — Feature group versions for schema evolution
- 🔡 **Type system** — int, float, str, bool, list

## Feature Store Concepts

```
Feature           → Named data attribute for an entity type
                    e.g. "user_age" for entity_type="user"

FeatureGroup      → Logical collection of related features
                    served together for a given entity key

EntityRecord      → Snapshot of feature values for one entity at one time
                    Supports multiple snapshots for time-travel queries

Point-in-Time Join → For each entity, retrieve features valid at query time
                    Prevents future data leakage in training datasets
```

## Installation

```bash
git clone https://github.com/BlackRoad-Labs/blackroad-feature-store
cd blackroad-feature-store
```

## Usage

### Register features

```bash
python feature_store.py register age user int \
  --source "SELECT age FROM users WHERE id=?" \
  --description "User age in years" \
  --tags "demographics,profile"

python feature_store.py register income user float \
  --description "Annual income in USD"
```

### Create a feature group

```bash
python feature_store.py create-group user_demographics \
  --features "age,income" \
  --entity-key user_id \
  --frequency batch
```

### Write feature values

```bash
python feature_store.py write <group-id> user-123 \
  '{"age": 35, "income": 85000.0}'
```

### Get feature values

```bash
python feature_store.py get <group-id> user-123

# Point-in-time retrieval
python feature_store.py get <group-id> user-123 --as-of "2024-01-01T00:00:00"
```

### Point-in-time join

```bash
python feature_store.py join "user-1,user-2,user-3" "<group-id>" \
  --timestamp "2024-06-01T00:00:00"
```

### Statistics

```bash
python feature_store.py stats <group-id>
```

### List

```bash
python feature_store.py list-features --entity-type user
python feature_store.py list-groups
```

## Ollama Router

Route prompts to a locally-running [Ollama](https://ollama.com) server using `@mention` triggers.
No external AI provider (Copilot, ChatGPT, Claude, etc.) is involved — all traffic goes directly to your hardware.

**Supported triggers** (case-insensitive): `@ollama`, `@copilot`, `@lucidia`, `@blackboxprogramming`

### Quick start

Start Ollama on your machine:

```bash
ollama serve          # defaults to http://localhost:11434
ollama pull llama3    # or whichever model you prefer
```

Use the CLI:

```bash
python ollama_router.py "@ollama what is a feature store?"
python ollama_router.py "@copilot explain point-in-time joins"
python ollama_router.py "@lucidia write a Python hello world"
python ollama_router.py "@blackboxprogramming refactor this function"
```

Override the server URL or model:

```bash
python ollama_router.py "@ollama hello" --base-url http://192.168.1.10:11434 --model mistral
```

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3` | Default model name |

### Python API

```python
from ollama_router import route, detect_trigger

# Detect a trigger without sending a request
trigger = detect_trigger("@copilot explain recursion")  # → "@copilot"

# Route automatically — sends to Ollama only when a trigger is present
result = route("@ollama what is a feature store?")
print(result["response"]["response"])

# No trigger → nothing is sent
result = route("plain text, no mention")
# result == {"routed": False, "trigger": None, "response": None}
```

## Tests

```bash
pytest tests/ -v
```
