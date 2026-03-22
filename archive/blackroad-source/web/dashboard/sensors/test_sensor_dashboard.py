"""Tests for BlackRoad Sensor Dashboard."""
import pytest
from pathlib import Path
from sensor_dashboard import SensorDashboard, SensorType, ReadingQuality, AlertType, AlertSeverity

@pytest.fixture
def dash(tmp_path):
    return SensorDashboard(db_path=tmp_path / "test.db")

@pytest.fixture
def sensor(dash):
    return dash.add_sensor("dev-1", "temperature", "°C", name="Room Temp", location="Office")

def test_add_sensor(dash):
    s = dash.add_sensor("dev-1", "humidity", "%", name="Humidity-1")
    assert s.type == SensorType.HUMIDITY
    assert s.unit == "%"
    assert s.min_value == 0.0
    assert s.max_value == 100.0

def test_add_sensor_custom_range(dash):
    s = dash.add_sensor("dev-1", "temperature", "°C", min_value=10.0, max_value=30.0)
    assert s.min_value == 10.0
    assert s.max_value == 30.0

def test_log_reading(dash, sensor):
    r = dash.log_reading(sensor.id, 22.5)
    assert r.raw_value == 22.5
    assert r.calibrated_value == 22.5
    assert r.quality == ReadingQuality.GOOD

def test_log_reading_with_calibration(dash):
    s = dash.add_sensor("dev-2", "temperature", "°C", calibration_offset=1.5)
    r = dash.log_reading(s.id, 20.0)
    assert r.calibrated_value == 21.5

def test_get_current_reading(dash, sensor):
    dash.log_reading(sensor.id, 21.0)
    dash.log_reading(sensor.id, 22.0)
    current = dash.get_current(sensor.id)
    assert current.calibrated_value == 22.0

def test_get_current_no_readings(dash, sensor):
    assert dash.get_current(sensor.id) is None

def test_get_history(dash, sensor):
    for v in [18.0, 20.0, 22.0]:
        dash.log_reading(sensor.id, v)
    history = dash.get_history(sensor.id, hours=1)
    assert len(history) == 3

def test_get_stats(dash, sensor):
    for v in [10.0, 20.0, 30.0]:
        dash.log_reading(sensor.id, v)
    stats = dash.get_stats(sensor.id, hours=1)
    assert stats["count"] == 3
    assert stats["min"] == 10.0
    assert stats["max"] == 30.0
    assert stats["avg"] == 20.0

def test_threshold_alert_high(dash):
    s = dash.add_sensor("dev-3", "temperature", "°C", min_value=0.0, max_value=40.0)
    dash.log_reading(s.id, 50.0)  # triggers threshold
    alerts = dash.get_active_alerts()
    assert any(a.type == AlertType.THRESHOLD for a in alerts)

def test_threshold_alert_low(dash):
    s = dash.add_sensor("dev-4", "temperature", "°C", min_value=5.0, max_value=40.0)
    dash.log_reading(s.id, 1.0)
    alerts = dash.get_active_alerts()
    assert any(a.severity == AlertSeverity.CRITICAL for a in alerts)

def test_detect_anomaly(dash, sensor):
    # Log normal values then spike
    for _ in range(10):
        dash.log_reading(sensor.id, 22.0)
    dash.log_reading(sensor.id, 100.0)  # spike
    alert = dash.detect_anomaly(sensor.id, window=60, z_threshold=2.0)
    assert alert is not None
    assert alert.type == AlertType.ANOMALY

def test_detect_anomaly_no_anomaly(dash, sensor):
    for v in [22.0, 22.1, 22.2, 22.0, 21.9]:
        dash.log_reading(sensor.id, v)
    alert = dash.detect_anomaly(sensor.id, window=60)
    assert alert is None

def test_resolve_alert(dash):
    s = dash.add_sensor("dev-5", "co2", "ppm", min_value=400.0, max_value=1000.0)
    dash.log_reading(s.id, 2000.0)
    alerts = dash.get_active_alerts()
    assert len(alerts) > 0
    resolved = dash.resolve_alert(alerts[0].id)
    assert resolved.resolved_at is not None
    assert resolved.is_active is False

def test_get_dashboard_data(dash, sensor):
    dash.log_reading(sensor.id, 22.5)
    data = dash.get_dashboard_data()
    assert data["total_sensors"] == 1
    assert len(data["sensors"]) == 1

def test_export_timeseries_json(dash, sensor):
    dash.log_reading(sensor.id, 22.0)
    result = dash.export_timeseries(sensor.id, hours=1, fmt="json")
    data = eval(result)  # basic check it's parseable
    import json
    data = json.loads(result)
    assert len(data) == 1

def test_export_timeseries_csv(dash, sensor):
    dash.log_reading(sensor.id, 22.0)
    result = dash.export_timeseries(sensor.id, hours=1, fmt="csv")
    assert "sensor_id" in result
    assert "calibrated_value" in result

def test_batch_log(dash, sensor):
    entries = [{"sensor_id": sensor.id, "value": v} for v in [1.0, 2.0, 3.0]]
    readings = dash.batch_log(entries)
    assert len(readings) == 3

def test_mark_sensor_offline(dash, sensor):
    alert = dash.mark_sensor_offline(sensor.id)
    assert alert.type == AlertType.OFFLINE

def test_update_calibration(dash, sensor):
    s = dash.update_calibration(sensor.id, 2.0)
    assert s.calibration_offset == 2.0

def test_list_sensors_by_device(dash):
    dash.add_sensor("dev-A", "temperature", "°C")
    dash.add_sensor("dev-B", "humidity", "%")
    sensors = dash.list_sensors(device_id="dev-A")
    assert all(s.device_id == "dev-A" for s in sensors)
