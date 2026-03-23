from __future__ import annotations

import threading
from typing import Any
from pathlib import Path

# Thread-safe in-memory session store
_LOCK = threading.Lock()

_sessions: dict[str, dict[str, Any]] = {}
"""
session_id -> {
  "dataframes": {filename: pd.DataFrame},
  "profiles": [DatasetProfile],
  "analysis": AnalysisResponse | None,
  "charts": [ChartMetadata],
  "chat_history": [{"role": str, "content": str}],
  "upload_dir": Path,
}
"""


def create_session(session_id: str, data: dict[str, Any]) -> None:
    with _LOCK:
        _sessions[session_id] = data


def get_session(session_id: str) -> dict[str, Any] | None:
    with _LOCK:
        return _sessions.get(session_id)


def update_session(session_id: str, updates: dict[str, Any]) -> None:
    with _LOCK:
        if session_id in _sessions:
            _sessions[session_id].update(updates)


def delete_session(session_id: str) -> None:
    with _LOCK:
        _sessions.pop(session_id, None)


def list_sessions() -> list[str]:
    with _LOCK:
        return list(_sessions.keys())
