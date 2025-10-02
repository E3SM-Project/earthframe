from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.artifact import ArtifactIn, ArtifactOut
from app.schemas.base import CamelInModel, CamelOutModel
from app.schemas.link import ExternalLinkIn, ExternalLinkOut


class SimulationCreate(CamelInModel):
    # required
    name: str
    case_name: str
    compset: str
    compset_alias: str
    grid_name: str
    grid_resolution: str
    initialization_type: str
    simulation_type: str
    status: str
    machine_id: UUID
    model_start_date: datetime

    # optional
    version_tag: str | None = None
    git_hash: str | None = None
    parent_simulation_id: UUID | None = None
    campaign_id: str | None = None
    experiment_type_id: str | None = None
    group_name: str | None = None
    simulation_end_date: datetime | None = None
    total_years: float | None = None
    run_start_date: datetime | None = None
    run_end_date: datetime | None = None
    compiler: str | None = None
    notes_markdown: str | None = None
    known_issues: str | None = None
    branch: str | None = None
    external_repo_url: str | None = None
    uploaded_by: str | None = None
    upload_date: datetime | None = None
    last_modified: datetime | None = None
    last_edited_by: str | None = None
    last_edited_at: datetime | None = None
    extra: dict = {}

    artifacts: list[ArtifactIn] | None = None
    links: list[ExternalLinkIn] | None = None


class SimulationOut(CamelOutModel):
    # Required fields.
    id: UUID
    name: str
    case_name: str
    compset: str
    compset_alias: str
    grid_name: str
    grid_resolution: str
    initialization_type: str
    simulation_type: str
    status: str
    machine_id: UUID
    model_start_date: datetime

    # Optional fields.
    version_tag: str | None = None
    git_hash: str | None = None
    parent_simulation_id: UUID | None = None
    campaign_id: str | None = None
    experiment_type_id: str | None = None
    group_name: str | None = None
    simulation_end_date: datetime | None = None
    total_years: float | None = None
    run_start_date: datetime | None = None
    run_end_date: datetime | None = None
    compiler: str | None = None
    notes_markdown: str | None = None
    known_issues: str | None = None
    branch: str | None = None
    external_repo_url: str | None = None
    uploaded_by: str | None = None
    upload_date: datetime | None = None
    last_modified: datetime | None = None
    last_edited_by: str | None = None
    last_edited_at: datetime | None = None
    extra: dict = {}

    created_at: datetime
    updated_at: datetime

    artifacts: list[ArtifactOut] = Field(default_factory=list)
    links: list[ExternalLinkOut] = Field(default_factory=list)
