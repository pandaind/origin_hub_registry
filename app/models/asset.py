import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

ASSET_TYPES = ("skill", "agent", "instruction", "workflow", "extension")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    author_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    download_count: Mapped[int] = mapped_column(Integer, default=0)

    author: Mapped[Optional[object]] = relationship("User", back_populates="assets")
    versions: Mapped[list["AssetVersion"]] = relationship(
        "AssetVersion", back_populates="asset", cascade="all, delete-orphan", order_by="AssetVersion.published_at.desc()"
    )
    tags: Mapped[list["AssetTag"]] = relationship(
        "AssetTag", back_populates="asset", cascade="all, delete-orphan"
    )

    @property
    def latest_version(self) -> Optional["AssetVersion"]:
        active = [v for v in self.versions if not v.yanked]
        return active[0] if active else None


class AssetVersion(Base):
    __tablename__ = "asset_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id: Mapped[str] = mapped_column(String, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    bundle_path: Mapped[str] = mapped_column(String(512), nullable=False)
    bundle_size: Mapped[int] = mapped_column(Integer, default=0)
    manifest: Mapped[dict] = mapped_column(JSON, nullable=False)
    yanked: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    asset: Mapped["Asset"] = relationship("Asset", back_populates="versions")


class AssetTag(Base):
    __tablename__ = "asset_tags"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id: Mapped[str] = mapped_column(String, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    tag: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="tags")
