"""Organization management API endpoints."""
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import HubException, ResourceNotFoundException
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.org import Organization, OrgMember
from app.models.user import User

router = APIRouter(prefix="/orgs", tags=["Organizations"])


class CreateOrgRequest(BaseModel):
    slug: str
    display_name: str
    is_public: bool = True

    @field_validator("slug")
    @classmethod
    def slug_valid(cls, v: str) -> str:
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Slug may only contain letters, numbers, hyphens, and underscores")
        if len(v) < 2 or len(v) > 64:
            raise ValueError("Slug must be 2–64 characters")
        return v.lower()


class AddMemberRequest(BaseModel):
    username: str
    role: str = "member"


class OrgOut(BaseModel):
    id: str
    slug: str
    display_name: str
    is_public: bool
    member_count: int = 0
    model_config = {"from_attributes": True}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=OrgOut)
async def create_org(
    req: CreateOrgRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new organization namespace. The creator becomes the owner."""
    # Check slug uniqueness
    result = await db.execute(select(Organization).where(Organization.slug == req.slug))
    if result.scalar_one_or_none():
        raise HubException(409, f"Organization '@{req.slug}' already exists")

    org = Organization(
        slug=req.slug,
        display_name=req.display_name,
        is_public=req.is_public,
        owner_id=user.id,
    )
    db.add(org)
    await db.flush()

    # Add creator as owner member
    db.add(OrgMember(org_id=org.id, user_id=user.id, role="owner"))
    await db.commit()
    await db.refresh(org)

    return OrgOut(id=org.id, slug=org.slug, display_name=org.display_name, is_public=org.is_public, member_count=1)


@router.post("/{slug}/members", status_code=status.HTTP_201_CREATED)
async def add_member(
    slug: str,
    req: AddMemberRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a user to an organization. Only the org owner can do this."""
    result = await db.execute(
        select(Organization).options(selectinload(Organization.members)).where(Organization.slug == slug)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise ResourceNotFoundException("Organization")

    if org.owner_id != user.id:
        raise HubException(403, "Only the organization owner can add members")

    # Find the target user
    user_result = await db.execute(select(User).where(User.username == req.username))
    target = user_result.scalar_one_or_none()
    if not target:
        raise ResourceNotFoundException("User")

    # Check if already a member
    already = any(m.user_id == target.id for m in org.members)
    if already:
        raise HubException(409, f"{req.username} is already a member of @{slug}")

    db.add(OrgMember(org_id=org.id, user_id=target.id, role=req.role))
    await db.commit()
    return {"message": f"Added {req.username} to @{slug} as {req.role}"}


@router.get("/{slug}/members")
async def list_members(slug: str, db: AsyncSession = Depends(get_db)):
    """List members of an organization."""
    result = await db.execute(
        select(Organization).options(selectinload(Organization.members)).where(Organization.slug == slug)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise ResourceNotFoundException("Organization")

    members = []
    for m in org.members:
        user_result = await db.execute(select(User).where(User.id == m.user_id))
        u = user_result.scalar_one_or_none()
        if u:
            members.append({"username": u.username, "role": m.role})

    return {"org": org.slug, "members": members}
