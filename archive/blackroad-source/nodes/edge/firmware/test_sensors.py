"""Tests for Pi agent sensors (mock mode)."""
import asyncio
import sys
import os

# Ensure mock mode by blocking RPi.GPIO import
sys.modules['RPi'] = None  # type: ignore
sys.modules['RPi.GPIO'] = None  # type: ignore

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from pi_agent.sensors.gpio_controller import GPIOController


@pytest.mark.asyncio
async def test_gpio_mock_set_read():
    ctrl = GPIOController()
    assert ctrl.is_mock
    ctrl.setup_pin(18, "out")
    await ctrl.set_pin(18, True)
    val = await ctrl.read_pin(18)
    assert val is True
    await ctrl.set_pin(18, False)
    assert await ctrl.read_pin(18) is False


@pytest.mark.asyncio
async def test_gpio_blink():
    ctrl = GPIOController()
    ctrl.setup_pin(24)
    await ctrl.blink(24, times=2, interval=0.01)
    assert await ctrl.read_pin(24) is False
