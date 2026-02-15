from fastapi import APIRouter

from app.api.routes import admin, auth, health, member_profiles, profile_share, public, registrations

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(member_profiles.router, tags=["member_profiles"])
api_router.include_router(profile_share.router, tags=["profile_share"])
api_router.include_router(public.router, tags=["public"])
api_router.include_router(admin.router, tags=["admin"])
