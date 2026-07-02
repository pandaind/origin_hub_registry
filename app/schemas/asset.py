from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

AssetType = Literal["skill", "agent", "instruction", "workflow", "extension"]


class BundleManifest(BaseModel):
    name: str
    version: str
    type: AssetType
    description: str = ""
    tags: List[str] = Field(default_factory=list)
    author: str
    origin_cli_min_version: str = "0.1.0"
    files: List[str] = Field(default_factory=list)


class AssetVersionOut(BaseModel):
    version: str
    published_at: datetime
    bundle_size: int
    yanked: bool
    manifest: dict

    model_config = {"from_attributes": True}


class AssetOut(BaseModel):
    id: str
    name: str
    type: AssetType
    description: str
    author: Optional[str] = None  # We will map author.username here in service
    created_at: datetime
    download_count: int
    tags: List[str] = Field(default_factory=list)
    latest_version: Optional[AssetVersionOut] = None
    versions: List[AssetVersionOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class AssetListOut(BaseModel):
    items: List[AssetOut]
    total: int
    limit: int
    offset: int
