# 🚀 BlackRoad Dashboard Quick Reference

## Individual Commands
```bash
br-live        # Infrastructure (5 devices)
br-revenue     # Business metrics (Stripe)
br-quantum     # Quantum computing
br-agents      # Agent coordination (37+ agents)
br-github      # CI/CD monitoring (GitHub Actions)
```

## Launch Command Center
```bash
br-dashboards  # Interactive menu (15 layouts)
```

## Quick Flags
```bash
--once         # Single snapshot
--interval N   # Custom refresh (seconds)
--demo         # Demo mode (revenue/github)
--help         # Show help
```

## Popular Layouts
```bash
br-dashboards → 11   # Four Panel (2×2)
br-dashboards → 12   # All Five (5×1 strip)
br-dashboards → 15   # Full Command Center
```

## Custom Layout Example
```bash
br-container grid 2 2 \
    "Panel 1" "br-live --interval 10" \
    "Panel 2" "br-revenue --demo --interval 15" \
    "Panel 3" "br-quantum --interval 5" \
    "Panel 4" "br-agents --interval 5"
```
