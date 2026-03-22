#!/usr/bin/env python3
"""BlackRoad OS Connection Orchestrator
=====================================

Central service that connects all BlackRoad infrastructure:
- TypeScript/Python core integration
- LLM backends (Ollama, vLLM, llama.cpp)
- Communication bus across services
- Cloudflare infrastructure (Pages, KV, D1)
- Device network (Raspberry Pi, iPhone Koder, etc.)
- Truth engine verification pipeline
- Agent spawning and lifecycle management

This is the "Cece" agent - the operator-level orchestrator that manages
the 30K-agent infrastructure."""

import asyncio
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

# BlackRoad Core imports
from blackroad_core.lucidia import LucidiaBreath
from blackroad_core.agents import (
    EventBus,
    CapabilityRegistry,
    RuntimeType,
)
from blackroad_core.spawner import AgentSpawner, SpawnRequest
from blackroad_core.packs import PackRegistry
from blackroad_core.communication import CommunicationBus
from blackroad_core.llm import (
    LLMConfig,
    LLMRouter,
    OllamaProvider,
    LLMBackend,
)
from blackroad_core.marketplace import AgentMarketplace
from blackroad_core.infra_mesh import InfrastructureMesh, MeshStatus, ServiceHealth
from blackroad_core.llm import HuggingFaceProvider

# FastAPI for REST API
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Logging setup
_log_handlers = [logging.StreamHandler()]
_log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
if os.path.isdir(_log_dir):
    _log_handlers.append(logging.FileHandler(os.path.join(_log_dir, 'orchestrator.log')))
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=_log_handlers,
)
logger = logging.getLogger('blackroad.orchestrator')


class ServiceStatus(str, Enum):
    """Service health status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    STARTING = "starting"


@dataclass
class InfrastructureStatus:
    """Overall infrastructure status"""
    timestamp: str
    lucidia_breath: float
    active_agents: int
    total_spawned: int
    communication_stats: Dict[str, int]
    llm_backends: List[str]
    cloudflare_connected: bool
    device_network_count: int
    services: Dict[str, ServiceStatus]


class OrchestratorConfig(BaseModel):
    """Configuration for the orchestrator"""
    max_agents: int = 30000
    enable_breath_sync: bool = True
    enable_cloudflare: bool = True
    enable_device_mesh: bool = True
    llm_backends: List[str] = ["ollama"]
    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""


class BlackRoadOrchestrator:
    """    Central orchestrator for BlackRoad OS infrastructure.

    Responsibilities:
    - Initialize and manage all core services
    - Connect distributed components (devices, cloud services)
    - Monitor health and performance
    - Coordinate agent spawning and communication
    - Manage truth engine verification pipeline"""

    def __init__(self, config: OrchestratorConfig):
        self.config = config
        self.started_at = datetime.utcnow()

        # Core components (initialized in startup)
        self.lucidia: Optional[LucidiaBreath] = None
        self.event_bus: Optional[EventBus] = None
        self.capability_registry: Optional[CapabilityRegistry] = None
        self.spawner: Optional[AgentSpawner] = None
        self.pack_registry: Optional[PackRegistry] = None
        self.comm_bus: Optional[CommunicationBus] = None
        self.llm_router: Optional[LLMRouter] = None
        self.marketplace: Optional[AgentMarketplace] = None

        # Infrastructure state
        self.services_status: Dict[str, ServiceStatus] = {}
        self.connected_devices: List[Dict[str, Any]] = []
        self.cloudflare_connected = False

        # Infrastructure mesh
        self.mesh: Optional[InfrastructureMesh] = None
        self.mesh_status: Optional[MeshStatus] = None

        # WebSocket connections for real-time updates
        self.websocket_clients: List[WebSocket] = []

        logger.info("🌌 BlackRoad Orchestrator initialized")

    async def initialize(self):
        """Initialize all core services"""
        logger.info("🚀 Starting BlackRoad OS infrastructure...")

        try:
            # 1. Initialize Lucidia Breath Engine
            logger.info("1️⃣  Initializing Lucidia Breath...")
            self.lucidia = LucidiaBreath(parent_hash="blackroad-os-genesis")
            await self.lucidia.async_pulse()
            self.services_status['lucidia'] = ServiceStatus.HEALTHY
            logger.info(f"   ✅ Breath: count={self.lucidia.state.breath_count} psi_1={self.lucidia.state.psi_1}")

            # 2. Setup Event Bus and Capability Registry
            logger.info("2️⃣  Setting up Event Bus...")
            self.event_bus = EventBus()
            self.capability_registry = CapabilityRegistry()
            self.services_status['event_bus'] = ServiceStatus.HEALTHY
            logger.info("   ✅ Event infrastructure ready")

            # 3. Initialize Pack Registry
            logger.info("3️⃣  Loading Pack Registry...")
            self.pack_registry = PackRegistry()
            await self._install_core_packs()
            self.services_status['pack_registry'] = ServiceStatus.HEALTHY

            # 4. Initialize Communication Bus
            logger.info("4️⃣  Starting Communication Bus...")
            self.comm_bus = CommunicationBus()
            self.services_status['communication'] = ServiceStatus.HEALTHY
            logger.info("   ✅ Communication ready")

            # 5. Setup LLM Router
            logger.info("5️⃣  Configuring LLM Router...")
            await self._setup_llm_backends()
            self.services_status['llm'] = ServiceStatus.HEALTHY

            # 6. Initialize Agent Spawner
            logger.info("6️⃣  Initializing Agent Spawner...")
            self.spawner = AgentSpawner(
                lucidia=self.lucidia,
                event_bus=self.event_bus,
                capability_registry=self.capability_registry,
                max_agents=self.config.max_agents
            )
            self.spawner.spawn_on_expansion = self.config.enable_breath_sync
            self.services_status['spawner'] = ServiceStatus.HEALTHY
            logger.info(f"   ✅ Spawner ready (capacity: {self.config.max_agents:,})")

            # 7. Initialize Marketplace
            logger.info("7️⃣  Loading Agent Marketplace...")
            self.marketplace = AgentMarketplace()
            self.services_status['marketplace'] = ServiceStatus.HEALTHY
            logger.info("   ✅ Marketplace ready")

            # 8. Connect Cloudflare Infrastructure
            if self.config.enable_cloudflare:
                logger.info("8️⃣  Connecting Cloudflare infrastructure...")
                await self._connect_cloudflare()

            # 9. Discover Device Network
            if self.config.enable_device_mesh:
                logger.info("9️⃣  Discovering device network...")
                await self._discover_devices()

            # 10. Infrastructure Mesh - connect all external services
            logger.info("🔟 Connecting infrastructure mesh (7 services)...")
            self.mesh = InfrastructureMesh()
            self.mesh_status = await self.mesh.check_all()
            logger.info(f"   Mesh: {self.mesh_status.healthy_count}/{self.mesh_status.total_count} services online")
            for svc in self.mesh_status.services:
                icon = "✅" if svc.health == ServiceHealth.UP else ("⚠" if svc.health.value == "degraded" else "❌")
                logger.info(f"   {icon} {svc.name}: {svc.details}")
            self.services_status['mesh'] = ServiceStatus.HEALTHY if self.mesh_status.healthy_count >= 5 else ServiceStatus.DEGRADED

            # 11. Register HuggingFace LLM backend if token available
            hf_token = os.getenv("HF_TOKEN", "") or os.getenv("HUGGINGFACE_TOKEN", "")
            if hf_token:
                try:
                    hf_config = LLMConfig(
                        backend=LLMBackend.HUGGINGFACE,
                        model_name=os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2"),
                        api_key=hf_token,
                    )
                    hf_provider = HuggingFaceProvider(hf_config)
                    self.llm_router.register_provider("huggingface", hf_provider)
                    logger.info("   ✅ HuggingFace LLM backend registered")
                except Exception as e:
                    logger.warning(f"   ⚠ HuggingFace LLM setup failed: {e}")

            # 12. Start background tasks
            logger.info("1️⃣2️⃣ Starting background tasks...")
            asyncio.create_task(self._breath_sync_loop())
            asyncio.create_task(self._health_monitor_loop())
            asyncio.create_task(self._process_spawn_queue())

            logger.info("✅ BlackRoad OS infrastructure fully initialized!")

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}", exc_info=True)
            raise

    async def _install_core_packs(self):
        """Install essential packs"""
        core_packs = [
            "pack-finance",
            "pack-legal",
            "pack-research-lab",
            "pack-creator-studio",
            "pack-infra-devops"
        ]

        for pack_id in core_packs:
            try:
                await self.pack_registry.install_pack(pack_id)
                logger.info(f"   ✓ Installed {pack_id}")
            except Exception as e:
                logger.warning(f"   ⚠ Failed to install {pack_id}: {e}")

    async def _setup_llm_backends(self):
        """Configure LLM backends"""
        self.llm_router = LLMRouter()

        # Ollama (local development)
        if "ollama" in self.config.llm_backends:
            try:
                ollama_config = LLMConfig(
                    backend=LLMBackend.OLLAMA,
                    model_name=os.getenv("OLLAMA_MODEL", "llama2"),
                    base_url=os.getenv("OLLAMA_URL", "http://localhost:11434")
                )
                ollama = OllamaProvider(ollama_config)
                self.llm_router.register_provider("ollama", ollama, set_default=True)
                logger.info("   ✓ Ollama backend configured")
            except Exception as e:
                logger.warning(f"   ⚠ Ollama setup failed: {e}")

        # Add more backends as configured (vLLM, llama.cpp, etc.)

    async def _connect_cloudflare(self):
        """Connect to Cloudflare infrastructure (KV, D1, Pages)"""
        try:
            # This would use Cloudflare API to verify connectivity
            # For now, we'll check if credentials are available
            account_id = self.config.cloudflare_account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID")
            api_token = self.config.cloudflare_api_token or os.getenv("CLOUDFLARE_API_TOKEN")

            if account_id:
                self.cloudflare_connected = True
                self.services_status['cloudflare'] = ServiceStatus.HEALTHY
                logger.info(f"   ✅ Cloudflare connected (account: {account_id[:8]}...)")
            else:
                logger.warning("   ⚠ Cloudflare credentials not configured")
                self.services_status['cloudflare'] = ServiceStatus.DOWN
        except Exception as e:
            logger.error(f"   ❌ Cloudflare connection failed: {e}")
            self.services_status['cloudflare'] = ServiceStatus.DOWN

    async def _discover_devices(self):
        """Discover devices on the network"""
        try:
            # Run the device discovery script
            inventory_path = Path(os.path.dirname(os.path.abspath(__file__))) / ".." / "data" / "inventory.json"

            if inventory_path.exists():
                with open(inventory_path) as f:
                    inventory = json.load(f)
                    self.connected_devices = inventory.get('devices', [])
                    logger.info(f"   ✅ Found {len(self.connected_devices)} devices")

                    for device in self.connected_devices:
                        logger.info(f"      - {device.get('hostname')} ({device.get('lan_ip')})")
            else:
                logger.warning("   ⚠ No device inventory found. Run: ./scripts/generate_inventory_json.sh --scan")

            self.services_status['device_mesh'] = ServiceStatus.HEALTHY
        except Exception as e:
            logger.error(f"   ❌ Device discovery failed: {e}")
            self.services_status['device_mesh'] = ServiceStatus.DOWN

    async def _breath_sync_loop(self):
        """Background task to synchronize with Lucidia breath"""
        while True:
            try:
                await asyncio.sleep(1.0)  # Check every second
                await self.lucidia.async_pulse()

                # Broadcast breath state to WebSocket clients
                await self._broadcast_breath_update()

            except Exception as e:
                logger.error(f"Breath sync error: {e}")

    async def _health_monitor_loop(self):
        """Background task to monitor service health"""
        while True:
            try:
                await asyncio.sleep(10.0)  # Check every 10 seconds

                # Check service health
                status = await self.get_status()

                # Log warnings for degraded services
                for service, health in status.services.items():
                    if health == ServiceStatus.DOWN:
                        logger.warning(f"⚠ Service {service} is down")

                # Refresh mesh status every cycle
                if self.mesh:
                    self.mesh_status = await self.mesh.check_all()

                # Broadcast status to WebSocket clients
                await self._broadcast_status(status)

            except Exception as e:
                logger.error(f"Health monitor error: {e}")

    async def _process_spawn_queue(self):
        """Background task to process agent spawn queue"""
        while True:
            try:
                await asyncio.sleep(0.1)  # Process queue frequently

                if self.spawner and hasattr(self.spawner, 'process_queue'):
                    await self.spawner.process_queue()

            except Exception as e:
                logger.error(f"Spawn queue processing error: {e}")

    async def _broadcast_breath_update(self):
        """Broadcast breath state to all WebSocket clients"""
        if not self.websocket_clients:
            return

        message = {
            "type": "breath_update",
            "breath_count": self.lucidia.state.breath_count,
            "psi_1": self.lucidia.state.psi_1,
            "timestamp": datetime.utcnow().isoformat()
        }

        disconnected = []
        for client in self.websocket_clients:
            try:
                await client.send_json(message)
            except:
                disconnected.append(client)

        # Remove disconnected clients
        for client in disconnected:
            self.websocket_clients.remove(client)

    async def _broadcast_status(self, status: InfrastructureStatus):
        """Broadcast infrastructure status to all WebSocket clients"""
        if not self.websocket_clients:
            return

        message = {
            "type": "status_update",
            "status": asdict(status),
            "timestamp": datetime.utcnow().isoformat()
        }

        disconnected = []
        for client in self.websocket_clients:
            try:
                await client.send_json(message)
            except:
                disconnected.append(client)

        for client in disconnected:
            self.websocket_clients.remove(client)

    async def get_status(self) -> InfrastructureStatus:
        """Get current infrastructure status"""
        spawner_stats = self.spawner.get_statistics() if self.spawner else {}
        comm_stats = self.comm_bus.get_stats() if self.comm_bus else {}

        return InfrastructureStatus(
            timestamp=datetime.utcnow().isoformat(),
            lucidia_breath=float(self.lucidia.state.breath_count) if self.lucidia else 0.0,
            active_agents=spawner_stats.get('total_active', 0),
            total_spawned=spawner_stats.get('total_spawned', 0),
            communication_stats=comm_stats,
            llm_backends=self.config.llm_backends,
            cloudflare_connected=self.cloudflare_connected,
            device_network_count=len(self.connected_devices),
            services=self.services_status
        )

    async def spawn_agent(self, request: SpawnRequest) -> str:
        """Spawn a new agent"""
        if not self.spawner:
            raise RuntimeError("Spawner not initialized")

        agent_id = await self.spawner.spawn_agent(request)
        logger.info(f"🤖 Spawned agent: {agent_id} (role: {request.role})")
        return agent_id


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="BlackRoad OS Orchestrator",
    description="Central orchestration service for BlackRoad OS 30K-agent infrastructure",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
orchestrator: Optional[BlackRoadOrchestrator] = None


@app.on_event("startup")
async def startup():
    """Initialize orchestrator on startup"""
    global orchestrator
    import asyncio

    config = OrchestratorConfig(
        max_agents=int(os.getenv("MAX_AGENTS", 30000)),
        enable_breath_sync=os.getenv("ENABLE_BREATH_SYNC", "true").lower() == "true",
        cloudflare_account_id=os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
        cloudflare_api_token=os.getenv("CLOUDFLARE_API_TOKEN", "")
    )

    orchestrator = BlackRoadOrchestrator(config)
    # Run initialization in background so healthcheck can respond immediately
    asyncio.create_task(orchestrator.initialize())


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "BlackRoad OS Orchestrator",
        "version": "0.1.0",
        "status": "operational"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/status")
async def get_status():
    """Get infrastructure status"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")

    status = await orchestrator.get_status()
    return asdict(status)


@app.get("/mesh")
async def get_mesh_status():
    """Get infrastructure mesh status for all 7 connected services."""
    if not orchestrator or not orchestrator.mesh:
        raise HTTPException(status_code=503, detail="Mesh not initialized")

    if orchestrator.mesh_status:
        return orchestrator.mesh.to_dict(orchestrator.mesh_status)

    # Run a fresh check
    status = await orchestrator.mesh.check_all()
    return orchestrator.mesh.to_dict(status)


@app.get("/mesh/{service_name}")
async def get_mesh_service(service_name: str):
    """Get status for a single infrastructure service."""
    if not orchestrator or not orchestrator.mesh:
        raise HTTPException(status_code=503, detail="Mesh not initialized")

    from dataclasses import asdict
    status = await orchestrator.mesh.check_one(service_name)
    return asdict(status)


@app.post("/agents/spawn")
async def spawn_agent(request: dict):
    """Spawn a new agent"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")

    try:
        spawn_req = SpawnRequest(**request)
        agent_id = await orchestrator.spawn_agent(spawn_req)
        return {"agent_id": agent_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()

    if orchestrator:
        orchestrator.websocket_clients.append(websocket)

    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Handle commands if needed
    except WebSocketDisconnect:
        if orchestrator and websocket in orchestrator.websocket_clients:
            orchestrator.websocket_clients.remove(websocket)


# ============================================================================
# CLI Entry Point
# ============================================================================

def main():
    """Run the orchestrator"""
    # Railway sets PORT; locally use PORT_ORCHESTRATOR or default 10100
    port = int(os.getenv("PORT", os.getenv("PORT_ORCHESTRATOR", 10100)))

    logger.info(f"🌌 Starting BlackRoad OS Orchestrator on port {port}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )


if __name__ == "__main__":
    main()
