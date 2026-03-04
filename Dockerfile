# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
# ---------- build ----------
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

# ---------- production ----------
FROM node:22-alpine AS production

RUN addgroup -g 1001 -S blackroad && \
    adduser -S operator -u 1001 -G blackroad

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist/ dist/
COPY blackroad-core/ blackroad-core/
COPY agents/ agents/

USER operator

ENV NODE_ENV=production
ENV BLACKROAD_GATEWAY_BIND=0.0.0.0
ENV BLACKROAD_GATEWAY_PORT=8787

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8787/healthz || exit 1

CMD ["node", "blackroad-core/gateway/server.js"]
