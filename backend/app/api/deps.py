from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal()

    try:
        yield db
    finally:
        db.close()
