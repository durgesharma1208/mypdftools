"""Application configuration loaded from environment variables and .env."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    max_file_size_mb: int = 50
    max_files: int = 10

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    libreoffice_path: str = ""
    ghostscript_path: str = ""

    temp_dir: str = "temp"
    output_dir: str = "output"

    request_timeout_seconds: int = 300

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def temp_directory(self) -> Path:
        path = Path(self.temp_dir)
        return path if path.is_absolute() else BACKEND_DIR / path

    @property
    def output_directory(self) -> Path:
        path = Path(self.output_dir)
        return path if path.is_absolute() else BACKEND_DIR / path

    def ensure_directories(self) -> None:
        self.temp_directory.mkdir(parents=True, exist_ok=True)
        self.output_directory.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()