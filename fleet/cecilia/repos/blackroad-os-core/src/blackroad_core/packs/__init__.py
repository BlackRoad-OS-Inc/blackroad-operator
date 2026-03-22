"""BlackRoad Packs System

Packs are domain-specific bundles of:
- Pre-configured agent templates
- Capability sets
- Workflows
- Tools and integrations
- Documentation

Based on Cece Agent Mode v2.0 pack structure:
- pack-finance
- pack-legal
- pack-research-lab
- pack-creator-studio
- pack-infra-devops"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
from pathlib import Path
import json


class PackStatus(Enum):
    """Pack installation status."""
    AVAILABLE = "available"
    INSTALLING = "installing"
    INSTALLED = "installed"
    ERROR = "error"
    DEPRECATED = "deprecated"


@dataclass
class PackCapability:
    """A capability provided by a pack."""
    name: str
    description: str
    required_tools: List[str] = field(default_factory=list)
    required_integrations: List[str] = field(default_factory=list)


@dataclass
class AgentTemplate:
    """Template for spawning pack-specific agents."""
    name: str
    role: str
    capabilities: List[str]
    runtime_type: str
    default_resources: Dict[str, Any] = field(default_factory=dict)
    emotional_baseline: str = "curiosity"
    suggested_workflows: List[str] = field(default_factory=list)


@dataclass
class PackManifest:
    """Pack manifest defining what a pack provides."""
    id: str
    name: str
    version: str
    description: str
    author: str
    license: str = "MIT"

    # What this pack provides
    capabilities: List[PackCapability] = field(default_factory=list)
    agent_templates: List[AgentTemplate] = field(default_factory=list)
    workflows: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)

    # Dependencies
    required_packs: List[str] = field(default_factory=list)
    required_services: List[str] = field(default_factory=list)

    # Installation
    install_script: Optional[str] = None
    config_schema: Dict[str, Any] = field(default_factory=dict)

    # Metadata
    tags: List[str] = field(default_factory=list)
    homepage: Optional[str] = None
    repository: Optional[str] = None


class Pack:
    """A domain-specific pack with agents and capabilities."""
    def __init__(self, manifest: PackManifest):
        self.manifest = manifest
        self.status = PackStatus.AVAILABLE
        self.config: Dict[str, Any] = {}
        self.installed_at: Optional[str] = None

    def get_agent_template(self, template_name: str) -> Optional[AgentTemplate]:
        """Get an agent template by name."""
        for template in self.manifest.agent_templates:
            if template.name == template_name:
                return template
        return None

    def list_capabilities(self) -> List[str]:
        """List all capability names."""
        return [cap.name for cap in self.manifest.capabilities]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.manifest.id,
            "name": self.manifest.name,
            "version": self.manifest.version,
            "description": self.manifest.description,
            "status": self.status.value,
            "capabilities": [cap.name for cap in self.manifest.capabilities],
            "agent_templates": [t.name for t in self.manifest.agent_templates],
            "installed_at": self.installed_at
        }


class PackRegistry:
    """Central registry for all available and installed packs."""
    def __init__(self, packs_dir: Path = Path("data/packs")):
        self.packs_dir = packs_dir
        self.packs_dir.mkdir(parents=True, exist_ok=True)

        self.available_packs: Dict[str, Pack] = {}
        self.installed_packs: Dict[str, Pack] = {}

        # Load built-in packs
        self._register_builtin_packs()

    def _register_builtin_packs(self):
        """Register built-in BlackRoad OS packs."""
        # Pack: Finance
        finance_pack = Pack(PackManifest(
            id="pack-finance",
            name="BlackRoad Finance Pack",
            version="1.0.0",
            description="Financial analysis, accounting, and reporting",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="analyze_transactions",
                    description="Analyze financial transactions for patterns and anomalies",
                    required_tools=["pandas", "numpy"]
                ),
                PackCapability(
                    name="generate_reports",
                    description="Generate financial reports and visualizations",
                    required_tools=["matplotlib", "reportlab"]
                ),
                PackCapability(
                    name="forecast_revenue",
                    description="Revenue forecasting using time series analysis",
                    required_tools=["prophet", "sklearn"]
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="financial-analyst",
                    role="Financial Analyst",
                    capabilities=["analyze_transactions", "generate_reports"],
                    runtime_type="llm_brain"
                ),
                AgentTemplate(
                    name="revenue-forecaster",
                    role="Revenue Forecaster",
                    capabilities=["forecast_revenue"],
                    runtime_type="workflow_engine"
                )
            ],
            tags=["finance", "accounting", "analytics"]
        ))
        self.available_packs["pack-finance"] = finance_pack

        # Pack: Legal
        legal_pack = Pack(PackManifest(
            id="pack-legal",
            name="BlackRoad Legal Pack",
            version="1.0.0",
            description="Legal document review, compliance, and contract analysis",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="review_contracts",
                    description="Review legal contracts for risks and obligations"
                ),
                PackCapability(
                    name="check_compliance",
                    description="Check documents for regulatory compliance"
                ),
                PackCapability(
                    name="draft_documents",
                    description="Draft legal documents from templates"
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="contract-reviewer",
                    role="Contract Reviewer",
                    capabilities=["review_contracts"],
                    runtime_type="llm_brain",
                    emotional_baseline="doubt"  # Critical mindset
                ),
                AgentTemplate(
                    name="compliance-checker",
                    role="Compliance Officer",
                    capabilities=["check_compliance"],
                    runtime_type="workflow_engine"
                )
            ],
            tags=["legal", "compliance", "contracts"]
        ))
        self.available_packs["pack-legal"] = legal_pack

        # Pack: Research Lab
        research_pack = Pack(PackManifest(
            id="pack-research-lab",
            name="BlackRoad Research Lab Pack",
            version="1.0.0",
            description="Research, literature review, and knowledge synthesis",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="search_papers",
                    description="Search academic papers and literature",
                    required_integrations=["arxiv", "pubmed", "semantic_scholar"]
                ),
                PackCapability(
                    name="synthesize_knowledge",
                    description="Synthesize insights from multiple sources"
                ),
                PackCapability(
                    name="design_experiments",
                    description="Design and plan research experiments"
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="research-assistant",
                    role="Research Assistant",
                    capabilities=["search_papers", "synthesize_knowledge"],
                    runtime_type="llm_brain",
                    emotional_baseline="curiosity"
                ),
                AgentTemplate(
                    name="experiment-designer",
                    role="Experiment Designer",
                    capabilities=["design_experiments"],
                    runtime_type="workflow_engine"
                )
            ],
            tags=["research", "academic", "knowledge"]
        ))
        self.available_packs["pack-research-lab"] = research_pack

        # Pack: Creator Studio
        creator_pack = Pack(PackManifest(
            id="pack-creator-studio",
            name="BlackRoad Creator Studio Pack",
            version="1.0.0",
            description="Content creation, design, and media production",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="generate_content",
                    description="Generate written content, scripts, and copy"
                ),
                PackCapability(
                    name="design_graphics",
                    description="Create graphics and visual assets",
                    required_tools=["pillow", "matplotlib"]
                ),
                PackCapability(
                    name="edit_video",
                    description="Edit and produce video content",
                    required_tools=["ffmpeg"]
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="content-writer",
                    role="Content Writer",
                    capabilities=["generate_content"],
                    runtime_type="llm_brain",
                    emotional_baseline="wonder"
                ),
                AgentTemplate(
                    name="graphic-designer",
                    role="Graphic Designer",
                    capabilities=["design_graphics"],
                    runtime_type="integration_bridge"
                )
            ],
            tags=["content", "creative", "media"]
        ))
        self.available_packs["pack-creator-studio"] = creator_pack

        # Pack: Infra DevOps
        devops_pack = Pack(PackManifest(
            id="pack-infra-devops",
            name="BlackRoad DevOps Pack",
            version="1.0.0",
            description="Infrastructure management, deployment, and monitoring",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="deploy_services",
                    description="Deploy and manage services across cloud platforms",
                    required_integrations=["railway", "cloudflare", "k8s"]
                ),
                PackCapability(
                    name="monitor_systems",
                    description="Monitor system health and performance"
                ),
                PackCapability(
                    name="manage_infrastructure",
                    description="Manage infrastructure as code"
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="deployment-engineer",
                    role="Deployment Engineer",
                    capabilities=["deploy_services"],
                    runtime_type="workflow_engine"
                ),
                AgentTemplate(
                    name="sre-monitor",
                    role="SRE Monitor",
                    capabilities=["monitor_systems"],
                    runtime_type="edge_worker"
                )
            ],
            tags=["devops", "infrastructure", "deployment"]
        ))
        self.available_packs["pack-infra-devops"] = devops_pack

        # Pack: Job Hunter
        job_hunter_pack = Pack(PackManifest(
            id="pack-job-hunter",
            name="BlackRoad Job Hunter Pack",
            version="1.0.0",
            description="Automated job application system with AI-powered customization",
            author="BlackRoad OS",
            capabilities=[
                PackCapability(
                    name="search_jobs",
                    description="Search jobs across multiple platforms (LinkedIn, Indeed, ZipRecruiter, Glassdoor)",
                    required_integrations=["linkedin", "indeed", "ziprecruiter", "glassdoor"]
                ),
                PackCapability(
                    name="customize_applications",
                    description="AI-powered customization of cover letters and application answers",
                    required_tools=["llm_provider"]
                ),
                PackCapability(
                    name="fill_forms",
                    description="Automated form filling and submission",
                    required_tools=["playwright", "selenium"]
                ),
                PackCapability(
                    name="track_applications",
                    description="Track application status and schedule follow-ups"
                )
            ],
            agent_templates=[
                AgentTemplate(
                    name="job-scraper",
                    role="Job Scraper",
                    capabilities=["search_jobs"],
                    runtime_type="integration_bridge",
                    emotional_baseline="curiosity"
                ),
                AgentTemplate(
                    name="application-writer",
                    role="Application Writer",
                    capabilities=["customize_applications"],
                    runtime_type="llm_brain",
                    emotional_baseline="wonder"
                ),
                AgentTemplate(
                    name="form-filler",
                    role="Form Filler",
                    capabilities=["fill_forms"],
                    runtime_type="workflow_engine"
                ),
                AgentTemplate(
                    name="job-hunter-orchestrator",
                    role="Job Hunter Orchestrator",
                    capabilities=["search_jobs", "customize_applications", "fill_forms", "track_applications"],
                    runtime_type="llm_brain",
                    emotional_baseline="determination"
                )
            ],
            tags=["jobs", "automation", "career", "applications"],
            homepage="https://blackroad.io/packs/job-hunter"
        ))
        self.available_packs["pack-job-hunter"] = job_hunter_pack

    async def install_pack(self, pack_id: str, config: Optional[Dict[str, Any]] = None) -> Pack:
        """Install a pack."""
        if pack_id not in self.available_packs:
            raise ValueError(f"Pack not found: {pack_id}")

        pack = self.available_packs[pack_id]

        # Check dependencies
        for required_pack in pack.manifest.required_packs:
            if required_pack not in self.installed_packs:
                raise ValueError(f"Required pack not installed: {required_pack}")

        # Update status
        pack.status = PackStatus.INSTALLING

        # Apply config
        if config:
            pack.config = config

        # Mark as installed
        pack.status = PackStatus.INSTALLED
        from datetime import datetime, UTC
        pack.installed_at = datetime.now(UTC).isoformat()

        self.installed_packs[pack_id] = pack

        return pack

    def uninstall_pack(self, pack_id: str):
        """Uninstall a pack."""
        if pack_id not in self.installed_packs:
            raise ValueError(f"Pack not installed: {pack_id}")

        pack = self.installed_packs[pack_id]
        pack.status = PackStatus.AVAILABLE
        pack.installed_at = None

        del self.installed_packs[pack_id]

    def list_available(self) -> List[Pack]:
        """List all available packs."""
        return list(self.available_packs.values())

    def list_installed(self) -> List[Pack]:
        """List all installed packs."""
        return list(self.installed_packs.values())

    def get_pack(self, pack_id: str) -> Optional[Pack]:
        """Get a pack by ID (installed or available)."""
        return self.installed_packs.get(pack_id) or self.available_packs.get(pack_id)


__all__ = [
    "Pack",
    "PackManifest",
    "PackCapability",
    "AgentTemplate",
    "PackRegistry",
    "PackStatus"
]
