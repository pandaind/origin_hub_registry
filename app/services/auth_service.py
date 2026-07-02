from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ResourceAlreadyExistsException
from app.core.security import generate_api_key
from app.models.user import ApiKey, User
from app.schemas.auth import RegisterRequest, RegisterResponse


async def register_user(db: AsyncSession, request: RegisterRequest) -> RegisterResponse:
    # Check if username or email exists
    stmt = select(User).where(
        (User.username == request.username) | (User.email == request.email)
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise ResourceAlreadyExistsException("User with this username or email")

    user = User(username=request.username, email=request.email)
    db.add(user)
    await db.flush()  # to get user.id

    raw_key, key_hash = generate_api_key()
    api_key = ApiKey(user_id=user.id, key_hash=key_hash)
    db.add(api_key)
    
    await db.commit()
    await db.refresh(user)

    return RegisterResponse(
        username=user.username,
        email=user.email,
        api_key=raw_key
    )
