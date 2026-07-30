from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import LoginRequest, TokenResponse, UserCreate, AdminResponse
from security import verify_password, create_access_token, hash_password
from dependencies import get_current_user
from models import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register",
    response_model=AdminResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: UserCreate,
    db: Session = Depends(get_db)
):

    existing_email = crud.get_user_by_email(
        db,
        data.email
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    existing_username = crud.get_user_by_username(
        db,
        data.username
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists."
        )

    user = crud.create_user(
        db=db,
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
        role="ADMIN"          # Always create clients as ADMIN
    )

    return user
@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = crud.get_user_by_email(
        db,
        data.email
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(
    {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role
    }
)

    return TokenResponse(
    access_token=token,
    token_type="bearer",
    role=user.role
)

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }