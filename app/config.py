from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "sqlite+aiosqlite:///./origin_hub.db"
    storage_path: str = "./storage"
    secret_key: str = "change-me-in-production"
    max_bundle_size_mb: int = 50
    default_page_size: int = 20

    @property
    def max_bundle_size_bytes(self) -> int:
        return self.max_bundle_size_mb * 1024 * 1024


settings = Settings()
