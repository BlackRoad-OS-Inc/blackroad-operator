# 🎨 Design Token Manager

Part of **BlackRoad Studio** — production creative tools.

Manage, version, validate, diff, and export design tokens. SQLite persistence with CSS / JavaScript / Tailwind exports.

## Features

- **Token CRUD** — add, update, get, delete, list with category filtering
- **Validation** — per-category rules (color format, spacing units, naming)
- **CSS export** — `--prefix-name: value;` with RGB channels and alias vars
- **JS export** — ES module with named exports + grouped `tokens` object
- **Tailwind config** — drop-in `module.exports` for all categories
- **Versioned snapshots** — save point-in-time state to SQLite
- **Diff engine** — compare any two snapshots or snapshot vs. current DB
- **Bulk import** — W3C Design Token Format or flat JSON
- **34 seed tokens** — BlackRoad brand colors, 8pt spacing, type scale, shadows, radii
- **Zero dependencies** — stdlib only

## Quick start

```bash
# Seed with BlackRoad defaults (34 tokens)
python src/design_token_manager.py seed

# Add a custom token
python src/design_token_manager.py add color/brand/blue '#3b82f6' color --desc 'Blue 500'

# Export as CSS
python src/design_token_manager.py export-css --prefix '--ds'

# Export as Tailwind
python src/design_token_manager.py export-tailwind

# Export as ES module
python src/design_token_manager.py export-js

# Save a snapshot
python src/design_token_manager.py snapshot --version v1.0.0 --name 'Release'

# Diff snapshot against current
python src/design_token_manager.py diff <snapshot-id> current

# Validate all tokens
python src/design_token_manager.py validate
```

## Token categories

| Category | Validation | Example |
|---|---|---|
| `color` | hex / rgb / hsl / var() | `#FF1D6C` |
| `spacing` | px / rem / em / % | `16px` |
| `typography` | rem / em | `1rem` |
| `radius` | px / rem | `8px` |
| `shadow` | CSS shadow syntax | `0 4px 6px rgba(0,0,0,0.1)` |
| `opacity` | 0–1 | `0.5` |
| `z-index` | integer | `100` |
| `breakpoint` | px width | `768px` |
| `motion` | ms duration | `300ms` |
| `border` | border shorthand | `1px solid var(--br-border)` |

## Tests

```bash
pip install pytest pytest-cov
pytest tests/ -v --cov=src
```
