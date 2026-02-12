from fastapi import APIRouter

from app.api.routes import auth, health, registrations

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(auth.router, tags=["auth"])
