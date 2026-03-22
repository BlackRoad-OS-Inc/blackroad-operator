"""Tests for BlackRoad Device Registry."""
import pytest
from device_registry import DeviceRegistry, DeviceStatus, MaintenanceType

@pytest.fixture
def reg(tmp_path):
    return DeviceRegistry(db_path=tmp_path / "test.db")

@pytest.fixture
def device(reg):
    return reg.register(
        serial="SN-12345", name="Raspberry Pi 4", model="Pi 4B",
        manufacturer="Raspberry Pi Foundation", hw_rev="1.4",
        location="Server Room A", owner="IT Team",
        purchase_date="2024-01-15", warranty_expires="2026-01-15",
        tags=["prod", "linux"])

def test_register_device(reg):
    d = reg.register("SN-001", "Test Device", "Model X", "Acme Corp")
    assert d.serial == "SN-001"
    assert d.status == DeviceStatus.ACTIVE

def test_register_duplicate_serial(reg, device):
    with pytest.raises(ValueError, match="already exists"):
        reg.register("SN-12345", "Duplicate", "Model", "Maker")

def test_get_device(reg, device):
    d = reg.get_device(device.id)
    assert d.serial == "SN-12345"
    assert d.manufacturer == "Raspberry Pi Foundation"

def test_get_by_serial(reg, device):
    d = reg.get_by_serial("SN-12345")
    assert d.id == device.id

def test_get_device_not_found(reg):
    with pytest.raises(ValueError):
        reg.get_device("nonexistent")

def test_assign_device(reg, device):
    d = reg.assign(device.id, "alice@example.com")
    assert d.assigned_to == "alice@example.com"

def test_unassign_device(reg, device):
    reg.assign(device.id, "alice@example.com")
    d = reg.unassign(device.id)
    assert d.assigned_to is None

def test_update_status(reg, device):
    d = reg.update_status(device.id, "maintenance")
    assert d.status == DeviceStatus.MAINTENANCE

def test_retire_device(reg, device):
    d = reg.retire(device.id)
    assert d.status == DeviceStatus.RETIRED

def test_update_location(reg, device):
    d = reg.update_location(device.id, "Data Center B")
    assert d.location == "Data Center B"

def test_add_tag(reg, device):
    d = reg.add_tag(device.id, "iot")
    assert "iot" in d.tags

def test_add_tag_idempotent(reg, device):
    reg.add_tag(device.id, "prod")
    d = reg.add_tag(device.id, "prod")
    assert d.tags.count("prod") == 1

def test_maintenance_log(reg, device):
    log = reg.maintenance_log(device.id, "repair", "Replaced fan", performed_by="Bob", cost=25.0)
    assert log.type == MaintenanceType.REPAIR
    assert log.cost == 25.0

def test_maintenance_sets_maintenance_status(reg, device):
    reg.maintenance_log(device.id, "repair", "Fan failure")
    d = reg.get_device(device.id)
    assert d.status == DeviceStatus.MAINTENANCE

def test_get_maintenance_history(reg, device):
    reg.maintenance_log(device.id, "inspection", "Annual inspection")
    reg.maintenance_log(device.id, "calibration", "Sensor calibration")
    history = reg.get_maintenance_history(device.id)
    assert len(history) == 2

def test_get_total_maintenance_cost(reg, device):
    reg.maintenance_log(device.id, "inspection", "Check", cost=50.0)
    reg.maintenance_log(device.id, "repair", "Fix", cost=150.0)
    total = reg.get_total_maintenance_cost(device.id)
    assert total == 200.0

def test_get_warranty_expiring(reg):
    from datetime import datetime, timezone, timedelta
    soon = (datetime.now(timezone.utc) + timedelta(days=15)).strftime("%Y-%m-%d")
    reg.register("SN-EXP", "Expiring Device", "Mod", "Mfr", warranty_expires=soon)
    expiring = reg.get_warranty_expiring(days=30)
    assert len(expiring) == 1

def test_search(reg, device):
    reg.register("SN-999", "Camera Unit", "Cam Pro", "Sony")
    results = reg.search("Camera")
    assert len(results) == 1
    assert results[0].name == "Camera Unit"

def test_search_with_status_filter(reg, device):
    reg.register("SN-RET", "Old Device", "Mod", "Mfr")
    d2 = reg.get_by_serial("SN-RET")
    reg.retire(d2.id)
    results = reg.search("Device", status_filter="retired")
    assert all(r.status == DeviceStatus.RETIRED for r in results)

def test_list_devices(reg, device):
    devices = reg.list_devices()
    assert len(devices) == 1

def test_list_devices_by_status(reg, device):
    active = reg.list_devices(status_filter="active")
    assert all(d.status == DeviceStatus.ACTIVE for d in active)

def test_get_unassigned(reg, device):
    unassigned = reg.get_unassigned()
    assert any(d.id == device.id for d in unassigned)
    reg.assign(device.id, "user@test.com")
    unassigned = reg.get_unassigned()
    assert not any(d.id == device.id for d in unassigned)

def test_export_inventory_json(reg, device):
    import json
    result = reg.export_inventory(fmt="json")
    data = json.loads(result)
    assert len(data) == 1
    assert data[0]["serial"] == "SN-12345"

def test_export_inventory_csv(reg, device):
    result = reg.export_inventory(fmt="csv")
    assert "serial" in result
    assert "SN-12345" in result

def test_get_summary(reg, device):
    summary = reg.get_summary()
    assert summary["total_devices"] == 1
    assert summary["status_breakdown"]["active"] == 1
