# Origin Hub Registry

Central asset registry for the Origin CLI — publish, discover, and install AI workflow templates, skills, agents, and extensions.

## Features

### Core Capabilities (Phase 1)
- **User Authentication**: Secure registration and API Key generation.
- **Asset Management**: Upload and download asset bundles (`.originpkg`).
- **Discovery**: Search, filter, and list assets by type and tags.
- **Versioning**: Track asset versions, dependencies, and metadata history.

### Enterprise & Teams (Phase 2)
- **Organizations & Namespaces**: Group assets under an organization (e.g., `logicist/my-agent`).
- **Private Assets**: Restrict asset visibility and access strictly to organization members.
- **Role-Based Access Control (RBAC)**: Manage organization members and owners with distinct permissions.
- **Flexible Auth**: Serve public assets openly while enforcing authentication for private actions.

### Upcoming Roadmap (Phase 3 & 4)
- **Phase 3 (Metrics & Safety)**: Download statistics, version deprecation (yanking), and CI/CD webhooks.
- **Phase 4 (Scale)**: S3/CDN backend support and multi-registry federation for enterprise environments.

---

## Quick Start (Production / Docker)

The registry is fully containerized with a built-in React web UI. Data persists automatically in Docker volumes.

### 1. Setup Environment
```bash
# Copy the environment template
cp .env.example .env

# Generate a secure SECRET_KEY and paste it into .env
make gen-secret
```

### 2. Build and Run
```bash
# Build the production image (React UI is built automatically)
make build

# Start the registry in the background
make up
```

The registry UI and API will be available at **http://localhost:8000**

### 3. Docker Hub Alternative
Instead of building locally, you can pull the pre-built image:
```bash
docker pull logicist/origin-hub-registry:latest
```

---

## Documentation & Tools

- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **Postman Collection**: Import `OriginHubRegistry.postman_collection.json` to test all endpoints.

---

## Local Development

If you want to modify the code, use the local development setup which includes hot-reloading for both the API and the UI:

```bash
# Starts FastAPI (Port 8000) and Vite UI (Port 5173) with hot-reload
make dev
```

See the [Makefile](Makefile) for a complete list of helpful commands.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
