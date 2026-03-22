#!/bin/bash
# Parse HREFBLACKROADOSWINDOWS.txt into blackroad protocol

echo "🌌 Parsing HREFBLACKROADOSWINDOWS.txt"
echo ""

INPUT_FILE=~/HREFBLACKROADOSWINDOWS.txt
OUTPUT_DIR=~/.blackroad/parsed/

mkdir -p "$OUTPUT_DIR"

echo "📂 Input: $INPUT_FILE ($(wc -l < "$INPUT_FILE") lines)"
echo ""

# Extract all file paths and convert to file:blackroad
echo "🔍 Extracting paths..."
grep -E "^\./|^/|node_modules" "$INPUT_FILE" | \
  sed 's|^\./||' | \
  sort -u > "$OUTPUT_DIR/paths.txt"

PATHS_COUNT=$(wc -l < "$OUTPUT_DIR/paths.txt")
echo "   Found: $PATHS_COUNT unique paths"

# Extract commands (lines starting with ▸▸▸)
echo "🔍 Extracting commands..."
grep "^▸▸▸" "$INPUT_FILE" | \
  sed 's/^▸▸▸ *//' | \
  sort -u > "$OUTPUT_DIR/commands.txt"

CMD_COUNT=$(wc -l < "$OUTPUT_DIR/commands.txt")
echo "   Found: $CMD_COUNT unique commands"

# Extract function definitions
echo "🔍 Extracting functions..."
grep -E "function |async function|export function" "$INPUT_FILE" | \
  sed 's/.*function //' | \
  cut -d'(' -f1 | \
  sort -u > "$OUTPUT_DIR/functions.txt"

FUNC_COUNT=$(wc -l < "$OUTPUT_DIR/functions.txt")
echo "   Found: $FUNC_COUNT unique functions"

# Create blackroad mappings
echo ""
echo "🎯 Creating blackroad mappings..."

cat > "$OUTPUT_DIR/MAPPINGS.md" << 'EOFMAP'
# HREFBLACKROADOSWINDOWS.txt → file:blackroad

## Parsed Content

All terminal history converted to blackroad protocol.

### Paths
```
./path/to/file → file:blackroad/file/path/to/file
```

### Commands
```
command args → file:blackroad/cmd/command
```

### Functions
```
functionName() → file:blackroad/function/functionName
```

## Examples

| Original | Blackroad Route |
|----------|----------------|
| `./bin/cli.ts` | `file:blackroad/file/bin/cli.ts` |
| `git commit` | `file:blackroad/cmd/git` |
| `async function main()` | `file:blackroad/function/main` |

## Storage

All parsed content stored at:
- `~/.blackroad/parsed/paths.txt`
- `~/.blackroad/parsed/commands.txt`
- `~/.blackroad/parsed/functions.txt`

Every line becomes a blackroad route.
EOFMAP

cat "$OUTPUT_DIR/MAPPINGS.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Parsing complete!"
echo ""
echo "📊 Results:"
echo "   Paths:     $PATHS_COUNT"
echo "   Commands:  $CMD_COUNT"
echo "   Functions: $FUNC_COUNT"
echo ""
echo "📂 Output: $OUTPUT_DIR"
echo ""
