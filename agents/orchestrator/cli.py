"""
BlackRoad Agent Orchestrator — CLI Entry Points
Run the controller or supervisor from command line.
"""
import argparse
import asyncio
import logging
import sys
import signal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)


def run_controller():
    """Start the central controller (FastAPI + NATS)."""
    import uvicorn
    from .config import CONTROLLER_HOST, CONTROLLER_PORT

    print(f"""
╔══════════════════════════════════════════════════════════╗
║  BLACKROAD AGENT ORCHESTRATOR — CONTROLLER              ║
║  30,000 agents · 3 nodes · NATS JetStream               ║
╚══════════════════════════════════════════════════════════╝
  Host: {CONTROLLER_HOST}:{CONTROLLER_PORT}
  NATS: nats://192.168.4.101:4222
  API:  http://localhost:{CONTROLLER_PORT}/api/health
""")

    uvicorn.run(
        "orchestrator.controller:app",
        host=CONTROLLER_HOST,
        port=CONTROLLER_PORT,
        log_level="info",
        reload=False,
    )


def run_supervisor():
    """Start a node supervisor."""
    parser = argparse.ArgumentParser(description="BlackRoad Node Supervisor")
    parser.add_argument("node", choices=["cecilia", "aria", "lucidia"], help="Node name")
    args = parser.parse_args(sys.argv[2:] if len(sys.argv) > 2 else sys.argv[1:])

    from .supervisor import NodeSupervisor
    from .config import NODES

    node_config = NODES[args.node]
    print(f"""
╔══════════════════════════════════════════════════════════╗
║  BLACKROAD NODE SUPERVISOR — {args.node.upper():^10}                 ║
╚══════════════════════════════════════════════════════════╝
  Host: {node_config.host}
  Max concurrent agents: {node_config.max_concurrent_agents}
  Max concurrent inference: {node_config.max_concurrent_inference}
  Models: {', '.join(node_config.models)}
""")

    supervisor = NodeSupervisor(args.node)

    async def _run():
        await supervisor.start()
        stop_event = asyncio.Event()

        def _signal_handler():
            stop_event.set()

        loop = asyncio.get_event_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, _signal_handler)

        await stop_event.wait()
        await supervisor.stop()

    asyncio.run(_run())


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python -m orchestrator <command>")
        print("Commands:")
        print("  controller   Start the central controller")
        print("  supervisor   Start a node supervisor (requires node name)")
        print("  status       Show cluster status")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "controller":
        run_controller()
    elif cmd == "supervisor":
        run_supervisor()
    elif cmd == "status":
        show_status()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


def show_status():
    """Quick cluster status check."""
    from .spawn import SpawnScheduler

    scheduler = SpawnScheduler()
    stats = scheduler.pool_stats()
    avail = scheduler.available_by_archetype()

    print(f"""
╔══════════════════════════════════════════════════════════╗
║  BLACKROAD AGENT CLUSTER STATUS                          ║
╚══════════════════════════════════════════════════════════╝
  Total agents:  {stats['total_agents']:,}
  Active:        {stats['total_active']:,}
  Idle:          {stats['total_agents'] - stats['total_active']:,}

  Available by archetype:""")
    for arch, count in sorted(avail.items(), key=lambda x: -x[1]):
        print(f"    {arch:15s} {count:>6,}")

    print(f"""
  Pools ({len(stats['pools'])}):""")
    for p in stats["pools"]:
        bar = "█" * min(30, p["active"]) + "░" * min(30, max(0, 30 - p["active"]))
        print(f"    {p['archetype']:12s} {p['node']:10s} {p['active']:>5}/{p['total']:<5} {bar}")


if __name__ == "__main__":
    main()
