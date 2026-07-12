.PHONY: help build up down logs dev dev-down shell test clean

IMAGE  ?= logicist/origin-hub-registry
TAG    ?= latest
COMPOSE = docker compose

# ─────────────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Production ────────────────────────────────────────────────────────────────
build: ## Build the production Docker image
	docker build -t $(IMAGE):$(TAG) .

push: ## Push the image to a registry (set IMAGE=registry/org/repo)
	docker push $(IMAGE):$(TAG)

up: ## Start production stack (detached)
	@[ -f .env ] || (echo "⚠️  .env not found — copy .env.example first"; exit 1)
	$(COMPOSE) up -d

down: ## Stop production stack
	$(COMPOSE) down

restart: ## Restart the production container
	$(COMPOSE) restart hub-registry

logs: ## Tail production logs
	$(COMPOSE) logs -f hub-registry

# ── Dev ───────────────────────────────────────────────────────────────────────
dev: ## Start local dev stack (FastAPI hot-reload + Vite)
	@[ -f .env ] || cp .env.example .env
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up

dev-down: ## Stop local dev stack
	$(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml down

# ── Utilities ─────────────────────────────────────────────────────────────────
shell: ## Open a shell in the running container
	docker exec -it origin_hub_registry sh

ps: ## Show container status
	$(COMPOSE) ps

health: ## Check the health endpoint
	@curl -sf http://localhost:8000/health | python3 -m json.tool

# ── UI ────────────────────────────────────────────────────────────────────────
ui-install: ## Install UI npm dependencies
	cd ui && npm install

ui-dev: ## Start Vite dev server locally (without Docker)
	cd ui && npm run dev

ui-build: ## Build the React UI (output to app/static)
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

reset-db: ## ⚠️  Delete local dev database (data/ directory)
	@read -p "Delete ./data/origin_hub.db? [y/N] " yn; \
	[ "$$yn" = "y" ] && rm -f data/origin_hub.db && echo "Deleted." || echo "Aborted."
