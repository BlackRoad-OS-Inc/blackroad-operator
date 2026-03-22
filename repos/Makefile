.PHONY: install build dev test lint clean up down seed validate migrate logs

install:
	pnpm install

build:
	pnpm build

dev:
	pnpm dev

test:
	pnpm test

lint:
	pnpm lint

clean:
	pnpm clean
	rm -rf node_modules

# Docker
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

# Data
seed:
	node scripts/seed.js

validate:
	node scripts/validate.js

import:
	node scripts/import-github.js
	node scripts/seed.js

migrate:
	node scripts/migrate.js

# Run services locally (foreground)
run-registry:
	cd services/registry && REGISTRY_DB_PATH=../../data/roadcode.db REGISTRIES_PATH=../../registries REGISTRY_PORT=3101 node src/index.js

run-prism:
	cd apps/prism && REGISTRY_URL=http://localhost:3101 PRISM_PORT=8787 node src/index.js

run-audit:
	cd services/audit && AUDIT_DB_PATH=../../data/audit.db AUDIT_CHAIN_PATH=../../data/chain.log AUDIT_PORT=3103 node src/index.js

# Setup (first time)
setup:
	@echo "Setting up RoadCode Platform..."
	pnpm install
	cp -n .env.example .env || true
	mkdir -p data
	node scripts/migrate.js
	node scripts/seed.js
	@echo "Done. Run 'make dev' to start."
