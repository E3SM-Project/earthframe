from uuid import uuid4

from app.models.simulation import Simulation
from sqlalchemy.orm import Session

from app.api.routers.simulations import (
    create_simulation,
    get_simulation,
    list_simulations,
)
from app.schemas.simulation import SimulationCreate


class TestCreateSimulation:
    def test_create_simulation_success(self, client, db: Session):
        payload = {
            "name": "Test Simulation",
            "caseName": "test_case",
            "compset": "AQUAPLANET",
            "compsetAlias": "QPC4",
            "gridName": "f19_f19",
            "gridResolution": "1.9x2.5",
            "initializationType": "startup",
            "simulationType": "control",
            "status": "new",
            "machineId": str(uuid4()),
            "modelStartDate": "2023-01-01T00:00:00Z",
            "versionTag": "v1.0",
            "gitHash": "abc123",
            "artifacts": [
                {
                    "name": "artifact1",
                    "type": "file",
                    "url": "http://example.com/artifact1",
                    "kind": "outputPath",
                    "uri": "/data/artifact1.nc",
                }
            ],
            "links": [
                {
                    "name": "link1",
                    "url": "http://example.com/link1",
                    "linkType": "diagnosticLinks",
                }
            ],
        }

        # # Test API endpoint
        # r = client.post("/simulations", json=payload)
        # assert r.status_code == 201

        # data = r.json()
        # assert data["name"] == payload["name"]
        # assert len(data["artifacts"]) == 1
        # assert len(data["links"]) == 1

        # Test function directly
        simulation_create = SimulationCreate(**payload)  # type: ignore
        simulation = create_simulation(simulation_create, db)
        assert simulation.name == payload["name"]
        assert len(simulation.artifacts) == 1
        assert len(simulation.links) == 1


class TestListSimulations:
    def test_list_simulations_empty(self, client, db: Session):
        # Test API endpoint
        r = client.get("/simulations")
        assert r.status_code == 200
        assert r.json() == []

        # Test function directly
        simulations = list_simulations(db)
        assert simulations == []

    def test_list_simulations_with_data(self, db: Session, client):
        sim = Simulation(name="Test Simulation", description="A test simulation")
        db.add(sim)
        db.commit()
        db.refresh(sim)

        # Test API endpoint
        r = client.get("/simulations")
        assert r.status_code == 200

        data = r.json()
        assert len(data) == 1
        assert data[0]["name"] == sim.name

        # Test function directly
        simulations = list_simulations(db)
        assert len(simulations) == 1
        assert simulations[0].name == sim.name


class TestGetSimulation:
    def test_get_simulation_success(self, db: Session, client):
        sim = Simulation(name="Test Simulation", description="A test simulation")
        db.add(sim)
        db.commit()
        db.refresh(sim)

        # Test API endpoint
        r = client.get(f"/simulations/{sim.id}")
        assert r.status_code == 200
        assert r.json()["name"] == sim.name

        # Test function directly
        simulation = get_simulation(sim.id, db)
        assert simulation.name == sim.name

    def test_get_simulation_not_found(self, client, db: Session):
        # Test API endpoint
        r = client.get(f"/simulations/{uuid4()}")
        assert r.status_code == 404
        assert r.json() == {"detail": "Simulation not found"}

        # Test function directly
        simulation = get_simulation(uuid4(), db)
        assert simulation is None
