from datetime import datetime
from uuid import uuid4

from app.schemas.artifact import ArtifactOut
from app.schemas.link import ExternalLinkOut
from app.schemas.simulation import SimulationCreate, SimulationOut
from app.schemas.utils import to_snake_case


class TestSimulationCreate:
    def test_simulation_create_required_fields(self):
        payload = {
            "name": "Test Simulation",
            "case_name": "test_case",
            "compset": "AQUAPLANET",
            "compset_alias": "QPC4",
            "grid_name": "f19_f19",
            "grid_resolution": "1.9x2.5",
            "initialization_type": "startup",
            "simulation_type": "control",
            "status": "new",
            "machine_id": uuid4(),
            "model_start_date": datetime(2023, 1, 1, 0, 0, 0),
        }

        simulation_create = SimulationCreate(**payload)  # type: ignore
        for key, value in payload.items():
            assert getattr(simulation_create, key) == value

    def test_simulation_create_required_fields_camel_case(self):
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
            "machineId": uuid4(),
            "modelStartDate": datetime(2023, 1, 1, 0, 0, 0),
        }

        simulation_create = SimulationCreate(**payload)  # type: ignore
        for key, value in payload.items():
            snake_case_key = to_snake_case(key)
            assert getattr(simulation_create, snake_case_key) == value

    def test_simulation_create_optional_fields_snake_case(self):
        payload = {
            "name": "Test Simulation",
            "case_name": "test_case",
            "compset": "AQUAPLANET",
            "compset_alias": "QPC4",
            "grid_name": "f19_f19",
            "grid_resolution": "1.9x2.5",
            "initialization_type": "startup",
            "simulation_type": "control",
            "status": "new",
            "machine_id": uuid4(),
            "model_start_date": datetime(2023, 1, 1, 0, 0, 0),
            "version_tag": "v1.0",
            "git_hash": "abc123",
            "parent_simulation_id": uuid4(),
            "campaign_id": "campaign1",
            "experiment_type_id": "exp1",
            "group_name": "group1",
            "simulation_end_date": datetime(2023, 12, 31, 0, 0, 0),
            "total_years": 1.0,
            "run_start_date": datetime(2023, 1, 1, 0, 0, 0),
            "run_end_date": datetime(2023, 12, 31, 0, 0, 0),
            "compiler": "gcc",
            "notes_markdown": "Some notes",
            "known_issues": "No known issues",
            "branch": "main",
            "external_repo_url": "http://example.com/repo",
            "uploaded_by": "user1",
            "upload_date": datetime(2023, 1, 1, 0, 0, 0),
            "last_modified": datetime(2023, 1, 2, 0, 0, 0),
            "last_edited_by": "user2",
            "last_edited_at": datetime(2023, 1, 2, 0, 0, 0),
            "extra": {"key": "value"},
            "artifacts": [
                {
                    "kind": "outputPath",
                    "uri": "http://example.com/artifact1",
                    "label": "artifact1",
                }
            ],
            "links": [
                {
                    "link_type": "diagnosticLinks",
                    "url": "http://example.com/link1",
                    "label": "link1",
                }
            ],
        }

        simulation_create = SimulationCreate(**payload)  # type: ignore

        for key, value in payload.items():
            if key in ["artifacts", "links"]:
                assert len(getattr(simulation_create, key)) == len(value)  # type: ignore
                for i, item in enumerate(value):  # type: ignore
                    for attr, attr_value in item.items():
                        assert (
                            getattr(getattr(simulation_create, key)[i], attr)
                            == attr_value
                        )
            else:
                assert getattr(simulation_create, key) == value

    def test_simulation_create_optional_fields_camel_case(self):
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
            "machineId": uuid4(),
            "modelStartDate": datetime(2023, 1, 1, 0, 0, 0),
            "versionTag": "v1.0",
            "gitHash": "abc123",
            "parentSimulationId": uuid4(),
            "campaignId": "campaign1",
            "experimentTypeId": "exp1",
            "groupName": "group1",
            "simulationEndDate": datetime(2023, 12, 31, 0, 0, 0),
            "totalYears": 1.0,
            "runStartDate": datetime(2023, 1, 1, 0, 0, 0),
            "runEndDate": datetime(2023, 12, 31, 0, 0, 0),
            "compiler": "gcc",
            "notesMarkdown": "Some notes",
            "knownIssues": "No known issues",
            "branch": "main",
            "externalRepoUrl": "http://example.com/repo",
            "uploadedBy": "user1",
            "uploadDate": datetime(2023, 1, 1, 0, 0, 0),
            "lastModified": datetime(2023, 1, 2, 0, 0, 0),
            "lastEditedBy": "user2",
            "lastEditedAt": datetime(2023, 1, 2, 0, 0, 0),
            "extra": {"key": "value"},
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

        simulation_create = SimulationCreate(**payload)  # type: ignore
        for key, value in payload.items():
            if key in ["artifacts", "links"]:
                assert len(getattr(simulation_create, key)) == len(value)  # type: ignore
                for i, item in enumerate(value):  # type: ignore
                    for attr, attr_value in item.items():
                        assert (
                            getattr(getattr(simulation_create, key)[i], attr)
                            == attr_value
                        )
            else:
                assert getattr(simulation_create, key) == value


class TestSimulationOut:
    def test_simulation_out_required_fields(self):
        payload = {
            "id": uuid4(),
            "name": "Test Simulation",
            "caseName": "test_case",
            "compSet": "AQUAPLANET",
            "compSetAlias": "QPC4",
            "gridName": "f19_f19",
            "gridResolution": "1.9x2.5",
            "initializationType": "startup",
            "simulationType": "control",
            "status": "new",
            "machineId": uuid4(),
            "modelStartDate": datetime(2023, 1, 1, 0, 0, 0),
            "createdAt": datetime(2023, 1, 1, 0, 0, 0),
            "updatedAt": datetime(2023, 1, 2, 0, 0, 0),
        }

        simulation_out = SimulationOut(**payload)  # type: ignore
        for key, value in payload.items():
            assert getattr(simulation_out, key) == value

    def test_simulation_out_optional_fields(self):
        # FIXME: This test is failing.
        payload = {
            "id": uuid4(),
            "name": "Test Simulation",
            "caseName": "test_case",
            "compSet": "AQUAPLANET",
            "compSetAlias": "QPC4",
            "gridName": "f19_f19",
            "gridResolution": "1.9x2.5",
            "initializationType": "startup",
            "simulationType": "control",
            "status": "new",
            "machineId": uuid4(),
            "modelStartDate": datetime(2023, 1, 1, 0, 0, 0),
            "versionTag": "v1.0",
            "gitHash": "abc123",
            "parentSimulationId": uuid4(),
            "campaignId": "campaign1",
            "experimentTypeId": "exp1",
            "groupName": "group1",
            "simulationEndDate": datetime(2023, 12, 31, 0, 0, 0),
            "totalYears": 1.0,
            "runStartDate": datetime(2023, 1, 1, 0, 0, 0),
            "runEndDate": datetime(2023, 12, 31, 0, 0, 0),
            "compiler": "gcc",
            "notesMarkdown": "Some notes",
            "knownIssues": "No known issues",
            "branch": "main",
            "externalRepoUrl": "http://example.com/repo",
            "uploadedBy": "user1",
            "uploadDate": datetime(2023, 1, 1, 0, 0, 0),
            "lastModified": datetime(2023, 1, 2, 0, 0, 0),
            "lastEditedBy": "user2",
            "lastEditedAt": datetime(2023, 1, 2, 0, 0, 0),
            "extra": {"key": "value"},
            "artifacts": [
                ArtifactOut(
                    name="artifact1",
                    type="file",
                    url="http://example.com/artifact1",
                    kind="outputPath",
                    uri="/data/artifact1.nc",
                )
            ],
            "links": [
                ExternalLinkOut(
                    name="link1",
                    url="http://example.com/link1",
                    link_type="diagnosticLinks",
                )
            ],
            "createdAt": datetime(2023, 1, 1, 0, 0, 0),
            "updatedAt": datetime(2023, 1, 2, 0, 0, 0),
        }

        simulation_out = SimulationOut(**payload)  # type: ignore
        for key, value in payload.items():
            if key in ["artifacts", "links"]:
                assert len(getattr(simulation_out, key)) == len(value)
                for i, item in enumerate(value):  # type: ignore
                    for attr, attr_value in item.dict().items():
                        assert (
                            getattr(getattr(simulation_out, key)[i], attr) == attr_value
                        )
            else:
                assert getattr(simulation_out, key) == value
