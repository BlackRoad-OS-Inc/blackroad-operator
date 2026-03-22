# syntax=docker/dockerfile:1.6

FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev
COPY tsconfig.json jest.config.js .eslintrc.cjs ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian11

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

USER nonroot

CMD ["dist/index.js"]
