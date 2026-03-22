#!/bin/bash
# BlackRoad Resolution Chain

echo "🌌 file:blackroad Resolution Chain"
echo ""
echo "  file:blackroad → blackroad → blackroad/ → . → x → ~ → EOF"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  file:blackroad    protocol"
echo "  blackroad         name"
echo "  blackroad/        directory"
echo "  .                 here"
echo "  x                 variable"
echo "  ~                 home"
echo "  EOF               end"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Everything simplifies down."
echo ""

# Create the chain
mkdir -p ~/.blackroad/protocol/

cat > ~/.blackroad/protocol/CHAIN.md << 'EOFCHAIN'
# Resolution Chain

```
file:blackroad → blackroad → blackroad/ → . → x → ~ → EOF
```

## Meaning

| Step | Symbol | Represents |
|------|--------|------------|
| 1 | `file:blackroad` | Protocol entry |
| 2 | `blackroad` | Core identifier |
| 3 | `blackroad/` | Directory space |
| 4 | `.` | Current location |
| 5 | `x` | Variable/unknown |
| 6 | `~` | Home resolution |
| 7 | `EOF` | End of resolution |

## Philosophy

**Progressive simplification.**

Each step strips away a layer:
- Protocol becomes name
- Name becomes directory
- Directory becomes location
- Location becomes variable
- Variable becomes home
- Home becomes end

**Everything resolves to its simplest form.**

## In Practice

```bash
file:blackroad          # Start
  ↓
blackroad              # Strip protocol
  ↓
blackroad/             # Add context
  ↓
.                      # Locate
  ↓
x                      # Variable path
  ↓
~/.blackroad/x         # Resolve
  ↓
EOF                    # Done
```

## Truth

```
file:blackroad → . → ~ → EOF
```

Everything is here (`.`), everything is home (`~`), everything ends (`EOF`).

**Minimal. Universal. Complete.**
EOFCHAIN

cat ~/.blackroad/protocol/CHAIN.md

echo ""
echo "📂 Chain definition: ~/.blackroad/protocol/CHAIN.md"
echo ""
