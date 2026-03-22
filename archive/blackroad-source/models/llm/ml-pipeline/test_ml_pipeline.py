"""Tests for ML Pipeline Orchestrator."""
import json
import pytest
import sys
sys.path.insert(0, "/tmp")
from ml_pipeline import (
    MLPipelineOrchestrator, Pipeline, FeatureSet, Model,
    PipelineStage, STATUS_CREATED, STATUS_DEPLOYED, STATUS_ROLLED_BACK,
)


@pytest.fixture
def orch(tmp_path):
    return MLPipelineOrchestrator(db_path=tmp_path / "test.db")


@pytest.fixture
def pipeline_id(orch):
    return orch.create_pipeline("test-pipeline", {"n_samples": 100})


def test_init_creates_db(tmp_path):
    db = tmp_path / "db"
    MLPipelineOrchestrator(db_path=db)
    assert db.exists()


def test_create_pipeline(orch):
    pid = orch.create_pipeline("my-pipeline", {"dataset": "iris"})
    assert pid
    pipeline = orch.get_pipeline(pid)
    assert pipeline.name == "my-pipeline"
    assert pipeline.status == STATUS_CREATED


def test_create_pipeline_default_stage(orch):
    pid = orch.create_pipeline("test")
    pipeline = orch.get_pipeline(pid)
    assert pipeline.current_stage == PipelineStage.DataIngestion.value


def test_get_pipeline_missing(orch):
    assert orch.get_pipeline("nonexistent") is None


def test_run_data_ingestion(orch, pipeline_id):
    result = orch.run_stage(pipeline_id, PipelineStage.DataIngestion)
    assert result["stage"] == "DataIngestion"
    assert result["status"] == "completed"
    assert "records_loaded" in result["output"]


def test_run_feature_engineering(orch, pipeline_id):
    result = orch.run_stage(pipeline_id, PipelineStage.FeatureEngineering)
    assert result["status"] == "completed"
    assert "features_computed" in result["output"]


def test_run_training_stage(orch, pipeline_id):
    result = orch.run_stage(pipeline_id, PipelineStage.Training)
    assert result["status"] == "completed"


def test_run_evaluation_stage(orch, pipeline_id):
    result = orch.run_stage(pipeline_id, PipelineStage.Evaluation)
    assert result["status"] == "completed"
    assert "accuracy" in result["output"]


def test_register_feature_set(orch, pipeline_id):
    fs = orch.register_feature_set(
        "iris_features",
        {"sepal_length": "float", "petal_width": "float"},
        pipeline_id=pipeline_id,
    )
    assert fs.name == "iris_features"
    assert fs.id


def test_train_model(orch, pipeline_id):
    model = orch.train(pipeline_id, "random_forest", {"n_estimators": 100})
    assert model.algorithm == "random_forest"
    assert model.version == 1
    assert "val_accuracy" in model.metrics


def test_train_model_increments_version(orch, pipeline_id):
    m1 = orch.train(pipeline_id, "rf")
    m2 = orch.train(pipeline_id, "rf")
    assert m2.version == m1.version + 1


def test_evaluate_pipeline(orch, pipeline_id):
    orch.train(pipeline_id, "rf")
    metrics = orch.evaluate(pipeline_id)
    assert "accuracy" in metrics
    assert 0 <= metrics["accuracy"] <= 1


def test_deploy_pipeline(orch, pipeline_id):
    orch.train(pipeline_id, "rf")
    result = orch.deploy(pipeline_id)
    assert result["status"] == "deployed"
    assert "endpoint" in result
    pipeline = orch.get_pipeline(pipeline_id)
    assert pipeline.status == STATUS_DEPLOYED


def test_rollback_pipeline(orch, pipeline_id):
    orch.train(pipeline_id, "rf")
    orch.train(pipeline_id, "rf")
    orch.deploy(pipeline_id)
    result = orch.rollback(pipeline_id)
    assert result["active_version"] < result["rolled_back_from_version"]


def test_rollback_no_previous_raises(orch, pipeline_id):
    orch.train(pipeline_id, "rf")
    with pytest.raises(ValueError, match="No previous version"):
        orch.rollback(pipeline_id)


def test_status(orch, pipeline_id):
    orch.train(pipeline_id, "rf")
    status = orch.status(pipeline_id)
    assert "pipeline" in status
    assert "models" in status
    assert len(status["models"]) == 1
