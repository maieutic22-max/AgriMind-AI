from fastapi import APIRouter
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.system import router as system_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.finance import router as finance_router
from app.api.v1.routes.profitability import router as profitability_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(system_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(profitability_router)
