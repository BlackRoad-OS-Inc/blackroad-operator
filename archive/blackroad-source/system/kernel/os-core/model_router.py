"""Capability-based model router for BlackRoad agents.

Routes agent capabilities to appropriate models, with support for:
- Internal models (blackroad-coder-7b, etc.)
- External models (OpenAI, Anthropic)
- Fallback chains
- Load balancing
- Access control
"""
from typing import List, Optional, Dict
import httpx
import os


# Agent canonical identities (PS-SHA∞)
CANONICAL_AGENTS = {
    'cece': {
        'id': 'agent:cece:governor:v1:blackroad',
        'sha256': 'c1cba42fd51be0b76c1f47ef2eda55fbcc1646b7b0a372b28f4a487ece7b47d2',
        'role': 'governor'
    },
    'lucidia': {
        'id': 'agent:lucidia:system:v1:blackroad',
        'sha256': '2a402097b594033b74fcc1c7666d4c35f42e578537fea8994bd3835458dd1b4f',
        'role': 'system'
    },
    'alice': {
        'id': 'agent:alice:governor:v1:blackroad',
        'sha256': '496762c13853508f5a52806717465ac0221391c55bc0cc556cebb1ece6b2a05c',
        'role': 'governor'
    },
    'alexa': {
        'id': 'agent:alexa:operator:v1:blackroad',
        'sha256': 'dbd2d954834ab0175db11ccf58ec5b778db0e1cb17297e1bd8ba13f1d9a88e59',
        'role': 'operator'
    },
    'deploy-bot': {
        'id': 'agent:deploy-bot:deploy:v1:blackroad',
        'sha256': 'ef819802b98f1ce2445081c3af2e7f4b75f3129b7082731d44cf07b56890df7a',
        'role': 'deploy'
    },
    'policy-bot': {
        'id': 'agent:policy-bot:policy:v1:blackroad',
        'sha256': 'e6d2e64dbc0ee329fb180eac0d08729876f70d40965bf41cd5bb608ddc0f5e3f',
        'role': 'policy'
    },
    'sync-agent': {
        'id': 'agent:sync-agent:sync:v1:blackroad',
        'sha256': '50eafa45a01e82038426a5be351aed81751e08be8ce3572772bddf7efc3ed64e',
        'role': 'sync'
    },
    'health-monitor': {
        'id': 'agent:health-monitor:monitor:v1:blackroad',
        'sha256': 'a7282b6ea58e99610da1349d316cffb67f1acaf8f3939c9fdfdd19c10d250d78',
        'role': 'monitor'
    },
    'archive-bot': {
        'id': 'agent:archive-bot:archive:v1:blackroad',
        'sha256': '742ba70013fa862a47365c60baaab157f044bcdd8c4ee3538398bb4c1bb7c2a3',
        'role': 'archive'
    },
    'echo': {
        'id': 'agent:echo:echo:v1:blackroad',
        'sha256': '08a64862807852be0dccefeb201109a073f837f2807ac7a7bd640fd0bdd25377',
        'role': 'echo'
    },
    'summarizer': {
        'id': 'agent:summarizer:summarizer:v1:blackroad',
        'sha256': '06bf5b984940cd950d4034eca50861fab13333949de9d6821e0029aeff22aa9e',
        'role': 'summarizer'
    },
    'sweep-bot': {
        'id': 'agent:sweep-bot:sweep:v1:blackroad',
        'sha256': '74d0d19a771162b1c92f4fdab887c3c158aa9d38f14931bb6f1ed1a14b966c5e',
        'role': 'sweep'
    },
    'cadillac': {
        'id': 'agent:cadillac:creative:v1:blackroad',
        'sha256': 'f194f7c91f5a67338c9f4a44c8943b1a4bcb2a653480bc4cb8315e26265bb183',
        'role': 'creative'
    },
    'sidian': {
        'id': 'agent:sidian:observer:v1:blackroad',
        'sha256': '94414d33f4403ee96c1f3b3357ab7106479bddfc27071e0079cdb13437c585c4',
        'role': 'observer'
    }
}


class ModelRouter:
    """Routes agent capabilities to appropriate models."""
    def __init__(self, registry_url: str = None):
        self.registry_url = registry_url or os.getenv(
            'MODEL_REGISTRY_URL',
            'https://registry.blackroad.io'
        )

        # Capability → Model mapping
        self.capability_map = self._load_capability_map()

    def _load_capability_map(self) -> Dict[str, List[Dict]]:
        """Load capability to model mapping.

        In production, this would fetch from model registry.
        For now, hardcoded with BlackRoad models.
        """
        return {
            # Code generation
            'code-generation': [
                {
                    'model': 'internal/blackroad-coder-7b-v1',
                    'endpoint': os.getenv(
                        'BLACKROAD_CODER_ENDPOINT',
                        'https://models-internal.blackroad.io'
                    ),
                    'weight': 0.8,
                    'latency_target': 500,  # ms
                },
                {
                    'model': 'openai/gpt-4',
                    'endpoint': 'https://api.openai.com/v1',
                    'weight': 0.2,
                    'fallback': True,
                    'latency_target': 2000,
                }
            ],

            # Code completion
            'code-completion': [
                {
                    'model': 'internal/blackroad-coder-7b-v1',
                    'endpoint': os.getenv('BLACKROAD_CODER_ENDPOINT'),
                    'weight': 1.0,
                }
            ],

            # Bug fixing
            'bug-fixing': [
                {
                    'model': 'internal/blackroad-coder-7b-v1',
                    'endpoint': os.getenv('BLACKROAD_CODER_ENDPOINT'),
                    'weight': 0.7,
                },
                {
                    'model': 'openai/gpt-4',
                    'endpoint': 'https://api.openai.com/v1',
                    'weight': 0.3,
                    'fallback': True,
                }
            ],

            # Documentation
            'documentation': [
                {
                    'model': 'internal/blackroad-coder-7b-v1',
                    'endpoint': os.getenv('BLACKROAD_CODER_ENDPOINT'),
                    'weight': 1.0,
                }
            ],

            # Refactoring
            'refactoring': [
                {
                    'model': 'internal/blackroad-coder-7b-v1',
                    'endpoint': os.getenv('BLACKROAD_CODER_ENDPOINT'),
                    'weight': 0.9,
                },
                {
                    'model': 'anthropic/claude-3-opus',
                    'endpoint': 'https://api.anthropic.com/v1',
                    'weight': 0.1,
                    'fallback': True,
                }
            ],

            # General reasoning (for governance agents like Cece, Alice)
            'reasoning': [
                {
                    'model': 'anthropic/claude-3-opus',
                    'endpoint': 'https://api.anthropic.com/v1',
                    'weight': 0.7,
                },
                {
                    'model': 'openai/gpt-4',
                    'endpoint': 'https://api.openai.com/v1',
                    'weight': 0.3,
                    'fallback': True,
                }
            ],

            # Creative tasks (for Cadillac)
            'creative': [
                {
                    'model': 'anthropic/claude-3-opus',
                    'endpoint': 'https://api.anthropic.com/v1',
                    'weight': 1.0,
                }
            ],

            # Summarization
            'summarization': [
                {
                    'model': 'openai/gpt-4-turbo',
                    'endpoint': 'https://api.openai.com/v1',
                    'weight': 0.8,
                },
                {
                    'model': 'anthropic/claude-3-sonnet',
                    'endpoint': 'https://api.anthropic.com/v1',
                    'weight': 0.2,
                }
            ],
        }

    def select_model(self, capability: str, agent_id: Optional[str] = None) -> Dict:
        """Select best model for a capability.

        Args:
            capability: Capability name (e.g., 'code-generation')
            agent_id: Optional agent ID for personalized routing

        Returns:
            Model configuration dict with endpoint, name, etc.
        """
        candidates = self.capability_map.get(capability, [])

        if not candidates:
            raise ValueError(f"No models found for capability: {capability}")

        # Agent-specific routing (future)
        if agent_id and agent_id in CANONICAL_AGENTS:
            agent_role = CANONICAL_AGENTS[agent_id]['role']

            # Creative agents prefer Claude
            if agent_role == 'creative':
                creative_models = [c for c in candidates if 'claude' in c['model'].lower()]
                if creative_models:
                    return creative_models[0]

            # Code-focused agents prefer BlackRoad Coder
            if agent_role in ['deploy', 'system']:
                blackroad_models = [c for c in candidates if 'blackroad-coder' in c['model']]
                if blackroad_models:
                    return blackroad_models[0]

        # Default: pick highest weight
        best = max(candidates, key=lambda x: x.get('weight', 0))
        return best

    async def generate(
        self,
        messages: List[Dict],
        capability: Optional[str] = None,
        model: Optional[str] = None,
        agent_id: Optional[str] = None,
        **kwargs
    ) -> Dict:
        """Generate completion using capability or explicit model.

        Args:
            messages: Chat messages
            capability: Capability name (if not providing explicit model)
            model: Explicit model ID (overrides capability)
            agent_id: Agent requesting generation (for routing)
            **kwargs: Additional generation parameters (temperature, max_tokens, etc.)

        Returns:
            Generation response
        """
        # Select model
        if not model:
            if not capability:
                raise ValueError("Must specify capability or model")
            model_config = self.select_model(capability, agent_id)
        else:
            # Explicit model - look up endpoint
            model_config = self._get_model_config(model)

        # Route to model endpoint
        endpoint = model_config['endpoint']
        model_name = model_config['model']

        # Build request
        request_data = {
            'model': model_name,
            'messages': messages,
            **kwargs  # temperature, max_tokens, etc.
        }

        # Get API key
        api_key = self._get_api_key(model_name)

        # Call model
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{endpoint}/v1/chat/completions",
                json=request_data,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                }
            )

            response.raise_for_status()
            return response.json()

    def _get_model_config(self, model_id: str) -> Dict:
        """Get model configuration by ID."""
        # Search all capabilities
        for capability, models in self.capability_map.items():
            for config in models:
                if config['model'] == model_id:
                    return config

        raise ValueError(f"No configuration found for model: {model_id}")

    def _get_api_key(self, model: str) -> str:
        """Get API key for model."""
        if 'blackroad-coder' in model:
            return os.getenv('BLACKROAD_MODEL_API_KEY', '')
        elif 'openai' in model or 'gpt' in model:
            return os.getenv('OPENAI_API_KEY', '')
        elif 'anthropic' in model or 'claude' in model:
            return os.getenv('ANTHROPIC_API_KEY', '')
        else:
            return os.getenv('MODEL_API_KEY', '')

    def get_agent_identity(self, agent_name: str) -> Optional[Dict]:
        """Get canonical identity for an agent."""
        return CANONICAL_AGENTS.get(agent_name)

    def verify_agent_identity(self, agent_name: str, claimed_hash: str) -> bool:
        """Verify agent identity via PS-SHA∞ hash."""
        agent = CANONICAL_AGENTS.get(agent_name)
        if not agent:
            return False
        return agent['sha256'] == claimed_hash
