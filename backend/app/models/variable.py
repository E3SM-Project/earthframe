from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.simulation import Simulation


class Variable(Base):
    __tablename__ = "variables"
    name: Mapped[str] = mapped_column(String(100), primary_key=True)
    description: Mapped[str | None] = mapped_column(String(300))

    simulations: Mapped[list[Simulation]] = relationship(
        secondary="simulation_variables", back_populates="variables"
    )


class SimulationVariable(Base):
    __tablename__ = "simulation_variables"
    simulation_id: Mapped[str] = mapped_column(
        ForeignKey("simulations.id"), primary_key=True
    )
    variable_name: Mapped[str] = mapped_column(
        ForeignKey("variables.name"), primary_key=True
    )
