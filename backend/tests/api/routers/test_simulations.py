from uuid import uuid4

from sqlalchemy.orm import Session

from app.api.routers.simulations import (
    create_simulation,
    get_simulation,
    list_simulations,
)
from app.models.simulation import Simulation
from app.schemas.simulation import SimulationCreate


class TestCreateSimulation:
    def test_create_simulation_success(self, client, db: Session):
        payload = {  # type: ignore
            "name": "Test Simulation",
            "compset": "AQUAPLANET",
            "comp_set_alias": "AQUA",
            "grid_name": "f19_f19",
            "grid_resolution": "1.9x2.5",
            "initialization_type": "startup",
            "simulation_type": "climate",
            "status": "new",
            "machine_id": str(uuid4()),
            "model_start_date": "2023-01-01T00:00:00Z",
            "case_name": "test_case",
            "version_tag": "v1.0",
            "git_hash": "abc123",
            "parent_simulation_id": None,
            "campaign_id": "campaign_1",
            "experiment_type_id": "exp_1",
            "group_name": "test_group",
            "simulation_end_date": "2023-12-31T23:59:59Z",
            "total_years": 1.0,
            "run_start_date": "2023-01-01T00:00:00Z",
            "run_end_date": "2023-12-31T23:59:59Z",
            "compiler": "gcc",
            "notes_markdown": "This is a test simulation.",
            "known_issues": "None",
            "branch": "main",
            "external_repo_url": "http://example.com/repo",
            "uploaded_by": "tester",
            "upload_date": "2023-01-01T00:00:00Z",
            "last_modified": "2023-01-01T00:00:00Z",
            "last_edited_by": "tester",
            "last_edited_at": "2023-01-01T00:00:00Z",
            "extra": {},
            "artifacts": [
                {
                    "kind": "image",
                    "uri": "http://example.com/image.png",
                    "label": "Image",
                }
            ],
            "links": [
                {"link_type": "reference", "url": "http://example.com", "label": "Ref"}
            ],
        }
        # Test API endpoint
        r = client.post("/simulations", json=payload)
        assert r.status_code == 201

        data = r.json()
        assert data["name"] == payload["name"]
        assert len(data["artifacts"]) == 1
        assert len(data["links"]) == 1

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
