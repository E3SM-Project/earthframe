from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ArtifactIn(BaseModel):
    kind: Literal[
        "outputPath", "archivePath", "runScriptPath", "postprocessingScriptPath"
    ]
    uri: str
    label: str | None = None


class ArtifactOut(ArtifactIn):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
