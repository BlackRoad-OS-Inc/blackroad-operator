"""Tests for BlackRoad IoT Gateway."""

import json
import tempfile
from pathlib import Path

import pytest

from iot_gateway import (
    CommandStatus,
    DeviceType,
    IoTGateway,
    Protocol,
    init_db,
)


@pytest.fixture
def gw(tmp_path):
    db = tmp_path / "test.db"
    return IoTGateway(db_path=db)


@pytest.fixture
def device(gw):
    return gw.register_device(
        mac="AA:BB:CC:DD:EE:01",
        name="Test Sensor",
        device_type="sensor",
        protocol="mqtt",
        ip="192.168.1.10",
        capabilities=["temperature", "humidity"],
    )


def test_register_device(gw):
    d = gw.register_device("AA:BB:CC:DD:EE:FF", "Thermostat-1", "thermostat", "mqtt", "10.0.0.1")
    assert d.mac == "AA:BB:CC:DD:EE:FF"
    assert d.type == DeviceType.THERMOSTAT
    assert d.protocol == Protocol.MQTT
    assert d.online is True


def test_register_device_idempotent(gw):
    gw.register_device("11:22:33:44:55:66", "Lock-A", "lock", "http", "10.0.0.2")
    d2 = gw.register_device("11:22:33:44:55:66", "Lock-A-updated", "lock", "http", "10.0.0.3")
    assert d2.name == "Lock-A-updated"
    assert d2.ip == "10.0.0.3"
    # Should still be one device
    devices = gw.list_devices()
    assert len(devices) == 1


def test_get_device_not_found(gw):
    with pytest.raises(ValueError, match="Device not found"):
        gw.get_device("nonexistent-id")


def test_update_firmware(gw, device):
    result = gw.update_firmware(device.id, "2.0.0")
    assert result["old_version"] == "1.0.0"
    assert result["new_version"] == "2.0.0"
    updated = gw.get_device(device.id)
    assert updated.firmware_version == "2.0.0"


def test_send_command(gw, device):
    cmd = gw.send_command(device.id, "reboot", {"delay": 5})
    assert cmd.command == "reboot"
    assert cmd.params == {"delay": 5}
    assert cmd.status == CommandStatus.PENDING


def test_acknowledge_command(gw, device):
    cmd = gw.send_command(device.id, "reset")
    acked = gw.acknowledge_command(cmd.id)
    assert acked.status == CommandStatus.ACKNOWLEDGED


def test_fail_command(gw, device):
    cmd = gw.send_command(device.id, "update")
    failed = gw.fail_command(cmd.id)
    assert failed.status == CommandStatus.FAILED


def test_bulk_update(gw):
    d1 = gw.register_device("AA:01", "D1", "sensor", "mqtt", "1.0.0.1")
    d2 = gw.register_device("AA:02", "D2", "actuator", "http", "1.0.0.2")
    results = gw.bulk_update([d1.id, d2.id], "ping")
    assert len(results) == 2
    for r in results:
        assert r.command == "ping"


def test_subscribe_and_process_message(gw, device):
    gw.subscribe_topic(device.id, "home/living/temp")
    msg = gw.process_message("home/living/temp", {"value": 22.5})
    assert msg.topic == "home/living/temp"
    assert msg.payload["value"] == 22.5


def test_subscribe_idempotent(gw, device):
    sub1 = gw.subscribe_topic(device.id, "sensors/light")
    sub2 = gw.subscribe_topic(device.id, "sensors/light")
    assert sub1.topic == sub2.topic


def test_get_device_status(gw, device):
    gw.subscribe_topic(device.id, "t/sensor")
    gw.send_command(device.id, "ping")
    status = gw.get_device_status(device.id)
    assert status["pending_commands"] == 1
    assert status["topic_subscriptions"] == 1


def test_export_topology(gw, device):
    topology = gw.export_topology()
    assert topology["device_count"] == 1
    assert topology["online_count"] == 1
    assert len(topology["devices"]) == 1


def test_get_stats(gw, device):
    gw.send_command(device.id, "ping")
    stats = gw.get_stats()
    assert stats["total_devices"] == 1
    assert stats["pending_commands"] == 1


def test_mark_offline_online(gw, device):
    gw.mark_offline(device.id)
    d = gw.get_device(device.id)
    assert d.online is False
    gw.mark_online(device.id)
    d = gw.get_device(device.id)
    assert d.online is True


def test_firmware_history(gw, device):
    gw.update_firmware(device.id, "1.1.0")
    gw.update_firmware(device.id, "1.2.0")
    history = gw.get_firmware_history(device.id)
    assert len(history) == 2
    assert history[0]["new_version"] == "1.1.0"


def test_list_devices_filter(gw):
    gw.register_device("BB:01", "Sensor-1", "sensor", "mqtt", "10.1.0.1")
    gw.register_device("BB:02", "Camera-1", "camera", "http", "10.1.0.2")
    sensors = gw.list_devices(device_type="sensor")
    assert all(d.type == DeviceType.SENSOR for d in sensors)


def test_unsubscribe_topic(gw, device):
    gw.subscribe_topic(device.id, "test/topic")
    removed = gw.unsubscribe_topic(device.id, "test/topic")
    assert removed is True
    removed2 = gw.unsubscribe_topic(device.id, "test/topic")
    assert removed2 is False


def test_generate_device_hash():
    h = IoTGateway.generate_device_hash("AA:BB:CC:DD:EE:FF")
    assert len(h) == 16


def test_pending_commands(gw, device):
    gw.send_command(device.id, "cmd1")
    gw.send_command(device.id, "cmd2")
    pending = gw.get_pending_commands(device.id)
    assert len(pending) == 2
