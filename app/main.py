import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import assets, auth
from app.db.database import create_tables

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
