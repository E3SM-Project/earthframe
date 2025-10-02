from datetime import datetime
from uuid import UUID

from app.schemas.base import CamelInModel, CamelOutModel


class MachineCreate(CamelInModel):
    name: str
    site: str
    architecture: str
    scheduler: str
    gpu: bool = False
    notes: str | None = None


class MachineOut(CamelOutModel):
    id: UUID
    name: str
    site: str
    architecture: str
    scheduler: str
    gpu: bool
    created_at: datetime
    updated_at: datetime
    notes: str | None = None
