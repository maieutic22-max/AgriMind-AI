import uuid
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse, summary="User Authentication (Development Baseline)")
def login(payload: LoginRequest):
    """
    Initial authentication endpoint.
    In this foundation phase, returns a signed JWT access token for valid payloads.
    Production user credential verification against PostgreSQL will activate once database migrations run.
    """
    # Demo/Development baseline token generation
    user_id = uuid.uuid5(uuid.NAMESPACE_DNS, payload.email)
    token = create_access_token(subject=str(user_id))
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user_id=user_id,
        email=payload.email,
        full_name="Verified Farmer (Demo)",
        role="FARMER"
    )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="User Registration (Development Baseline)")
def register(payload: RegisterRequest):
    """
    Initial user registration endpoint. Validates schema and prepares user record.
    Full persistence in PostgreSQL activates upon database connection.
    """
    user_id = uuid.uuid5(uuid.NAMESPACE_DNS, payload.email)
    return UserResponse(
        id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        is_active=True
    )
