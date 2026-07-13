from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.exceptions import ResourceAlreadyExistsException
from app.core.security import generate_api_key, get_password_hash, verify_password
from app.models.user import ApiKey, User
from app.schemas.auth import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse


async def register_user(db: AsyncSession, request: RegisterRequest) -> RegisterResponse:
    # Check if username or email exists
    stmt = select(User).where(
        (User.username == request.username) | (User.email == request.email)
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise ResourceAlreadyExistsException("User with this username or email")

    hashed_password = get_password_hash(request.password)
    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        role="user"
    )
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


async def login_user(db: AsyncSession, request: LoginRequest) -> LoginResponse:
    # Find user by username or email
    stmt = select(User).where(
        (User.username == request.username_or_email) | (User.email == request.username_or_email)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate a new API key for the CLI session
    raw_key, key_hash = generate_api_key()
    api_key = ApiKey(user_id=user.id, key_hash=key_hash, name="CLI login key")
    db.add(api_key)
    await db.commit()

    return LoginResponse(
        api_key=raw_key
    )
