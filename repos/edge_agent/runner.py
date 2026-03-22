"""Main loop for the edge agent."""

from __future__ import annotations

import logging
import signal
import sys
import time

from .capture import FrameCapture
from .config import EdgeAgentConfig
from .sender import GatewaySender
from .trust import EmitGate, TrustCalculator
from .vitals import VitalsCalculator

LOGGER = logging.getLogger(__name__)


class EdgeAgentRunner:
    """Run the edge agent main loop."""

    def __init__(self, config: EdgeAgentConfig) -> None:
        self._config = config
        self._capture = FrameCapture(
            camera_index=config.camera_index,
            frame_width=config.frame_width,
            frame_height=config.frame_height,
        )
        self._vitals = VitalsCalculator()
        self._trust = TrustCalculator(config)
        self._gate = EmitGate(
            threshold=config.emit_threshold,
            interval_seconds=config.emit_interval_seconds,
        )
        self._sender = GatewaySender(config)
        self._running = True

    def _setup_signals(self) -> None:
        for sig in (signal.SIGTERM, signal.SIGINT):
            signal.signal(sig, self._handle_exit)

    def _handle_exit(self, signum, frame) -> None:  # type: ignore[override]
        LOGGER.info("Received signal %s - shutting down edge agent", signum)
        self._running = False

    def run(self) -> None:
        LOGGER.info(
            "Starting edge agent for agent_id=%s gateway=%s",
            self._config.agent_id,
            self._config.gateway_url,
        )
        self._setup_signals()
        try:
            while self._running:
                timestamp = time.time()
                capture = self._capture.read(timestamp)
                vitals = self._vitals.compute(capture.frame)
                trust = self._trust.compute(vitals)
                result = self._gate.evaluate(trust)
                LOGGER.info(
                    "Vitals=%s trust=%.3f emit=%s",
                    vitals.as_dict(),
                    trust,
                    result.should_emit,
                )
                if result.should_emit:
                    payload = self._sender.build_payload(
                        vitals=vitals,
                        trust=result.trust,
                        timestamp=capture.timestamp,
                        frame=capture.frame,
                    )
                    success = self._sender.send(payload)
                    if not success:
                        LOGGER.warning("Failed to deliver payload")
                time.sleep(0.5)
        finally:
            self._capture.release()
            LOGGER.info("Edge agent shut down cleanly")


def configure_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    level = logging.INFO
    if any(arg in ("-v", "--verbose") for arg in argv):
        level = logging.DEBUG
    configure_logging(level)
    try:
        config = EdgeAgentConfig.from_env()
    except ValueError as exc:
        LOGGER.error("Configuration error: %s", exc)
        return 1

    runner = EdgeAgentRunner(config)
    runner.run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
