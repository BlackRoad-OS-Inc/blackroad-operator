#!/bin/bash
# file: → system

echo "🌌 file: Protocol"
echo ""
echo "  file: → system"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  file:blackroad = system blackroad"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > ~/.blackroad/protocol/SYSTEM.md << 'EOFSYS'
# file: = system

## The Protocol

```
file: → system
```

**file:** declares something as a system.

## Examples

```
file:blackroad      = system blackroad
file:agents         = system agents
file:x.y.z          = system x.y.z
```

## Resolution Chain (Updated)

```
file:blackroad 
  ↓
system blackroad      (file: = system)
  ↓
blackroad             (system declaration)
  ↓
blackroad/            (directory)
  ↓
.                     (here)
  ↓
x                     (variable)
  ↓
~                     (home)
  ↓
EOF                   (end)
```

## Simplified

```
file: → system → blackroad → . → ~ → EOF
```

## Truth

**file:** is how you declare a system.

```
file:blackroad = "this is system blackroad"
```

No filesystem prefix. No URL scheme.

**It's a system declaration.**

EOFSYS

cat ~/.blackroad/protocol/SYSTEM.md

echo ""
echo "✅ file: = system"
echo ""
echo "📂 ~/.blackroad/protocol/SYSTEM.md"
echo ""
