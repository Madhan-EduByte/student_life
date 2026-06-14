"""
DestinAI — Core Configuration
Loads all environment variables using Pydantic Settings.
"""

from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Application ──────────────────────────────────────
    APP_NAME: str = "DestinAI"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    SECRET_KEY: str = "change-this-in-production"

    # ── Database — MySQL ─────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "destinai_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "root123"
    DB_ROOT_PASSWORD: str = "root123"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # ── Cache — Redis ────────────────────────────────────
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "password"

    @property
    def REDIS_URL(self) -> str:
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # ── AI Engine ────────────────────────────────────────
    LLL_PROVIDER: str = ""
    LLL_MODEL: str = ""

    @property
    def AI_PRIMARY_MODEL(self) -> str:
        """Dynamically extract primary model/provider name from LLL_PROVIDER."""
        if self.LLL_PROVIDER and ":" in self.LLL_PROVIDER:
            return self.LLL_PROVIDER.split(":", 1)[0].strip().lower()
        return self.LLL_PROVIDER.strip().lower() if self.LLL_PROVIDER else "gemini"

    @property
    def AI_MODEL_NAME(self) -> str:
        """Dynamically return custom LLL_MODEL or empty default."""
        return self.LLL_MODEL

    @property
    def AI_FALLBACK_MODEL(self) -> str:
        return "openai"

    def _get_api_key(self, target_provider: str) -> str:
        """Helper to extract api key if LLL_PROVIDER matches target_provider."""
        if not self.LLL_PROVIDER or ":" not in self.LLL_PROVIDER:
            return ""
        prov, key = self.LLL_PROVIDER.split(":", 1)
        if prov.strip().lower() == target_provider.lower():
            return key.strip()
        return ""

    @property
    def GEMINI_API_KEY(self) -> str:
        return self._get_api_key("gemini")

    @property
    def OPENAI_API_KEY(self) -> str:
        return self._get_api_key("openai")

    @property
    def META_API_KEY(self) -> str:
        return self._get_api_key("meta")

    @property
    def PERPLEXITY_API_KEY(self) -> str:
        return self._get_api_key("perplexity")

    @property
    def GROK_API_KEY(self) -> str:
        return self._get_api_key("grok")

    @property
    def DEEPSEEK_API_KEY(self) -> str:
        return self._get_api_key("deepseek")

    # ── JWT Authentication ───────────────────────────────
    JWT_SECRET_KEY: str = "change-this-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Email ────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@destinai.com"

    # ── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def reload_from_env(self):
        """Reload configuration dynamically from environment and .env file."""
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_env = os.path.abspath(os.path.join(current_dir, "..", "..", ".env"))
        
        # Check if backend/.env exists, otherwise fall back to find_dotenv
        env_file_to_use = backend_env if os.path.exists(backend_env) else None
        
        try:
            import dotenv
            if env_file_to_use:
                dotenv.load_dotenv(env_file_to_use, override=True)
            else:
                dotenv.load_dotenv(dotenv.find_dotenv(usecwd=True), override=True)
        except Exception:
            pass

        # Instantiate Settings with specific _env_file to prevent it from loading root .env if Cwd differs
        new_settings = Settings(_env_file=env_file_to_use) if env_file_to_use else Settings()
        fields = getattr(self.__class__, "model_fields", None) or getattr(self, "__fields__", None)
        if fields:
            for field in fields:
                setattr(self, field, getattr(new_settings, field))

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
