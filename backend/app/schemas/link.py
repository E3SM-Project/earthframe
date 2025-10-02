from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.utils import to_camel_case


class ExternalLinkIn(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel_case, populate_by_name=True)

    link_type: Literal["diagnosticLinks", "paceLinks", "docs", "other"]
    url: str
    label: str | None = None


class ExternalLinkOut(ExternalLinkIn):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel_case, populate_by_name=True
    )

    id: UUID
    created_at: datetime
    updated_at: datetime
