"""Tests for k8s_operator.py"""
import json
import tempfile
import time
from pathlib import Path
import pytest
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from k8s_operator import (
    Controller, Resource, ResourceKind, ResourceStatus,
    _yaml_to_dict, _dict_to_yaml, _get_db, Event,
)


@pytest.fixture
def tmp_db(tmp_path):
    return _get_db(tmp_path / "test.db")


@pytest.fixture
def ctrl(tmp_path):
    return Controller(ResourceKind.DEPLOYMENT.value, db_path=tmp_path / "test.db")


# ---------------------------------------------------------------------------
# YAML parser
# ---------------------------------------------------------------------------

def test_yaml_to_dict_simple():
    yaml = "apiVersion: apps/v1\nkind: Deployment\n"
    d = _yaml_to_dict(yaml)
    assert d["apiVersion"] == "apps/v1"
    assert d["kind"] == "Deployment"


def test_yaml_to_dict_nested():
    yaml = "metadata:\n  name: myapp\n  namespace: default\n"
    d = _yaml_to_dict(yaml)
    assert d["metadata"]["name"] == "myapp"
    assert d["metadata"]["namespace"] == "default"


def test_yaml_to_dict_integer():
    yaml = "replicas: 3\n"
    d = _yaml_to_dict(yaml)
    assert d["replicas"] == 3


def test_yaml_to_dict_boolean():
    d = _yaml_to_dict("enabled: true\n")
    assert d["enabled"] is True


def test_dict_to_yaml_roundtrip():
    d = {"kind": "Deployment", "metadata": {"name": "x"}, "spec": {"replicas": 2}}
    yaml_str = _dict_to_yaml(d)
    assert "Deployment" in yaml_str
    assert "replicas" in yaml_str


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def test_create_resource(ctrl):
    r = ctrl.create_resource("Deployment", "web", "default", {"replicas": 1})
    assert r.id
    assert r.name == "web"
    assert r.kind == "Deployment"
    assert r.status == ResourceStatus.PENDING.value


def test_create_resource_with_labels(ctrl):
    r = ctrl.create_resource("Service", "svc", "prod", {}, labels={"app": "api"})
    assert r.labels["app"] == "api"


def test_delete_resource(ctrl):
    r = ctrl.create_resource("Deployment", "to-del", "default", {})
    ok = ctrl.delete_resource(r.id)
    assert ok
    status = ctrl.get_status(r.id)
    assert "error" in status


def test_delete_nonexistent(ctrl):
    assert ctrl.delete_resource("nonexistent-id") is False


def test_update_resource(ctrl):
    r = ctrl.create_resource("Deployment", "app", "default", {"replicas": 1})
    updated = ctrl.update_resource(r.id, spec={"replicas": 3})
    assert updated.spec["replicas"] == 3
    assert updated.resource_version == 2


# ---------------------------------------------------------------------------
# Scaling
# ---------------------------------------------------------------------------

def test_scale_deployment(ctrl):
    r = ctrl.create_resource("Deployment", "scaled", "default", {"replicas": 1})
    result = ctrl.scale(r.id, 5)
    assert result["success"]
    assert result["new_replicas"] == 5
    assert result["old_replicas"] == 1


def test_scale_negative_replicas(ctrl):
    r = ctrl.create_resource("Deployment", "d", "default", {})
    with pytest.raises(ValueError):
        ctrl.scale(r.id, -1)


def test_scale_wrong_kind(ctrl):
    r = ctrl.create_resource("Service", "svc", "default", {})
    result = ctrl.scale(r.id, 3)
    assert not result["success"]


def test_scale_nonexistent(ctrl):
    result = ctrl.scale("bad-id", 3)
    assert not result["success"]


# ---------------------------------------------------------------------------
# Status
# ---------------------------------------------------------------------------

def test_get_status(ctrl):
    r = ctrl.create_resource("Deployment", "st", "default", {"replicas": 2})
    status = ctrl.get_status(r.id)
    assert status["id"] == r.id
    assert status["kind"] == "Deployment"
    assert "recent_events" in status


def test_set_status(ctrl):
    r = ctrl.create_resource("Deployment", "st2", "default", {})
    ok = ctrl.set_status(r.id, ResourceStatus.RUNNING.value)
    assert ok
    status = ctrl.get_status(r.id)
    assert status["status"] == ResourceStatus.RUNNING.value


# ---------------------------------------------------------------------------
# Apply manifest
# ---------------------------------------------------------------------------

def test_apply_manifest_create(ctrl):
    yaml = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
spec:
  replicas: 3
"""
    r = ctrl.apply_manifest(yaml)
    assert r.name == "nginx"
    assert r.spec.get("replicas") == 3


def test_apply_manifest_update(ctrl):
    yaml = "apiVersion: v1\nkind: Service\nmetadata:\n  name: svc\n  namespace: default\nspec:\n  port: 80\n"
    r1 = ctrl.apply_manifest(yaml)
    yaml2 = "apiVersion: v1\nkind: Service\nmetadata:\n  name: svc\n  namespace: default\nspec:\n  port: 443\n"
    r2 = ctrl.apply_manifest(yaml2)
    assert r2.id == r1.id
    assert r2.spec.get("port") == 443


# ---------------------------------------------------------------------------
# Reconcile
# ---------------------------------------------------------------------------

def test_reconcile_creates_missing(ctrl):
    desired = [{"kind": "Deployment", "name": "app1", "namespace": "default", "spec": {"replicas": 2}}]
    results = ctrl.reconcile(desired)
    assert any(r.action == "created" for r in results)


def test_reconcile_updates_changed(ctrl):
    ctrl.create_resource("Deployment", "app2", "default", {"replicas": 1})
    desired = [{"kind": "Deployment", "name": "app2", "namespace": "default", "spec": {"replicas": 5}}]
    results = ctrl.reconcile(desired)
    assert any(r.action == "updated" for r in results)


def test_reconcile_noop_unchanged(ctrl):
    ctrl.create_resource("Deployment", "app3", "default", {"replicas": 2})
    desired = [{"kind": "Deployment", "name": "app3", "namespace": "default", "spec": {"replicas": 2}}]
    results = ctrl.reconcile(desired)
    assert any(r.action == "noop" for r in results)


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

def test_list_resources_by_namespace(ctrl):
    ctrl.create_resource("Deployment", "a", "ns1", {})
    ctrl.create_resource("Deployment", "b", "ns2", {})
    ns1 = ctrl.list_resources(namespace="ns1")
    assert len(ns1) == 1
    assert ns1[0].namespace == "ns1"


def test_list_resources_by_label(ctrl):
    ctrl.create_resource("Deployment", "tagged", "default", {}, labels={"env": "prod"})
    ctrl.create_resource("Deployment", "untagged", "default", {}, labels={"env": "dev"})
    prod = ctrl.list_resources(label_selector={"env": "prod"})
    assert all(r.labels["env"] == "prod" for r in prod)


# ---------------------------------------------------------------------------
# Export YAML
# ---------------------------------------------------------------------------

def test_export_yaml(ctrl):
    r = ctrl.create_resource("Deployment", "exp", "default", {"replicas": 1})
    yaml_str = ctrl.export_yaml(r.id)
    assert "Deployment" in yaml_str
    assert "exp" in yaml_str


def test_export_yaml_not_found(ctrl):
    yaml_str = ctrl.export_yaml("nonexistent")
    assert "Error" in yaml_str
