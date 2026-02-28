# BlackRoad Operator API — Production Dockerfile
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# --- Production image ---
FROM node:22-alpine

WORKDIR /app

# Security: run as non-root
RUN addgroup -S blackroad && adduser -S operator -G blackroad

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist/ ./dist/

# Copy gateway and policies for local fallback
COPY blackroad-core/gateway/ ./blackroad-core/gateway/
COPY blackroad-core/policies/ ./blackroad-core/policies/

USER operator

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:8080/healthz || exit 1

CMD ["node", "dist/server/start.js"]
