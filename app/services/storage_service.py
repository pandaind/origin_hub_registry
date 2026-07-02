import json
import os
import tarfile
from pathlib import Path
from tempfile import NamedTemporaryFile

import aiofiles
from fastapi import UploadFile

from app.config import settings
from app.core.exceptions import HubException
from app.schemas.asset import BundleManifest


class StorageService:
    def __init__(self):
        self.storage_path = Path(settings.storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile, asset_name: str, version: str) -> str:
        """Saves uploaded file to storage and returns the relative path."""
        # Check size (basic protection, FastAPI also has limits)
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        
        if size > settings.max_bundle_size_bytes:
            raise HubException(413, f"File too large. Max size is {settings.max_bundle_size_mb}MB")

        dest_dir = self.storage_path / asset_name / version
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / f"{asset_name}-{version}.originpkg"

        async with aiofiles.open(dest_path, "wb") as out_file:
            while content := await file.read(1024 * 1024):  # 1MB chunks
                await out_file.write(content)
                
        return str(dest_path.relative_to(self.storage_path))

    def get_full_path(self, relative_path: str) -> Path:
        return self.storage_path / relative_path

    async def extract_manifest(self, bundle_path_rel: str) -> BundleManifest:
        """Extracts and parses hub-manifest.json from the tarball."""
        full_path = self.get_full_path(bundle_path_rel)
        if not full_path.exists():
            raise HubException(500, "Bundle file not found after save")

        try:
            with tarfile.open(full_path, "r:gz") as tar:
                manifest_member = None
                for member in tar.getmembers():
                    # Handle potential leading slashes or directories
                    if member.name.endswith("hub-manifest.json"):
                        manifest_member = member
                        break
                
                if not manifest_member:
                    raise HubException(400, "hub-manifest.json not found in bundle")
                
                f = tar.extractfile(manifest_member)
                if not f:
                    raise HubException(500, "Failed to read hub-manifest.json from bundle")
                    
                data = json.loads(f.read().decode("utf-8"))
                return BundleManifest(**data)
                
        except tarfile.TarError:
            raise HubException(400, "Invalid archive format. Expected tar.gz (.originpkg)")
        except json.JSONDecodeError:
            raise HubException(400, "hub-manifest.json contains invalid JSON")
        except Exception as e:
            if isinstance(e, HubException):
                raise
            raise HubException(400, f"Failed to parse manifest: {e}")

storage_service = StorageService()
