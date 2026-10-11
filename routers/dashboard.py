from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from dependencies import get_current_user
from logger import logger
from models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        stats = crud.get_dashboard_stats(
            db=db,
            admin_id=current_user.id,
            days=days
        )
        return stats
    except Exception as e:
        logger.error(f"Fetch Dashboard Stats Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch dashboard statistics."
        )
