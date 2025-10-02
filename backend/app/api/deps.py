from collections.abc import Generator
from contextlib import contextmanager

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@contextmanager
def transaction(db: Session):
    try:
        yield

        db.commit()
    except IntegrityError as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Constraint violation while writing to the database.",
        ) from e
    except Exception:
        db.rollback()

        raise
