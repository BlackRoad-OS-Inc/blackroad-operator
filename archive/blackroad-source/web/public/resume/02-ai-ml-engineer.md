# Alexa Amundson

**AI/ML Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Cloud AI APIs are expensive and you don't own the data. Deployed 27 language models on-premise across edge hardware with 52 TOPS of dedicated acceleration — full inference sovereignty at a fraction of the cost.

---

## Experience

### BlackRoad OS | Founder & AI/ML Engineer | 2025–Present

**The Problem: AI Without Vendor Lock-In**
- Needed persistent, private AI inference without per-token API costs or data leaving the network
- Deployed 27 Ollama models (48.1 GB) across 3 Pi 5 nodes — installed 2x Hailo-8 NPUs (52 TOPS total) for hardware acceleration
- Fine-tuned 4 custom CECE personality models for domain-specific generation — models that don't exist anywhere else

**The Challenge: Thermals Kill Edge AI**
- Inference on $80 hardware generates heat. A runaway generation loop pushed one node to 73.8°C — approaching thermal shutdown
- Built power monitoring (cron every 5 min), CPU governor tuning, and voltage optimization — stabilized fleet at 42°C average
- Reduced GPU memory allocation from 256MB to 16MB on headless nodes, capped frequencies, applied conservative governors — no inference quality loss

**The Stack: From Model to API to User**
- Built Ollama Bridge SSE proxy for streaming model responses to web clients in real-time
- AI image generation hub with 4 backend agents (DALL-E, Flux, SDXL, FAL) — single API, best-model routing
- FTS5 knowledge index across 156,675 memory entries — models can search their own history across 230 SQLite databases

---

## Technical Skills

Ollama, Hailo-8 NPU, DALL-E, Flux, SDXL, FastAPI, Python, FTS5, Docker

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| AI Models | *live* | services.sh — ollama list via SSH |
| Model Size (GB) | *live* | services.sh — ollama list via SSH |
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| Docker Containers | *live* | services.sh — docker ps via SSH |
