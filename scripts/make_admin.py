#!/usr/bin/env python3
import asyncio
import sys

from sqlalchemy import select

from app.db.database import AsyncSessionLocal
from app.models.user import User

async def make_admin(username_or_email: str):
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(
            (User.username == username_or_email) | (User.email == username_or_email)
        )
        result = await session.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            print(f"User '{username_or_email}' not found.")
            sys.exit(1)
            
        user.role = "admin"
        await session.commit()
        print(f"Success! User '{user.username}' is now an admin.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <username_or_email>")
        sys.exit(1)
        
    asyncio.run(make_admin(sys.argv[1]))
