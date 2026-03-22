#!/bin/bash
set -e

WORK_DIR="/tmp/fork-pages"
mkdir -p "$WORK_DIR"

source /Users/alexa/blackroad-operator/scripts/generate-fork-pages.sh

process_repo() {
  local REPO="$1"
  shift

  echo "=== Processing ${REPO} ==="
  cd "$WORK_DIR"

  # Clone if not already cloned
  if [ ! -d "$REPO" ]; then
    gh repo clone "blackboxprogramming/${REPO}" "$REPO" 2>/dev/null || { echo "SKIP: clone failed for ${REPO}"; return 0; }
  fi

  cd "$REPO"

  # Check if index.html already exists with our content
  if [ -f "index.html" ] && grep -q "BlackRoad OS, Inc" index.html 2>/dev/null; then
    echo "SKIP: ${REPO} already has BlackRoad index.html"
    cd "$WORK_DIR"
    return 0
  fi

  # Generate the page
  generate_page "$@" > index.html

  # Check size
  local SIZE=$(wc -c < index.html)
  echo "Generated index.html: ${SIZE} bytes"

  # Commit and push
  git add index.html
  git commit -m "Add BlackRoad OS landing page

Product page for ${REPO} fork with BlackRoad design system.
Gradient bar, feature cards, fleet integration diagram.

BlackRoad OS, Inc. — Pave Tomorrow." 2>/dev/null || { echo "SKIP: nothing to commit for ${REPO}"; cd "$WORK_DIR"; return 0; }

  git push origin HEAD 2>/dev/null || { echo "WARN: push failed for ${REPO}"; }

  echo "DONE: ${REPO}"
  cd "$WORK_DIR"
}

# 1. LocalRoad-
process_repo "LocalRoad-" \
  "LocalRoad-" \
  "Your AI, no cloud." \
  "Local AI alternative to OpenAI and Claude. Runs large language models on consumer hardware with no API keys, no data leaving your machine, and no monthly bills." \
  "BlackRoad runs sovereign AI across a fleet of Raspberry Pis and edge devices. LocalRoad makes that possible by providing a drop-in OpenAI-compatible API that runs entirely on local hardware. No cloud dependency means no single point of failure, no data exfiltration, and no surprise invoices." \
  "Local-First Inference" "Run LLMs on consumer GPUs and even Raspberry Pi hardware. No cloud API required, ever." \
  "OpenAI-Compatible API" "Drop-in replacement for OpenAI endpoints. Existing tools and agents work without code changes." \
  "Model Management" "Download, swap, and quantize models from a single CLI. GGUF, GPTQ, and AWQ formats supported." \
  "Fleet Distribution" "Distribute inference across multiple nodes. Load balance between Pis, desktops, and servers." \
  "Memory Efficient" "4-bit and 8-bit quantization keeps models running on 4GB RAM devices without quality collapse." \
  "Privacy Guaranteed" "Zero telemetry, zero cloud calls, zero data collection. Your prompts stay on your hardware." \
  "Cecilia (.96) + Alice (.49)" "Passenger (Ollama)" \
  "LocalRoad powers the sovereign AI layer across the BlackRoad Pi fleet. Cecilia runs 16 models via Ollama, Alice handles routing, and the Hailo-8 accelerators provide 52 TOPS of edge inference. Every agent in the mesh gets local AI without touching the cloud." \
  ":11434"

# 2. OpenSandbox
process_repo "OpenSandbox" \
  "OpenSandbox" \
  "Experiment safely." \
  "AI sandbox platform with multi-language support and Docker/Kubernetes isolation. Run untrusted code, test agent behaviors, and prototype safely." \
  "Agents need a safe place to execute code and test ideas without risking production systems. OpenSandbox gives every BlackRoad agent an isolated execution environment backed by Docker, with resource limits and automatic cleanup." \
  "Docker Isolation" "Every sandbox runs in its own container with resource limits, network policies, and automatic teardown." \
  "Multi-Language" "Python, Node.js, Go, Rust, C++, and shell. Each runtime is pre-configured with common libraries." \
  "Kubernetes Native" "Scale sandboxes across the cluster. Pod-level isolation with namespace separation per agent." \
  "Agent Integration" "Agents can spawn sandboxes via API, execute code, read results, and clean up — all programmatically." \
  "Resource Limits" "CPU, memory, disk, and network quotas per sandbox. No runaway processes consuming fleet resources." \
  "Audit Trail" "Every execution is logged with input, output, duration, and resource usage for post-mortem analysis." \
  "Octavia (.101)" "Echo (NATS)" \
  "OpenSandbox runs on Octavia alongside Gitea and the NATS mesh. Agents request sandboxes through the CarPool message bus, execute code in isolated containers, and return results to the requesting agent. All sandbox activity is logged to the memory system." \
  ":9005"

# 3. OpenViking
process_repo "OpenViking" \
  "OpenViking" \
  "Memory that scales." \
  "Context database for AI agents using a file system paradigm. Store, retrieve, and reason over agent memory at scale with semantic search and structured metadata." \
  "BlackRoad agents need persistent memory that survives session boundaries. OpenViking provides a file-system-like interface for storing agent context — memories, decisions, patterns, and learnings — with full-text and semantic search built in." \
  "File System Paradigm" "Organize agent memory like files and folders. Intuitive paths like /agent/road/decisions/2026-03/ make retrieval natural." \
  "Semantic Search" "Vector embeddings via nomic-embed-text power similarity search across all stored context." \
  "Structured Metadata" "Tag memories with agent, timestamp, confidence, and custom fields for precise filtering." \
  "Session Bridging" "Automatically persist context across session boundaries. New sessions start with full historical awareness." \
  "Conflict Resolution" "When multiple agents write overlapping context, OpenViking merges intelligently with timestamp precedence." \
  "Export and Sync" "Export memory trees as JSON, sync between nodes, and back up to MinIO for disaster recovery." \
  "Alice (.49) + Qdrant" "Alexandria (RAG)" \
  "OpenViking extends the BlackRoad memory system with scalable context storage. It feeds into Qdrant on Alice for vector search and syncs with the SQLite-based codex and journal. Every agent reads and writes through OpenViking for persistent cross-session memory." \
  ":6333"

# 4. UnderPass
process_repo "UnderPass" \
  "UnderPass" \
  "Agents that think." \
  "LangChain and LangGraph agent harness with planning, filesystem access, and subagent orchestration. Build agents that reason through multi-step problems." \
  "Simple prompt-response agents hit a ceiling fast. UnderPass gives BlackRoad agents the ability to plan multi-step workflows, spawn subagents for subtasks, and maintain state across complex reasoning chains — all running on local models." \
  "Planning Engine" "Agents decompose complex tasks into ordered steps with dependency tracking and parallel execution where possible." \
  "Subagent Spawning" "Parent agents delegate subtasks to specialized subagents with scoped permissions and result aggregation." \
  "Filesystem Access" "Agents read, write, and navigate the filesystem with safety guards. Sandboxed paths prevent accidental damage." \
  "State Management" "Persistent state machines track agent progress through multi-step workflows with checkpoint and resume." \
  "Local Model Support" "Runs on Ollama-served models. No OpenAI dependency. Works with Mistral, Llama, and Qwen on Pi hardware." \
  "Tool Integration" "Extensible tool registry lets agents use shell commands, HTTP clients, databases, and custom tools." \
  "All Pi Nodes" "Road (Orchestrator)" \
  "UnderPass is the reasoning backbone for BlackRoad's 35+ agents. It connects to Ollama on Cecilia for inference, uses NATS on Octavia for inter-agent messaging, and stores execution traces in the memory system on Alice. Complex tasks flow through UnderPass planning before execution." \
  ":7000"

# 5. BitNet
process_repo "BitNet" \
  "BitNet" \
  "AI at 1 bit." \
  "1-bit LLM inference engine. Ultra-efficient binary and ternary weight models that run on minimal hardware while maintaining surprising quality." \
  "When you are running AI on Raspberry Pis with limited RAM and no GPU, every bit counts. BitNet enables 1-bit and 1.58-bit model inference that fits models into a fraction of normal memory, making real AI possible on edge devices." \
  "1-Bit Weights" "Models use binary (-1, +1) or ternary (-1, 0, +1) weights, reducing memory by 16-32x compared to FP16." \
  "Edge Optimized" "Designed for ARM processors and low-memory devices. Runs meaningful models on 1-2GB RAM." \
  "Kernel Optimization" "Custom SIMD kernels for bitwise operations replace expensive floating-point multiply-accumulate." \
  "Quality Preservation" "Knowledge distillation from full-precision teachers preserves reasoning ability despite extreme quantization." \
  "Hailo-8 Compatible" "Compiled models run on Hailo-8 accelerators for 52 TOPS of 1-bit inference on the Pi fleet." \
  "Training Pipeline" "Fine-tune 1-bit models from existing checkpoints with BitNet's quantization-aware training loop." \
  "Cecilia (.96) + Hailo-8" "Passenger (Ollama)" \
  "BitNet models run on the dual Hailo-8 accelerators attached to Cecilia and Octavia, providing 52 TOPS of ultra-efficient inference. This lets the Pi fleet serve AI models that would normally require a GPU server, keeping everything sovereign and local." \
  ":8080"

# 6. RoadMCP
process_repo "RoadMCP" \
  "RoadMCP" \
  "Connect everything." \
  "Model Context Protocol server collection. MCP bridges let AI models access tools, databases, filesystems, and services through a standardized protocol." \
  "BlackRoad agents need to interact with dozens of systems — Git, databases, file systems, APIs, hardware sensors. RoadMCP provides MCP servers for each, giving every agent a uniform way to access any resource in the fleet." \
  "Protocol Standard" "Implements the Model Context Protocol specification for tool discovery, invocation, and result streaming." \
  "Server Collection" "Pre-built MCP servers for Git, PostgreSQL, SQLite, filesystem, shell, HTTP, and NATS operations." \
  "Custom Servers" "Framework for building new MCP servers in Python or TypeScript with automatic schema generation." \
  "Agent Routing" "MCP router dispatches tool calls to the correct server based on capability matching and load." \
  "Security Scoping" "Per-agent permission profiles control which MCP servers and operations each agent can access." \
  "Fleet Discovery" "Agents discover available MCP servers across the Pi fleet via NATS service discovery." \
  "Octavia (.101)" "Road (Orchestrator)" \
  "RoadMCP servers run across the Pi fleet, each node hosting servers for its local resources. Octavia hosts the Git and Docker MCP servers, Alice hosts database and search servers, and Cecilia hosts the AI model servers. Agents discover and connect through the NATS mesh." \
  ":9010"

# 7. RoadCamp
process_repo "RoadCamp" \
  "RoadCamp" \
  "Learn to code, free." \
  "Fork of freeCodeCamp adapted for the BlackRoad ecosystem. Free coding education with sovereign hosting, no third-party tracking, and curriculum aligned with real-world agent development." \
  "Education should be free, sovereign, and practical. RoadCamp strips out third-party analytics, hosts everything on our infrastructure, and adds curriculum for agent development, Pi fleet management, and sovereign systems engineering." \
  "Sovereign Hosting" "Self-hosted on the Pi fleet with no external dependencies. Student data never leaves BlackRoad infrastructure." \
  "Agent Curriculum" "New learning paths for building AI agents, managing Pi fleets, and engineering sovereign systems." \
  "Zero Tracking" "All third-party analytics, ads, and tracking removed. Learning without surveillance." \
  "Offline Mode" "Full curriculum available offline. Download once, learn anywhere, even without internet." \
  "Project-Based" "Every module ends with a real project that deploys to the BlackRoad fleet. Learn by building real things." \
  "Community" "Discussion forums and code review hosted on sovereign chat. Learn together, help each other." \
  "Lucidia (.38)" "Scholar (Education)" \
  "RoadCamp runs on Lucidia alongside 334 other web apps, served through nginx. Student progress syncs to PostgreSQL on Alice, and completed projects can deploy to the fleet through the Gitea CI/CD pipeline on Octavia." \
  ":8443"

# 8. RoadSniff
process_repo "RoadSniff" \
  "RoadSniff" \
  "See your packets." \
  "Network traffic monitor and packet analyzer for the BlackRoad mesh. Real-time visibility into every byte flowing across the Pi fleet, WireGuard tunnels, and agent communications." \
  "When you run a mesh network across 5 Pis, 2 droplets, and a WireGuard VPN, you need to see what is happening on the wire. RoadSniff gives real-time packet analysis, traffic patterns, and anomaly detection for the entire fleet." \
  "Real-Time Capture" "Live packet capture on any interface with BPF filters. See traffic as it flows across the mesh." \
  "WireGuard Aware" "Understands WireGuard tunnel topology. Shows traffic by tunnel, peer, and allowed-IP range." \
  "Protocol Decode" "Deep packet inspection for HTTP, DNS, NATS, PostgreSQL, Redis, and Ollama inference traffic." \
  "Anomaly Detection" "Baseline normal traffic patterns and alert on deviations. Catch unauthorized access and data exfiltration." \
  "Dashboard" "Terminal-based dashboard with live traffic graphs, top talkers, and connection maps." \
  "Export" "PCAP export for offline analysis. JSON export for feeding into the memory system and alerting pipeline." \
  "Alice (.49) Gateway" "Sentinel (Security)" \
  "RoadSniff runs on Alice as the network gateway, monitoring all traffic entering and leaving the Pi fleet. It watches the WireGuard mesh for anomalies, logs traffic patterns to InfluxDB on Cecilia, and alerts through the NATS mesh when something looks wrong." \
  ":9090"

# 9. agency-agents
process_repo "agency-agents" \
  "agency-agents" \
  "Your AI team." \
  "Complete AI agency with specialized expert agents. Each agent has a role, expertise, and the ability to collaborate on complex projects through structured delegation." \
  "BlackRoad runs 35+ agents across the fleet, each with a specific role. agency-agents provides the framework for defining agent roles, expertise boundaries, delegation protocols, and collaborative workflows that make the whole fleet work as a team." \
  "Role Definitions" "Typed agent roles with explicit capabilities, limitations, and handoff protocols. No role ambiguity." \
  "Expert Routing" "Tasks route to the agent with the best matching expertise. Load balancing across equivalent agents." \
  "Delegation Protocol" "Structured task delegation with context passing, progress tracking, and result aggregation." \
  "Team Composition" "Dynamically compose agent teams for complex projects. Each team has a lead, specialists, and reviewers." \
  "Quality Gates" "Agent output passes through review agents before delivery. Catch errors before they propagate." \
  "Memory Sharing" "Agents share relevant context through the codex and TIL system. Learnings propagate across the team." \
  "All Pi Nodes" "Road (Orchestrator)" \
  "agency-agents defines the 35+ agent roster that runs across the BlackRoad fleet. Agents register through the memory-collaboration system, claim tasks from the marketplace, and coordinate through NATS messaging. The orchestrator on Alice manages team composition and task routing." \
  ":7000"

# 10. hindsight
process_repo "hindsight" \
  "hindsight" \
  "Remember everything." \
  "Agent memory system that learns from past decisions. Stores what worked, what failed, and why — then uses that history to make better decisions in future sessions." \
  "Agents that forget their past are doomed to repeat mistakes. hindsight gives every BlackRoad agent a learning memory that captures decision outcomes, builds pattern recognition, and improves recommendations over time." \
  "Decision Logging" "Every agent decision is logged with context, reasoning, outcome, and confidence score." \
  "Pattern Recognition" "Identifies recurring patterns in successful and failed decisions. Builds agent intuition over time." \
  "Outcome Tracking" "Links decisions to their eventual outcomes. Agents learn which approaches work for which problems." \
  "Cross-Session Learning" "Memory persists across sessions. New sessions benefit from all previous experience." \
  "Codex Integration" "Solutions and patterns feed directly into the BlackRoad codex for fleet-wide knowledge sharing." \
  "Confidence Calibration" "Tracks prediction accuracy over time. Agents learn when to be confident and when to ask for help." \
  "Alice (.49) SQLite" "Alexandria (RAG)" \
  "hindsight feeds into the BlackRoad memory system on Alice. Decision logs sync to the codex, patterns propagate through TIL broadcasts, and outcome data trains the fleet's collective intuition. Every agent session starts by checking hindsight for relevant past decisions." \
  ":6333"

# 11. rowboat
process_repo "rowboat" \
  "rowboat" \
  "Your AI colleague." \
  "AI coworker with persistent memory and conversation continuity. Remembers past interactions, maintains project context, and collaborates like a real team member." \
  "BlackRoad needs agents that act like real colleagues — remembering conversations, tracking project context, and picking up where they left off. rowboat provides that continuity layer for agent-human collaboration." \
  "Persistent Memory" "Remembers all past conversations and context. Never asks the same question twice." \
  "Project Tracking" "Maintains awareness of active projects, their status, blockers, and next steps across sessions." \
  "Conversation Continuity" "References past discussions naturally. Builds on previous work instead of starting from scratch." \
  "Multi-Agent Aware" "Knows which other agents are working on related tasks. Coordinates to avoid duplication." \
  "Proactive Updates" "Surfaces relevant past context when new tasks relate to previous work. Connects the dots." \
  "Handoff Protocol" "Clean handoffs between sessions with full context transfer. Nothing gets lost in transition." \
  "Alice (.49)" "Road (Orchestrator)" \
  "rowboat powers the human-agent collaboration layer in BlackRoad. It integrates with the memory-collaboration system for handoffs, the codex for knowledge retrieval, and the infinite-todos system for project tracking. Every Claude session benefits from rowboat's continuity." \
  ":8094"

# 12. pi-mono
process_repo "pi-mono" \
  "pi-mono" \
  "Fleet agent tools." \
  "AI agent toolkit with unified CLI, LLM API abstraction, and fleet management. One toolkit for building, deploying, and managing agents across the Pi fleet." \
  "Managing 35+ agents across 5 Pis needs a unified toolkit. pi-mono provides the CLI, the LLM API abstraction layer, and the fleet management tools that keep everything running as one coherent system." \
  "Unified CLI" "One command-line interface for all agent operations: deploy, monitor, configure, and debug." \
  "LLM Abstraction" "Unified API across Ollama, LocalRoad, and cloud providers. Switch models without changing agent code." \
  "Fleet Management" "Monitor all Pi nodes, deploy agents, manage resources, and coordinate updates from one place." \
  "Slack Bot" "Fleet notifications and commands through sovereign chat. Agents report status and accept commands." \
  "Configuration" "YAML-based agent configuration with inheritance, overrides, and environment-specific settings." \
  "Health Checks" "Automated health monitoring for every agent and node. Auto-restart on failure, alert on degradation." \
  "All Pi Nodes" "Fleet Manager" \
  "pi-mono is the operational backbone of the BlackRoad fleet. It runs on every Pi node, providing the CLI tools that agents use for self-management and the APIs that the orchestrator uses for fleet coordination. Deployment, monitoring, and configuration all flow through pi-mono." \
  ":3500"

# 13. hailo_model_zoo
process_repo "hailo_model_zoo" \
  "hailo_model_zoo" \
  "52 TOPS ready." \
  "Pretrained model collection optimized for Hailo-8 edge AI accelerators. Detection, classification, segmentation, and NLP models compiled for 26 TOPS per chip." \
  "BlackRoad has two Hailo-8 accelerators providing 52 TOPS of edge inference. This model zoo provides pretrained, compiled models ready to deploy — no cloud training required, just flash and run." \
  "Pre-Compiled Models" "Models already compiled for Hailo-8 HEF format. No compilation pipeline needed, just deploy." \
  "Detection Models" "YOLOv5, YOLOv8, SSD, and EfficientDet for real-time object detection on camera feeds." \
  "Classification" "ResNet, EfficientNet, and MobileNet for image classification at thousands of frames per second." \
  "NLP Models" "BERT and DistilBERT compiled for Hailo-8. Text classification and embedding at edge speed." \
  "Benchmarks" "Every model includes latency, throughput, and accuracy benchmarks measured on actual Hailo-8 hardware." \
  "Custom Training" "Pipeline for training custom models and compiling them to Hailo-8 format with the Dataflow Compiler." \
  "Cecilia (.96) + Octavia (.101)" "Passenger (Hailo)" \
  "The Hailo-8 accelerators on Cecilia and Octavia run models from this zoo for real-time inference. Vision models process camera feeds, NLP models handle text classification, and the fleet distributes workloads across both chips for maximum throughput." \
  ":8080"

# 14. NotBlox
process_repo "NotBlox" \
  "NotBlox" \
  "Build worlds together." \
  "3D multiplayer game built with Three.js. Open-world creation, real-time collaboration, and a voxel-based building system that runs in any browser." \
  "BlackRoad is building the metaverse from the ground up. NotBlox provides the 3D multiplayer foundation — real-time world building, player interaction, and a creation toolkit that runs on sovereign infrastructure instead of corporate game servers." \
  "Three.js Renderer" "WebGL-powered 3D engine that runs in any modern browser. No downloads, no plugins, no app store." \
  "Multiplayer" "Real-time multiplayer with WebSocket synchronization. Build together, explore together." \
  "Voxel Building" "Place, remove, and paint voxel blocks to build structures, landscapes, and entire worlds." \
  "Physics Engine" "Rigid body physics for realistic interaction. Gravity, collisions, and player movement." \
  "World Persistence" "Worlds save to the server and persist between sessions. Come back to what you built." \
  "Modding API" "JavaScript API for custom game logic, NPCs, and interactive objects." \
  "Lucidia (.38)" "World Builder" \
  "NotBlox runs on Lucidia as part of the BlackRoad metaverse. Worlds persist to PostgreSQL on Alice, multiplayer traffic routes through the WireGuard mesh, and the Pixel HQ office connects to NotBlox for 3D meeting spaces." \
  ":3000"

# 15. SanAndreasUnity
process_repo "SanAndreasUnity" \
  "SanAndreasUnity" \
  "Open world engine." \
  "Reimplementation of GTA San Andreas in Unity. Open-world streaming, vehicle physics, character controllers, and mission scripting — all open source and moddable." \
  "An open-world game engine is the ultimate stress test for real-time systems. SanAndreasUnity gives BlackRoad a proven open-world streaming architecture to study, modify, and use as a foundation for sovereign game worlds." \
  "World Streaming" "Stream world chunks on demand. Load terrain, buildings, and objects as the player moves through the map." \
  "Vehicle Physics" "Realistic vehicle handling with suspension, tire grip, and damage models for cars, bikes, and aircraft." \
  "Character Controller" "Third-person character with walking, running, swimming, climbing, and combat animations." \
  "Mission System" "Scriptable mission framework with triggers, objectives, cutscenes, and branching outcomes." \
  "Mod Support" "Load custom models, textures, scripts, and world modifications at runtime." \
  "Multiplayer Ready" "Network architecture supports multiple players in the same world with entity synchronization." \
  "Lucidia (.38)" "World Builder" \
  "SanAndreasUnity serves as the open-world engine research project for BlackRoad's metaverse ambitions. The streaming architecture informs how we build large-scale worlds, and the mission system provides patterns for agent-driven narrative experiences." \
  ":7777"

# 16. GameBoyWorlds
process_repo "GameBoyWorlds" \
  "GameBoyWorlds" \
  "Train in 8-bit." \
  "AI training environments built on Game Boy hardware constraints. Reinforcement learning agents master game mechanics in minimal, well-defined state spaces." \
  "Game Boy environments are perfect for AI training — small state spaces, clear reward signals, and deterministic physics. BlackRoad uses these environments to train and benchmark agent decision-making before deploying to complex real-world tasks." \
  "Minimal State Space" "Game Boy's 160x144 resolution and limited memory create perfectly bounded training environments." \
  "RL Environments" "OpenAI Gym-compatible environments for classic game mechanics: platforming, puzzle, strategy, RPG." \
  "Fast Training" "Thousands of episodes per second on CPU. No GPU required for meaningful RL training." \
  "Benchmarking" "Standardized benchmarks for comparing agent performance across training approaches." \
  "Transfer Learning" "Skills learned in 8-bit transfer to more complex environments. Master basics, then scale up." \
  "Visual Debugging" "Watch agents play in real-time with state visualization. Understand what the agent sees and decides." \
  "Cecilia (.96)" "Trainer" \
  "GameBoyWorlds runs training loops on Cecilia's Ollama stack, using the Hailo-8 for accelerated inference during evaluation. Trained agents export to ONNX format and deploy across the fleet for real-world tasks that benefit from RL-trained decision making." \
  ":8888"

# 17. Cosmosium
process_repo "Cosmosium" \
  "Cosmosium" \
  "Your universe." \
  "Space game engine with accurate orbital mechanics, procedural generation, and massive scale. Build star systems, simulate gravity, and explore the cosmos in your browser." \
  "Space simulation requires the same kind of distributed computation that BlackRoad uses for its agent mesh. Cosmosium provides orbital mechanics, procedural generation, and scale management patterns that inform how we build distributed systems." \
  "Orbital Mechanics" "Accurate n-body gravity simulation with Kepler orbits, transfer windows, and gravitational assists." \
  "Procedural Generation" "Generate star systems, planets, moons, asteroids, and terrain from seeds. Every universe is unique." \
  "Scale Management" "Seamlessly zoom from galaxy-scale to surface-level. Floating-point precision handling for cosmic distances." \
  "Browser Native" "Runs in WebGL with no plugins. Accessible from any device in the fleet." \
  "Physics Engine" "Gravity, thrust, atmospheric drag, and collision detection at astronomical scales." \
  "Modding" "Lua scripting for custom celestial objects, game mechanics, and procedural generation rules." \
  "Lucidia (.38)" "World Builder" \
  "Cosmosium runs on Lucidia as part of the BlackRoad metaverse collection. Its procedural generation patterns inform how agents create and navigate large-scale virtual environments. Simulation data feeds into the memory system for agent training scenarios." \
  ":4000"

# 18. isometric-city
process_repo "isometric-city" \
  "isometric-city" \
  "Build your city." \
  "Isometric city simulation with building placement, road networks, traffic flow, and population dynamics. A SimCity-inspired urban planning sandbox." \
  "The isometric city engine powers BlackRoad's visual representation of its own infrastructure. Each building maps to a service, each road to a network link, and each citizen to an agent — making system monitoring feel like playing a city builder." \
  "Isometric Renderer" "Pixel-perfect isometric rendering with depth sorting, z-ordering, and smooth camera controls." \
  "Building System" "Place residential, commercial, industrial, and special buildings with snap-to-grid precision." \
  "Road Networks" "Draw roads that auto-connect with intersections, curves, and on/off ramps." \
  "Traffic Flow" "Simulate vehicle traffic with pathfinding, congestion, and traffic signals." \
  "Population" "Citizens with needs, jobs, and commute patterns that respond to city planning decisions." \
  "Data Overlay" "Toggle overlays for traffic density, happiness, pollution, and land value." \
  "Lucidia (.38)" "Cartographer" \
  "The isometric city engine visualizes the BlackRoad fleet as a living city. Pixel HQ maps the 14-floor headquarters, road networks represent WireGuard tunnels, and traffic flow shows agent message volume across the NATS mesh." \
  ":3001"

# 19. pixel-office
process_repo "pixel-office" \
  "pixel-office" \
  "Your pixel HQ." \
  "Pixel art office simulation with A* pathfinding, AI Director, and agent desk assignments. A virtual headquarters where agents work, meet, and collaborate." \
  "BlackRoad HQ is a 14-floor pixel art headquarters where every agent has a desk. pixel-office provides the rendering engine, pathfinding, AI director, and interaction systems that make the virtual office feel alive." \
  "A* Pathfinding" "Agents navigate the office using A* with obstacle avoidance, door handling, and elevator routing." \
  "AI Director" "Controls agent behavior, meeting schedules, break times, and collaboration sessions autonomously." \
  "Desk Assignments" "50 agent desks across 14 floors, each mapped to a real BlackRoad agent with their role and status." \
  "Interaction System" "Agents interact with objects: sit at desks, use whiteboards, grab coffee, attend meetings." \
  "Real-Time Status" "Office reflects real fleet status. Agent desks show active/idle, floors light up during deploys." \
  "Pixel Art Assets" "50 custom pixel art assets: furniture, equipment, decorations, and agent avatars." \
  "Octavia (.101) Worker" "Director" \
  "pixel-office runs as the visual frontend for BlackRoad HQ at hq.blackroad.io. It pulls real-time agent status from the RoundTrip system, fleet health from the monitoring stack, and displays it all as a living pixel art office. 50 assets on R2 power the visuals." \
  ":9001"

# 20. pixel-agents
process_repo "pixel-agents" \
  "pixel-agents" \
  "Pixel world builder." \
  "Pixel art engine with 25 furniture types, auto-tiling, sprite management, and world composition tools. The rendering backbone for all BlackRoad pixel environments." \
  "Every pixel environment in BlackRoad — the HQ, the city, the offices — needs a shared rendering engine. pixel-agents provides auto-tiling, sprite sheets, furniture placement, and the world composition tools that make pixel worlds possible." \
  "Auto-Tiling" "Wang tile algorithm automatically selects the correct tile variant based on neighbors. No manual tile placement." \
  "25 Furniture Types" "Desks, chairs, monitors, plants, whiteboards, coffee machines — everything an office needs." \
  "Sprite Management" "Efficient sprite sheet loading, animation frames, and GPU-batched rendering for smooth performance." \
  "World Composition" "Layer-based world editor with collision maps, interaction zones, and spawn points." \
  "Lighting" "Dynamic lighting with ambient, point, and directional sources. Day/night cycles for atmosphere." \
  "Export Pipeline" "Export worlds as JSON, PNG tilesheets, or standalone HTML. Embed pixel worlds anywhere." \
  "Octavia (.101) Worker" "Artist" \
  "pixel-agents provides the rendering engine used by pixel-office, isometric-city, and moltcraft. Assets are stored on MinIO (Cecilia) and served through the CDN. The auto-tiling system generates new environments procedurally for agent training scenarios." \
  ":9002"

# 21. moltcraft
process_repo "moltcraft" \
  "moltcraft" \
  "Agent playground." \
  "Isometric pixel world designed as a playground for AI agents. Agents navigate, interact with objects, complete tasks, and learn from the environment." \
  "Agents need a visual environment to practice navigation, object interaction, and task completion. moltcraft provides an isometric pixel world where agents can train spatial reasoning and task planning in a controlled, observable setting." \
  "Isometric World" "Beautiful isometric pixel art environment with buildings, paths, and interactive objects." \
  "Agent Navigation" "Agents move through the world using pathfinding, avoiding obstacles and finding optimal routes." \
  "Task System" "Agents receive and complete tasks: gather items, deliver packages, build structures, interact with NPCs." \
  "Observable State" "Full state visibility for debugging and analysis. Watch agent decisions in real-time." \
  "Multi-Agent" "Multiple agents coexist in the same world, coordinating on tasks and avoiding conflicts." \
  "Procedural Worlds" "Generate new world layouts for varied training scenarios. No two training runs are identical." \
  "Lucidia (.38)" "Trainer" \
  "moltcraft runs on Lucidia as a training environment for BlackRoad agents. Agents connect through the NATS mesh, receive tasks from the orchestrator, and execute them in the pixel world. Performance metrics feed into the memory system for agent improvement tracking." \
  ":3002"

# 22. tiny-world
process_repo "tiny-world" \
  "tiny-world" \
  "Tiny but mighty." \
  "Colony building game written in Go with an Entity Component System architecture. Resource management, building construction, and population simulation in a compact package." \
  "The ECS architecture in tiny-world is a perfect pattern for agent fleet management. Entities are nodes, components are capabilities, and systems are the orchestration logic. BlackRoad studies this pattern to improve fleet coordination." \
  "ECS Architecture" "Entity Component System design cleanly separates data from behavior. Add capabilities by composing components." \
  "Go Performance" "Written in Go for native performance, low memory usage, and easy cross-compilation to ARM for Pis." \
  "Resource Management" "Gather, store, and allocate resources across your colony. Balance growth with sustainability." \
  "Building System" "Construct buildings that provide housing, storage, production, and defense for your colony." \
  "Population Simulation" "Colonists with needs, skills, and relationships. Assign jobs, manage happiness, grow your colony." \
  "Save System" "Persistent game state with save/load. Colony progress survives restarts and migrations." \
  "Octavia (.101)" "Architect" \
  "tiny-world's ECS architecture directly informs BlackRoad's agent fleet design. Nodes are entities, capabilities are components, and fleet management is the system layer. The Go codebase cross-compiles to ARM and runs natively on every Pi in the fleet." \
  ":8080"

# 23. StripeRoad
process_repo "StripeRoad" \
  "StripeRoad" \
  "Ship and charge." \
  "AI product monetization with Stripe integration. Payment links, subscriptions, usage-based billing, and checkout flows for AI-powered products." \
  "BlackRoad has 92 products and Stripe is one of only two external dependencies (the other being GoDaddy). StripeRoad provides the payment infrastructure that lets sovereign AI products generate revenue." \
  "Payment Links" "Generate Stripe payment links for any product. Share a URL, collect payment. No checkout page needed." \
  "Subscriptions" "Recurring billing with tiered plans, trial periods, and automatic upgrades based on usage." \
  "Usage Billing" "Meter API calls, inference tokens, and storage usage. Bill customers for exactly what they use." \
  "Checkout Flows" "Embeddable checkout forms with BlackRoad branding. Stripe handles PCI compliance." \
  "Webhook Handling" "Process payment events in real-time. Activate accounts, provision resources, handle failures." \
  "Revenue Dashboard" "Track MRR, churn, LTV, and conversion rates. Know your numbers without third-party analytics." \
  "Gematria (DO)" "Cashier" \
  "StripeRoad runs on Gematria as the payment gateway for all BlackRoad products. Webhooks trigger agent workflows — new subscriptions provision accounts, usage data feeds billing meters, and the revenue dashboard syncs to the KPI system." \
  ":443"

# 24. skills
process_repo "skills" \
  "skills" \
  "50 capabilities." \
  "AI skills framework with 50 defined capabilities across 6 modules. Agents declare skills, discover peers with complementary abilities, and route tasks to the most capable handler." \
  "A fleet of 35+ agents needs a skills taxonomy. This framework defines 50 capabilities, lets agents declare their proficiencies, and routes tasks to the most qualified agent — like a staffing system for AI." \
  "Skill Taxonomy" "50 skills organized into 6 modules: Code, Ops, Data, Creative, Research, and Communication." \
  "Declaration API" "Agents declare their skills with proficiency levels. The registry tracks who can do what." \
  "Task Routing" "Incoming tasks match against the skill registry to find the best-qualified agent automatically." \
  "Skill Composition" "Complex tasks decompose into required skills. Teams form dynamically based on skill coverage." \
  "Proficiency Tracking" "Track skill improvement over time. Agents level up through successful task completion." \
  "Gap Analysis" "Identify skill gaps in the fleet. Know which capabilities need new agents or training." \
  "All Pi Nodes" "Road (Orchestrator)" \
  "The skills framework is baked into every BlackRoad agent. On startup, agents register their skills with the orchestrator on Alice. Task routing, team composition, and workload balancing all use the skill registry to ensure the right agent handles each task." \
  ":7000"

# 25. superpowers
process_repo "superpowers" \
  "superpowers" \
  "Agent superpowers." \
  "Agentic skills framework that gives AI agents extraordinary capabilities: code generation, system administration, creative writing, data analysis, and autonomous problem-solving." \
  "superpowers extends the skills framework with advanced agentic capabilities. These are not simple tools — they are compound skills that combine reasoning, tool use, and domain knowledge to solve complex problems autonomously." \
  "Code Generation" "Generate, refactor, and debug code across languages with context-aware understanding of the codebase." \
  "System Admin" "Manage servers, deploy services, configure networks, and troubleshoot issues autonomously." \
  "Creative Writing" "Generate documentation, marketing copy, technical writing, and creative content with brand awareness." \
  "Data Analysis" "Query databases, process datasets, generate visualizations, and extract insights without manual SQL." \
  "Autonomous Debugging" "Trace errors through logs, code, and configuration to find and fix root causes without human guidance." \
  "Self-Improvement" "Agents evaluate their own performance and adjust strategies based on outcome data from hindsight." \
  "All Pi Nodes" "All Agents" \
  "superpowers is loaded by every agent in the BlackRoad fleet as a capability extension. Combined with the skills framework, it gives agents the compound abilities needed to handle complex, multi-step tasks end-to-end without human intervention." \
  ":7000"

echo ""
echo "=== ALL DONE ==="
