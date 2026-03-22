"""Tests for BlackRoad Terraform Modules."""
import json
import pytest
from terraform_modules import (
    TerraformVariable, TerraformOutput, TerraformModule,
    generate_main_tf, generate_variables_tf, generate_outputs_tf,
    generate_tfvars, generate_module_readme, plan_summary, cost_estimate,
    _init_db, save_module, list_modules,
)


def make_module(**kwargs):
    defaults = dict(name="test_module", provider="aws", resource_type="aws_instance")
    defaults.update(kwargs)
    return TerraformModule(**defaults)


class TestTerraformVariable:
    def test_basic_variable(self):
        v = TerraformVariable("region", "string", "AWS region", "us-east-1")
        tf = v.to_tf()
        assert 'variable "region"' in tf
        assert 'type        = string' in tf
        assert '"us-east-1"' in tf

    def test_required_has_no_default(self):
        v = TerraformVariable("name", required=True)
        tf = v.to_tf()
        assert "default" not in tf

    def test_sensitive_flag(self):
        v = TerraformVariable("secret", sensitive=True)
        tf = v.to_tf()
        assert "sensitive   = true" in tf

    def test_bool_default(self):
        v = TerraformVariable("enabled", "bool", default=True)
        tf = v.to_tf()
        assert "true" in tf

    def test_list_default(self):
        v = TerraformVariable("zones", "list(string)", default=["us-east-1a"])
        tf = v.to_tf()
        assert "us-east-1a" in tf


class TestTerraformOutput:
    def test_basic_output(self):
        o = TerraformOutput("instance_id", "aws_instance.main.id", "EC2 Instance ID")
        tf = o.to_tf()
        assert 'output "instance_id"' in tf
        assert "aws_instance.main.id" in tf

    def test_sensitive_output(self):
        o = TerraformOutput("password", "random_password.main.result", sensitive=True)
        tf = o.to_tf()
        assert "sensitive   = true" in tf


class TestTerraformModule:
    def test_valid_module(self):
        m = make_module()
        assert m.name == "test_module"
        assert m.provider == "aws"

    def test_invalid_provider(self):
        with pytest.raises(ValueError, match="provider"):
            make_module(provider="kubernetes")

    def test_invalid_name(self):
        with pytest.raises(ValueError):
            make_module(name="My Module!")

    def test_auto_required_providers(self):
        m = make_module(provider="aws")
        assert "aws" in m.required_providers

    def test_gcp_provider(self):
        m = make_module(provider="gcp", resource_type="google_compute_instance")
        assert m.provider == "gcp"


class TestGenerateMainTf:
    def test_contains_terraform_block(self):
        m = make_module()
        tf = generate_main_tf(m)
        assert "terraform {" in tf
        assert "required_version" in tf

    def test_contains_provider_block(self):
        m = make_module()
        tf = generate_main_tf(m)
        assert 'provider "aws"' in tf

    def test_contains_resource_block(self):
        m = make_module()
        tf = generate_main_tf(m)
        assert 'resource "aws_instance" "main"' in tf

    def test_gcp_provider_block(self):
        m = make_module(provider="gcp", resource_type="google_compute_instance")
        tf = generate_main_tf(m)
        assert 'provider "google"' in tf

    def test_vpc_resource_defaults(self):
        m = make_module(resource_type="aws_vpc")
        tf = generate_main_tf(m)
        assert "enable_dns_hostnames" in tf


class TestGenerateVariablesTf:
    def test_empty_variables(self):
        m = make_module()
        tf = generate_variables_tf(m)
        assert "No variables" in tf

    def test_with_variables(self):
        m = make_module(variables=[
            TerraformVariable("region", "string", "AWS region", "us-east-1")
        ])
        tf = generate_variables_tf(m)
        assert 'variable "region"' in tf


class TestGenerateTfvars:
    def test_string_value(self):
        result = generate_tfvars({"region": "us-east-1"})
        assert 'region = "us-east-1"' in result

    def test_int_value(self):
        result = generate_tfvars({"count": 3})
        assert "count = 3" in result

    def test_bool_value(self):
        result = generate_tfvars({"enabled": True})
        assert "enabled = true" in result

    def test_list_value(self):
        result = generate_tfvars({"zones": ["us-east-1a", "us-east-1b"]})
        assert "zones = " in result
        assert "us-east-1a" in result

    def test_dict_value(self):
        result = generate_tfvars({"tags": {"env": "prod"}})
        assert "tags = " in result


class TestPlanSummary:
    def test_json_plan(self):
        plan_json = json.dumps({
            "resource_changes": [
                {"address": "aws_instance.main", "change": {"actions": ["create"]}},
                {"address": "aws_s3_bucket.logs", "change": {"actions": ["update"]}},
                {"address": "aws_security_group.old", "change": {"actions": ["delete"]}},
            ]
        })
        result = plan_summary(plan_json)
        assert result["add"] == 1
        assert result["change"] == 1
        assert result["destroy"] == 1
        assert result["total_changes"] == 3

    def test_text_plan(self):
        text = "Plan: 3 to add, 1 to change, 0 to destroy."
        result = plan_summary(text)
        assert result["add"] == 3
        assert result["change"] == 1

    def test_no_changes(self):
        plan_json = json.dumps({"resource_changes": [
            {"address": "aws_instance.main", "change": {"actions": ["no-op"]}}
        ]})
        result = plan_summary(plan_json)
        assert result["total_changes"] == 0


class TestCostEstimate:
    def test_basic_aws_estimate(self):
        resources = [{"type": "instance", "count": 2, "hours": 730}]
        result = cost_estimate(resources, "aws")
        assert result["provider"] == "aws"
        assert result["total_monthly"] > 0
        assert len(result["breakdown"]) == 1

    def test_multiple_resources(self):
        resources = [
            {"type": "instance", "count": 3},
            {"type": "rds", "count": 1},
            {"type": "load_balancer", "count": 1},
        ]
        result = cost_estimate(resources, "aws")
        assert len(result["breakdown"]) == 3
        assert result["total_annual"] == result["total_monthly"] * 12

    def test_free_resources(self):
        resources = [{"type": "vpc", "count": 1}]
        result = cost_estimate(resources, "aws")
        assert result["total_monthly"] == 0.0

    def test_unknown_provider_returns_zero(self):
        resources = [{"type": "instance", "count": 1}]
        result = cost_estimate(resources, "unknown_cloud")
        assert result["total_monthly"] == 0.0


class TestSQLitePersistence:
    def test_save_and_list_module(self, tmp_path):
        db = _init_db(tmp_path / "test.db")
        m = make_module()
        mid = save_module(m, db)
        assert mid > 0
        rows = list_modules(db)
        assert len(rows) == 1
        assert rows[0]["name"] == "test_module"

    def test_module_files_saved(self, tmp_path):
        db = _init_db(tmp_path / "test.db")
        m = make_module()
        mid = save_module(m, db)
        files = db.execute(
            "SELECT filename FROM module_files WHERE module_id=?", (mid,)
        ).fetchall()
        filenames = [f[0] for f in files]
        assert "main.tf" in filenames
        assert "variables.tf" in filenames
        assert "outputs.tf" in filenames
