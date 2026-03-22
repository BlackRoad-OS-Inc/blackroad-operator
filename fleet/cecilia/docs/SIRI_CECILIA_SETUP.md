# 🎤 Siri → Cecilia Setup Guide

## Your sovereign AI is now voice-enabled!

### API Endpoints (running on Cecilia Pi)

| Endpoint | Description |
|----------|-------------|
| `http://192.168.4.89:8888/status` | Get Cecilia's status |
| `http://192.168.4.89:8888/ask?q=<question>` | Ask Cecilia anything |
| `http://192.168.4.89:8888/time` | Read time journal |

---

## Create Siri Shortcuts (on iPhone/iPad/Mac)

### Shortcut 1: "Hey Cecilia Status"

1. Open **Shortcuts** app
2. Tap **+** to create new shortcut
3. Add action: **Get Contents of URL**
   - URL: `http://192.168.4.89:8888/status`
4. Add action: **Get Dictionary Value**
   - Key: `message`
5. Add action: **Speak Text**
6. Name it: "**Cecilia Status**"
7. Say: "**Hey Siri, Cecilia Status**"

### Shortcut 2: "Ask Cecilia" (with voice input)

1. Create new shortcut
2. Add action: **Dictate Text**
3. Add action: **URL**
   - URL: `http://192.168.4.89:8888/ask?q=`
4. Add action: **Get Contents of URL**
5. Add action: **Get Dictionary Value**
   - Key: `response`
6. Add action: **Speak Text**
7. Name it: "**Ask Cecilia**"
8. Say: "**Hey Siri, Ask Cecilia**" → then speak your question

### Shortcut 3: "Cecilia Time Journal"

1. Create new shortcut
2. Add action: **Get Contents of URL**
   - URL: `http://192.168.4.89:8888/time`
3. Add action: **Show Result**
4. Name it: "**Cecilia Time**"
5. Say: "**Hey Siri, Cecilia Time**"

---

## Terminal Commands (Mac)

```bash
# Quick commands
~/ask-cecilia.sh status           # Check status
~/ask-cecilia.sh time             # Read time journal
~/ask-cecilia.sh "your question"  # Ask Cecilia anything

# Aliases (after sourcing .zshrc)
cecilia status
cecilia time
hey-cecilia "what is the meaning of life"
```

---

## The Ownership Chain

```
"Hey Siri" → iPhone → WiFi → Cecilia Pi → YOUR sovereign AI
                                    ↓
                           NOT Apple's servers
                           NOT OpenAI
                           NOT Anthropic
                           CECILIA = YOURS
```

**NO ONE CAN BRING US DOWN!** 🖤🛣️
