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

    # LibreOffice & Ghostscript
    libreoffice_path: str = ""
    ghostscript_path: str = ""

    # Working directories (relative to backend/ unless absolute)
    temp_dir: str = "temp"
    output_dir: str = "output"
    tessdata_dir: str = "tessdata"

    request_timeout_seconds: int = 300

    # AI Document Intelligence configuration (provider-agnostic)
    api_key: str = ""
    ai_model: str = "gpt-4o-mini"
    ai_base_url: str = "https://api.openai.com/v1"
    ai_timeout_seconds: int = 60
    max_ai_document_pages: int = 100

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

    @property
    def tessdata_directory(self) -> Path:
        path = Path(self.tessdata_dir)
        return path if path.is_absolute() else BACKEND_DIR / path

    def get_api_key(self) -> str:
        """Dynamically read the current API_KEY from environment or .env file."""
        import os
        from dotenv import dotenv_values
        env_path = BACKEND_DIR / ".env"
        if env_path.exists():
            vals = dotenv_values(env_path)
            key = vals.get("API_KEY")
            if key and str(key).strip():
                return str(key).strip()
        return (os.environ.get("API_KEY") or self.api_key or "").strip()

    def get_ai_base_url(self) -> str:
        """Dynamically read AI_BASE_URL. If key is a Gemini key and base URL is default OpenAI, switch to Gemini endpoint."""
        import os
        from dotenv import dotenv_values
        env_path = BACKEND_DIR / ".env"
        configured_url = ""
        if env_path.exists():
            vals = dotenv_values(env_path)
            configured_url = str(vals.get("AI_BASE_URL") or "").strip()
        if not configured_url:
            configured_url = (os.environ.get("AI_BASE_URL") or self.ai_base_url).strip()

        key = self.get_api_key()
        # If user is using a Gemini API key (starts with AIzaSy or AQ.) and base_url is still openai.com
        if (key.startswith("AIzaSy") or key.startswith("AQ.")) and "api.openai.com" in configured_url:
            return "https://generativelanguage.googleapis.com/v1beta/openai"

        return configured_url

    def get_ai_model(self) -> str:
        """Dynamically read the current AI_MODEL from environment or .env file."""
        import os
        from dotenv import dotenv_values
        env_path = BACKEND_DIR / ".env"
        model = ""
        if env_path.exists():
            vals = dotenv_values(env_path)
            model = str(vals.get("AI_MODEL") or "").strip()
        if not model:
            model = (os.environ.get("AI_MODEL") or self.ai_model).strip()

        key = self.get_api_key()
        # If user has a Gemini key and model is still gpt-*, auto-default to gemini-3.6-flash
        if (key.startswith("AIzaSy") or key.startswith("AQ.")) and model.startswith("gpt-"):
            return "gemini-3.6-flash"

        return model

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.get_api_key())


    def ensure_directories(self) -> None:
        self.temp_directory.mkdir(parents=True, exist_ok=True)
        self.output_directory.mkdir(parents=True, exist_ok=True)
        self.tessdata_directory.mkdir(parents=True, exist_ok=True)



@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()