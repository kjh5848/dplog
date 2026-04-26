from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class FormatActionResult:
    ok: bool
    action: str
    message: str = ""
    selector: str | None = None
    fallback: bool = False
    evidence: dict[str, Any] = field(default_factory=dict)
