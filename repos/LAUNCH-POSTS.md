# Launch Posts — BlackRoad OS Blog

All posts ready to submit. Post the HN one first, then Reddit 30 min later, then dev.to within the hour.

---

## 1. Hacker News (Show HN)

**Submit at**: https://news.ycombinator.com/submit

**Title**: `Show HN: 52 TOPS of AI inference on $400 of Raspberry Pis`

**URL**: `https://blackroad.io/blog/52-tops-on-400-dollars`

**Comment to post immediately after submission** (this is where HN engagement happens):

```
Hi HN — I built a distributed AI inference cluster on five Raspberry Pis with two Hailo-8 M.2 accelerators (26 TOPS each). The article covers the full build: hardware, a custom mesh network (WireGuard + hostapd), the inference stack (Ollama serving 16 models), what broke (undervoltage, thermal throttling, SD card degradation), and the self-healing automation that keeps it running unattended.

The honest numbers: 8-12 tokens/sec on a 7B model (CPU), 200-300 FPS image classification on the Hailo NPU. Not datacenter performance, but it runs 24/7 for ~$15/month in electricity vs $500-1000/month cloud equivalent.

One node has been offline for days because nobody has walked over to power cycle it. No system is perfect.

Code: https://github.com/blackboxprogramming
Fleet dashboard: https://blackroad.io

Happy to answer questions about the Hailo-8 integration, WireGuard mesh topology, or the power optimization that eliminated all throttle flags on Pi 5.
```

---

## 2. Reddit

### r/raspberry_pi

**Title**: `52 TOPS of AI inference on a 5-node Raspberry Pi cluster with Hailo-8 accelerators`

**Body**:
```
Built a distributed inference cluster across five Pis (one Pi 400, four Pi 5s). Two of the Pi 5s have Hailo-8 M.2 AI accelerators on the PCIe lane — 26 TOPS each for a combined 52 TOPS of INT8 inference.

The cluster runs:
- Ollama with 16 language models (8-12 tok/s on 7B)
- Hailo-8 for vision tasks (200-300 FPS on mobilenet-class)
- A custom mesh network (hostapd + WireGuard) across all nodes
- Self-healing automation (heartbeat + heal cron jobs)

Total hardware cost: ~$440 ($600 with retail Hailo pricing)
Monthly electricity: ~$15

Wrote up the full build including what broke — undervoltage is the #1 killer. Pi 5 + Hailo-8 + NVMe needs a proper 5V/5A supply and most USB-C chargers can't do it.

Full writeup: https://blackroad.io/blog/52-tops-on-400-dollars
```

### r/selfhosted

**Title**: `Self-healing infrastructure on a Pi cluster — heartbeat monitors, auto-restart, and the 5% that still needs a human`

**Body**:
```
Running 5 Raspberry Pis 24/7 as an AI inference cluster. Built an automation layer that handles service restarts, connectivity monitoring, and power management without human intervention.

Each node runs:
- Heartbeat cron (1 min) — checks WireGuard tunnel, DNS, network
- Heal cron (5 min) — restarts Ollama, stats-proxy, cloudflared if down
- Power monitor (5 min) — logs temps, voltage, throttle flags

It caught a rogue service calling an API in a tight loop (73.8°C → 57.9°C after kill), an obfuscated cron job dropping scripts from /tmp, and an overclock that was causing sustained undervoltage.

But it can't power cycle hardware. One node has been offline for days.

Full writeup: https://blackroad.io/blog/self-healing-infrastructure
Also: the hardware stack (https://blackroad.io/blog/52-tops-on-400-dollars) and the mesh network (https://blackroad.io/blog/roadnet-carrier-grade-mesh)
```

### r/homelab

**Title**: `Built a carrier-grade mesh network on 5 Raspberry Pis — WireGuard, hostapd, Pi-hole, custom DNS zones`

**Body**:
```
Five Pis, five WiFi APs on non-overlapping channels (1/6/11), five subnets (10.10.x.0/24), WireGuard encrypted mesh with a VPS hub, Pi-hole for DNS, and custom TLDs for internal service discovery.

The network carries real traffic — AI model inference, git operations (207 repos on self-hosted Gitea), Docker Swarm orchestration.

Wrote up the full architecture, the WireGuard topology, DNS zones, failover handling, and what we'd do differently (channel overlap between two nodes, DHCP instability, the WireGuard hub being a SPOF).

https://blackroad.io/blog/roadnet-carrier-grade-mesh
```

### r/ProgrammingLanguages

**Title**: `Designing a programming language for AI agent orchestration — indentation-sensitive parsing, spawn primitives, fleet-aware types`

**Body**:
```
Built a small language called RoadC for orchestrating AI agents across a distributed Raspberry Pi cluster. Python-style indentation (colon + INDENT/DEDENT), `fun` keyword, `let`/`var`/`const`, and `spawn` for concurrent task creation.

The implementation is a tree-walking interpreter: 598-line lexer, 827-line parser, 321-line interpreter, 463-line AST with 46 node classes.

What works: functions, recursion, closures, if/elif/else, while, for, lists, dicts.
What doesn't: the network-aware spawning (the whole reason we built it) is still a parser stub.

Honest writeup about the design decisions, INDENT/DEDENT tokenization edge cases, and what we learned:
https://blackroad.io/blog/roadc-language-for-agents
```

---

## 3. dev.to

**Title**: `The Sovereign Computing Manifesto: Why We Run 52 TOPS of AI on Hardware We Own`

**Tags**: `sovereign-computing, edge-ai, raspberry-pi, infrastructure`

**Body**: Copy the full manifesto article content, reformatted as markdown. Add a canonical URL pointing to `https://blackroad.io/blog/sovereign-computing-manifesto`.

This is the philosophical piece that gets shared by people who aren't interested in the technical details but resonate with the idea. It links back to all four technical articles.

---

## Posting Schedule

1. **HN** — Post now. Comment immediately. Engage with every response for the first 2 hours.
2. **r/raspberry_pi** — 30 min after HN. This is the most relevant sub.
3. **r/selfhosted** — 1 hour after HN. Different angle (ops, not hardware).
4. **r/homelab** — 2 hours after HN. Networking angle.
5. **r/ProgrammingLanguages** — Next day. Different audience entirely.
6. **dev.to** — Next day. The manifesto. Different audience again.

Each post hits a different community with a different article. None feel like the same person carpet-bombing. Each one is the right content for the right audience.

---

## Key Rules

- Never link to more than one article per subreddit post (looks spammy)
- The HN comment is where engagement happens — answer every question
- Don't mention "BlackRoad OS" in Reddit titles — let the content speak
- The dev.to manifesto should feel like an essay, not a product launch
- If anyone asks "what is BlackRoad OS" — answer honestly: it's infrastructure we built for ourselves. It's not a product yet.
