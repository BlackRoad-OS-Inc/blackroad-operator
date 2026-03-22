"""Tests for blackroad-fleet-tracker."""
import pytest, math
from fleet_tracker import FleetTracker, Asset, Geofence, calc_distance, calc_bearing


@pytest.fixture
def tracker(tmp_path):
    t = FleetTracker(db_path=str(tmp_path / "test.db"))
    t.register_asset(Asset("v1", "Van-1", "vehicle", 40.7128, -74.0060))
    t.register_asset(Asset("v2", "Van-2", "vehicle", 40.7580, -73.9855))
    t.add_geofence(Geofence("gf1", "Depot", 40.7128, -74.0060, radius_km=0.5))
    return t


def test_haversine_known_distance():
    # NYC to uptown ~5.3 km
    d = calc_distance(40.7128, -74.0060, 40.7614, -73.9776)
    assert 5.0 < d < 6.0


def test_haversine_zero():
    assert calc_distance(10, 20, 10, 20) == pytest.approx(0.0)


def test_bearing_north():
    b = calc_bearing(0, 0, 1, 0)   # move north
    assert b == pytest.approx(0.0, abs=1.0)


def test_update_location(tracker):
    pt = tracker.update_location("v1", 40.7200, -74.0100, speed_kmh=30)
    assert pt.lat == 40.7200
    a = tracker.get_asset("v1")
    assert a.location_lat == 40.7200


def test_invalid_lat_raises(tracker):
    with pytest.raises(ValueError, match="latitude"):
        tracker.update_location("v1", 95.0, -74.0)


def test_get_assets_near(tracker):
    nearby = tracker.get_assets_near(40.7128, -74.0060, radius_km=1.0)
    assert any(x["asset_id"] == "v1" for x in nearby)


def test_get_assets_near_excludes_far(tracker):
    nearby = tracker.get_assets_near(40.7128, -74.0060, radius_km=0.1)
    ids = [x["asset_id"] for x in nearby]
    assert "v2" not in ids


def test_geofence_check_inside(tracker):
    result = tracker.check_geofence("v1", "gf1")
    assert result["inside"] is True


def test_geofence_check_outside(tracker):
    result = tracker.check_geofence("v2", "gf1")
    assert result["inside"] is False


def test_asset_history(tracker):
    for i in range(5):
        tracker.update_location("v1", 40.7128 + i * 0.001, -74.0060)
    hist = tracker.get_asset_history("v1", hours=1)
    assert len(hist) >= 5


def test_detect_idle(tracker):
    # no movement — should be idle
    result = tracker.detect_idle("v1", threshold_minutes=30)
    assert result["idle"] is True


def test_detect_not_idle(tracker):
    for i in range(6):
        tracker.update_location("v1", 40.7128 + i * 0.05, -74.0060 + i * 0.05)
    result = tracker.detect_idle("v1", threshold_minutes=60)
    assert result["idle"] is False


def test_trip_distance(tracker):
    for i in range(5):
        tracker.update_location("v1", 40.7128 + i * 0.01, -74.0060)
    km = tracker.calc_trip_distance("v1", hours=1)
    assert km > 0


def test_unknown_asset_raises(tracker):
    with pytest.raises(ValueError, match="not found"):
        tracker.update_location("nope", 40.0, -74.0)
