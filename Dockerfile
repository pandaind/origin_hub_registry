# ── Stage 1: Build React UI ───────────────────────────────────────────────────
FROM node:20-alpine AS node-builder

WORKDIR /build/ui

# Cache npm deps separately from source
COPY ui/package.json ui/package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY ui/ ./
RUN npm run build
# vite.config.ts → build.outDir = '../app/static'
# → output lands at /build/app/static/ (one level up from /build/ui/)


# ── Stage 2: Install Python deps ─────────────────────────────────────────────
FROM python:3.11-slim AS python-builder

WORKDIR /build

# Install build tools, then clean up in the same layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy the manifest and README (hatchling requires README.md during metadata build)
COPY pyproject.toml README.md ./

# Install into a prefix directory so we can copy it cleanly
RUN pip install --upgrade pip \
    && pip install --prefix=/install .


# ── Stage 3: Final lean runtime image ────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="Origin Hub Registry"
LABEL org.opencontainers.image.description="Central asset registry for Origin CLI"
LABEL org.opencontainers.image.source="https://github.com/YOUR_ORG/origin_hub_registry"

# Runtime env
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app" \
    PORT=8000 \
    WORKERS=1

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=python-builder /install /usr/local

# Copy application source
COPY app/ ./app/

# Copy the compiled React SPA (written to app/static by vite build)
COPY --from=node-builder /build/app/static ./app/static/

# Create persistent data directories and a non-root user
RUN mkdir -p /data /storage \
    && addgroup --system --gid 1001 appgroup \
    && adduser  --system --uid 1001 --ingroup appgroup --no-create-home appuser \
    && chown -R appuser:appgroup /data /storage /app

USER appuser

# Non-secret defaults (override via docker-compose env_file or -e flags)
ENV DATABASE_URL="sqlite+aiosqlite:////data/origin_hub.db" \
    STORAGE_PATH="/storage" \
    MAX_BUNDLE_SIZE_MB=50 \
    DEFAULT_PAGE_SIZE=20 \
    LOG_LEVEL="info"
# SECRET_KEY must be set at runtime — never bake secrets into an image.

EXPOSE ${PORT}

# Built-in liveness check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers ${WORKERS} --log-level ${LOG_LEVEL}"]
