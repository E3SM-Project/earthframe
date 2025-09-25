from app.db.base import Base
from app import models  # noqa: F401 (ensures all models are imported)

target_metadata = Base.metadata
