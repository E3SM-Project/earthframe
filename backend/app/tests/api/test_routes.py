import pytest
from fastapi.testclient import TestClient
from app.api.routes import (
    router,
    Simulation,
    SimulationAnalysisRequest,
    Machine,
    SimulationType,
    Status,
)

client = TestClient(router)


@pytest.fixture
def simulation_payload():
    machine = Machine(
        id="machine1",
        name="Machine 1",
        site="Site A",
        architecture="x86_64",
        scheduler="SLURM",
        gpu="NVIDIA",
        notes="Test machine",
        created_at="2023-01-01T00:00:00Z",
    )

    simulation = Simulation(
        id="sim1",
        name="Simulation 1",
        caseName="Case A",
        ensembleMember="member1",
        versionTag="v1.0",
        compset="A compset",
        gridName="Grid A",
        gridResolution="1 degree",
        initializationType="Hybrid",
        compiler="Intel",
        parentSimulationId=None,
        modelStartDate="2023-01-01",
        modelEndDate="2023-12-31",
        calendarStartDate=None,
        simulationType=SimulationType.PRODUCTION,
        status=Status.RUNNING,
        campaignId="campaign1",
        experimentTypeId="exp1",
        machineId="machine1",
        variables=["var1", "var2"],
        uploadedBy="user1",
        uploadDate="2023-01-01T12:00:00Z",
        lastModified="2023-01-02T12:00:00Z",
        lastEditedBy="user2",
        lastEditedAt="2023-01-02T12:00:00Z",
        branch="main",
        branchTime="2023-01-01T12:00:00Z",
        gitHash="abc123",
        externalRepoUrl=None,
        runDate=None,
        outputPath=None,
        archivePaths=["/path/to/archive"],
        runScriptPaths=["/path/to/script"],
        batchLogPaths=None,
        postprocessingScriptPath=["/path/to/postprocess"],
        diagnosticLinks=None,
        paceLinks=None,
        keyFeatures=None,
        notesMarkdown=None,
        knownIssues=None,
        annotations=["annotation1"],
        machine=machine,
    )

    return SimulationAnalysisRequest(simulations=[simulation])


def test_analyze_simulations_single(simulation_payload):
    response = client.post("/analyze-simulations", json=simulation_payload.dict())
    assert response.status_code == 200
    assert "summary" in response.json()
    assert isinstance(response.json()["summary"], str)


def test_analyze_simulations_multiple(simulation_payload):
    # Duplicate the simulation to simulate multiple simulations
    simulation_payload.simulations.append(simulation_payload.simulations[0])
    response = client.post("/analyze-simulations", json=simulation_payload.dict())
    assert response.status_code == 200
    assert "summary" in response.json()
    assert isinstance(response.json()["summary"], str)


def test_analyze_simulations_empty():
    payload = SimulationAnalysisRequest(simulations=[])
    response = client.post("/analyze-simulations", json=payload.dict())
    assert response.status_code == 200
    assert "summary" in response.json()
    assert isinstance(response.json()["summary"], str)


def test_analyze_simulations_invalid_payload():
    response = client.post("/analyze-simulations", json={"invalid": "data"})
    assert response.status_code == 422  # Unprocessable Entity
