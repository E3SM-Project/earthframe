from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.machine import Machine
from app.schemas import MachineCreate, MachineOut

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.post("", response_model=MachineOut, status_code=status.HTTP_201_CREATED)
def create_machine(payload: MachineCreate, db: Session = Depends(get_db)):
    existing = db.query(Machine).filter(Machine.name == payload.name).first()

    if existing:
        raise HTTPException(
            status_code=400, detail="Machine with this name already exists"
        )

    machine = Machine(**payload.model_dump())

    db.add(machine)
    db.commit()
    db.refresh(machine)

    return machine


@router.get("", response_model=list[MachineOut])
def list_machines(db: Session = Depends(get_db)):
    machines = db.query(Machine).order_by(Machine.name.asc()).all()

    return machines


@router.get("/{machine_id}", response_model=MachineOut)
def get_machine(machine_id: UUID, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()

    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    return machine
