from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, get_optional_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.asset import AssetListOut, AssetOut
from app.services import asset_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=AssetListOut)
async def list_assets(
    q: str = Query(None, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    caller: User | None = Depends(get_optional_user),
):
    """Search and list assets. Private org assets are shown only to members."""
    user_id = caller.id if caller else None
    return await asset_service.search_assets(db, q, limit, offset, user_id=user_id)


@router.get("/recommend", response_model=AssetListOut)
async def recommend_assets(
    tech: str = Query(..., description="Comma-separated list of tech tags (e.g. react,typescript)"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Recommend assets based on tech tags."""
    tech_tags = [t.strip() for t in tech.split(",") if t.strip()]
    return await asset_service.recommend_assets(db, tech_tags, limit)


@router.get("/{name}", response_model=AssetOut)
async def get_asset(
    name: str,
    db: AsyncSession = Depends(get_db),
    caller: User | None = Depends(get_optional_user),
):
    """Get an asset's metadata and version history."""
    user_id = caller.id if caller else None
    return await asset_service.get_asset(db, name, user_id=user_id)


@router.get("/{name}/versions")
async def list_asset_versions(name: str, db: AsyncSession = Depends(get_db)):
    """List all non-yanked versions for an asset in descending order."""
    asset = await asset_service.get_asset(db, name)
    return [
        {"version": v.version, "published_at": v.published_at}
        for v in asset.versions
        if not v.yanked
    ]


@router.post("/{name}/{version}", status_code=status.HTTP_201_CREATED, response_model=AssetOut)
async def upload_asset(
    name: str,
    version: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new .originpkg bundle for an asset."""
    return await asset_service.upload_asset_bundle(db, file, user, name, version)


@router.get("/{name}/{version}/bundle")
async def download_asset(name: str, version: str, db: AsyncSession = Depends(get_db)):
    """Download the .originpkg bundle for a specific version."""
    rel_path = await asset_service.get_bundle_path(db, name, version)
    full_path = storage_service.get_full_path(rel_path)
    
    return FileResponse(
        path=full_path,
        media_type="application/gzip",
        filename=f"{name}-{version}.originpkg"
    )
