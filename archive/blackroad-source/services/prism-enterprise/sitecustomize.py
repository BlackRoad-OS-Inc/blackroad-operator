"""Runtime compatibility patches for the BlackRoad Prism test suite.

This module is imported automatically by Python whenever it is present on the
import path (see :mod:`site`).  We use it to keep third-party dependency
behavior stable across the wide range of environments that run the tests.
"""

from __future__ import annotations

from functools import wraps
import inspect
from typing import Any, Type


def _patch_httpx_app_argument() -> None:
    """Allow ``httpx`` clients to accept the deprecated ``app=`` argument.

    FastAPI/Starlette's :class:`~fastapi.testclient.TestClient` (and several
    other internal tests) still rely on passing ``app=...`` to
    :class:`httpx.Client`/``AsyncClient``.  Newer releases of ``httpx`` removed
    this parameter, expecting callers to construct an ``ASGITransport`` instead.

    Rather than pinning an older version of ``httpx`` across the entire repo, we
    adapt the new API surface so it remains backwards compatible.  When the
    ``app`` keyword is provided we transparently create an ``ASGITransport`` and
    forward it through ``transport=``.
    """

    try:
        import httpx  # type: ignore
    except Exception:  # pragma: no cover - optional dependency in some envs
        return

    transport_factory = getattr(httpx, "ASGITransport", None)
    if transport_factory is None:  # pragma: no cover - extremely old httpx
        return

    def _needs_patch(cls: Type[Any]) -> bool:
        if getattr(cls, "__blackroad_patched__", False):
            return False
        try:
            sig = inspect.signature(cls.__init__)
        except (TypeError, ValueError):  # pragma: no cover - builtin/extension
            return False
        return "app" not in sig.parameters

    def _apply_patch(cls: Type[Any]) -> None:
        if not _needs_patch(cls):
            return

        original_init = cls.__init__

        @wraps(original_init)
        def patched_init(self: Any, *args: Any, app: Any = None, **kwargs: Any) -> None:
            if app is not None and "transport" not in kwargs:
                try:
                    kwargs["transport"] = transport_factory(app=app)
                except Exception:  # pragma: no cover - defensive
                    pass
            original_init(self, *args, **kwargs)

        cls.__init__ = patched_init  # type: ignore[assignment]
        setattr(cls, "__blackroad_patched__", True)

    for target in (httpx.Client, httpx.AsyncClient):
        _apply_patch(target)


_patch_httpx_app_argument()

