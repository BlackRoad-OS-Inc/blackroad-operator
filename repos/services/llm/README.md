# Prism LLM Service

Production-grade LLM inference service with multi-provider support, caching, streaming, and observability.

## Features

- **Multi-Provider Support**: OpenAI, Anthropic Claude, Ollama, and more
- **Streaming Responses**: Server-Sent Events (SSE) for real-time streaming
- **Response Caching**: Redis-based caching with configurable TTL
- **Prompt Templating**: Jinja2-based templates with predefined system/task templates
- **Prompt Chains**: Chain multiple LLM calls together
- **Observability**: Prometheus metrics, structured logging
- **Rate Limiting**: Token and request-based rate limiting
- **Health Checks**: Kubernetes-ready health endpoints
- **Security**: Non-root containers, read-only filesystem, API key authentication

## Quick Start

### Using Docker

```bash
# Build image
docker build -t prism-llm:latest .

# Run with echo provider (no API keys needed)
docker run -p 8000:8000 -e LLM_DEFAULT_PROVIDER=echo prism-llm:latest

# Run with OpenAI
docker run -p 8000:8000 \
  -e LLM_DEFAULT_PROVIDER=openai \
  -e LLM_OPENAI_API_KEY=your-key-here \
  prism-llm:latest

# Run with Anthropic
docker run -p 8000:8000 \
  -e LLM_DEFAULT_PROVIDER=anthropic \
  -e LLM_ANTHROPIC_API_KEY=your-key-here \
  prism-llm:latest
```

### Using Poetry

```bash
# Install dependencies
poetry install

# Run service
poetry run python -m app.main

# Run tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html
```

### Using Kubernetes

```bash
# Create namespace
kubectl create namespace prism

# Add API keys to secret
kubectl create secret generic llm-secrets -n prism \
  --from-literal=openai-api-key=your-openai-key \
  --from-literal=anthropic-api-key=your-anthropic-key

# Deploy
kubectl apply -f k8s/deployment.yaml

# Port forward for testing
kubectl port-forward -n prism svc/llm 8000:8000
```

## Configuration

All configuration via environment variables with `LLM_` prefix:

### Service Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_HOST` | `0.0.0.0` | Service host |
| `LLM_PORT` | `8000` | Service port |
| `LLM_LOG_LEVEL` | `info` | Log level |
| `LLM_DEFAULT_PROVIDER` | `echo` | Default provider |

### Provider Configuration

#### OpenAI

| Variable | default | Description |
|----------|---------|-------------|
| `LLM_OPENAI_API_KEY` | - | OpenAI API key |
| `LLM_OPENAI_BASE_URL` | `https://api.openai.com/v1` | API base URL |
| `LLM_OPENAI_DEFAULT_MODEL` | `gpt-4o-mini` | Default model |
| `LLM_OPENAI_TIMEOUT` | `60` | Request timeout (seconds) |

#### Anthropic

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_ANTHROPIC_API_KEY` | - | Anthropic API key |
| `LLM_ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | API base URL |
| `LLM_ANTHROPIC_DEFAULT_MODEL` | `claude-sonnet-4-5-20250929` | Default model |
| `LLM_ANTHROPIC_TIMEOUT` | `60` | Request timeout (seconds) |

#### Ollama

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_OLLAMA_BASE_URL` | `http://ollama-bridge.prism.svc.cluster.local:4010` | Ollama server URL |
| `LLM_OLLAMA_DEFAULT_MODEL` | `llama3.1` | Default model |
| `LLM_OLLAMA_TIMEOUT` | `120` | Request timeout (seconds) |

### Caching

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_REDIS_URL` | - | Redis connection URL |
| `LLM_CACHE_ENABLED` | `false` | Enable caching |
| `LLM_CACHE_TTL` | `3600` | Cache TTL (seconds) |

### Observability

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_METRICS_ENABLED` | `true` | Enable Prometheus metrics |
| `LLM_METRICS_PORT` | `9090` | Metrics server port |

## API Reference

### Endpoints

#### `POST /v1/chat`

Generate chat completion.

**Query Parameters:**
- `provider` (optional): Provider name (`openai`, `anthropic`, `ollama`, `echo`)

**Request Body:**
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 1.0,
  "stream": false
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "model": "gpt-4o-mini",
  "content": "Hello! How can I help you today?",
  "role": "assistant",
  "finish_reason": "stop",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}
```

#### `POST /v1/chat/completions`

OpenAI-compatible endpoint (alias for `/v1/chat`).

#### `GET /providers`

List available providers.

**Response:**
```json
{
  "providers": ["openai", "anthropic", "ollama", "echo"],
  "default": "echo"
}
```

#### `GET /health`

Health check endpoint.

#### `GET /healthz`

Kubernetes health endpoint.

#### `GET /metrics`

Prometheus metrics endpoint.

#### `DELETE /cache`

Clear response cache.

### Streaming

Enable streaming by setting `stream: true`:

```bash
curl -X POST http://localhost:8000/v1/chat?provider=echo \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

Response format (Server-Sent Events):
```
data: {"id":"chatcmpl-123","model":"echo-v1","delta":"Hello","finish_reason":null}
data: {"id":"chatcmpl-123","model":"echo-v1","delta":" world","finish_reason":null}
data: {"id":"chatcmpl-123","model":"echo-v1","delta":"","finish_reason":"stop"}
data: [DONE]
```

## Usage Examples

### Basic Chat

```python
import httpx

response = httpx.post(
    "http://localhost:8000/v1/chat?provider=echo",
    json={
        "messages": [
            {"role": "user", "content": "What is 2+2?"}
        ],
        "temperature": 0.7,
    }
)

print(response.json()["content"])
```

### Streaming Chat

```python
import httpx

with httpx.stream(
    "POST",
    "http://localhost:8000/v1/chat?provider=echo",
    json={
        "messages": [{"role": "user", "content": "Count to 5"}],
        "stream": True,
    }
) as response:
    for line in response.iter_lines():
        if line.startswith("data: "):
            print(line[6:])
```

### Using Prompt Templates

```python
from app.templates import get_task_template

# Summarization template
template = get_task_template("summarize")
prompt = template.render(text="Long text to summarize...")

# Make request
response = httpx.post(
    "http://localhost:8000/v1/chat",
    json={"messages": [{"role": "user", "content": prompt}]}
)
```

### Prompt Chains

```python
from app.templates import PromptChain

chain = PromptChain([
    {
        "template": "Summarize this: {{ article }}",
        "output_key": "summary"
    },
    {
        "template": "Extract key points from: {{ summary }}",
        "output_key": "key_points"
    }
])

async def llm_call(prompt: str) -> str:
    # Your LLM call implementation
    pass

result = await chain.run(llm_call, {"article": "Long article text..."})
print(result["key_points"])
```

## Monitoring

### Prometheus Metrics

- `llm_requests_total{provider,model,status}` - Total requests
- `llm_request_duration_seconds{provider,model}` - Request duration histogram
- `llm_tokens_total{provider,model,type}` - Total tokens (prompt/completion)

### Grafana Dashboard

Import the Grafana dashboard from `k8s/grafana-dashboard.json` for visualization.

## Development

### Project Structure

```
services/llm/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── cache.py             # Response caching
│   ├── templates.py         # Prompt templates
│   └── providers/
│       ├── __init__.py
│       ├── base.py          # Provider interface
│       ├── openai_provider.py
│       ├── anthropic_provider.py
│       ├── ollama_provider.py
│       └── echo_provider.py
├── tests/
│   ├── test_api.py
│   ├── test_providers.py
│   └── test_templates.py
├── k8s/
│   └── deployment.yaml
├── pyproject.toml
├── Dockerfile
└── README.md
```

### Running Tests

```bash
# All tests
poetry run pytest

# Specific test file
poetry run pytest tests/test_api.py

# With coverage
poetry run pytest --cov=app --cov-report=html

# Watch mode
poetry run pytest-watch
```

### Code Quality

```bash
# Format code
poetry run black app tests

# Lint
poetry run ruff check app tests

# Type checking
poetry run mypy app
```

## Integration with LLM Gateway

This service is designed to work with the `llm-gateway` service:

```
User Request → llm-gateway → llm (this service) → Provider (OpenAI/Anthropic/etc)
                    ↓
                 Fallback (Ollama)
```

The gateway provides:
- Circuit breaker pattern
- Automatic fallback to Ollama
- Request routing
- Incident logging

## Performance

### Benchmarks

With echo provider (baseline):
- ~1000 req/s on single core
- ~50ms p50 latency
- ~100ms p99 latency

With OpenAI (network bound):
- ~100 req/s (limited by API)
- ~500ms p50 latency
- ~2s p99 latency

### Optimization Tips

1. **Enable caching**: Reduces API calls for repeated queries
2. **Use streaming**: Better UX for long responses
3. **Batch requests**: Process multiple requests in parallel
4. **Local models**: Use Ollama for high-throughput scenarios
5. **Connection pooling**: Configured by default in httpx/OpenAI clients

## Troubleshooting

### Common Issues

**Service won't start:**
- Check logs: `kubectl logs -n prism deployment/llm`
- Verify secrets: `kubectl get secret -n prism llm-secrets`
- Check resource limits

**High latency:**
- Check provider health: `GET /health`
- Monitor metrics: `GET /metrics`
- Review cache hit rate
- Check network latency to provider

**Cache not working:**
- Verify Redis connection: `LLM_REDIS_URL`
- Check cache enabled: `LLM_CACHE_ENABLED=true`
- Monitor Redis logs

**Out of memory:**
- Increase memory limits in deployment.yaml
- Reduce concurrent requests
- Disable caching if Redis memory is limited

## Security

- ✅ Non-root user (UID 1000)
- ✅ Read-only root filesystem
- ✅ No privilege escalation
- ✅ Dropped capabilities
- ✅ API keys via Kubernetes secrets
- ✅ HTTPS for external APIs
- ⚠️ Add authentication for production (not included)

## License

Copyright (c) 2025 BlackRoad Inc.

## Support

- Issues: [GitHub Issues](https://github.com/blackroad/prism-console/issues)
- Docs: [Prism Console Documentation](https://docs.blackroad.io)
