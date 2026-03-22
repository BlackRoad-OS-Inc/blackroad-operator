"""Tests for Feature Store."""
import json
import pytest
import sys
sys.path.insert(0, "/tmp")
from feature_store import (
    FeatureStore, Feature, FeatureGroup, EntityRecord,
    DTYPE_INT, DTYPE_FLOAT, DTYPE_STR, FREQ_BATCH, FREQ_STREAMING,
)


@pytest.fixture
def store(tmp_path):
    return FeatureStore(db_path=tmp_path / "test.db")


@pytest.fixture
def store_with_features(store):
    store.register_feature("age", "user", DTYPE_INT, description="User age")
    store.register_feature("income", "user", DTYPE_FLOAT, description="Annual income")
    store.register_feature("city", "user", DTYPE_STR, description="City")
    return store


@pytest.fixture
def store_with_group(store_with_features):
    group = store_with_features.create_group(
        "user_demographics", ["age", "income", "city"], entity_key="user_id"
    )
    return store_with_features, group


def test_init_creates_db(tmp_path):
    db = tmp_path / "fs.db"
    FeatureStore(db_path=db)
    assert db.exists()


def test_register_feature(store):
    f = store.register_feature("revenue", "order", DTYPE_FLOAT, source_query="SELECT SUM(total)")
    assert f.name == "revenue"
    assert f.dtype == DTYPE_FLOAT
    assert f.entity_type == "order"
    assert f.id


def test_register_feature_invalid_dtype(store):
    with pytest.raises(ValueError, match="Invalid dtype"):
        store.register_feature("x", "user", "invalid_dtype")


def test_get_feature(store_with_features):
    f = store_with_features.get_feature("age")
    assert f is not None
    assert f.name == "age"


def test_get_feature_missing(store):
    assert store.get_feature("nonexistent") is None


def test_list_features(store_with_features):
    features = store_with_features.list_features()
    names = {f.name for f in features}
    assert "age" in names
    assert "income" in names


def test_list_features_by_entity(store_with_features):
    store_with_features.register_feature("price", "product", DTYPE_FLOAT)
    user_features = store_with_features.list_features(entity_type="user")
    assert all(f.entity_type == "user" for f in user_features)


def test_create_group(store_with_group):
    store, group = store_with_group
    assert group.name == "user_demographics"
    assert "age" in group.features
    assert group.entity_key == "user_id"
    assert group.version == 1


def test_create_group_invalid_feature(store):
    store.register_feature("valid_feat", "user", DTYPE_INT)
    with pytest.raises(ValueError, match="not registered"):
        store.create_group("g", ["valid_feat", "nonexistent"], entity_key="id")


def test_write_and_get_features(store_with_group):
    store, group = store_with_group
    store.write_features(group.id, "user-1", {"age": 30, "income": 75000.0, "city": "NYC"})
    values = store.get_features(group.id, "user-1")
    assert values is not None
    assert values["age"] == 30
    assert values["income"] == 75000.0
    assert values["city"] == "NYC"


def test_get_features_missing_entity(store_with_group):
    store, group = store_with_group
    values = store.get_features(group.id, "nonexistent-user")
    assert values is None


def test_point_in_time_correctness(store_with_group):
    store, group = store_with_group
    store.write_features(group.id, "user-1", {"age": 25}, timestamp="2023-01-01T00:00:00")
    store.write_features(group.id, "user-1", {"age": 26}, timestamp="2024-01-01T00:00:00")

    # At 2023-06-01, should see age=25
    values = store.get_features(group.id, "user-1", as_of_timestamp="2023-06-01T00:00:00")
    assert values is not None
    assert values["age"] == 25

    # After 2024 update, should see age=26
    values_new = store.get_features(group.id, "user-1")
    assert values_new["age"] == 26


def test_point_in_time_join(store_with_group):
    store, group = store_with_group
    store.write_features(group.id, "user-1", {"age": 30, "income": 80000.0}, timestamp="2024-01-01T00:00:00")
    store.write_features(group.id, "user-2", {"age": 25, "income": 60000.0}, timestamp="2024-01-01T00:00:00")

    result = store.point_in_time_join(
        ["user-1", "user-2", "user-3"],
        [group.id],
        timestamp="2024-06-01T00:00:00",
    )
    assert len(result) == 3
    assert result[0]["entity_id"] == "user-1"
    assert result[0]["age"] == 30
    assert result[2]["entity_id"] == "user-3"  # missing data


def test_statistics_empty(store_with_group):
    store, group = store_with_group
    stats = store.statistics(group.id)
    assert stats["total_records"] == 0
    assert "age" in stats["features"]


def test_statistics_with_data(store_with_group):
    store, group = store_with_group
    for i in range(5):
        store.write_features(group.id, f"u{i}", {"age": 20 + i, "income": float(40000 + i * 1000)})
    stats = store.statistics(group.id)
    assert stats["total_records"] == 5
    assert stats["features"]["age"]["count"] == 5
    assert stats["features"]["age"]["mean"] == 22.0
    assert stats["features"]["age"]["min"] == 20
    assert stats["features"]["age"]["max"] == 24
