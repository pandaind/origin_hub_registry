# Origin Hub Registry

Central asset registry for Origin CLI.
Serves as the backend for `origin hub *` commands.

## Features (Phase 1)
- User registration & API Key generation
- Upload asset bundles (`.originpkg`)
- Download asset bundles
- Asset search & listing
- Asset metadata & version history

## Getting Started (Dev)

### Prerequisites
- Python 3.9+
- [uv](https://github.com/astral-sh/uv) or `pip`

### Installation
```bash
# Set up env
cp .env.example .env

# Create venv and install
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Run Server
```bash
# Starts uvicorn with hot-reload
hub
# or
uvicorn app.main:app --reload
```

Then visit:
- **API Docs:** http://localhost:8000/docs

---

## Running with Docker (Production/Shareable)

The registry is fully containerized and easy to run anywhere using Docker Compose. It automatically provisions persistent volumes for the SQLite database and asset storage.

1. Ensure Docker Desktop (or the Docker daemon) is running.
2. Build and start the container:
   ```bash
   docker-compose up --build -d
   ```
3. The server will be accessible at `http://localhost:8000`.

To stop the server:
```bash
docker-compose down
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
