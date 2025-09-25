from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base declarative class; Alembic uses Base.metadata."""

    pass
