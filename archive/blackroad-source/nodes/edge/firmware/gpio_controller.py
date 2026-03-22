#!/usr/bin/env python3
"""GPIO controller for BlackRoad Pi agents (RPi.GPIO with mock fallback)."""

from __future__ import annotations
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import RPi.GPIO as GPIO
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    _HAS_GPIO = True
except ImportError:
    _HAS_GPIO = False
    logger.debug("RPi.GPIO not available — using mock mode")


class GPIOController:
    """Async GPIO controller with mock fallback for non-Pi systems."""

    def __init__(self):
        self._pins: dict[int, bool] = {}
        self._mock = not _HAS_GPIO

    def setup_pin(self, pin: int, mode: str = "out") -> None:
        """Configure a GPIO pin as input or output."""
        if self._mock:
            self._pins[pin] = False
            return
        gpio_mode = GPIO.OUT if mode == "out" else GPIO.IN
        GPIO.setup(pin, gpio_mode)
        self._pins[pin] = False

    async def set_pin(self, pin: int, state: bool) -> None:
        """Set a GPIO output pin high or low."""
        if pin not in self._pins:
            self.setup_pin(pin)
        if self._mock:
            self._pins[pin] = state
            logger.debug("Mock GPIO pin %d = %s", pin, state)
            return
        await asyncio.get_event_loop().run_in_executor(
            None, GPIO.output, pin, GPIO.HIGH if state else GPIO.LOW
        )
        self._pins[pin] = state

    async def read_pin(self, pin: int) -> bool:
        """Read a GPIO input pin."""
        if self._mock:
            return self._pins.get(pin, False)
        result = await asyncio.get_event_loop().run_in_executor(None, GPIO.input, pin)
        return bool(result)

    async def blink(self, pin: int, times: int = 3, interval: float = 0.2) -> None:
        """Blink a pin N times."""
        for _ in range(times):
            await self.set_pin(pin, True)
            await asyncio.sleep(interval)
            await self.set_pin(pin, False)
            await asyncio.sleep(interval)

    def cleanup(self) -> None:
        """Release all GPIO resources."""
        if not self._mock and _HAS_GPIO:
            GPIO.cleanup()

    @property
    def is_mock(self) -> bool:
        return self._mock
