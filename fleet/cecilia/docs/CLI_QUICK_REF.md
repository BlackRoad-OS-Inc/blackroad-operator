# ⚡ BlackRoad CLI - Quick Reference Card

## 🎤 Wake Words (One-Liners)

```bash
copilot "your question"      # GitHub Copilot
claude "your prompt"          # Claude AI (local)
codex "search term"           # Codex search
ollama "prompt"               # Ollama models
memory search "query"         # Memory system
agent list                    # List agents
lucidia "message"             # Lucidia AI
deploy <service> [env]        # Deploy
```

## 🖥️ Terminal (brt)

```bash
brt new <name>               # New session
brt list                     # List sessions  
brt attach <name>            # Attach
brt kill <name>              # Kill session
brt status                   # System status
brt help                     # Show menu
```

## 🚀 Quick Examples

```bash
# Get code help
copilot "create REST API in Express"

# Generate code
claude "write fibonacci in Python"

# Find existing solutions
codex "authentication middleware"

# Chat with Lucidia
lucidia "hello"

# Check system
brt status

# Create work session
brt new dev-session
```

## 📦 Installation

```bash
# Already installed! Just add to PATH:
echo 'export PATH="$HOME:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 🎯 Pro Tip

Chain commands together:
```bash
codex "quantum" && claude "explain the results"
```

---

**Full Docs:** `~/BLACKROAD_TERMINAL_COMPLETE.md`  
**Status:** ✅ Ready to use anywhere! 🚀
