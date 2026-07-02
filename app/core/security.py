import hashlib
import secrets

from fastapi import Depends, HTTPException, Security, status
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import ApiKey, User


api_key_header = APIKeyHeader(name="Authorization", auto_error=False)


def generate_api_key() -> tuple[str, str]:
    """Generates a raw key and its SHA-256 hash."""
    raw_key = f"ohub_{secrets.token_urlsafe(32)}"
    key_hash = hash_api_key(raw_key)
    return raw_key, key_hash


def hash_api_key(raw_key: str) -> str:
    """Returns SHA-256 hash of the API key."""
    # If the user passes 'Bearer ohub_...', strip 'Bearer '
    if raw_key.startswith("Bearer "):
        raw_key = raw_key[7:]
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


async def get_current_user(
    api_key_header: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db)
) -> User:
    """FastAPI dependency to validate API key and return the associated User."""
    if not api_key_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key missing from Authorization header",
        )

    key_hash = hash_api_key(api_key_header)

    stmt = select(ApiKey).where(ApiKey.key_hash == key_hash)
    result = await db.execute(stmt)
    api_key_obj = result.scalar_one_or_none()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )

    # Fetch user
    stmt_user = select(User).where(User.id == api_key_obj.user_id)
    user_result = await db.execute(stmt_user)
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
