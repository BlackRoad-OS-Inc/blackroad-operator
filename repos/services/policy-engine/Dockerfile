FROM python:3.11-slim

WORKDIR /app

# Install OPA
RUN apt-get update && apt-get install -y curl && \
    curl -L -o /usr/local/bin/opa https://openpolicyagent.org/downloads/v0.67.0/opa_linux_amd64_static && \
    chmod +x /usr/local/bin/opa && \
    apt-get remove -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install --no-cache-dir poetry==1.8.0

# Copy dependencies
COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && \
    poetry install --no-dev --no-root --no-interaction --no-ansi

# Copy application
COPY app ./app
COPY policies ./policies

# Create non-root user
RUN useradd -m -u 1000 policyuser && \
    chown -R policyuser:policyuser /app

USER policyuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8001/healthz', timeout=5)"

EXPOSE 8001

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
