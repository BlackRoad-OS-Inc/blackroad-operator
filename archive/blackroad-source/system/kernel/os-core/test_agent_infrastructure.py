"""Test Suite for BlackRoad OS Agent Infrastructure

Comprehensive tests for:
- Agent spawner lifecycle
- Pack system
- Communication bus
- LLM integration
- Marketplace"""

import pytest
import pytest_asyncio
import asyncio
from pathlib import Path
import tempfile

from blackroad_core.lucidia import LucidiaBreath
from blackroad_core.agents import (
    AgentManifest,
    BlackRoadAgent,
    RuntimeType,
    EmotionalState,
    EventBus,
    CapabilityRegistry
)
from blackroad_core.spawner import AgentSpawner, SpawnRequest, AgentStatus
from blackroad_core.packs import PackRegistry, Pack, PackManifest, PackCapability, AgentTemplate
from blackroad_core.communication import (
    CommunicationBus,
    AgentCommunicator,
    Message,
    MessageType,
    MessagePriority
)
from blackroad_core.llm import (
    LLMConfig,
    LLMMessage,
    LLMRouter,
    LLMBackend
)
from blackroad_core.marketplace import (
    AgentMarketplace,
    AgentTemplateMetadata,
    TemplateCategory,
    TemplateStatus
)


class TestAgentSpawner:
    """Test agent spawner lifecycle management."""

    @pytest_asyncio.fixture
    async def spawner(self):
        """Create spawner with dependencies."""
        lucidia = LucidiaBreath(parent_hash="test-parent-hash")
        event_bus = EventBus()
        capability_registry = CapabilityRegistry()

        spawner = AgentSpawner(
            lucidia=lucidia,
            event_bus=event_bus,
            capability_registry=capability_registry,
            max_agents=100
        )

        yield spawner

        # Cleanup
        for agent_id in list(spawner.agents.keys()):
            await spawner.terminate_agent(agent_id)

    @pytest.mark.asyncio
    async def test_spawn_agent(self, spawner):
        """Test spawning a new agent."""
        request = SpawnRequest(
            role="Test Agent",
            capabilities=["test_capability"],
            runtime_type=RuntimeType.LLM_BRAIN
        )

        agent_id = await spawner.spawn_agent(request, force_immediate=True)

        assert agent_id is not None
        assert agent_id in spawner.agents
        assert spawner.agents[agent_id].status == AgentStatus.RUNNING

    @pytest.mark.asyncio
    async def test_spawn_with_pack(self, spawner):
        """Test spawning agent with pack membership."""
        request = SpawnRequest(
            role="Finance Agent",
            capabilities=["analyze_transactions"],
            runtime_type=RuntimeType.LLM_BRAIN,
            pack="pack-finance"
        )

        agent_id = await spawner.spawn_agent(request, force_immediate=True)
        agent = spawner.agents[agent_id].agent

        assert "pack-finance" in agent.manifest.pack_membership

    @pytest.mark.asyncio
    async def test_spawn_with_parent(self, spawner):
        """Test spawning child agent."""
        # Spawn parent
        parent_request = SpawnRequest(
            role="Parent Agent",
            capabilities=["parent_cap"],
            runtime_type=RuntimeType.WORKFLOW_ENGINE
        )
        parent_id = await spawner.spawn_agent(parent_request, force_immediate=True)

        # Spawn child
        child_request = SpawnRequest(
            role="Child Agent",
            capabilities=["child_cap"],
            runtime_type=RuntimeType.LLM_BRAIN,
            parent_id=parent_id
        )
        child_id = await spawner.spawn_agent(child_request, force_immediate=True)

        # Verify lineage
        parent_record = spawner.agents[parent_id]
        child_record = spawner.agents[child_id]

        assert child_id in parent_record.children
        assert child_record.parent_id == parent_id

    @pytest.mark.asyncio
    async def test_pause_resume_agent(self, spawner):
        """Test pausing and resuming an agent."""
        request = SpawnRequest(
            role="Test Agent",
            capabilities=["test"],
            runtime_type=RuntimeType.LLM_BRAIN
        )
        agent_id = await spawner.spawn_agent(request, force_immediate=True)

        # Pause
        await spawner.pause_agent(agent_id)
        assert spawner.agents[agent_id].status == AgentStatus.PAUSED

        # Resume
        await spawner.start_agent(agent_id)
        assert spawner.agents[agent_id].status == AgentStatus.RUNNING

    @pytest.mark.asyncio
    async def test_terminate_agent(self, spawner):
        """Test agent termination."""
        request = SpawnRequest(
            role="Test Agent",
            capabilities=["test"],
            runtime_type=RuntimeType.LLM_BRAIN
        )
        agent_id = await spawner.spawn_agent(request, force_immediate=True)

        await spawner.terminate_agent(agent_id, reason="test_complete")

        assert agent_id not in spawner.agents
        assert spawner.total_terminated == 1

    @pytest.mark.asyncio
    async def test_capacity_limit(self, spawner):
        """Test max agent capacity enforcement."""
        spawner.max_agents = 3

        # Spawn 3 agents
        for i in range(3):
            request = SpawnRequest(
                role=f"Agent {i}",
                capabilities=["test"],
                runtime_type=RuntimeType.LLM_BRAIN
            )
            await spawner.spawn_agent(request, force_immediate=True)

        # Try to spawn 4th
        request = SpawnRequest(
            role="Agent 4",
            capabilities=["test"],
            runtime_type=RuntimeType.LLM_BRAIN
        )

        with pytest.raises(RuntimeError, match="Max agents reached"):
            await spawner.spawn_agent(request, force_immediate=True)


class TestPackSystem:
    """Test pack registry and templates."""

    @pytest.fixture
    def registry(self):
        """Create pack registry."""
        with tempfile.TemporaryDirectory() as tmpdir:
            registry = PackRegistry(Path(tmpdir) / "packs")
            yield registry

    @pytest.mark.asyncio
    async def test_install_pack(self, registry):
        """Test pack installation."""
        pack = await registry.install_pack("pack-finance")

        assert pack.manifest.id == "pack-finance"
        assert "pack-finance" in registry.installed_packs

    @pytest.mark.asyncio
    async def test_uninstall_pack(self, registry):
        """Test pack uninstallation."""
        await registry.install_pack("pack-finance")
        registry.uninstall_pack("pack-finance")

        assert "pack-finance" not in registry.installed_packs

    def test_get_agent_template(self, registry):
        """Test retrieving agent template from pack."""
        pack = registry.get_pack("pack-finance")
        template = pack.get_agent_template("financial-analyst")

        assert template is not None
        assert template.name == "financial-analyst"
        assert template.runtime_type == "llm_brain"

    def test_list_capabilities(self, registry):
        """Test listing pack capabilities."""
        pack = registry.get_pack("pack-finance")
        capabilities = pack.list_capabilities()

        assert "analyze_transactions" in capabilities
        assert "generate_reports" in capabilities


class TestCommunicationBus:
    """Test agent-to-agent communication."""

    @pytest.fixture
    def comm_bus(self):
        """Create communication bus."""
        with tempfile.TemporaryDirectory() as tmpdir:
            bus = CommunicationBus(Path(tmpdir) / "messages")
            yield bus

    @pytest.mark.asyncio
    async def test_broadcast_message(self, comm_bus):
        """Test broadcasting to topic."""
        received_messages = []

        async def handler(message: Message):
            received_messages.append(message)
            return None

        comm_bus.subscribe("test_topic", handler)

        await comm_bus.broadcast(
            sender_id="agent-1",
            topic="test_topic",
            payload={"data": "test""""
        )

        await asyncio.sleep(0.1)
        assert len(received_messages) == 1
        assert received_messages[0].payload["data"] == "test"

    @pytest.mark.asyncio
    async def test_request_response(self, comm_bus):
        """Test request/response pattern."""
        async def responder(message: Message):
            if message.type == MessageType.REQUEST:
                await comm_bus.reply(
                    message,
                    sender_id="agent-2",
                    payload={"result": "success""""
                )
            return None

        comm_bus.subscribe("requests", responder)

        response = await comm_bus.send(
            sender_id="agent-1",
            topic="requests",
            payload={"query": "test"},
            wait_for_response=True,
            timeout=5.0
        )

        assert response is not None
        assert response.payload["result"] == "success"

    @pytest.mark.asyncio
    async def test_direct_message(self, comm_bus):
        """Test direct agent-to-agent messaging."""
        received = []

        async def handler(message: Message):
            received.append(message)
            return None

        comm_bus.register_agent("agent-2", handler)

        await comm_bus.send(
            sender_id="agent-1",
            recipient_id="agent-2",
            topic="direct",
            payload={"msg": "hello""""
        )

        await asyncio.sleep(0.1)
        assert len(received) == 1
        assert received[0].payload["msg"] == "hello"


class TestLLMIntegration:
    """Test LLM router and providers."""

    def test_llm_config_creation(self):
        """Test creating LLM configuration."""
        config = LLMConfig(
            backend=LLMBackend.OLLAMA,
            model_name="llama2",
            temperature=0.7,
            max_tokens=2048
        )

        assert config.backend == LLMBackend.OLLAMA
        assert config.model_name == "llama2"
        assert config.temperature == 0.7

    def test_llm_message_creation(self):
        """Test creating LLM messages."""
        message = LLMMessage(
            role="user",
            content="Test prompt"
        )

        assert message.role == "user"
        assert message.content == "Test prompt"

    def test_llm_router_registration(self):
        """Test registering LLM providers."""
        router = LLMRouter()

        config = LLMConfig(
            backend=LLMBackend.OLLAMA,
            model_name="llama2"
        )

        from blackroad_core.llm import OllamaProvider
        provider = OllamaProvider(config)

        router.register_provider("ollama", provider, set_default=True)

        assert router.default_provider == "ollama"
        assert "ollama" in router.providers


class TestMarketplace:
    """Test agent marketplace."""

    @pytest.fixture
    def marketplace(self):
        """Create marketplace."""
        with tempfile.TemporaryDirectory() as tmpdir:
            market = AgentMarketplace(Path(tmpdir) / "marketplace")
            yield market

    @pytest.mark.asyncio
    async def test_publish_template(self, marketplace):
        """Test publishing agent template."""
        template = AgentTemplateMetadata(
            id="",  # Will be auto-generated
            name="Custom Agent",
            description="A custom agent template",
            version="1.0.0",
            author="Test Author",
            category=TemplateCategory.GENERAL,
            role="Custom Role",
            capabilities=["custom_capability"],
            runtime_type="llm_brain"
        )

        template_id = await marketplace.publish_template(template)

        assert template_id is not None
        assert template_id in marketplace.templates
        assert marketplace.templates[template_id].status == TemplateStatus.PUBLISHED

    def test_search_templates(self, marketplace):
        """Test searching for templates."""
        results = marketplace.search(
            query="financial",
            min_rating=4.0
        )

        assert len(results) > 0
        assert any("financial" in t.name.lower() for t in results)

    def test_search_by_category(self, marketplace):
        """Test filtering by category."""
        results = marketplace.search(category=TemplateCategory.FINANCE)

        assert all(t.category == TemplateCategory.FINANCE for t in results)

    def test_get_popular_templates(self, marketplace):
        """Test getting popular templates."""
        popular = marketplace.get_popular(limit=3)

        assert len(popular) <= 3
        # Should be sorted by downloads descending
        if len(popular) > 1:
            assert popular[0].downloads >= popular[1].downloads

    def test_get_top_rated_templates(self, marketplace):
        """Test getting top rated templates."""
        top_rated = marketplace.get_top_rated(limit=3)

        assert len(top_rated) <= 3
        # Should be sorted by rating descending
        if len(top_rated) > 1:
            assert top_rated[0].rating >= top_rated[1].rating


class TestIntegration:
    """Integration tests for complete system."""

    @pytest.mark.asyncio
    async def test_full_agent_lifecycle(self):
        """Test complete agent lifecycle with all components."""
        # Setup infrastructure
        lucidia = LucidiaBreath(parent_hash="integration-test-hash")
        event_bus = EventBus()
        capability_registry = CapabilityRegistry()

        with tempfile.TemporaryDirectory() as tmpdir:
            comm_bus = CommunicationBus(Path(tmpdir) / "messages")
            pack_registry = PackRegistry(Path(tmpdir) / "packs")

            # Install pack
            await pack_registry.install_pack("pack-finance")

            # Create spawner
            spawner = AgentSpawner(lucidia, event_bus, capability_registry)

            # Spawn agent from pack template
            request = SpawnRequest(
                role="Financial Analyst",
                capabilities=["analyze_transactions"],
                runtime_type=RuntimeType.LLM_BRAIN,
                pack="pack-finance"
            )

            agent_id = await spawner.spawn_agent(request, force_immediate=True)

            # Setup communication
            comm = AgentCommunicator(agent_id, comm_bus)

            # Send message
            received = []

            async def handler(msg):
                received.append(msg)
                return None

            comm.subscribe_to("test_topic", handler)

            await comm.broadcast(
                topic="test_topic",
                payload={"data": "test""""
            )

            await asyncio.sleep(0.1)

            # Verify
            assert len(received) == 1
            assert spawner.agents[agent_id].status == AgentStatus.RUNNING

            # Cleanup
            await spawner.terminate_agent(agent_id)
            assert agent_id not in spawner.agents


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
