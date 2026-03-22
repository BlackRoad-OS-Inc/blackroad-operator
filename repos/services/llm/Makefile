.PHONY: help install test lint format build run docker-build docker-run clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	poetry install

test: ## Run tests
	poetry run pytest

test-cov: ## Run tests with coverage
	poetry run pytest --cov=app --cov-report=html --cov-report=term

lint: ## Lint code
	poetry run ruff check app tests

format: ## Format code
	poetry run black app tests
	poetry run ruff check --fix app tests

build: ## Build package
	poetry build

run: ## Run service locally
	poetry run python -m uvicorn app.main:app --reload

docker-build: ## Build Docker image
	docker build -t prism-llm:latest .

docker-run: ## Run Docker container
	docker run -p 8000:8000 -e LLM_DEFAULT_PROVIDER=echo prism-llm:latest

docker-compose-up: ## Start services with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop services with docker-compose
	docker-compose down

clean: ## Clean build artifacts
	rm -rf dist build *.egg-info .pytest_cache .coverage htmlcov
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
