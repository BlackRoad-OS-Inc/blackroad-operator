"""Vitals computation for the edge agent."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

LOGGER = logging.getLogger(__name__)


@dataclass
class Vitals:
    """Structured vitals output."""

    confidence: float
    transparency: float
    stability: float

    def as_dict(self) -> dict[str, float]:
        return {
            "confidence": self.confidence,
            "transparency": self.transparency,
            "stability": self.stability,
        }


class VitalsCalculator:
    """Compute vitals from image frames."""

    def __init__(self) -> None:
        self._previous_gray: Optional[np.ndarray] = None

    def compute(self, frame: np.ndarray) -> Vitals:
        if frame.ndim != 3:
            raise ValueError("Frame must have 3 dimensions (H, W, C)")
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        confidence = self._confidence(gray)
        transparency = self._transparency(gray)
        stability = self._stability(gray)

        self._previous_gray = gray
        return Vitals(
            confidence=confidence,
            transparency=transparency,
            stability=stability,
        )

    @staticmethod
    def _confidence(gray: np.ndarray) -> float:
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        score = min(1.0, variance / 500.0)
        LOGGER.debug("Computed confidence variance=%s score=%s", variance, score)
        return float(score)

    @staticmethod
    def _transparency(gray: np.ndarray) -> float:
        hist = cv2.calcHist([gray], [0], None, [64], [0, 256])
        hist = hist.flatten()
        hist_sum = hist.sum()
        if hist_sum <= 0:
            return 0.0
        probabilities = hist / hist_sum
        entropy = -np.sum(probabilities * np.log(probabilities + 1e-9))
        max_entropy = np.log(len(hist))
        score = min(1.0, entropy / max_entropy)
        LOGGER.debug("Computed transparency entropy=%s score=%s", entropy, score)
        return float(score)

    def _stability(self, gray: np.ndarray) -> float:
        if self._previous_gray is None:
            LOGGER.debug("No previous frame; default stability=1.0")
            return 1.0
        diff = cv2.absdiff(gray, self._previous_gray)
        mean_delta = float(np.mean(diff) / 255.0)
        score = max(0.0, 1.0 - min(1.0, mean_delta * 4))
        LOGGER.debug("Computed stability mean_delta=%s score=%s", mean_delta, score)
        return score
