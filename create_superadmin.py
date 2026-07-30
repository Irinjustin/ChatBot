from database import SessionLocal
from models import User
from security import hash_password


db = SessionLocal()

try:
    existing_user = (
        db.query(User)
        .filter(User.email == "admin@example.com")
        .first()
    )

    if existing_user:
        print("Super Admin already exists!")

    else:
        super_admin = User(
            username="superadmin",
            email="admin@example.com",
            password=hash_password("Admin@123"),
            role="SUPER_ADMIN"
        )

        db.add(super_admin)
        db.commit()

        print("Super Admin created successfully!")

finally:
    db.close()