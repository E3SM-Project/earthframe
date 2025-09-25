from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MachineCreate(BaseModel):
    name: str
    site: str
    architecture: str
    scheduler: str
    gpu: bool = False
    notes: str | None = None


class MachineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    site: str
    architecture: str
    scheduler: str
    gpu: bool
    created_at: datetime
    updated_at: datetime
    notes: str | None = None
