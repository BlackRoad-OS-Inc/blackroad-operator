"""Video capture utilities for the edge agent."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

LOGGER = logging.getLogger(__name__)


@dataclass
class CaptureResult:
    """Container for captured frame data."""

    frame: np.ndarray
    timestamp: float


class FrameCapture:
    """Wrapper around OpenCV capture with helpful defaults."""

    def __init__(
        self,
        camera_index: int = 0,
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None,
    ) -> None:
        self.camera_index = camera_index
        self.frame_width = frame_width
        self.frame_height = frame_height
        self._capture = cv2.VideoCapture(camera_index)
        if not self._capture.isOpened():
            LOGGER.warning("Camera index %s could not be opened on init", camera_index)
        if frame_width:
            self._capture.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
        if frame_height:
            self._capture.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

    def read(self, timestamp: float) -> CaptureResult:
        if not self._capture.isOpened():
            LOGGER.debug("Attempting to reopen camera index %s", self.camera_index)
            self._capture.open(self.camera_index)
        ok, frame = self._capture.read()
        if not ok or frame is None:
            LOGGER.error("Camera read failed; generating fallback frame")
            frame = self._fallback_frame()
        else:
            if self.frame_width or self.frame_height:
                frame = self._resize(frame)
        return CaptureResult(frame=frame, timestamp=timestamp)

    def release(self) -> None:
        if self._capture.isOpened():
            self._capture.release()

    def _resize(self, frame: np.ndarray) -> np.ndarray:
        width = self.frame_width or frame.shape[1]
        height = self.frame_height or frame.shape[0]
        return cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)

    def _fallback_frame(self) -> np.ndarray:
        width = self.frame_width or 640
        height = self.frame_height or 480
        gradient = np.linspace(0, 255, width, dtype=np.uint8)
        frame = np.tile(gradient, (height, 1))
        frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        return frame

    def __enter__(self) -> "FrameCapture":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:  # type: ignore[override]
        self.release()
