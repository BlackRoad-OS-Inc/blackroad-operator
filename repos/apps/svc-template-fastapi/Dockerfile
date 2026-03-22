# syntax=docker/dockerfile:1.6

FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml ./
COPY app ./app
RUN pip install --upgrade pip && \
    pip install build && \
    python -m build --wheel --outdir /tmp/dist && \
    pip install --prefix=/install /tmp/dist/*.whl

FROM gcr.io/distroless/python3-debian11

ENV PYTHONPATH=/app \
    PORT=4000 \
    APP_NAME=svc-template-fastapi \
    ENVIRONMENT=production

WORKDIR /app

COPY --from=builder /install /usr/local
COPY --from=builder /app/app ./app

EXPOSE 4000

USER nonroot

ENTRYPOINT ["python", "-m", "app.main"]
