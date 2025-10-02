from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from .mixins import IDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.simulation import Simulation


class ExternalLink(Base, IDMixin, TimestampMixin):
    __tablename__ = "external_links"

    # diagnosticLinks, paceLinks, docs, other
    simulation_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="CASCADE")
    )
    link_type: Mapped[str] = mapped_column(String(50))
    url: Mapped[str] = mapped_column(String(1000))
    label: Mapped[Optional[str]] = mapped_column(String(200))

    simulation: Mapped["Simulation"] = relationship(
        back_populates="links",
        primaryjoin="ExternalLink.simulation_id==Simulation.id",
        passive_deletes=True,
    )
