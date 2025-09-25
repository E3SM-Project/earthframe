from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExternalLinkIn(BaseModel):
    link_type: Literal["diagnosticLinks", "paceLinks", "docs", "other"]
    url: str
    label: str | None = None


class ExternalLinkOut(ExternalLinkIn):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
