"""Main FastAPI application for LLM service."""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from prometheus_client import Counter, Histogram, generate_latest
from starlette.responses import Response

from .cache import ResponseCache
from .config import get_settings
from .providers import (
    AnthropicProvider,
    ChatRequest,
    ChatResponse,
    EchoProvider,
    LLMProvider,
    OllamaProvider,
    OpenAIProvider,
    StreamChunk,
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Metrics
REQUEST_COUNT = Counter("llm_requests_total", "Total requests", ["provider", "model", "status"])
REQUEST_DURATION = Histogram("llm_request_duration_seconds", "Request duration", ["provider", "model"])
TOKEN_COUNT = Counter("llm_tokens_total", "Total tokens", ["provider", "model", "type"])


class ProviderManager:
    """Manages LLM providers."""

    def __init__(self, settings):
        """Initialize provider manager.

        Args:
            settings: Application settings
        """
        self.settings = settings
        self.providers: dict[str, LLMProvider] = {}
        self._init_providers()

    def _init_providers(self) -> None:
        """Initialize configured providers."""
        # OpenAI
        if self.settings.openai_api_key:
            self.providers["openai"] = OpenAIProvider(
                api_key=self.settings.openai_api_key,
                base_url=self.settings.openai_base_url,
                default_model=self.settings.openai_default_model,
                timeout=self.settings.openai_timeout,
            )
            logger.info("Initialized OpenAI provider")

        # Anthropic
        if self.settings.anthropic_api_key:
            self.providers["anthropic"] = AnthropicProvider(
                api_key=self.settings.anthropic_api_key,
                base_url=self.settings.anthropic_base_url,
                default_model=self.settings.anthropic_default_model,
                timeout=self.settings.anthropic_timeout,
            )
            logger.info("Initialized Anthropic provider")

        # Ollama
        self.providers["ollama"] = OllamaProvider(
            base_url=self.settings.ollama_base_url,
            default_model=self.settings.ollama_default_model,
            timeout=self.settings.ollama_timeout,
        )
        logger.info("Initialized Ollama provider")

        # Echo (always available)
        self.providers["echo"] = EchoProvider()
        logger.info("Initialized Echo provider")

    def get_provider(self, name: str | None = None) -> LLMProvider:
        """Get provider by name.

        Args:
            name: Provider name (uses default if None)

        Returns:
            LLM provider

        Raises:
            HTTPException: If provider not found
        """
        provider_name = name or self.settings.default_provider
        provider = self.providers.get(provider_name)

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Provider '{provider_name}' not configured. Available: {list(self.providers.keys())}",
            )

        return provider


# Application state
app_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan manager.

    Args:
        app: FastAPI application

    Yields:
        None
    """
    settings = get_settings()

    # Initialize provider manager
    app_state["provider_manager"] = ProviderManager(settings)

    # Initialize cache
    app_state["cache"] = ResponseCache(
        redis_url=settings.redis_url,
        ttl=settings.cache_ttl,
        enabled=settings.cache_enabled,
    )

    logger.info("LLM service started")

    yield

    # Cleanup
    if "cache" in app_state:
        await app_state["cache"].close()

    logger.info("LLM service stopped")


# Create app
app = FastAPI(
    title="Prism LLM Service",
    description="Production-grade LLM inference service with multi-provider support",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint.

    Returns:
        Health status
    """
    return {"status": "healthy", "service": "llm"}


@app.get("/healthz")
async def healthz():
    """Kubernetes health check endpoint.

    Returns:
        Health status
    """
    return {"ok": True}


@app.get("/providers")
async def list_providers():
    """List available providers.

    Returns:
        Available providers
    """
    manager: ProviderManager = app_state["provider_manager"]
    return {"providers": list(manager.providers.keys()), "default": manager.settings.default_provider}


@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, provider: str | None = None):
    """Generate chat completion.

    Args:
        request: Chat request
        provider: Provider name (optional)

    Returns:
        Chat response
    """
    settings = get_settings()
    manager: ProviderManager = app_state["provider_manager"]
    cache: ResponseCache = app_state["cache"]

    # Get provider
    llm_provider = manager.get_provider(provider)

    # Apply defaults
    if request.max_tokens is None:
        request.max_tokens = settings.default_max_tokens

    # Check cache (only for non-streaming)
    if not request.stream and cache.enabled:
        cached = await cache.get(
            provider=llm_provider.name,
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
            model=request.model or "",
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        if cached:
            logger.info(f"Cache hit for provider={llm_provider.name}")
            return ChatResponse(**cached)

    # Generate response
    start_time = time.time()
    try:
        if request.stream:
            # Return streaming response
            async def stream_generator():
                async for chunk in llm_provider.stream_chat(request):
                    yield f"data: {chunk.model_dump_json()}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            # Non-streaming response
            response = await llm_provider.chat(request)

            # Update metrics
            duration = time.time() - start_time
            REQUEST_COUNT.labels(provider=llm_provider.name, model=response.model, status="success").inc()
            REQUEST_DURATION.labels(provider=llm_provider.name, model=response.model).observe(duration)

            if response.usage:
                TOKEN_COUNT.labels(provider=llm_provider.name, model=response.model, type="prompt").inc(
                    response.usage["prompt_tokens"]
                )
                TOKEN_COUNT.labels(provider=llm_provider.name, model=response.model, type="completion").inc(
                    response.usage["completion_tokens"]
                )

            # Cache response
            if cache.enabled:
                await cache.set(
                    provider=llm_provider.name,
                    messages=[{"role": m.role, "content": m.content} for m in request.messages],
                    model=request.model or "",
                    response=response.model_dump(),
                    temperature=request.temperature,
                    max_tokens=request.max_tokens,
                )

            return response

    except Exception as e:
        REQUEST_COUNT.labels(provider=llm_provider.name, model=request.model or "unknown", status="error").inc()
        logger.error(f"Error generating response: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest, provider: str | None = None):
    """OpenAI-compatible chat completions endpoint.

    Args:
        request: Chat request
        provider: Provider name (optional)

    Returns:
        Chat response
    """
    return await chat(request, provider)


@app.delete("/cache")
async def clear_cache():
    """Clear response cache.

    Returns:
        Number of entries cleared
    """
    cache: ResponseCache = app_state["cache"]
    count = await cache.clear()
    return {"cleared": count}


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint.

    Returns:
        Prometheus metrics
    """
    return Response(content=generate_latest(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )
