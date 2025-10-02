from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# SQLAlchemy 2.0-style engine (sync)
engine = create_engine(settings.database_url, pool_pre_ping=True)


# autoflush=False: Disables auto flushing of changes before a query for control.
# autocommit=False: Requires explicit commit for better transaction control.
# future=True: Enables SQLAlchemy 2.0-style behavior for forward compatibility.
# expire_on_commit=False: Prevents auto-expiry of objects post commit for performance.
SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, future=True, expire_on_commit=False
)
