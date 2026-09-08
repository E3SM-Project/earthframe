import json
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query

from app.common.schemas.base import CamelOutBaseModel

PACE_BASE_URL = "https://pace.ornl.gov"
PACE_LOOKUP_TIMEOUT_SECONDS = 2.5
PACE_CACHE_TTL_SECONDS = 300.0

_PACE_CACHE_LOCK = threading.Lock()
_PACE_CACHE: dict[str, tuple[float, str | None]] = {}

router = APIRouter(prefix="/pace", tags=["PACE"])


class PaceResolutionOut(CamelOutBaseModel):
    execution_id: str
    experiment_id: str | None


@router.get("/resolve", response_model=PaceResolutionOut)
def resolve_pace_execution(
    execution_id: Annotated[
        str,
        Query(
            ...,
            description="Simulation execution ID to resolve to a PACE experiment ID.",
        ),
    ],
) -> PaceResolutionOut:
    normalized_execution_id = _normalize_execution_id(execution_id)
    return PaceResolutionOut(
        execution_id=normalized_execution_id,
        experiment_id=_resolve_experiment_id(normalized_execution_id),
    )


def _normalize_execution_id(execution_id: str) -> str:
    normalized_execution_id = execution_id.strip()
    if not normalized_execution_id:
        raise HTTPException(status_code=422, detail="execution_id must not be blank")
    return normalized_execution_id


def _resolve_experiment_id(execution_id: str) -> str | None:
    cache_hit, cached_experiment_id = _get_cached_experiment_id(execution_id)
    if cache_hit:
        return cached_experiment_id

    request = urllib.request.Request(
        _build_pace_lookup_url(execution_id), headers={"Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(
            request, timeout=PACE_LOOKUP_TIMEOUT_SECONDS
        ) as response:
            if response.status != 200:
                experiment_id = None
            else:
                response_body = response.read().decode("utf-8")
                experiment_id = _parse_experiment_id(response_body)
    except (
        TimeoutError,
        UnicodeDecodeError,
        urllib.error.HTTPError,
        urllib.error.URLError,
    ):
        experiment_id = None

    _set_cached_experiment_id(execution_id, experiment_id)
    return experiment_id


def _build_pace_lookup_url(execution_id: str) -> str:
    encoded_execution_id = urllib.parse.quote(execution_id, safe="")
    return f"{PACE_BASE_URL}/ajax/specificSearch/lid:{encoded_execution_id}/expid"


def _parse_experiment_id(response_body: str) -> str | None:
    try:
        payload = json.loads(response_body)
    except json.JSONDecodeError:
        payload = response_body
    return _extract_experiment_id(payload)


def _extract_experiment_id(payload: Any) -> str | None:
    direct_experiment_id = _normalize_experiment_id(payload)
    if direct_experiment_id is not None:
        return direct_experiment_id
    if not isinstance(payload, list) or not payload or not isinstance(payload[0], dict):
        return None
    return _normalize_experiment_id(payload[0].get("expid"))


def _normalize_experiment_id(value: Any) -> str | None:
    if isinstance(value, int):
        return str(value)
    if not isinstance(value, str):
        return None
    normalized_experiment_id = value.strip()
    return normalized_experiment_id if normalized_experiment_id.isdigit() else None


def _get_cached_experiment_id(execution_id: str) -> tuple[bool, str | None]:
    now = time.monotonic()
    with _PACE_CACHE_LOCK:
        cached_entry = _PACE_CACHE.get(execution_id)
        if cached_entry is None:
            return False, None
        expires_at, experiment_id = cached_entry
        if expires_at <= now:
            _PACE_CACHE.pop(execution_id, None)
            return False, None
        return True, experiment_id


def _set_cached_experiment_id(execution_id: str, experiment_id: str | None) -> None:
    with _PACE_CACHE_LOCK:
        _PACE_CACHE[execution_id] = (
            time.monotonic() + PACE_CACHE_TTL_SECONDS,
            experiment_id,
        )
