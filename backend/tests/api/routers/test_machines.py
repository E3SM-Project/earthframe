from uuid import uuid4

from sqlalchemy.orm import Session

from app.api.routers.machines import create_machine, get_machine, list_machines
from app.models.machine import Machine
from app.schemas.machine import MachineCreate


class TestCreateMachine:
    def test_create_machine_success(self, client, db: Session):
        payload = {"name": "Machine A", "description": "Test machine"}

        # Test the API endpoint
        r = client.post("/machines", json=payload)
        assert r.status_code == 201

        data = r.json()
        assert data["name"] == payload["name"]
        assert data["description"] == payload["description"]

        # Test the actual function
        machine_create = MachineCreate(**payload)
        machine = create_machine(machine_create, db)
        assert machine.name == payload["name"]
        assert machine.description == payload["description"]

    def test_create_machine_duplicate_name(self, db: Session, client):
        # Seed an existing machine
        db.add(Machine(name="Machine B", description="Existing machine"))
        db.commit()

        payload = {"name": "Machine B", "description": "Duplicate machine"}

        # Test the API endpoint
        r = client.post("/machines", json=payload)
        assert r.status_code == 400
        assert r.json()["detail"] == "Machine with this name already exists"

        # Test the actual function
        try:
            machine_create = MachineCreate(**payload)
            create_machine(machine_create, db)
        except ValueError as e:
            assert str(e) == "Machine with this name already exists"


class TestListMachines:
    def test_list_machines(self, db: Session, client):
        db.add_all(
            [
                Machine(name="Machine C", description="First machine"),
                Machine(name="Machine D", description="Second machine"),
            ]
        )
        db.commit()

        # Test the API endpoint
        r = client.get("/machines")
        assert r.status_code == 200
        data = r.json()

        # Don’t rely on DB ordering unless your API guarantees it
        names = {m["name"] for m in data}
        assert names == {"Machine C", "Machine D"}

        # Test the actual function
        machines = list_machines(db)
        machine_names = {m.name for m in machines}
        assert machine_names == {"Machine C", "Machine D"}


class TestGetMachine:
    def test_get_machine_success(self, db: Session, client):
        machine = Machine(name="Machine E", notes="Test machine")
        db.add(machine)
        db.commit()
        db.refresh(machine)

        # Test the API endpoint
        r = client.get(f"/machines/{machine.id}")
        assert r.status_code == 200

        data = r.json()
        assert data["name"] == machine.name
        assert data["description"] == machine.notes

        # Test the actual function
        fetched_machine = get_machine(machine.id, db)
        assert fetched_machine.name == machine.name
        assert fetched_machine.notes == machine.notes

    def test_get_machine_not_found(self, client, db: Session):
        random_id = uuid4()

        # Test the API endpoint
        r = client.get(f"/machines/{random_id}")
        assert r.status_code == 404
        assert r.json()["detail"] == "Machine not found"

        # Test the actual function
        fetched_machine = get_machine(random_id, db)
        assert fetched_machine is None
