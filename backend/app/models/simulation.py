from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.artifact import Artifact
    from app.models.link import ExternalLink
    from app.models.machine import Machine
    from app.models.variable import Variable


class Simulation(Base, IDMixin, TimestampMixin):
    __tablename__ = "simulations"

    # Required core (from screenshot)
    name: Mapped[str] = mapped_column(String(200), index=True)
    compset: Mapped[str] = mapped_column(String(120))
    compset_alias: Mapped[str] = mapped_column(String(120))
    grid_name: Mapped[str] = mapped_column(String(200))  # long name
    grid_resolution: Mapped[str] = mapped_column(String(50))
    initialization_type: Mapped[str] = mapped_column(String(50))
    simulation_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_lookup.code"), index=True
    )
    machine_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("machines.id"), index=True
    )
    model_start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Optional context / provenance
    case_name: Mapped[str | None] = mapped_column(String(200))
    version_tag: Mapped[str | None] = mapped_column(String(100))
    git_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    parent_simulation_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("simulations.id")
    )
    campaign_id: Mapped[str | None] = mapped_column(String(100))
    experiment_type_id: Mapped[str | None] = mapped_column(String(100))
    group_name: Mapped[str | None] = mapped_column(String(120))

    # Timeline
    simulation_end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    total_years: Mapped[float | None] = mapped_column(Float)
    run_start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    run_end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Build / code
    compiler: Mapped[str | None] = mapped_column(String(100))
    branch: Mapped[str | None] = mapped_column(String(200))
    external_repo_url: Mapped[str | None] = mapped_column(String(500))

    # Notes & issues
    notes_markdown: Mapped[str | None] = mapped_column(Text)
    known_issues: Mapped[str | None] = mapped_column(Text)

    # Provenance & audit (explicit, optional; we still keep created_at/updated_at)
    uploaded_by: Mapped[str | None] = mapped_column(String(100))
    upload_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_modified: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_edited_by: Mapped[str | None] = mapped_column(String(100))
    last_edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Extension bucket
    extra: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    machine: Mapped[Machine] = relationship(
        back_populates="simulations", foreign_keys=[machine_id]
    )
    parent: Mapped[Simulation] = relationship(remote_side="Simulation.id")
    variables: Mapped[list[Variable]] = relationship(
        secondary="simulation_variables", back_populates="simulations"
    )
    artifacts: Mapped[list[Artifact]] = relationship(
        back_populates="simulation", cascade="all, delete-orphan"
    )
    links: Mapped[list[ExternalLink]] = relationship(
        back_populates="simulation", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("name", "version_tag", name="uq_simulation_name_version"),
    )
