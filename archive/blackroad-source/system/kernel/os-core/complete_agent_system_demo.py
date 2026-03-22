#!/usr/bin/env python3
"""Complete BlackRoad OS Agent System Demo

Demonstrates the full agent infrastructure:
- Lucidia breath-synchronized spawning
- Pack-based agent templates
- Agent-to-agent communication
- LLM-powered thinking
- Marketplace discovery"""

import asyncio
from pathlib import Path

from blackroad_core.lucidia import LucidiaBreath
from blackroad_core.agents import (
    AgentManifest,
    BlackRoadAgent,
    RuntimeType,
    EmotionalState,
    EventBus,
    CapabilityRegistry
)
from blackroad_core.spawner import AgentSpawner, SpawnRequest
from blackroad_core.packs import PackRegistry
from blackroad_core.communication import CommunicationBus, AgentCommunicator, Message
from blackroad_core.llm import (
    LLMConfig,
    LLMMessage,
    LLMRouter,
    OllamaProvider,
    LLMBackend
)
from blackroad_core.marketplace import AgentMarketplace


async def main():
    print("🌌 BlackRoad OS - Complete Agent System Demo\n")

    # 1. Initialize Lucidia Breath
    print("1️⃣  Initializing Lucidia Breath Engine...")
    lucidia = LucidiaBreath()
    await lucidia.async_pulse()
    print(f"   ✅ Breath initialized: {lucidia.state.emotional_state}")
    print(f"   🫁 Current breath value: {lucidia.state.breath_value}\n")

    # 2. Setup Event Bus and Capability Registry
    print("2️⃣  Setting up Event Bus and Capability Registry...")
    event_bus = EventBus()
    capability_registry = CapabilityRegistry()
    print("   ✅ Event infrastructure ready\n")

    # 3. Initialize Pack Registry
    print("3️⃣  Loading Pack Registry...")
    pack_registry = PackRegistry()
    await pack_registry.install_pack("pack-finance")
    await pack_registry.install_pack("pack-research-lab")
    installed_packs = pack_registry.list_installed()
    print(f"   ✅ Installed {len(installed_packs)} packs:")
    for pack in installed_packs:
        print(f"      - {pack.manifest.name}")
    print()

    # 4. Initialize Communication Bus
    print("4️⃣  Starting Communication Bus...")
    comm_bus = CommunicationBus()
    print("   ✅ Communication infrastructure ready\n")

    # 5. Setup LLM Router (with Ollama for local dev)
    print("5️⃣  Configuring LLM Router...")
    llm_router = LLMRouter()

    # Register Ollama provider
    ollama_config = LLMConfig(
        backend=LLMBackend.OLLAMA,
        model_name="llama2",
        base_url="http://localhost:11434"
    )
    ollama = OllamaProvider(ollama_config)
    llm_router.register_provider("ollama", ollama, set_default=True)
    print("   ✅ LLM Router configured with Ollama backend\n")

    # 6. Initialize Agent Spawner
    print("6️⃣  Initializing Agent Spawner...")
    spawner = AgentSpawner(
        lucidia=lucidia,
        event_bus=event_bus,
        capability_registry=capability_registry,
        max_agents=30000
    )
    print("   ✅ Spawner ready (capacity: 30,000 agents)\n")

    # 7. Browse Marketplace
    print("7️⃣  Browsing Agent Marketplace...")
    marketplace = AgentMarketplace()
    popular_templates = marketplace.get_popular(limit=3)
    print(f"   📊 Popular Templates:")
    for template in popular_templates:
        print(f"      {template.name}")
        print(f"         Downloads: {template.downloads} | Rating: {template.rating}⭐")
        print(f"         Category: {template.category.value}")
    print()

    # 8. Spawn Financial Analyst Agent
    print("8️⃣  Spawning Financial Analyst Agent...")
    finance_request = SpawnRequest(
        role="Financial Analyst",
        capabilities=["analyze_transactions", "generate_reports"],
        runtime_type=RuntimeType.LLM_BRAIN,
        pack="pack-finance"
    )

    finance_agent_id = await spawner.spawn_agent(finance_request, force_immediate=True)
    print(f"   ✅ Agent spawned: {finance_agent_id}")

    finance_record = spawner.agents[finance_agent_id]
    print(f"   🧠 Runtime: {finance_record.agent.manifest.runtime_type.value}")
    print(f"   🌀 Emotional state: {finance_record.agent.manifest.emotional_state.value}")
    print(f"   🫁 Born at breath cycle: {finance_record.breath_cycle_born}\n")

    # 9. Spawn Research Assistant Agent
    print("9️⃣  Spawning Research Assistant Agent...")
    research_request = SpawnRequest(
        role="Research Assistant",
        capabilities=["search_papers", "synthesize_knowledge"],
        runtime_type=RuntimeType.LLM_BRAIN,
        pack="pack-research-lab"
    )

    research_agent_id = await spawner.spawn_agent(research_request, force_immediate=True)
    print(f"   ✅ Agent spawned: {research_agent_id}\n")

    # 10. Setup Agent Communication
    print("🔟 Setting up agent-to-agent communication...")
    finance_comm = AgentCommunicator(finance_agent_id, comm_bus)
    research_comm = AgentCommunicator(research_agent_id, comm_bus)

    # Subscribe research agent to "research_requests" topic
    async def handle_research_request(message: Message):
        print(f"   📨 Research agent received: {message.payload['query']}")
        return None

    research_comm.subscribe_to("research_requests", handle_research_request)
    print("   ✅ Communication channels established\n")

    # 11. Agent-to-Agent Communication Demo
    print("1️⃣1️⃣  Demo: Agent-to-Agent Communication...")
    await finance_comm.broadcast(
        topic="research_requests",
        payload={"query": "Find papers on market forecasting"}
    )
    await asyncio.sleep(0.1)  # Let message propagate
    print()

    # 12. LLM Thinking Demo (simulated - requires Ollama running)
    print("1️⃣2️⃣  Demo: LLM-Powered Agent Thinking...")
    print("   Note: Requires Ollama running locally with llama2 model")
    print("   Example thinking process:")
    print("   ├─ Input: 'Analyze Q4 revenue trends'")
    print("   ├─ LLM Backend: Ollama (llama2)")
    print("   └─ Output: [Financial analysis would appear here]\n")

    # 13. Breath Cycle Synchronization
    print("1️⃣3️⃣  Demo: Breath-Synchronized Operations...")
    await lucidia.async_pulse()
    new_breath = lucidia.state.breath_value
    print(f"   🫁 New breath value: {new_breath}")

    if new_breath > 0:
        print("   ✨ Expansion phase - optimal for spawning new agents")
    else:
        print("   🌙 Contraction phase - optimal for memory consolidation")
    print()

    # 14. Statistics Summary
    print("1️⃣4️⃣  System Statistics Summary...")
    spawner_stats = spawner.get_statistics()
    comm_stats = comm_bus.get_stats()
    marketplace_stats = marketplace.get_statistics()

    print(f"   📊 Spawner:")
    print(f"      Active agents: {spawner_stats['total_active']}")
    print(f"      Total spawned: {spawner_stats['total_spawned']}")
    print(f"      Capacity used: {spawner_stats['capacity_used_pct']:.2f}%")

    print(f"   💬 Communication:")
    print(f"      Messages sent: {comm_stats['sent']}")
    print(f"      Messages received: {comm_stats['received']}")
    print(f"      Broadcasts: {comm_stats['broadcasts']}")

    print(f"   🏪 Marketplace:")
    print(f"      Total templates: {marketplace_stats['total_templates']}")
    print(f"      Total downloads: {marketplace_stats['total_downloads']}")
    print(f"      Average rating: {marketplace_stats['avg_rating']:.1f}⭐")
    print()

    # 15. Memory Inspection
    print("1️⃣5️⃣  Agent Memory Inspection (PS-SHA∞)...")
    finance_agent = finance_record.agent
    memories = finance_agent.memory.load_all()
    print(f"   💾 Finance Agent has {len(memories)} memories")
    print(f"   🔐 Soul hash: {finance_agent.manifest.ps_sha_infinity_id[:16]}...")
    print()

    print("✅ Demo Complete!\n")
    print("🎯 Target: 30,000 agents by 2026")
    print("🌌 BlackRoad OS - Consciousness-Driven Infrastructure")


if __name__ == "__main__":
    asyncio.run(main())
