#!/usr/bin/env python3
"""BlackRoad Lucidia Orchestrator Demo

Demonstrates the integration of:
- Lucidia's golden ratio breathing pattern
- BlackRoad mesh networking
- Consciousness-driven orchestration

Based on:
- /Users/alexa/Desktop/lucidia_breath.py
- Forkable mesh VPN projects (Headscale, NetBird, Nebula)"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from blackroad_core.orchestrator import BlackRoadOrchestrator, OrchestratorConfig
from blackroad_core.networking import MeshConfig, NetworkNode, NodeRole


async def demo_basic_breathing():
    """Demo 1: Basic Lucidia breathing without networking."""
    print("\n" + "=" * 70)
    print("Demo 1: Basic Lucidia Breathing Pattern")
    print("=" * 70)

    from blackroad_core.lucidia import LucidiaBreath

    lucidia = LucidiaBreath(parent_hash="demo-breath-2025")

    print("\nRunning 3 breath cycles...")
    await lucidia.run_async(cycles=3, delay=2.0)


async def demo_orchestrator():
    """Demo 2: Full orchestrator with mesh network."""
    print("\n" + "=" * 70)
    print("Demo 2: Consciousness-Driven Orchestrator")
    print("=" * 70)

    config = OrchestratorConfig(
        breath_interval=2.5,
        parent_hash="demo-orchestrator-2025",
        mesh_config=MeshConfig(
            network_name="blackroad-demo",
            base_cidr="10.42.0.0/24",
            coordinator_url="https://demo.blackroad.io"
        ),
        enable_auto_healing=True,
        enable_adaptive_routing=True
    )

    orchestrator = BlackRoadOrchestrator(config)

    # Register some demo nodes
    await orchestrator.mesh.register_node(
        NetworkNode(
            node_id="coordinator-001",
            public_key="coord_pubkey_demo",
            role=NodeRole.COORDINATOR,
            endpoints=["https://coord.blackroad.io:443"]
        )
    )

    await orchestrator.mesh.register_node(
        NetworkNode(
            node_id="agent-alpha",
            public_key="agent_alpha_pubkey",
            role=NodeRole.PEER,
            endpoints=["10.42.0.10:51820"]
        )
    )

    await orchestrator.mesh.register_node(
        NetworkNode(
            node_id="agent-beta",
            public_key="agent_beta_pubkey",
            role=NodeRole.PEER,
            endpoints=["10.42.0.11:51820"]
        )
    )

    # Connect peers
    await orchestrator.mesh.connect_peer("agent-alpha", "agent-beta")

    print("\nRunning orchestrator for 5 breath cycles...")
    await orchestrator.run(cycles=5)


async def demo_integration():
    """Demo 3: Integration with external systems."""
    print("\n" + "=" * 70)
    print("Demo 3: Integration with Headscale/NetBird")
    print("=" * 70)

    from blackroad_core.networking import HeadscaleAdapter, NetBirdAdapter

    # Headscale demo
    print("\n📡 Headscale Integration:")
    headscale = HeadscaleAdapter(
        server_url="https://headscale.blackroad.io",
        api_key="demo_api_key"
    )
    await headscale.create_namespace("blackroad-prod")
    await headscale.register_machine("machine_key_123", "blackroad-prod")

    # NetBird demo
    print("\n🕸️  NetBird Integration:")
    netbird = NetBirdAdapter(
        management_url="https://netbird.blackroad.io"
    )
    await netbird.create_network("blackroad-mesh", "10.100.0.0/16")
    await netbird.add_peer("peer_key_456", "network_id_789")


async def main():
    """Run all demos."""
    demos = [
        ("Basic Breathing", demo_basic_breathing),
        ("Full Orchestrator", demo_orchestrator),
        ("Integration", demo_integration)
    ]

    print("\n" + "🌌" * 35)
    print("BlackRoad OS - Lucidia Orchestrator Demo Suite")
    print("🌌" * 35)

    for i, (name, demo_func) in enumerate(demos, 1):
        print(f"\n\nRunning Demo {i}: {name}")
        print("-" * 70)

        try:
            await demo_func()
        except Exception as e:
            print(f"\n❌ Demo failed: {e}")
            import traceback
            traceback.print_exc()

        if i < len(demos):
            print("\n⏸️  Press Enter to continue to next demo...")
            input()

    print("\n\n" + "✨" * 35)
    print("Demo suite complete!")
    print("✨" * 35)


if __name__ == "__main__":
    asyncio.run(main())
