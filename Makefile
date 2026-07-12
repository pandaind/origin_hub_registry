.PHONY: help build publish push up down logs dev dev-down shell ps health \
        ui-install ui-dev ui-build test gen-secret clean reset-db

IMAGE  ?= logicist/origin-hub-registry
TAG    ?= latest
COMPOSE = docker compose

# ─────────────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Build & Publish ───────────────────────────────────────────────────────────
build: ## Build the production image locally (IMAGE=logicist/origin-hub-registry TAG=latest)
	docker build \
		--label "org.opencontainers.image.created=$$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
		--label "org.opencontainers.image.revision=$$(git rev-parse --short HEAD 2>/dev/null || echo unknown)" \
		-t $(IMAGE):$(TAG) \
		-t $(IMAGE):sha-$$(git rev-parse --short HEAD 2>/dev/null || echo local) \
		.

push: ## Push the image to Docker Hub
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):sha-$$(git rev-parse --short HEAD 2>/dev/null || echo local)

publish: build push ## Build + push in one step (requires docker login)
	@echo "✅ Published $(IMAGE):$(TAG) to Docker Hub"
	@echo "   Pull on any machine with: docker pull $(IMAGE):$(TAG)"

# ── Production ────────────────────────────────────────────────────────────────
up: ## Start production stack using Docker Hub image (detached)
	@[ -f .env ] || (echo "⚠️  .env not found — run: cp .env.example .env  then set SECRET_KEY"; exit 1)
	$(COMPOSE) up -d
	@echo "✅ Registry running at http://localhost:$$(grep HOST_PORT .env | cut -d= -f2 || echo 8000)"

down: ## Stop and remove production containers
	$(COMPOSE) down

restart: ## Restart the production container
	$(COMPOSE) restart hub-registry

logs: ## Tail production logs
	$(COMPOSE) logs -f hub-registry

ps: ## Show container status
	$(COMPOSE) ps

health: ## Check the /health endpoint
	@curl -sf http://localhost:$$(grep HOST_PORT .env 2>/dev/null | cut -d= -f2 || echo 8000)/health \
		| python3 -m json.tool

# ── Dev ───────────────────────────────────────────────────────────────────────
dev: ## Start local dev stack (FastAPI hot-reload + Vite dev server via Docker)
	@[ -f .env ] || cp .env.example .env
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up

dev-down: ## Stop local dev stack
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml down

# ── Shell / Debug ─────────────────────────────────────────────────────────────
shell: ## Open a shell in the running production container
	docker exec -it origin_hub_registry sh

# ── UI (local, no Docker) ─────────────────────────────────────────────────────
ui-install: ## Install UI npm dependencies
	cd ui && npm install

ui-dev: ## Start Vite dev server locally (requires backend running on :8000)
	cd ui && npm run dev

ui-build: ## Build the React UI into app/static (used by production Dockerfile)
	cd ui && npm run build

# ── Tests ─────────────────────────────────────────────────────────────────────
test: ## Run backend test suite
	.venv/bin/pytest tests/ -v

# ── Secrets ───────────────────────────────────────────────────────────────────
gen-secret: ## Generate a secure SECRET_KEY value
	@python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove stopped containers and dangling images
	docker system prune -f
	docker volume prune -f

reset-db: ## ⚠️  Delete the local dev database (irreversible)
	@read -p "Delete ./data/origin_hub.db? [y/N] " yn; \
	[ "$$yn" = "y" ] && rm -f data/origin_hub.db && echo "Deleted." || echo "Aborted."
