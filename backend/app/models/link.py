from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .common import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.simulation import Simulation


class ExternalLink(Base, IDMixin, TimestampMixin):
    __tablename__ = "external_links"

    simulation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    link_type: Mapped[str] = mapped_column(
        String(50)
    )  # diagnosticLinks, paceLinks, docs, other
    url: Mapped[str] = mapped_column(String(1000))
    label: Mapped[Optional[str]] = mapped_column(String(200))

    simulation: Mapped["Simulation"] = relationship(
        back_populates="links", primaryjoin="ExternalLink.simulation_id==Simulation.id"
    )
