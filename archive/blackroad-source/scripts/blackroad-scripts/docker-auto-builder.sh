#!/usr/bin/env bash
# Auto-generate Dockerfiles
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[DOCKER-BUILDER]${NC} Generating Dockerfile..."

# Detect project type
if [[ -f package.json ]]; then
  TYPE="node"
elif [[ -f requirements.txt ]]; then
  TYPE="python"
elif [[ -f go.mod ]]; then
  TYPE="go"
else
  TYPE="generic"
fi

case $TYPE in
  node)
    cat > Dockerfile <<'DOCKER'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
DOCKER
    echo -e "${GREEN}✓${NC} Created Node.js Dockerfile"
    ;;
    
  python)
    cat > Dockerfile <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
DOCKER
    echo -e "${GREEN}✓${NC} Created Python Dockerfile"
    ;;
    
  go)
    cat > Dockerfile <<'DOCKER'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
DOCKER
    echo -e "${GREEN}✓${NC} Created Go Dockerfile"
    ;;
esac

# Also create .dockerignore
cat > .dockerignore <<'IGNORE'
node_modules
.git
.env
*.log
.DS_Store
IGNORE

echo -e "${GREEN}✓${NC} Created .dockerignore"
echo ""
echo "  Build: docker build -t $PROJECT_NAME ."
echo "  Run: docker run -p 3000:3000 $PROJECT_NAME"
