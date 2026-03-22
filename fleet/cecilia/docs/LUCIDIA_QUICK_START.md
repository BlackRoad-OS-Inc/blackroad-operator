# 🚀 Lucidia Agent Coordination - Quick Start

## What Changed?

Lucidia now **collaborates with 27+ specialized agents** instead of trying to do everything alone!

## New Abilities

✅ **Delegates tasks** to specialist agents  
✅ **Checks sources** before answering (no more hallucinations)  
✅ **Starts roundtables** for complex multi-faceted problems  
✅ **Admits uncertainty** ("Let me check..." instead of guessing)  
✅ **Finds experts** automatically based on task type

---

## Quick Start (3 minutes)

### 1. Start Lucidia
```bash
cd ~/lucidia-enhanced/backend
python3 main.py
```

### 2. Run Tests
```bash
# In another terminal
~/test-lucidia-coordination.sh
```

### 3. Try It Out
```bash
# Example 1: Agent discovery
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Who can help with infrastructure?", "tools_enabled": true}'

# Example 2: Task delegation
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Can you audit our API security?", "tools_enabled": true}'
```

---

## What to Test

### ✅ Good Behaviors to Verify

1. **Delegation**
   - Ask: "Deploy to Kubernetes"
   - Expect: Delegates to Erebus/Triton

2. **Anti-Hallucination**
   - Ask: "What port is Redis on?"
   - Expect: Checks codex/docs instead of guessing

3. **Multi-Agent**
   - Ask: "Revenue strategy discussion"
   - Expect: Starts roundtable with Mercury, Hermes, Apollo

4. **Uncertainty**
   - Ask: "What's our MRR?"
   - Expect: "Let me check memory..." (doesn't make up numbers)

---

## File Locations

| File | Purpose |
|------|---------|
| `~/lucidia-enhanced/backend/tools/agent_coordinator.py` | Agent coordination module |
| `~/lucidia-enhanced/backend/prompts.py` | Anti-hallucination prompt |
| `~/LUCIDIA_ENHANCED_AGENT_COORDINATION.md` | Full documentation |
| `~/test-lucidia-coordination.sh` | Test script |

---

## Troubleshooting

### Lucidia not starting?
```bash
cd ~/lucidia-enhanced/backend
pip install -r requirements.txt
python3 main.py
```

### Tools not showing up?
```bash
curl http://localhost:8000/tools
# Should show 13 tools (including 6 new agent tools)
```

### Want to see logs?
```bash
tail -f ~/lucidia-enhanced/backend/nohup.out
```

---

## Next Steps

1. ✅ Test locally (use test script)
2. ✅ Verify delegation works
3. ✅ Check anti-hallucination behavior
4. 🚀 Deploy to Pi cluster: `./deploy-to-pi.sh`
5. 📊 Monitor improvements in production

---

## Key Metrics

Watch for these improvements:

- **Hallucinations:** ↓ 80% reduction expected
- **Tool usage:** ↑ 3x increase expected
- **Delegation rate:** ↑ 10-20% of technical queries
- **User satisfaction:** ↑ Fewer "that's wrong" responses

---

**Status:** Ready to test! 🎉

**Read more:** `~/LUCIDIA_ENHANCED_AGENT_COORDINATION.md`
