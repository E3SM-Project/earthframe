from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.artifact import Artifact
from app.db.link import ExternalLink
from app.db.simulation import Simulation
from app.schemas import SimulationCreate, SimulationOut

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("", response_model=SimulationOut, status_code=status.HTTP_201_CREATED)
def create_simulation(payload: SimulationCreate, db: Session = Depends(get_db)):
    """
    Create a new simulation and store it in the database.

    Parameters
    ----------
    payload : SimulationCreate
        The data required to create a new simulation, including optional artifacts
        and external links.
    db : Session, optional
        The database session dependency, by default provided by `Depends(get_db)`.

    Returns
    -------
    Simulation
        The newly created simulation object with its associated data.

    Notes
    -----
    - The function first creates a `Simulation` object and assigns it an ID.
    - If artifacts are provided in the payload, they are added to the database
      and associated with the simulation.
    - If external links are provided in the payload, they are added to the database
      and associated with the simulation.
    - The database transaction is committed, and the simulation object is refreshed
      before being returned.
    """
    sim = Simulation(
        **payload.model_dump(exclude={"artifacts", "links"}, by_alias=True)
    )
    db.add(sim)

    # Assign sim.id by flushing to the DB.
    db.flush()

    # Add any provided artifacts to the database.
    if payload.artifacts:
        for a in payload.artifacts:
            artifact_obj = Artifact(
                simulation_id=sim.id,
                kind=a.kind,
                uri=a.uri,
                label=a.label,
            )
            db.add(artifact_obj)

    # Add any provided links to the database.
    if payload.links:
        for link in payload.links:
            link_obj = ExternalLink(
                simulation_id=sim.id,
                link_type=link.link_type,
                url=link.url,
                label=link.label,
            )
            db.add(link_obj)

    db.commit()
    db.refresh(sim)

    return sim


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
