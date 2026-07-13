from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_admin_user
from app.db.database import get_db
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetListOut, AssetOut
from app.schemas.auth import RoleUpdateRequest, UserOut

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_admin_user)])


@router.get("/users", response_model=List[UserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    """List all registered users (Global Admin only)."""
    stmt = select(User)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: str,
    request: RoleUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Change a user's role (Global Admin only)."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = request.role
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Hard delete a user and all their resources (Global Admin only)."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()


@router.get("/assets", response_model=AssetListOut)
async def list_all_assets(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List all assets on the hub (Global Admin only)."""
    stmt = (
        select(Asset)
        .options(
            selectinload(Asset.author),
            selectinload(Asset.versions),
            selectinload(Asset.tags),
        )
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    assets = result.scalars().all()
    
    # We map the author's username for the schema
    for a in assets:
        if a.author:
            a.author = a.author.username
            
    return AssetListOut(
        items=assets,
        total=len(assets),
        limit=limit,
        offset=offset
    )


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    """Delete any asset by ID (Global Admin only)."""
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    await db.delete(asset)
    await db.commit()
