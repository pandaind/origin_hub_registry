import os

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import HubException, ResourceAlreadyExistsException, ResourceNotFoundException
from app.models.asset import Asset, AssetTag, AssetVersion
from app.models.user import User
from app.schemas.asset import AssetListOut, AssetOut
from app.services.storage_service import storage_service


async def upload_asset_bundle(db: AsyncSession, file: UploadFile, user: User, asset_name: str, version: str) -> AssetOut:
    """Handles upload, manifest extraction, DB insertion, and returns the updated Asset."""
    # 1. Save file to storage
    rel_path = await storage_service.save_upload(file, asset_name, version)
    
    try:
        # 2. Extract manifest
        manifest = await storage_service.extract_manifest(rel_path)
        
        # 3. Validate name and version match manifest
        if manifest.name != asset_name:
            raise HubException(400, f"Manifest name '{manifest.name}' does not match URL '{asset_name}'")
        if manifest.version != version:
            raise HubException(400, f"Manifest version '{manifest.version}' does not match URL '{version}'")

        file_size = os.path.getsize(storage_service.get_full_path(rel_path))

        # 4. Check if Asset exists
        stmt = select(Asset).options(selectinload(Asset.versions)).where(Asset.name == asset_name)
        result = await db.execute(stmt)
        asset = result.scalar_one_or_none()

        if asset:
            # Check ownership
            if asset.author_id != user.id:
                raise HubException(403, "You do not own this asset")
            
            # Check version uniqueness
            for existing_version in asset.versions:
                if existing_version.version == version:
                    raise ResourceAlreadyExistsException(f"Version {version} for {asset_name}")
            
            # Update description and type if changed
            asset.description = manifest.description
            asset.type = manifest.type
        else:
            # Create new Asset
            asset = Asset(
                name=asset_name,
                type=manifest.type,
                description=manifest.description,
                author_id=user.id
            )
            db.add(asset)
            await db.flush() # get asset.id

        # 5. Create AssetVersion
        new_version = AssetVersion(
            asset_id=asset.id,
            version=version,
            bundle_path=rel_path,
            bundle_size=file_size,
            manifest=manifest.model_dump()
        )
        db.add(new_version)

        # 6. Update tags
        # Simple replace for now
        stmt_delete_tags = select(AssetTag).where(AssetTag.asset_id == asset.id)
        res_tags = await db.execute(stmt_delete_tags)
        for t in res_tags.scalars():
            await db.delete(t)
            
        for tag_str in manifest.tags:
            db.add(AssetTag(asset_id=asset.id, tag=tag_str))

        await db.commit()
        await db.refresh(asset)
        
        return await get_asset(db, asset_name)

    except Exception as e:
        # Cleanup file on DB failure
        if os.path.exists(storage_service.get_full_path(rel_path)):
            os.remove(storage_service.get_full_path(rel_path))
        raise e


async def get_asset(db: AsyncSession, name: str) -> AssetOut:
    stmt = (
        select(Asset)
        .options(selectinload(Asset.versions), selectinload(Asset.tags), selectinload(Asset.author))
        .where(Asset.name == name)
    )
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise ResourceNotFoundException("Asset")

    # Map to schema
    asset_dict = {
        "id": asset.id,
        "name": asset.name,
        "type": asset.type,
        "description": asset.description,
        "author": asset.author.username if asset.author else None,
        "created_at": asset.created_at,
        "download_count": asset.download_count,
        "tags": [t.tag for t in asset.tags],
        "latest_version": asset.latest_version,
        "versions": asset.versions
    }
    return AssetOut.model_validate(asset_dict)


async def search_assets(db: AsyncSession, q: str = None, limit: int = 20, offset: int = 0) -> AssetListOut:
    stmt = select(Asset).options(selectinload(Asset.versions), selectinload(Asset.tags), selectinload(Asset.author))
    
    if q:
        stmt = stmt.where(Asset.name.ilike(f"%{q}%") | Asset.description.ilike(f"%{q}%"))
        
    stmt = stmt.limit(limit).offset(offset).order_by(Asset.download_count.desc())
    
    result = await db.execute(stmt)
    assets = result.scalars().all()
    
    # Total count (simplified for now)
    total = len(assets) if len(assets) < limit else offset + limit + 1
    
    items = []
    for asset in assets:
        asset_dict = {
            "id": asset.id,
            "name": asset.name,
            "type": asset.type,
            "description": asset.description,
            "author": asset.author.username if asset.author else None,
            "created_at": asset.created_at,
            "download_count": asset.download_count,
            "tags": [t.tag for t in asset.tags],
            "latest_version": asset.latest_version,
            "versions": []  # Omit full history in search
        }
        items.append(AssetOut.model_validate(asset_dict))

    return AssetListOut(items=items, total=total, limit=limit, offset=offset)


async def get_bundle_path(db: AsyncSession, name: str, version: str) -> str:
    stmt = (
        select(AssetVersion)
        .join(Asset)
        .where(Asset.name == name, AssetVersion.version == version)
    )
    result = await db.execute(stmt)
    v = result.scalar_one_or_none()
    
    if not v:
        raise ResourceNotFoundException("Asset version")
    
    if v.yanked:
        raise HubException(410, "This version has been yanked and is no longer available.")
        
    # Increment download count (fire and forget for this simplistic impl)
    stmt_inc = select(Asset).where(Asset.id == v.asset_id)
    res_asset = await db.execute(stmt_inc)
    a = res_asset.scalar_one()
    a.download_count += 1
    await db.commit()
    
    return v.bundle_path


async def recommend_assets(db: AsyncSession, tech_tags: list[str], limit: int = 10) -> AssetListOut:
    """Recommend assets based on overlapping tech tags and download count."""
    if not tech_tags:
        return AssetListOut(items=[], total=0, limit=limit, offset=0)

    # Convert to lowercase for matching
    tags_lower = [t.lower() for t in tech_tags]

    # Fetch all assets that have AT LEAST ONE matching tag
    stmt = (
        select(Asset)
        .join(Asset.tags)
        .options(selectinload(Asset.versions), selectinload(Asset.tags), selectinload(Asset.author))
        .where(AssetTag.tag.in_(tags_lower))
        .distinct()
    )
    result = await db.execute(stmt)
    assets = result.scalars().all()

    # Score them in memory (since SQLite doesn't have robust array intersection scoring)
    scored_assets = []
    for asset in assets:
        asset_tags_lower = {t.tag.lower() for t in asset.tags}
        overlap_count = len(set(tags_lower).intersection(asset_tags_lower))
        
        # Scoring algorithm: 10 points per matching tag, 1 point per 10 downloads
        score = (overlap_count * 10) + (asset.download_count / 10.0)
        scored_assets.append((score, asset))

    # Sort by score desc, then slice
    scored_assets.sort(key=lambda x: x[0], reverse=True)
    top_assets = [a[1] for a in scored_assets[:limit]]

    items = []
    for asset in top_assets:
        asset_dict = {
            "id": asset.id,
            "name": asset.name,
            "type": asset.type,
            "description": asset.description,
            "author": asset.author.username if asset.author else None,
            "created_at": asset.created_at,
            "download_count": asset.download_count,
            "tags": [t.tag for t in asset.tags],
            "latest_version": asset.latest_version,
            "versions": []  # Omit full history
        }
        items.append(AssetOut.model_validate(asset_dict))

    return AssetListOut(items=items, total=len(items), limit=limit, offset=0)
