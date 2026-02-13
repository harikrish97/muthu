from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Vedic Vivaha API"
    api_prefix: str = "/api"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/vedic_vivaha"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    admin_token: str = "dev-admin-token-change-me"
    enforce_credit_for_profile_access: bool = False
    member_session_secret: str = "change-me-member-session-secret"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
