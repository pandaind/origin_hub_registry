import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api import assets, auth, orgs
from app.db.database import create_tables
from app.models import org  # noqa: F401 — ensures ORM tables are registered

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(
    title="Origin Hub Registry",
    description="Central asset registry for Origin CLI (skills, agents, instructions, workflows)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(orgs.router)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
async def dashboard():
    """Serve the Hub Registry web dashboard."""
    return FileResponse(STATIC_DIR / "index.html")


@app.on_event("startup")
async def on_startup():
    # Only for dev! In prod use alembic.
    await create_tables()


@app.get("/health")
async def health():
    return {"status": "ok"}


def start():
    """Entry point for `hub` CLI script."""
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
