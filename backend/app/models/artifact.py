from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.simulation import Simulation


class Artifact(Base, IDMixin, TimestampMixin):
    __tablename__ = "artifacts"

    simulation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    kind: Mapped[str] = mapped_column(
        String(50)
    )  # outputPath, archivePath, runScriptPath, postprocessingScriptPath
    uri: Mapped[str] = mapped_column(String(1000))
    label: Mapped[Optional[str]] = mapped_column(String(200))
    checksum: Mapped[Optional[str]] = mapped_column(String(128))
    size_bytes: Mapped[Optional[int]] = mapped_column(Integer)

    simulation: Mapped["Simulation"] = relationship(
        back_populates="artifacts", primaryjoin="Artifact.simulation_id==Simulation.id"
    )
