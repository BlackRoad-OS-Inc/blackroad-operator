"""FastAPI service powering the BlackRoad Prism console job runner."""

from __future__ import annotations

import asyncio
import contextlib
import threading
from collections.abc import Iterator
from typing import List, Tuple

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from .agent import jobs, store

app = FastAPI(title="BlackRoad Prism Console API")


@app.get("/jobs")
def list_jobs(limit: int = 20) -> List[dict]:
    """Return the most recent jobs."""
    safe_limit = max(1, min(int(limit), 200))
    return store.list_jobs(limit=safe_limit)


@app.get("/jobs/{job_id}")
def get_job(job_id: int) -> dict:
    """Return details for a specific job."""
    job = store.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return job


@app.websocket("/ws/run")
async def ws_run(websocket: WebSocket) -> None:
    await websocket.accept()
    jid: int | None = None
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[Tuple[str, str | Exception | None]] = asyncio.Queue()
    stop_event = threading.Event()
    runner: Iterator[str] | None = None
    worker: threading.Thread | None = None

    try:
        cmd = await websocket.receive_text()
        if not cmd.strip():
            await websocket.send_text("[error] command required")
            return
        jid = store.new_job(cmd)
        await websocket.send_text(f"[[BLACKROAD_JOB_ID:{jid}]]")

        runner = iter(jobs.run_remote_stream(command=cmd))

        def _pump_stream() -> None:
            assert runner is not None
            try:
                for line in runner:
                    if stop_event.is_set():
                        break
                    loop.call_soon_threadsafe(queue.put_nowait, ("line", line))
            except Exception as exc:  # noqa: BLE001
                loop.call_soon_threadsafe(queue.put_nowait, ("error", exc))
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, ("done", None))
                with contextlib.suppress(Exception):
                    runner.close()  # type: ignore[attr-defined]

        worker = threading.Thread(target=_pump_stream, name="prism-job-runner", daemon=True)
        worker.start()

        while True:
            event, payload = await queue.get()
            if event == "line":
                assert isinstance(payload, str)
                payload_with_newline = payload if payload.endswith("\n") else f"{payload}\n"
                store.append(jid, payload_with_newline)
                await websocket.send_text(payload)
            elif event == "error":
                assert isinstance(payload, Exception)
                raise payload
            else:  # "done"
                break

        store.finish(jid, "ok")
        await websocket.send_text("[[BLACKROAD_DONE]]")
    except WebSocketDisconnect:
        if jid is not None:
            store.finish(jid, "disconnected")
    except Exception as exc:  # noqa: BLE001
        if jid is not None:
            store.finish(jid, f"error: {exc}")
        if websocket.application_state == WebSocketState.CONNECTED:
            await websocket.send_text(f"[error] {exc}")
    finally:
        stop_event.set()
        if runner is not None:
            with contextlib.suppress(Exception):
                runner.close()  # type: ignore[attr-defined]
        if worker is not None:
            worker.join(timeout=1)
        if websocket.application_state == WebSocketState.CONNECTED:
            await websocket.close()
