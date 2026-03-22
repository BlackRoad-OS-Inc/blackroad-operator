"""BlackRoad LLM Integration Layer

Provides unified interface for multiple LLM backends:
- vLLM (Apache-2.0) - GPU production inference
- llama.cpp (MIT) - CPU/edge inference
- Ollama (MIT) - Local development

Supports agent "thinking" via language models while maintaining
compatibility with edge devices (Pi/Jetson) and cloud GPUs."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any, AsyncIterator
from enum import Enum
import asyncio
import json


class LLMBackend(Enum):
    """Supported LLM backends."""
    VLLM = "vllm"  # GPU production
    LLAMACPP = "llamacpp"  # CPU/edge
    OLLAMA = "ollama"  # Local dev
    OPENAI_COMPAT = "openai_compat"  # OpenAI-compatible APIs
    HUGGINGFACE = "huggingface"  # HF Inference API


@dataclass
class LLMConfig:
    """Configuration for LLM backend."""
    backend: LLMBackend
    model_name: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None

    # Inference parameters
    temperature: float = 0.7
    max_tokens: int = 2048
    top_p: float = 0.9
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0

    # Performance
    timeout: int = 60
    max_retries: int = 3


@dataclass
class LLMMessage:
    """A message in the conversation."""
    role: str  # system, user, assistant
    content: str
    name: Optional[str] = None


@dataclass
class LLMResponse:
    """Response from LLM inference."""
    content: str
    model: str
    finish_reason: str
    usage: Dict[str, int]

    # Metadata
    latency_ms: Optional[float] = None
    backend: Optional[str] = None


class LLMProvider:
    """    Abstract base for LLM providers.

    Subclasses implement specific backends (vLLM, llama.cpp, Ollama)."""

    def __init__(self, config: LLMConfig):
        self.config = config

    async def generate(
        self,
        messages: List[LLMMessage],
        stream: bool = False,
        **kwargs
    ) -> LLMResponse:
        """        Generate completion from messages.

        Args:
            messages: Conversation history
            stream: Stream response tokens
            **kwargs: Additional parameters

        Returns:
            LLMResponse with generated text"""
        raise NotImplementedError

    async def generate_stream(
        self,
        messages: List[LLMMessage],
        **kwargs
    ) -> AsyncIterator[str]:
        """        Generate streaming completion.

        Args:
            messages: Conversation history
            **kwargs: Additional parameters

        Yields:
            Text chunks as they are generated."""
        raise NotImplementedError


class OllamaProvider(LLMProvider):
    """    Ollama backend for local development.

    Ollama provides easy local LLM serving with models like:
    - llama2, llama3, codellama
    - mistral, mixtral
    - phi, gemma"""

    async def generate(
        self,
        messages: List[LLMMessage],
        stream: bool = False,
        **kwargs
    ) -> LLMResponse:
        """Generate using Ollama API."""
        import aiohttp
        import time

        base_url = self.config.base_url or "http://localhost:11434"
        url = f"{base_url}/api/chat"

        # Convert messages to Ollama format
        ollama_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        payload = {
            "model": self.config.model_name,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": self.config.temperature,
                "top_p": self.config.top_p,
                "num_predict": self.config.max_tokens
            }
        }

        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                resp.raise_for_status()
                result = await resp.json()

        latency = (time.time() - start_time) * 1000

        return LLMResponse(
            content=result["message"]["content"],
            model=self.config.model_name,
            finish_reason=result.get("done_reason", "stop"),
            usage={
                "prompt_tokens": result.get("prompt_eval_count", 0),
                "completion_tokens": result.get("eval_count", 0),
                "total_tokens": result.get("prompt_eval_count", 0) + result.get("eval_count", 0)
            },
            latency_ms=latency,
            backend="ollama"
        )

    async def generate_stream(
        self,
        messages: List[LLMMessage],
        **kwargs
    ) -> AsyncIterator[str]:
        """Stream generation using Ollama."""
        import aiohttp

        base_url = self.config.base_url or "http://localhost:11434"
        url = f"{base_url}/api/chat"

        ollama_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        payload = {
            "model": self.config.model_name,
            "messages": ollama_messages,
            "stream": True,
            "options": {
                "temperature": self.config.temperature,
                "top_p": self.config.top_p,
                "num_predict": self.config.max_tokens
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                resp.raise_for_status()

                async for line in resp.content:
                    if line:
                        chunk = json.loads(line)
                        if "message" in chunk and "content" in chunk["message"]:
                            yield chunk["message"]["content"]


class LlamaCppProvider(LLMProvider):
    """    llama.cpp backend for CPU/edge inference.

    Optimized for:
    - Raspberry Pi
    - Jetson Nano/Orin
    - Commodity CPUs"""

    async def generate(
        self,
        messages: List[LLMMessage],
        stream: bool = False,
        **kwargs
    ) -> LLMResponse:
        """Generate using llama.cpp server."""
        import aiohttp
        import time

        base_url = self.config.base_url or "http://localhost:8080"
        url = f"{base_url}/v1/chat/completions"

        # OpenAI-compatible format
        payload = {
            "model": self.config.model_name,
            "messages": [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ],
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
            "top_p": self.config.top_p,
            "stream": False
        }

        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                resp.raise_for_status()
                result = await resp.json()

        latency = (time.time() - start_time) * 1000

        choice = result["choices"][0]

        return LLMResponse(
            content=choice["message"]["content"],
            model=result.get("model", self.config.model_name),
            finish_reason=choice.get("finish_reason", "stop"),
            usage=result.get("usage", {}),
            latency_ms=latency,
            backend="llamacpp"
        )


class VLLMProvider(LLMProvider):
    """    vLLM backend for high-throughput GPU inference.

    Features:
    - PagedAttention for memory efficiency
    - Continuous batching
    - 200K+ tokens/sec throughput"""

    async def generate(
        self,
        messages: List[LLMMessage],
        stream: bool = False,
        **kwargs
    ) -> LLMResponse:
        """Generate using vLLM server (OpenAI-compatible)."""
        import aiohttp
        import time

        base_url = self.config.base_url or "http://localhost:8000"
        url = f"{base_url}/v1/chat/completions"

        payload = {
            "model": self.config.model_name,
            "messages": [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ],
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
            "top_p": self.config.top_p,
            "stream": False
        }

        headers = {}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"

        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                result = await resp.json()

        latency = (time.time() - start_time) * 1000

        choice = result["choices"][0]

        return LLMResponse(
            content=choice["message"]["content"],
            model=result.get("model", self.config.model_name),
            finish_reason=choice.get("finish_reason", "stop"),
            usage=result.get("usage", {}),
            latency_ms=latency,
            backend="vllm"
        )


class HuggingFaceProvider(LLMProvider):
    """
    Hugging Face Inference API backend.

    Supports any model hosted on the HF Hub with the Inference API,
    including serverless inference and dedicated Inference Endpoints.
    """

    async def generate(
        self,
        messages: List[LLMMessage],
        stream: bool = False,
        **kwargs
    ) -> LLMResponse:
        """Generate using HF Inference API (OpenAI-compatible chat route)."""
        import aiohttp
        import time

        base_url = self.config.base_url or "https://api-inference.huggingface.co"
        api_key = self.config.api_key or ""

        # Try chat completions endpoint first (works for conversational models)
        url = f"{base_url}/models/{self.config.model_name}/v1/chat/completions"

        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        payload = {
            "model": self.config.model_name,
            "messages": [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ],
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
            "top_p": self.config.top_p,
            "stream": False,
        }

        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    latency = (time.time() - start_time) * 1000
                    choice = result["choices"][0]
                    return LLMResponse(
                        content=choice["message"]["content"],
                        model=result.get("model", self.config.model_name),
                        finish_reason=choice.get("finish_reason", "stop"),
                        usage=result.get("usage", {}),
                        latency_ms=latency,
                        backend="huggingface",
                    )

                # Fallback: use the simple text generation endpoint
                fallback_url = f"{base_url}/models/{self.config.model_name}"
                # Combine messages into a single prompt
                prompt = "\n".join(f"{m.role}: {m.content}" for m in messages)
                async with session.post(
                    fallback_url,
                    json={"inputs": prompt, "parameters": {"max_new_tokens": self.config.max_tokens}},
                    headers=headers,
                ) as fallback_resp:
                    fallback_resp.raise_for_status()
                    result = await fallback_resp.json()

        latency = (time.time() - start_time) * 1000

        # Handle list response format
        content = result[0].get("generated_text", "") if isinstance(result, list) else str(result)

        return LLMResponse(
            content=content,
            model=self.config.model_name,
            finish_reason="stop",
            usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            latency_ms=latency,
            backend="huggingface",
        )


class LLMRouter:
    """    Routes LLM requests to appropriate backend based on:
    - Model requirements
    - Available resources
    - Performance needs"""

    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {}
        self.default_provider: Optional[str] = None

    def register_provider(self, name: str, provider: LLMProvider, set_default: bool = False):
        """Register an LLM provider."""
        self.providers[name] = provider

        if set_default or not self.default_provider:
            self.default_provider = name

    async def generate(
        self,
        messages: List[LLMMessage],
        provider_name: Optional[str] = None,
        **kwargs
    ) -> LLMResponse:
        """Generate using specified or default provider."""
        provider_name = provider_name or self.default_provider

        if not provider_name or provider_name not in self.providers:
            raise ValueError(f"Provider not found: {provider_name}")

        provider = self.providers[provider_name]
        return await provider.generate(messages, **kwargs)


__all__ = [
    "LLMConfig",
    "LLMMessage",
    "LLMResponse",
    "LLMProvider",
    "OllamaProvider",
    "LlamaCppProvider",
    "VLLMProvider",
    "HuggingFaceProvider",
    "LLMRouter",
    "LLMBackend",
]
