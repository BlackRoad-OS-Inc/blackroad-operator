# RoadPad Quick Start Guide

## Installation

```bash
# Run setup script
cd ~/roadpad
./roadpad-setup.sh

# Reload shell
source ~/.zshrc  # or ~/.bashrc
```

## Basic Usage

```bash
# Launch with prompt
roadpad

# Open a file
roadpad notes.md

# Quick alias
rp notes.txt
```

## Essential Commands

### In Prompt Mode (>)
- Type query, press Enter
- Use `\` at end for multi-line
- Up/Down for history

### In Editor Mode
- `:w` - Save file
- `:e filename` - Open file
- `:q` - Quit
- `:wq` - Save and quit

### Keybindings
- `Ctrl+P` - Toggle prompt/editor
- `Ctrl+R` - Recent files
- `Shift+Tab` - Cycle accept modes
- `Ctrl+Q` - Quit

## Accept Modes

### Manual (default)
- See diff preview
- `Ctrl+Y` - Accept
- `Ctrl+N` - Reject
- `Ctrl+A` - Accept all
- `Ctrl+R` - Reject all

### On-Save
- Edits queue
- Apply on `:w`

### Always
- Immediate apply

## Configuration

Edit `~/.roadpad/config.json`:
```json
{
  "accept_mode": 0,
  "copilot_enabled": true,
  "tab_width": 4
}
```

Or use environment variables:
```bash
export ROADPAD_ACCEPT_MODE=manual
export ROADPAD_TAB_WIDTH=2
```

Or CLI flags:
```bash
roadpad --accept-mode=always
roadpad --no-copilot
```

## Files

- Config: `~/.roadpad/config.json`
- History: `~/.roadpad/history.json`
- Recent: `~/.roadpad/recent_files.json`

---

**That's it! You're ready to use RoadPad.**
