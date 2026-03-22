# BlackRoad Social Media Posts — Ready to Post

Stagger LinkedIn posts Day 1 / Day 2 / Day 3. Twitter thread goes out Day 1 alongside the LinkedIn post. Reddit posts go out Day 2-3.

---

## LINKEDIN POST 1 — The Build (Day 1)

```
I built a 52 TOPS AI inference cluster out of Raspberry Pis.

No cloud. No monthly bill. Five Pi 5s, two Hailo-8 accelerators, one 1TB NVMe, and a WireGuard mesh tying it all together.

Here's what the numbers actually look like:

- 52 TOPS total AI throughput (2x Hailo-8 at 26 TOPS each)
- 16 LLM models running simultaneously via Ollama (8-12 tok/s)
- 200-300 FPS on vision inference through Hailo
- 198 listening sockets across the fleet, 207 git repos on a self-hosted Gitea

The thing that surprised me most: the bottleneck was never compute. It was power delivery. A Raspberry Pi 5 with a Hailo-8 and NVMe draws enough current to trigger undervoltage at 0.750V. We had to drop the CPU from 2.6GHz overclock back to 2.0GHz and rewrite the power governor to keep things stable.

The fleet heals itself — cron jobs check heartbeats every minute, restart crashed services in five, and a custom stats proxy aggregates health across all nodes.

Full writeup: [link to 52 TOPS article]

#EdgeAI #RaspberryPi #LocalInference #SovereignCompute
```

---

## LINKEDIN POST 2 — The Philosophy (Day 2)

```
Your AI runs on someone else's GPU.

Every inference you make — every image classified, every token generated — routes through a data center you don't own, governed by terms you didn't read, priced at whatever they decide this quarter.

We ran the math on what our cluster would cost in the cloud:

- 52 TOPS of dedicated AI inference: ~$500-1,000/month on AWS or GCP
- Over 3 years: $18,000 to $36,000 minimum
- Our hardware cost: $1,140 total. Electricity: ~$15/month. Three-year total: ~$1,680.

That's a 10-20x cost difference. And we own it.

But I'm not going to pretend it's easy. One node is offline right now and needs a physical reboot. Two are running on insufficient power supplies. An SD card is showing early signs of failure. There's no SLA. There's no support ticket. When something breaks at 3am, it's on us.

That's the honest tradeoff. You trade convenience for control, reliability for ownership, someone else's problem for your own.

The cloud is someone else's computer. This is ours.

Full manifesto: [link]

#SovereignCompute #EdgeAI #SelfHosted
```

---

## LINKEDIN POST 3 — The Language (Day 3)

```
I built a programming language because bash wasn't cutting it anymore.

I needed to orchestrate AI agents across 5 Raspberry Pis — spawn inference jobs, route them to the right accelerator, handle failures when a node drops off the network. Bash scripts got us to 400+ tools. But coordinating async work across a mesh network with shell scripts is held together with duct tape and prayer.

Python could do it, but I wanted something that understood the domain natively — agents, spaces, concurrent spawning. Something where "spawn inference on cecilia" is a first-class operation, not a subprocess call wrapped in a try/except.

So I wrote RoadC. Python-style indentation. Functions declared with `fun`. Built-in `spawn` for concurrency. A `space` keyword for 3D spatial computing (because eventually these agents need to reason about physical space).

It has a working lexer, parser, and tree-walking interpreter. It handles recursion, pattern matching, closures. It's real.

It's also a prototype. The fleet still runs on bash. The 400+ scripts that keep everything alive aren't getting rewritten anytime soon. But RoadC is how I think about the next layer — where agents don't just respond to commands, they coordinate autonomously.

Full writeup: [link to RoadC article]

#ProgrammingLanguages #EdgeComputing #AI #LanguageDesign
```

---

## TWITTER/X THREAD (Day 1)

### Tweet 1
```
We run 52 TOPS of AI inference on $400 of Raspberry Pis.

No cloud. No monthly bill.

Here's the full breakdown: [photo of cluster]
```
(148 chars)

### Tweet 2
```
The hardware:

- 5x Raspberry Pi 5
- 2x Hailo-8 accelerators (26 TOPS each)
- 1TB NVMe on the main node
- Total cost: ~$1,140 with all accessories

Each Pi 5 costs $80. A Hailo-8 is $100. This isn't exotic hardware.
```
(230 chars)

### Tweet 3
```
The network:

- WireGuard mesh connecting all nodes
- 5 WiFi access points (SSID: RoadNet)
- Custom DNS zones: .cece, .blackroad, .entity
- Pi-hole blocking ads fleet-wide
- 48+ domains routed through Cloudflare tunnels

It's a real network, not a toy.
```
(262 chars)

### Tweet 4
```
The inference:

- 16 LLM models via Ollama (8-12 tok/s)
- Hailo-8 does vision at 200-300 FPS
- 4 custom fine-tuned models
- Self-hosted Gitea with 207 repos
- Fleet heals itself — crashed services auto-restart in 5 min
```
(232 chars)

### Tweet 5
```
What broke:

- Undervoltage: 0.750V on a Pi 5 (should be 0.85V+)
- Thermal throttling until we dropped overclock from 2.6GHz to 2.0GHz
- SD cards dying ("Card stuck being busy!")
- One node is offline right now. Needs a physical reboot.

It's not perfect. That's the point.
```
(278 chars)

### Tweet 6
```
The cost:

- Hardware: $1,140 (one-time)
- Electricity: ~$15/month
- 3-year total: ~$1,680

Equivalent cloud compute:
- $500-1,000/month
- 3-year total: $18,000-$36,000

We save 10-20x. And we own every bit of it.
```
(218 chars)

### Tweet 7
```
"The cloud is someone else's computer. This is ours."

Full writeup with architecture diagrams, port maps, and all the ugly details: [link]
```
(139 chars)

---

## REDDIT — r/LocalLLaMA

### Title
```
Running 16 Ollama models simultaneously on a Pi 5 cluster with Hailo-8 offload — 52 TOPS, no cloud
```

### Body
```
Been building this for a while and wanted to share real numbers instead of theoretical specs.

**Hardware:**
- 5x Raspberry Pi 5
- 2x Hailo-8 accelerators (26 TOPS each, $100 each)
- 1TB NVMe on the main node
- WireGuard mesh connecting everything

**LLM Performance:**
- 16 models loaded in Ollama (including 4 custom fine-tuned)
- 8-12 tok/s on text generation (CPU, not Hailo — Hailo handles vision)
- Hailo-8 does object detection / classification at 200-300 FPS
- All inference stays local. Nothing touches the cloud.

**What actually works:**
- Ollama serves all 16 models concurrently. Swapping is fast on the Pi 5 with 8GB RAM but you do hit limits with larger models.
- Hailo-8 is excellent for vision tasks. Plugs in via M.2, shows up as /dev/hailo0, just works after driver setup.
- Fleet self-heals — heartbeat checks every minute, service restarts every 5 minutes if something crashes.

**What doesn't:**
- tok/s is obviously not competing with cloud GPUs. This is for always-on, private inference — not speed.
- Power delivery is a real problem. Pi 5 + Hailo-8 + NVMe draws enough to trigger undervoltage. Need a proper 5V/5A PSU.
- SD cards are not meant for this workload. One is already showing degradation after months of swap pressure.
- One of the five nodes is currently offline and needs a physical reboot. No remote management on Pis.

**Cost comparison:**
- Total hardware: ~$1,140
- Electricity: ~$15/month
- 3-year cost: ~$1,680
- Equivalent cloud: $18,000-$36,000 over the same period

Full writeup with architecture, port maps, and the power optimization work: [link to 52 TOPS article]

Happy to answer questions about the Hailo-8 setup specifically — there isn't a lot of documentation out there for running it on Pi 5.
```

---

## REDDIT — r/docker (or r/selfhosted)

### Title
```
Docker Swarm on a 5-node Raspberry Pi cluster with NATS messaging and self-healing automation
```

### Body
```
Running a Pi 5 cluster (5 nodes) with Docker Swarm for orchestration and NATS for inter-node messaging. Wanted to share the self-healing architecture since most homelab posts focus on the happy path.

**Stack:**
- Docker Swarm (leader on the node with 1TB NVMe)
- NATS for lightweight pub/sub messaging between nodes
- Gitea (self-hosted, 207 repos) running in Swarm
- Ollama for LLM inference (containerized)
- Portainer for management UI
- WireGuard mesh as the network backbone

**Self-healing setup:**
- Heartbeat cron every 1 minute on all nodes
- Healing cron every 5 minutes — checks critical services, auto-restarts if down
- Stats proxy on port 7890 aggregates health from all nodes
- Watchdog timer on the gateway node monitors a Redis task queue
- Power monitoring every 5 minutes (custom script, logs to /var/log/)

**What I learned the hard way:**
- Docker Swarm service replicas can silently fail. Had a service stuck at 0/4 replicas with no obvious error.
- Container sprawl is real. Cleaned 141 dead containers off one node before it started behaving again.
- SD cards and Docker do not mix well long-term. The write amplification from container layers accelerates degradation. Put your data on NVMe or USB SSD if you can.
- Power matters more than you think. Undervoltage causes random container crashes that look like application bugs.

**Fleet stats:**
- 198 listening sockets across 5 nodes
- 11 Docker images (11.2GB) on the Swarm leader
- 14 images (3.3GB) on the secondary node
- Everything behind Cloudflare tunnels — no ports exposed to the internet

Full writeup on the architecture and the ugly parts: [link to self-healing article]
```

---

## POSTING SCHEDULE

| Day | Platform | Post |
|-----|----------|------|
| Day 1 | LinkedIn | Post 1 — The Build |
| Day 1 | Twitter/X | Full 7-tweet thread |
| Day 2 | LinkedIn | Post 2 — The Philosophy |
| Day 2 | Reddit | r/LocalLLaMA post |
| Day 3 | LinkedIn | Post 3 — The Language |
| Day 3 | Reddit | r/docker post |

Post LinkedIn between 8-10am CT (peak engagement for tech content). Twitter thread same day, early afternoon. Reddit posts evening when those subs are most active.
