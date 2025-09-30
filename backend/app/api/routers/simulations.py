from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db
from app.db.artifact import Artifact
from app.db.link import ExternalLink
from app.db.simulation import Simulation
from app.schemas import SimulationCreate, SimulationOut

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("", response_model=SimulationOut, status_code=status.HTTP_201_CREATED)
def create_simulation(payload: SimulationCreate, db: Session = Depends(get_db)):
    try:
        # 1) Create the base Simulation
        sim = Simulation(
            **payload.model_dump(
                by_alias=False,
                exclude={"artifacts", "links"},
                exclude_unset=True,
            )
        )
        db.add(sim)
        db.flush()  # needed to get sim.id

        # 2) Related rows (batch insert if present)
        if payload.artifacts:
            db.add_all(
                [
                    Artifact(
                        simulation_id=sim.id, **artifact.model_dump(by_alias=False)
                    )
                    for artifact in payload.artifacts
                ]
            )
        if payload.links:
            db.add_all(
                [
                    ExternalLink(
                        simulation_id=sim.id, **link.model_dump(by_alias=False)
                    )
                    for link in payload.links
                ]
            )

        # 3) Commit once
        db.commit()

    except Exception:
        db.rollback()
        raise

    # 4) Reload with relations eagerly loaded (safe for serialization)
    sim_reload = db.get(
        Simulation,
        sim.id,
        options=(
            selectinload(Simulation.artifacts),
            selectinload(Simulation.links),
        ),
    )
    if sim_reload is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # 5) Serialize now (explicit makes debugging crystal clear)
    return SimulationOut.model_validate(sim_reload, from_attributes=True)


@router.get("", response_model=list[SimulationOut])
def list_simulations(db: Session = Depends(get_db)):
    """
    Retrieve a list of simulations from the database, ordered by creation date
    in descending order.

    Parameters
    ----------
    db : Session, optional
        The database session dependency, by default obtained via `Depends(get_db)`.

    Returns
    -------
    list
        A list of `Simulation` objects, ordered by their `created_at` timestamp
        in descending order.
    """

    sims = db.query(Simulation).order_by(Simulation.created_at.desc()).all()

    return sims


@router.get("/{sim_id}", response_model=SimulationOut)
def get_simulation(sim_id: UUID, db: Session = Depends(get_db)):
    """Retrieve a simulation by its unique identifier.

    Parameters
    ----------
    sim_id : UUID
        The unique identifier of the simulation to retrieve.
    db : Session, optional
        The database session dependency, by default provided by `Depends(get_db)`.

    Returns
    -------
    Simulation
        The simulation object if found.

    Raises
    ------
    HTTPException
        If the simulation with the given ID is not found, raises a 404 HTTP exception.
    """
    sim = db.query(Simulation).filter(Simulation.id == sim_id).first()

    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return sim
