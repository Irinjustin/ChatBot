from database import SessionLocal

from services.milvus_service import (
    index_website,
)

db = SessionLocal()

index_website(
    db=db,
    admin_id=3
)

db.close()