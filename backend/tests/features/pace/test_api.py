import json
import urllib.error
import urllib.request
from urllib.parse import urlparse

import pytest

from app.api.version import API_BASE
from app.features.pace import api as pace_api


class FakeHttpResponse:
    def __init__(self, status: int, body: str) -> None:
        self.status = status
        self.body = body.encode("utf-8")

    def read(self) -> bytes:
        return self.body

    def __enter__(self) -> "FakeHttpResponse":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        return None


class TestResolvePaceExecution:
    @pytest.fixture(autouse=True)
    def clear_cache(self) -> None:
        pace_api._PACE_CACHE.clear()

    def test_returns_experiment_id_and_uses_encoded_fixed_url(
        self, client, monkeypatch
    ) -> None:
        captured_requests: list[urllib.request.Request] = []

        def fake_urlopen(
            request: urllib.request.Request, timeout: float
        ) -> FakeHttpResponse:
            captured_requests.append(request)
            assert timeout == pace_api.PACE_LOOKUP_TIMEOUT_SECONDS
            return FakeHttpResponse(200, json.dumps([{"expid": "228920"}]))

        monkeypatch.setattr(pace_api.urllib.request, "urlopen", fake_urlopen)

        response = client.get(
            f"{API_BASE}/pace/resolve", params={"execution_id": "lid/ 42?next=1"}
        )

        assert response.status_code == 200
        assert response.json() == {
            "executionId": "lid/ 42?next=1",
            "experimentId": "228920",
        }
        parsed_url = urlparse(captured_requests[0].full_url)
        assert parsed_url.scheme == "https"
        assert parsed_url.netloc == "pace.ornl.gov"
        assert (
            parsed_url.path == "/ajax/specificSearch/lid:lid%2F%2042%3Fnext%3D1/expid"
        )

    @pytest.mark.parametrize(
        "body",
        ["[]", "{not-json", json.dumps([{}]), json.dumps([{"expid": "invalid"}])],
    )
    def test_returns_null_for_missing_or_invalid_experiment_id(
        self, client, monkeypatch, body
    ) -> None:
        monkeypatch.setattr(
            pace_api.urllib.request,
            "urlopen",
            lambda *args, **kwargs: FakeHttpResponse(200, body),
        )

        response = client.get(f"{API_BASE}/pace/resolve", params={"execution_id": "x"})

        assert response.status_code == 200
        assert response.json() == {"executionId": "x", "experimentId": None}

    @pytest.mark.parametrize(
        "failure",
        [TimeoutError(), urllib.error.URLError("PACE unavailable")],
    )
    def test_returns_null_on_upstream_failure(
        self, client, monkeypatch, failure
    ) -> None:
        def fake_urlopen(*args, **kwargs):
            raise failure

        monkeypatch.setattr(pace_api.urllib.request, "urlopen", fake_urlopen)

        response = client.get(f"{API_BASE}/pace/resolve", params={"execution_id": "x"})

        assert response.status_code == 200
        assert response.json() == {"executionId": "x", "experimentId": None}

    def test_reuses_cached_resolution(self, client, monkeypatch) -> None:
        calls = 0

        def fake_urlopen(*args, **kwargs) -> FakeHttpResponse:
            nonlocal calls
            calls += 1
            return FakeHttpResponse(200, "214043")

        monkeypatch.setattr(pace_api.urllib.request, "urlopen", fake_urlopen)

        for _ in range(2):
            response = client.get(
                f"{API_BASE}/pace/resolve", params={"execution_id": "x"}
            )
            assert response.json() == {"executionId": "x", "experimentId": "214043"}

        assert calls == 1

    def test_rejects_blank_execution_id(self, client) -> None:
        response = client.get(f"{API_BASE}/pace/resolve", params={"execution_id": "  "})

        assert response.status_code == 422
