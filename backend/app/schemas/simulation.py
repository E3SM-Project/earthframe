from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.artifact import ArtifactIn, ArtifactOut
from app.schemas.link import ExternalLinkIn, ExternalLinkOut


class SimulationCreate(BaseModel):
    # required (camelCase aliases preserved)
    name: str
    compset: str
    compSetAlias: str = Field(alias="compSetAlias")
    gridName: str = Field(alias="gridName")
    gridResolution: str = Field(alias="gridResolution")
    initializationType: str = Field(alias="initializationType")
    simulationType: str = Field(alias="simulationType")
    status: str
    machineId: UUID = Field(alias="machineId")
    modelStartDate: datetime = Field(alias="modelStartDate")

    # optional
    caseName: Optional[str] = None
    versionTag: Optional[str] = None
    gitHash: Optional[str] = None
    parentSimulationId: Optional[UUID] = None
    campaignId: Optional[str] = None
    experimentTypeId: Optional[str] = None
    groupName: Optional[str] = None
    simulationEndDate: Optional[datetime] = None
    totalYears: Optional[float] = None
    runStartDate: Optional[datetime] = None
    runEndDate: Optional[datetime] = None
    compiler: Optional[str] = None
    notesMarkdown: Optional[str] = None
    knownIssues: Optional[str] = None
    branch: Optional[str] = None
    externalRepoUrl: Optional[str] = None
    uploadedBy: Optional[str] = None
    uploadDate: Optional[datetime] = None
    lastModified: Optional[datetime] = None
    lastEditedBy: Optional[str] = None
    lastEditedAt: Optional[datetime] = None
    extra: dict = {}

    # child collections (optional)
    artifacts: list[ArtifactIn] | None = None
    links: list[ExternalLinkIn] | None = None

    model_config = ConfigDict(populate_by_name=True)


class SimulationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    compset: str
    compSetAlias: str
    gridName: str
    gridResolution: str
    initializationType: str
    simulationType: str
    status: str
    machineId: UUID
    modelStartDate: datetime

    # optionals echoed
    caseName: Optional[str] = None
    versionTag: Optional[str] = None
    gitHash: Optional[str] = None
    parentSimulationId: Optional[UUID] = None
    campaignId: Optional[str] = None
    experimentTypeId: Optional[str] = None
    groupName: Optional[str] = None
    simulationEndDate: Optional[datetime] = None
    totalYears: Optional[float] = None
    runStartDate: Optional[datetime] = None
    runEndDate: Optional[datetime] = None
    compiler: Optional[str] = None
    notesMarkdown: Optional[str] = None
    knownIssues: Optional[str] = None
    branch: Optional[str] = None
    externalRepoUrl: Optional[str] = None
    uploadedBy: Optional[str] = None
    uploadDate: Optional[datetime] = None
    lastModified: Optional[datetime] = None
    lastEditedBy: Optional[str] = None
    lastEditedAt: Optional[datetime] = None
    extra: dict = {}

    created_at: datetime
    updated_at: datetime

    artifacts: list[ArtifactOut] = []
    links: list[ExternalLinkOut] = []
