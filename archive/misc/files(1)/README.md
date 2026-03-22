# fs-index

Minimal filesystem indexer for BlackRoad OS. Generates JSON indexes of directory trees.

## Usage

```bash
# Index current directory
python index.py

# Index specific path
python index.py ~/projects

# With options
python index.py ~/code -o code-index.json --hash --preview --pretty
```

## Options

| Flag | Description |
|------|-------------|
| `-o, --output` | Output filename (default: `index.json`) |
| `--hash` | Include SHA256 hash (first 8KB) |
| `--preview` | Include first line of text files |
| `--pretty` | Pretty-print JSON output |

## Output

```json
{
  "root": "/home/alexa/projects",
  "indexed_at": "2025-01-26T16:00:00",
  "count": 1234,
  "entries": [
    {
      "path": "scripts/deploy.sh",
      "name": "deploy.sh",
      "type": "file",
      "ext": ".sh",
      "category": "script",
      "size": 1443,
      "mtime": "2025-01-17T16:19:00"
    }
  ]
}
```

## Categories

Files are auto-categorized: `script`, `config`, `code`, `doc`, `data`, `web`, `dotfile`, `directory`, `other`

## Skipped

Automatically skips: `.git`, `node_modules`, `__pycache__`, `.venv`, `dist`, `build`, etc.
