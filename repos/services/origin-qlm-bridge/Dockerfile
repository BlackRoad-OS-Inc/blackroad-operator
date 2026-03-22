# syntax=docker/dockerfile:1.7
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

FROM base AS builder
COPY pyproject.toml ./
COPY src ./src
RUN pip install --upgrade pip && \
    pip install --no-cache-dir .

FROM base AS runtime
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY src ./src
EXPOSE 8100
ENV QLM_BRIDGE_PORT=8100
CMD ["uvicorn", "origin_qlm_bridge.app:create_app", "--host", "0.0.0.0", "--port", "8100"]
