from fastapi import APIRouter

from app.api.routes import admin, auth, health, registrations

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(admin.router, tags=["admin"])
