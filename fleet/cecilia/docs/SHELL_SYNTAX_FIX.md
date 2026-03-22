# 🚨 Shell Syntax Fix for blackroad-ai

## The Problem

When you run:
```bash
blackroad-ai suggest "write hello world in rust!"
```

You get: `zsh: event not found: )`

**Why?** The `!` triggers zsh history expansion (tries to find last command ending with `)`)

---

## ✅ The Solution

Use **single quotes** instead:
```bash
blackroad-ai suggest 'write hello world in rust!'
```

Or **escape** the exclamation:
```bash
blackroad-ai suggest "write hello world in rust\!"
```

Or **disable history expansion** in zsh:
```bash
# Add to ~/.zshrc
setopt NO_BANG_HIST

# Apply now
source ~/.zshrc
```

---

## 📋 Copy/Paste Ready Commands

```bash
# AI code generation (WORKS)
blackroad-ai suggest 'write hello world in rust'
blackroad-ai suggest 'create fibonacci function'
blackroad-ai suggest 'implement binary search'

# AI explanations (WORKS)
blackroad-ai explain 'how does async work'
blackroad-ai explain 'what is a closure'

# System status
blackroad-ai status
blackroad-ai methods
blackroad-help

# Quick test
blackroad-ai suggest 'print hello'
```

---

## 🎯 Online Pis (Ready for Gateway)

From your output:
- ✅ **cecilia** - ONLINE
- ✅ **lucidia** - ONLINE  
- ✅ **alice** - ONLINE
- ✅ **anastasia** - ONLINE
- ❌ octavia - Offline (but SSH works, Ollama running)
- ❌ aria - Offline

---

## 🚀 Next Steps

### 1. Fix Shell History (Permanent)
```bash
echo "setopt NO_BANG_HIST" >> ~/.zshrc
source ~/.zshrc
```

### 2. Test AI Command
```bash
blackroad-ai suggest 'write hello world in python'
```

### 3. Start Web Service
```bash
cd ~/services/web
npm run dev
# Opens on http://localhost:3000
```

### 4. Start Gateway Dashboard
```bash
# In separate terminal
cd ~/copilot-agent-gateway
node gateway-web.js
# Opens on http://localhost:3030
```

---

## 💡 Pro Tips

### Create Aliases
Add to `~/.zshrc`:
```bash
alias ai='blackroad-ai suggest'
alias explain='blackroad-ai explain'
alias brai='blackroad-ai'
```

Then use:
```bash
ai 'write quicksort'
explain 'how does map work'
```

### Quick AI Access
```bash
# Instead of typing the whole command
function ask() {
    blackroad-ai suggest "$*"
}

# Usage:
ask write hello world in rust
# No quotes needed!
```

---

## 🔧 Troubleshooting

### "zsh: event not found"
- Use single quotes: `'text'` not `"text!"`
- Or disable: `setopt NO_BANG_HIST`

### "command not found: next"
```bash
cd ~/services/web
npm install
```

### "Cannot connect to port 3000"
```bash
# Kill whatever's using it
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### Gateway not responding
```bash
# Check if running
lsof -i :3030

# Restart
cd ~/copilot-agent-gateway
node gateway-web.js
```

---

**Quick reference:** `~/BLACKROAD_QUICK_COMMANDS.sh`

Test now:
```bash
blackroad-ai suggest 'write hello world in python'
```
