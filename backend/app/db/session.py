from collections.abc import Generator
import logging
import os

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def _build_engine(database_url: str):
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    return create_engine(database_url, pool_pre_ping=True, connect_args=connect_args)


def _resolve_engine():
    primary_url = settings.database_url
    primary_engine = _build_engine(primary_url)

    if primary_url.startswith("sqlite"):
        return primary_engine

    try:
        with primary_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return primary_engine
    except OperationalError:
        fallback_url = os.getenv("DATABASE_URL_FALLBACK", "sqlite:///./vedic_vivaha.db")
        logger.warning(
            "Primary database unavailable. Falling back to local sqlite database: %s",
            fallback_url,
        )
        return _build_engine(fallback_url)


engine = _resolve_engine()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
