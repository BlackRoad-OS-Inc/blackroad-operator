"""Tests for terraform_state.py"""
import json
import time
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from terraform_state import (
    lock_state, unlock_state, get_lock_info,
    store_state, get_state, list_workspaces, list_resources, get_resource,
    get_drift, backup_state, get_state_history, _get_db,
    TFResource, TFState,
)

SAMPLE_STATE = {
    "version": 4,
    "terraform_version": "1.6.0",
    "serial": 1,
    "lineage": "test-lineage-001",
    "outputs": {"vpc_id": {"value": "vpc-123", "type": "string"}},
    "resources": [
        {
            "address": "aws_instance.web",
            "mode": "managed",
            "type": "aws_instance",
            "name": "web",
            "provider_config_key": "registry.terraform.io/hashicorp/aws",
            "attributes": {"id": "i-12345", "instance_type": "t3.micro", "ami": "ami-abc"},
            "dependencies": [],
        },
        {
            "address": "aws_security_group.web_sg",
            "mode": "managed",
            "type": "aws_security_group",
            "name": "web_sg",
            "provider_config_key": "registry.terraform.io/hashicorp/aws",
            "attributes": {"id": "sg-99999", "name": "web-sg"},
            "dependencies": ["aws_instance.web"],
        },
    ],
}


@pytest.fixture
def db(tmp_path):
    return _get_db(tmp_path / "test_tf.db")


# ---------------------------------------------------------------------------
# Locking
# ---------------------------------------------------------------------------

def test_lock_state(db):
    ok = lock_state("default", "runner-1", db=db)
    assert ok


def test_lock_already_locked(db):
    lock_state("prod", "runner-1", db=db)
    ok = lock_state("prod", "runner-2", db=db)
    assert not ok


def test_unlock_state(db):
    lock_state("staging", "me", db=db)
    ok = unlock_state("staging", "me", db=db)
    assert ok


def test_unlock_wrong_holder_raises(db):
    lock_state("secure", "alice", db=db)
    with pytest.raises(PermissionError):
        unlock_state("secure", "bob", db=db)


def test_unlock_force(db):
    lock_state("force-ws", "alice", db=db)
    ok = unlock_state("force-ws", "bob", force=True, db=db)
    assert ok


def test_unlock_not_locked(db):
    ok = unlock_state("never-locked", "me", db=db)
    assert not ok


def test_get_lock_info(db):
    lock_state("info-ws", "operator", operation="plan", db=db)
    info = get_lock_info("info-ws", db=db)
    assert info["holder"] == "operator"
    assert info["operation"] == "plan"


def test_get_lock_info_not_locked(db):
    assert get_lock_info("unlocked-ws", db=db) is None


def test_relock_after_unlock(db):
    lock_state("relock", "a", db=db)
    unlock_state("relock", "a", db=db)
    ok = lock_state("relock", "b", db=db)
    assert ok


# ---------------------------------------------------------------------------
# State storage
# ---------------------------------------------------------------------------

def test_store_state(db):
    state = store_state("default", SAMPLE_STATE, db=db)
    assert state.workspace == "default"
    assert len(state.resources) == 2


def test_store_state_increments_serial(db):
    store_state("serial-test", SAMPLE_STATE, db=db)
    state2 = store_state("serial-test", SAMPLE_STATE, db=db)
    assert state2.serial == 2


def test_store_state_archives_previous(db):
    store_state("archive-ws", SAMPLE_STATE, db=db)
    store_state("archive-ws", SAMPLE_STATE, db=db)
    history = get_state_history("archive-ws", db=db)
    assert len(history) >= 1


def test_get_state(db):
    store_state("get-test", SAMPLE_STATE, db=db)
    state = get_state("get-test", db=db)
    assert state is not None
    assert state.workspace == "get-test"


def test_get_state_not_found(db):
    assert get_state("nonexistent-ws", db=db) is None


def test_state_outputs(db):
    store_state("out-ws", SAMPLE_STATE, db=db)
    state = get_state("out-ws", db=db)
    assert "vpc_id" in state.outputs


def test_state_to_tf_json(db):
    store_state("json-ws", SAMPLE_STATE, db=db)
    state = get_state("json-ws", db=db)
    tf_json = state.to_tf_json()
    assert "resources" in tf_json
    assert "outputs" in tf_json
    assert tf_json["version"] == 4


# ---------------------------------------------------------------------------
# Resource queries
# ---------------------------------------------------------------------------

def test_list_resources(db):
    store_state("res-ws", SAMPLE_STATE, db=db)
    resources = list_resources("res-ws", db=db)
    assert len(resources) == 2


def test_list_resources_type_filter(db):
    store_state("filter-ws", SAMPLE_STATE, db=db)
    instances = list_resources("filter-ws", type_filter="aws_instance", db=db)
    assert all(r.type == "aws_instance" for r in instances)
    assert len(instances) == 1


def test_get_resource(db):
    store_state("getres-ws", SAMPLE_STATE, db=db)
    r = get_resource("getres-ws", "aws_instance.web", db=db)
    assert r is not None
    assert r.type == "aws_instance"
    assert r.attributes["id"] == "i-12345"


def test_get_resource_not_found(db):
    store_state("nr-ws", SAMPLE_STATE, db=db)
    assert get_resource("nr-ws", "nonexistent.resource", db=db) is None


# ---------------------------------------------------------------------------
# TFResource data class
# ---------------------------------------------------------------------------

def test_tfresource_to_dict():
    r = TFResource(
        address="aws_s3_bucket.data",
        type="aws_s3_bucket",
        name="data",
        provider="hashicorp/aws",
        attributes={"bucket": "my-bucket"},
    )
    d = r.to_dict()
    assert d["address"] == "aws_s3_bucket.data"
    assert d["attributes"]["bucket"] == "my-bucket"


def test_tfresource_from_dict():
    d = {
        "address": "google_compute_instance.vm",
        "type": "google_compute_instance",
        "name": "vm",
        "provider_config_key": "hashicorp/google",
        "attributes": {"zone": "us-central1-a"},
        "dependencies": [],
    }
    r = TFResource.from_dict(d)
    assert r.address == "google_compute_instance.vm"
    assert r.attributes["zone"] == "us-central1-a"


# ---------------------------------------------------------------------------
# Drift detection
# ---------------------------------------------------------------------------

def test_get_drift_no_changes(db):
    store_state("nodrift-ws", SAMPLE_STATE, db=db)
    # Store again (same) to create history to compare against
    store_state("nodrift-ws", SAMPLE_STATE, db=db)
    drift = get_drift("nodrift-ws", db=db)
    assert drift == []


def test_get_drift_added_resource(db):
    store_state("drift-add", SAMPLE_STATE, db=db)
    extra_resource = {
        "address": "aws_rds_instance.db",
        "mode": "managed",
        "type": "aws_rds_instance",
        "name": "db",
        "provider_config_key": "hashicorp/aws",
        "attributes": {"id": "rds-1"},
        "dependencies": [],
    }
    new_state = {**SAMPLE_STATE, "resources": SAMPLE_STATE["resources"] + [extra_resource]}
    # Store new state
    store_state("drift-add", new_state, db=db)
    # Pass old resources as actual
    old_resources = SAMPLE_STATE["resources"]
    drift = get_drift("drift-add", actual_resources=old_resources, db=db)
    added = [d for d in drift if d.drift_kind == "added"]
    assert any(d.address == "aws_rds_instance.db" for d in added)


def test_get_drift_modified_attribute(db):
    store_state("drift-mod", SAMPLE_STATE, db=db)
    modified = json.loads(json.dumps(SAMPLE_STATE))
    modified["resources"][0]["attributes"]["instance_type"] = "t3.large"
    store_state("drift-mod", modified, db=db)
    old = SAMPLE_STATE["resources"]
    drift = get_drift("drift-mod", actual_resources=old, db=db)
    modified_drift = [d for d in drift if d.drift_kind == "modified"]
    assert any(d.address == "aws_instance.web" for d in modified_drift)


# ---------------------------------------------------------------------------
# Backup
# ---------------------------------------------------------------------------

def test_backup_state(db, tmp_path):
    store_state("bkp-ws", SAMPLE_STATE, db=db)
    backup_path = backup_state("bkp-ws", backup_dir=tmp_path / "backups", db=db)
    assert backup_path.exists()
    content = json.loads(backup_path.read_text())
    assert "resources" in content


def test_backup_not_found(db, tmp_path):
    with pytest.raises(ValueError):
        backup_state("nonexistent", backup_dir=tmp_path, db=db)


# ---------------------------------------------------------------------------
# Workspaces
# ---------------------------------------------------------------------------

def test_list_workspaces(db):
    store_state("ws1", SAMPLE_STATE, db=db)
    store_state("ws2", SAMPLE_STATE, db=db)
    workspaces = list_workspaces(db=db)
    assert "ws1" in workspaces
    assert "ws2" in workspaces


# ---------------------------------------------------------------------------
# State history
# ---------------------------------------------------------------------------

def test_state_history(db):
    store_state("hist-ws2", SAMPLE_STATE, db=db)
    store_state("hist-ws2", SAMPLE_STATE, db=db)
    store_state("hist-ws2", SAMPLE_STATE, db=db)
    history = get_state_history("hist-ws2", db=db)
    assert len(history) >= 2
    assert all("serial" in h for h in history)
