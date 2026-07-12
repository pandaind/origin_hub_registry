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
- **Phase 3 (Metrics & Safety)**: Download statistics and version deprecation (yanking).
- **Phase 4 (Scale)**: S3 backend support and multi-registry federation for enterprise environments.

---

## Quick Start

### Option A — Pull from Docker Hub (recommended for new machines)

No repo clone needed. Just download two files and run:

```bash
# 1. Download the standalone compose file and env template
curl -O https://raw.githubusercontent.com/pandaind/origin_hub_registry/master/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/pandaind/origin_hub_registry/master/.env.example
cp .env.example .env

# 2. Set a strong secret key in .env
#    (replace the CHANGE_ME value with the output of this command)
python3 -c "import secrets; print(secrets.token_hex(32))"

# 3. Pull the image and start
docker compose -f docker-compose.prod.yml up -d
```

The UI and API will be available at **http://localhost:8000**

To update to a newer release:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

### Option B — Build & Publish from this machine

```bash
# Clone the repo, then:
cp .env.example .env          # configure .env

make build                    # build the image locally
make publish                  # build + push to Docker Hub (requires docker login)

make up                       # start using the locally built image
make logs                     # tail logs
make down                     # stop
```

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
