# Empty Argument Handling: "" → #

**Created:** 2026-02-18  
**Status:** ✓ Complete  
**Philosophy:** Empty string always routes to help/usage

---

## The Rule

**`""` (empty string/no args) → `#` (help)**

All BlackRoad CLI tools follow this convention:
- No arguments provided = show help
- Empty string = show usage guide
- Missing required args = display examples

---

## Implementation

### Standard Pattern

```bash
# Main command router
# Empty string "" routes to help (#)
CMD="${1}"
[ -z "$CMD" ] && CMD="help"
shift 2>/dev/null || true

case "$CMD" in
    # ... commands ...
    help|h|--help|-h|"")
        show_help
        ;;
esac
```

### Wake Words Pattern

```bash
# Detect which wake word was called
WAKE_WORD=$(basename "$0")

# If no arguments, show help
if [ -z "$1" ]; then
    case "$WAKE_WORD" in
        copilot)
            # Show copilot help
            ;;
        claude)
            # Show claude help
            ;;
    esac
fi
```

---

## All Commands

### 1. **br-api**

```bash
# No args → help
br-api
# Output: Full help with commands, examples, philosophy

# With command
br-api call "your prompt"
```

### 2. **br-errors**

```bash
# No args → stats (default view)
br-errors
# Output: Provider limit statistics

# With command
br-errors watch
```

### 3. **brt** (Terminal)

```bash
# No args → help menu
brt
# Output: Beautiful banner + menu options

# With command
brt new my-session
```

### 4. **Wake Words**

#### copilot
```bash
# No args → help
copilot
# Output:
# 🤖 GitHub Copilot
# Usage: copilot "your question"
# Examples: ...
# Features: Auto-failover, zero downtime

# With args
copilot "create REST API"
```

#### claude
```bash
# No args → help
claude
# Output:
# 🎨 Claude AI
# Usage: claude "your prompt"
# Examples: ...
# Features: Local AI, unlimited, zero cost

# With args
claude "write Python code"
```

#### codex
```bash
# No args → help
codex
# Output:
# 🔍 Codex Search
# Usage: codex "search query"
# Examples: ...
# Features: 22,244 components, instant results

# With args
codex "authentication"
```

#### ollama
```bash
# No args → help
ollama
# Output:
# 🤖 Ollama Local AI
# Usage: ollama "your prompt"
# Examples: ...
# Features: Local, unlimited, multiple models

# With args
ollama "explain Docker"
```

#### memory
```bash
# No args → help
memory
# Output:
# 🧠 Memory System
# Usage: memory <command> [args]
# Commands: search, recent, log
# Features: 4,000+ entries, full-text search

# With args
memory search "API"
```

#### agent
```bash
# No args → help
agent
# Output:
# 🤝 Agent Coordination
# Usage: agent <command> [args]
# Commands: list, status, call
# Features: 27+ agents, multi-agent collab

# With args
agent list
```

#### lucidia
```bash
# No args → help
lucidia
# Output:
# 🌍 Lucidia AI
# Usage: lucidia "your message"
# Examples: ...
# Features: System intelligence, multi-device

# With args
lucidia "analyze system"
```

#### deploy
```bash
# No args → help
deploy
# Output:
# 🚀 Deployment System
# Usage: deploy <service> <environment>
# Examples: ...
# Features: Zero-downtime, auto-rollback

# With args
deploy web prod
```

---

## Help Output Format

### Standard Structure

```
╔═══════════════════════════════════════════════════╗
║     Tool Name - Description                      ║
╚═══════════════════════════════════════════════════╝

Usage: command [args]

Examples:
  command "example 1"
  command "example 2"

Features:
  • Feature 1
  • Feature 2
  • Feature 3
```

### Wake Word Structure

```
🎨 Tool Name

Usage: command "your input"

Examples:
  command "example 1"
  command "example 2"
  command "example 3"

Features:
  • Feature 1
  • Feature 2
  • Feature 3
```

---

## Testing

```bash
# Test all commands with no args
br-api              # → Shows help
br-errors           # → Shows stats (help view)
brt                 # → Shows menu
copilot             # → Shows usage
claude              # → Shows usage
codex               # → Shows usage
ollama              # → Shows usage
memory              # → Shows usage
agent               # → Shows usage
lucidia             # → Shows usage
deploy              # → Shows usage
```

Expected result: **All show helpful information** ✓

---

## Benefits

### 1. **Discoverable**
New users can type any command and get help immediately.

### 2. **Consistent**
All commands follow the same pattern - predictable behavior.

### 3. **Helpful**
Help messages include:
- Usage syntax
- Real examples
- Key features
- Related commands

### 4. **Forgiving**
No error messages for empty args - just helpful guidance.

---

## Examples

### New User Experience

```bash
# User doesn't know what copilot does
$ copilot

🤖 GitHub Copilot

Usage: copilot "your question"

Examples:
  copilot "how do I create a REST API in Node.js?"
  copilot "explain async/await in JavaScript"
  copilot "write a Python function for sorting"

Features:
  • Auto-failover on rate limits
  • Switches to local AI when needed
  • Zero downtime
```

User now knows:
- ✓ How to use it
- ✓ What it does
- ✓ What features it has
- ✓ Real examples to try

### Power User Experience

```bash
# Quick check what options are available
$ br-api

# Shows all commands
call, question, context, stats, providers, bypass, help

# Pick the one needed
$ br-api stats
```

---

## Philosophy

**"" → # means "Show me how to use this"**

- Empty args = user asking for help
- Show usage, not errors
- Provide examples, not just syntax
- Be helpful, not pedantic

---

## Files Updated (4)

1. **`~/br-api`**
   - Empty args → help
   - Added explicit "" handling

2. **`~/br-errors`**
   - Empty args → stats (helpful default)
   - Added "" case

3. **`~/brt`**
   - Empty args → menu/help
   - Beautiful banner display

4. **`~/blackroad-wake-words.sh`**
   - All 8 wake words
   - Empty args → usage with examples
   - Consistent help format

---

## Summary

✅ **All commands handle "" correctly**  
✅ **Empty args → helpful output**  
✅ **Consistent patterns across tools**  
✅ **Discoverable for new users**  
✅ **Quick for power users**

---

**Result:** Every BlackRoad CLI tool is self-documenting! 🎉
