"""
Machine Learning Pipeline Orchestration
blackroad-ml-pipeline: Orchestrate ML pipelines from ingestion through deployment.
"""

import argparse
import json
import logging
import os
import random
import sqlite3
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional
from uuid import uuid4

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ml_pipeline")

DB_PATH = Path(os.environ.get("ML_PIPELINE_DB", Path.home() / ".blackroad" / "ml_pipeline.db"))


class PipelineStage(str, Enum):
    """Stages of an ML pipeline."""
    DataIngestion = "DataIngestion"
    FeatureEngineering = "FeatureEngineering"
    Training = "Training"
    Evaluation = "Evaluation"
    Deployment = "Deployment"


STAGE_ORDER = [
    PipelineStage.DataIngestion,
    PipelineStage.FeatureEngineering,
    PipelineStage.Training,
    PipelineStage.Evaluation,
    PipelineStage.Deployment,
]

STATUS_CREATED = "created"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_DEPLOYED = "deployed"
STATUS_ROLLED_BACK = "rolled_back"

SPLIT_TRAIN = "train"
SPLIT_VAL = "val"
SPLIT_TEST = "test"


@dataclass
class Pipeline:
    """Represents an ML pipeline with configuration and state."""
    id: str
    name: str
    config: dict
    current_stage: str
    status: str
    created_at: str
    updated_at: str
    error_msg: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["config"] = self.config
        return d

    @classmethod
    def from_row(cls, row) -> "Pipeline":
        return cls(
            id=row["id"],
            name=row["name"],
            config=json.loads(row["config"]) if row["config"] else {},
            current_stage=row["current_stage"],
            status=row["status"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            error_msg=row["error_msg"] or "",
        )


@dataclass
class FeatureSet:
    """Represents a versioned feature set."""
    id: str
    name: str
    version: str
    features: dict
    split: str
    size: int
    pipeline_id: Optional[str]
    created_at: str

    def to_dict(self) -> dict:
        d = asdict(self)
        d["features"] = self.features
        return d

    @classmethod
    def from_row(cls, row) -> "FeatureSet":
        return cls(
            id=row["id"],
            name=row["name"],
            version=row["version"],
            features=json.loads(row["features"]) if row["features"] else {},
            split=row["split"],
            size=row["size"],
            pipeline_id=row["pipeline_id"],
            created_at=row["created_at"],
        )


@dataclass
class Model:
    """Represents a trained ML model."""
    id: str
    pipeline_id: str
    algorithm: str
    hyperparams: dict
    metrics: dict
    artifact_path: str
    is_deployed: bool
    created_at: str
    version: int = 1

    def to_dict(self) -> dict:
        d = asdict(self)
        d["hyperparams"] = self.hyperparams
        d["metrics"] = self.metrics
        return d

    @classmethod
    def from_row(cls, row) -> "Model":
        return cls(
            id=row["id"],
            pipeline_id=row["pipeline_id"],
            algorithm=row["algorithm"],
            hyperparams=json.loads(row["hyperparams"]) if row["hyperparams"] else {},
            metrics=json.loads(row["metrics"]) if row["metrics"] else {},
            artifact_path=row["artifact_path"],
            is_deployed=bool(row["is_deployed"]),
            created_at=row["created_at"],
            version=row["version"] if "version" in row.keys() else 1,
        )


class MLPipelineOrchestrator:
    """
    ML Pipeline Orchestrator.

    Manages ML pipelines from data ingestion through deployment, tracking
    all state in SQLite. Simulates work in each pipeline stage with logging.

    Usage::

        orch = MLPipelineOrchestrator()
        pipeline_id = orch.create_pipeline("my-experiment", {"dataset": "iris"})
        orch.run_stage(pipeline_id, PipelineStage.DataIngestion)
        orch.train(pipeline_id, "random_forest", {"n_estimators": 100})
    """

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS pipelines (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    config TEXT DEFAULT '{}',
                    current_stage TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    error_msg TEXT DEFAULT ''
                );

                CREATE TABLE IF NOT EXISTS feature_sets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    version TEXT NOT NULL,
                    features TEXT DEFAULT '{}',
                    split TEXT NOT NULL,
                    size INTEGER DEFAULT 0,
                    pipeline_id TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS models (
                    id TEXT PRIMARY KEY,
                    pipeline_id TEXT NOT NULL,
                    algorithm TEXT NOT NULL,
                    hyperparams TEXT DEFAULT '{}',
                    metrics TEXT DEFAULT '{}',
                    artifact_path TEXT DEFAULT '',
                    is_deployed INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    version INTEGER DEFAULT 1,
                    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
                );

                CREATE TABLE IF NOT EXISTS stage_runs (
                    id TEXT PRIMARY KEY,
                    pipeline_id TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    status TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    completed_at TEXT,
                    duration_ms INTEGER DEFAULT 0,
                    output TEXT DEFAULT '{}'
                );

                CREATE INDEX IF NOT EXISTS idx_pipelines_name ON pipelines(name);
                CREATE INDEX IF NOT EXISTS idx_models_pipeline ON models(pipeline_id);
                CREATE INDEX IF NOT EXISTS idx_stages_pipeline ON stage_runs(pipeline_id);
            """)
        logger.debug("DB initialized at %s", self.db_path)

    def _touch_pipeline(self, pipeline_id: str, status: Optional[str] = None, stage: Optional[str] = None, error: str = "") -> None:
        """Update pipeline timestamp and optionally status/stage."""
        now = datetime.utcnow().isoformat()
        with self._get_conn() as conn:
            if status and stage:
                conn.execute(
                    "UPDATE pipelines SET updated_at=?, status=?, current_stage=?, error_msg=? WHERE id=?",
                    (now, status, stage, error, pipeline_id),
                )
            elif status:
                conn.execute(
                    "UPDATE pipelines SET updated_at=?, status=?, error_msg=? WHERE id=?",
                    (now, status, error, pipeline_id),
                )
            else:
                conn.execute("UPDATE pipelines SET updated_at=? WHERE id=?", (now, pipeline_id))

    def create_pipeline(self, name: str, config: Optional[dict] = None) -> str:
        """Create a new ML pipeline.

        Args:
            name: Pipeline name.
            config: Configuration dict (dataset paths, settings, etc.).

        Returns:
            Pipeline ID (UUID string).
        """
        now = datetime.utcnow().isoformat()
        pipeline_id = str(uuid4())
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO pipelines (id, name, config, current_stage, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    pipeline_id, name, json.dumps(config or {}),
                    PipelineStage.DataIngestion.value,
                    STATUS_CREATED, now, now,
                ),
            )
        logger.info("Pipeline created: %s (%s)", name, pipeline_id[:8])
        return pipeline_id

    def get_pipeline(self, pipeline_id: str) -> Optional[Pipeline]:
        """Fetch a pipeline by ID."""
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM pipelines WHERE id=?", (pipeline_id,)).fetchone()
        return Pipeline.from_row(row) if row else None

    def run_stage(self, pipeline_id: str, stage: PipelineStage) -> dict:
        """Execute a specific pipeline stage.

        Each stage simulates work and logs progress. Updates pipeline state
        upon completion or failure.

        Args:
            pipeline_id: Target pipeline.
            stage: Stage to run.

        Returns:
            Dict with stage, status, duration_ms, output.
        """
        pipeline = self.get_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found.")

        logger.info("Running stage %s for pipeline %s", stage.value, pipeline_id[:8])
        self._touch_pipeline(pipeline_id, STATUS_RUNNING, stage.value)

        started_at = datetime.utcnow()
        run_id = str(uuid4())

        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO stage_runs (id, pipeline_id, stage, status, started_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (run_id, pipeline_id, stage.value, "running", started_at.isoformat()),
            )

        try:
            output = self._execute_stage(pipeline_id, stage, pipeline.config)
            status = "completed"
            logger.info("Stage %s completed for pipeline %s", stage.value, pipeline_id[:8])
        except Exception as e:
            output = {"error": str(e)}
            status = "failed"
            logger.error("Stage %s failed: %s", stage.value, e)
            self._touch_pipeline(pipeline_id, STATUS_FAILED, stage.value, error=str(e))

        completed_at = datetime.utcnow()
        duration_ms = int((completed_at - started_at).total_seconds() * 1000)

        with self._get_conn() as conn:
            conn.execute(
                """UPDATE stage_runs SET status=?, completed_at=?, duration_ms=?, output=?
                   WHERE id=?""",
                (status, completed_at.isoformat(), duration_ms, json.dumps(output), run_id),
            )

        if status == "completed":
            self._touch_pipeline(pipeline_id, STATUS_RUNNING, stage.value)

        return {
            "stage": stage.value,
            "status": status,
            "duration_ms": duration_ms,
            "output": output,
        }

    def _execute_stage(self, pipeline_id: str, stage: PipelineStage, config: dict) -> dict:
        """Simulate stage execution. Returns stage output dict."""
        if stage == PipelineStage.DataIngestion:
            return self._run_data_ingestion(pipeline_id, config)
        elif stage == PipelineStage.FeatureEngineering:
            return self._run_feature_engineering(pipeline_id, config)
        elif stage == PipelineStage.Training:
            return self._run_training(pipeline_id, config)
        elif stage == PipelineStage.Evaluation:
            return self._run_evaluation(pipeline_id, config)
        elif stage == PipelineStage.Deployment:
            return self._run_deployment(pipeline_id, config)
        else:
            raise ValueError(f"Unknown stage: {stage}")

    def _run_data_ingestion(self, pipeline_id: str, config: dict) -> dict:
        logger.info("[DataIngestion] Loading dataset from %s", config.get("dataset", "default"))
        time.sleep(0.05)
        n_samples = config.get("n_samples", 1000)
        return {
            "records_loaded": n_samples,
            "source": config.get("dataset", "synthetic"),
            "schema": ["feature_1", "feature_2", "label"],
        }

    def _run_feature_engineering(self, pipeline_id: str, config: dict) -> dict:
        logger.info("[FeatureEngineering] Computing features")
        time.sleep(0.05)
        n = config.get("n_samples", 1000)
        return {
            "features_computed": 10,
            "train_size": int(n * 0.7),
            "val_size": int(n * 0.15),
            "test_size": int(n * 0.15),
        }

    def _run_training(self, pipeline_id: str, config: dict) -> dict:
        logger.info("[Training] Training model")
        time.sleep(0.05)
        return {
            "epochs": config.get("epochs", 10),
            "final_loss": round(random.uniform(0.05, 0.3), 4),
        }

    def _run_evaluation(self, pipeline_id: str, config: dict) -> dict:
        logger.info("[Evaluation] Evaluating model on test set")
        time.sleep(0.05)
        return {
            "accuracy": round(random.uniform(0.80, 0.99), 4),
            "f1_score": round(random.uniform(0.78, 0.98), 4),
            "precision": round(random.uniform(0.80, 0.99), 4),
            "recall": round(random.uniform(0.75, 0.99), 4),
        }

    def _run_deployment(self, pipeline_id: str, config: dict) -> dict:
        logger.info("[Deployment] Deploying model")
        time.sleep(0.05)
        return {
            "endpoint": f"/api/v1/predict/{pipeline_id[:8]}",
            "replicas": config.get("replicas", 1),
        }

    def register_feature_set(
        self,
        name: str,
        features: dict,
        data: Optional[dict] = None,
        split: str = SPLIT_TRAIN,
        pipeline_id: Optional[str] = None,
        version: str = "1.0",
    ) -> FeatureSet:
        """Register a feature set for use in training.

        Args:
            name: Feature set name.
            features: Dict of feature name → dtype/description.
            data: Optional data dict (for size estimation).
            split: train/val/test.
            pipeline_id: Associated pipeline ID.
            version: Feature set version.

        Returns:
            The registered FeatureSet.
        """
        size = len(data) if data else 0
        fs = FeatureSet(
            id=str(uuid4()),
            name=name,
            version=version,
            features=features,
            split=split,
            size=size,
            pipeline_id=pipeline_id,
            created_at=datetime.utcnow().isoformat(),
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO feature_sets (id, name, version, features, split, size, pipeline_id, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (fs.id, fs.name, fs.version, json.dumps(fs.features), fs.split, fs.size, fs.pipeline_id, fs.created_at),
            )
        logger.info("Feature set registered: %s v%s (%s split, %d records)", name, version, split, size)
        return fs

    def train(
        self,
        pipeline_id: str,
        algorithm: str,
        hyperparams: Optional[dict] = None,
    ) -> Model:
        """Train a model for this pipeline.

        Args:
            pipeline_id: Pipeline to train for.
            algorithm: Algorithm name (e.g. 'random_forest', 'xgboost').
            hyperparams: Hyperparameter dict.

        Returns:
            The trained Model.
        """
        pipeline = self.get_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found.")

        logger.info("Training %s for pipeline %s", algorithm, pipeline_id[:8])

        with self._get_conn() as conn:
            version_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM models WHERE pipeline_id=?", (pipeline_id,)
            ).fetchone()
            version = version_row["cnt"] + 1

        metrics = {
            "train_loss": round(random.uniform(0.01, 0.2), 4),
            "val_loss": round(random.uniform(0.02, 0.25), 4),
            "val_accuracy": round(random.uniform(0.80, 0.99), 4),
        }
        artifact_path = f"/artifacts/{pipeline_id[:8]}/{algorithm}_v{version}.pkl"

        model = Model(
            id=str(uuid4()),
            pipeline_id=pipeline_id,
            algorithm=algorithm,
            hyperparams=hyperparams or {},
            metrics=metrics,
            artifact_path=artifact_path,
            is_deployed=False,
            created_at=datetime.utcnow().isoformat(),
            version=version,
        )

        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO models
                   (id, pipeline_id, algorithm, hyperparams, metrics, artifact_path, is_deployed, created_at, version)
                   VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)""",
                (
                    model.id, model.pipeline_id, model.algorithm,
                    json.dumps(model.hyperparams), json.dumps(model.metrics),
                    model.artifact_path, model.created_at, model.version,
                ),
            )

        self._touch_pipeline(pipeline_id, STATUS_RUNNING, PipelineStage.Training.value)
        logger.info("Model trained: %s v%d accuracy=%.4f", algorithm, version, metrics["val_accuracy"])
        return model

    def evaluate(self, pipeline_id: str, test_features: Optional[dict] = None) -> dict:
        """Evaluate the latest model for a pipeline.

        Args:
            pipeline_id: Pipeline to evaluate.
            test_features: Optional test feature dict.

        Returns:
            Evaluation metrics dict.
        """
        with self._get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM models WHERE pipeline_id=? ORDER BY version DESC LIMIT 1",
                (pipeline_id,),
            ).fetchone()

        if not row:
            raise ValueError(f"No model found for pipeline {pipeline_id}")

        metrics = {
            "accuracy": round(random.uniform(0.80, 0.99), 4),
            "f1_score": round(random.uniform(0.78, 0.98), 4),
            "precision": round(random.uniform(0.80, 0.99), 4),
            "recall": round(random.uniform(0.75, 0.99), 4),
            "auc_roc": round(random.uniform(0.85, 0.99), 4),
            "test_samples": len(test_features) if test_features else 200,
        }

        model_id = row["id"]
        existing = json.loads(row["metrics"]) if row["metrics"] else {}
        existing.update(metrics)

        with self._get_conn() as conn:
            conn.execute(
                "UPDATE models SET metrics=? WHERE id=?",
                (json.dumps(existing), model_id),
            )

        self._touch_pipeline(pipeline_id, STATUS_RUNNING, PipelineStage.Evaluation.value)
        logger.info("Evaluation complete for pipeline %s: accuracy=%.4f", pipeline_id[:8], metrics["accuracy"])
        return metrics

    def deploy(self, pipeline_id: str) -> dict:
        """Deploy the latest model for a pipeline.

        Args:
            pipeline_id: Pipeline to deploy.

        Returns:
            Deployment info dict.
        """
        with self._get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM models WHERE pipeline_id=? ORDER BY version DESC LIMIT 1",
                (pipeline_id,),
            ).fetchone()

        if not row:
            raise ValueError(f"No model found for pipeline {pipeline_id}")

        model_id = row["id"]
        endpoint = f"/api/v1/predict/{pipeline_id[:8]}"

        with self._get_conn() as conn:
            conn.execute("UPDATE models SET is_deployed=1 WHERE id=?", (model_id,))
            conn.execute("UPDATE models SET is_deployed=0 WHERE pipeline_id=? AND id != ?", (pipeline_id, model_id))

        self._touch_pipeline(pipeline_id, STATUS_DEPLOYED, PipelineStage.Deployment.value)
        logger.info("Pipeline %s deployed at %s", pipeline_id[:8], endpoint)
        return {
            "pipeline_id": pipeline_id,
            "model_id": model_id,
            "endpoint": endpoint,
            "status": "deployed",
        }

    def rollback(self, pipeline_id: str) -> dict:
        """Rollback to the previous model version.

        Args:
            pipeline_id: Pipeline to roll back.

        Returns:
            Rollback info dict.
        """
        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM models WHERE pipeline_id=? ORDER BY version DESC LIMIT 2",
                (pipeline_id,),
            ).fetchall()

        if len(rows) < 2:
            raise ValueError(f"No previous version to rollback to for pipeline {pipeline_id}")

        current = rows[0]
        previous = rows[1]

        with self._get_conn() as conn:
            conn.execute("UPDATE models SET is_deployed=0 WHERE id=?", (current["id"],))
            conn.execute("UPDATE models SET is_deployed=1 WHERE id=?", (previous["id"],))

        self._touch_pipeline(pipeline_id, STATUS_ROLLED_BACK, PipelineStage.Deployment.value)
        logger.info("Rolled back pipeline %s from v%d to v%d", pipeline_id[:8], current["version"], previous["version"])
        return {
            "pipeline_id": pipeline_id,
            "rolled_back_from_version": current["version"],
            "active_version": previous["version"],
        }

    def status(self, pipeline_id: str) -> dict:
        """Get full status of a pipeline including models and stage runs.

        Returns:
            Status dict.
        """
        pipeline = self.get_pipeline(pipeline_id)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found.")

        with self._get_conn() as conn:
            models = conn.execute(
                "SELECT * FROM models WHERE pipeline_id=? ORDER BY version", (pipeline_id,)
            ).fetchall()
            stages = conn.execute(
                "SELECT * FROM stage_runs WHERE pipeline_id=? ORDER BY started_at", (pipeline_id,)
            ).fetchall()

        return {
            "pipeline": pipeline.to_dict(),
            "models": [
                {
                    "id": m["id"][:8] + "...",
                    "algorithm": m["algorithm"],
                    "version": m["version"],
                    "is_deployed": bool(m["is_deployed"]),
                    "metrics": json.loads(m["metrics"]),
                }
                for m in models
            ],
            "stage_runs": [
                {
                    "stage": s["stage"],
                    "status": s["status"],
                    "duration_ms": s["duration_ms"],
                }
                for s in stages
            ],
        }

    def list_pipelines(self) -> list:
        """List all pipelines."""
        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM pipelines ORDER BY created_at DESC"
            ).fetchall()
        return [Pipeline.from_row(r).to_dict() for r in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_create(args, orch: MLPipelineOrchestrator) -> None:
    config = json.loads(args.config) if args.config else {}
    pipeline_id = orch.create_pipeline(args.name, config)
    print(f"✓ Pipeline created: {pipeline_id}")


def cmd_run(args, orch: MLPipelineOrchestrator) -> None:
    stage = PipelineStage(args.stage)
    result = orch.run_stage(args.pipeline_id, stage)
    print(f"Stage {result['stage']}: {result['status']} ({result['duration_ms']}ms)")
    print(json.dumps(result["output"], indent=2))


def cmd_register_features(args, orch: MLPipelineOrchestrator) -> None:
    features = json.loads(args.features) if args.features else {}
    fs = orch.register_feature_set(
        name=args.name,
        features=features,
        split=args.split,
        pipeline_id=getattr(args, "pipeline_id", None),
        version=args.version,
    )
    print(f"✓ Feature set registered: {fs.name} v{fs.version} ({fs.split})")


def cmd_train(args, orch: MLPipelineOrchestrator) -> None:
    hparams = json.loads(args.hyperparams) if args.hyperparams else {}
    model = orch.train(args.pipeline_id, args.algorithm, hparams)
    print(f"✓ Model trained: {model.algorithm} v{model.version}")
    print(f"  Metrics: {json.dumps(model.metrics)}")


def cmd_evaluate(args, orch: MLPipelineOrchestrator) -> None:
    metrics = orch.evaluate(args.pipeline_id)
    print("Evaluation metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v}")


def cmd_deploy(args, orch: MLPipelineOrchestrator) -> None:
    result = orch.deploy(args.pipeline_id)
    print(f"✓ Deployed pipeline {args.pipeline_id[:8]}...")
    print(f"  Endpoint: {result['endpoint']}")


def cmd_rollback(args, orch: MLPipelineOrchestrator) -> None:
    result = orch.rollback(args.pipeline_id)
    print(f"✓ Rolled back from v{result['rolled_back_from_version']} to v{result['active_version']}")


def cmd_status(args, orch: MLPipelineOrchestrator) -> None:
    status = orch.status(args.pipeline_id)
    p = status["pipeline"]
    print(f"Pipeline: {p['name']} ({p['id'][:8]}...)")
    print(f"  Stage: {p['current_stage']}")
    print(f"  Status: {p['status']}")
    if status["models"]:
        print("Models:")
        for m in status["models"]:
            deployed = " [DEPLOYED]" if m["is_deployed"] else ""
            print(f"  v{m['version']} {m['algorithm']}{deployed}")
    if status["stage_runs"]:
        print("Stage runs:")
        for s in status["stage_runs"]:
            print(f"  {s['stage']}: {s['status']} ({s['duration_ms']}ms)")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ML Pipeline Orchestrator")
    parser.add_argument("--db", help="Override database path")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("create", help="Create a new pipeline")
    p.add_argument("name", help="Pipeline name")
    p.add_argument("--config", help="JSON config string")
    p.set_defaults(func=cmd_create)

    p = sub.add_parser("run", help="Run a pipeline stage")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.add_argument("stage", choices=[s.value for s in PipelineStage])
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("register-features", help="Register a feature set")
    p.add_argument("name", help="Feature set name")
    p.add_argument("--features", help="JSON features dict")
    p.add_argument("--split", default=SPLIT_TRAIN, choices=[SPLIT_TRAIN, SPLIT_VAL, SPLIT_TEST])
    p.add_argument("--version", default="1.0")
    p.add_argument("--pipeline-id", help="Associate with pipeline")
    p.set_defaults(func=cmd_register_features)

    p = sub.add_parser("train", help="Train a model")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.add_argument("algorithm", help="Algorithm name")
    p.add_argument("--hyperparams", help="JSON hyperparams")
    p.set_defaults(func=cmd_train)

    p = sub.add_parser("evaluate", help="Evaluate the latest model")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.set_defaults(func=cmd_evaluate)

    p = sub.add_parser("deploy", help="Deploy the latest model")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.set_defaults(func=cmd_deploy)

    p = sub.add_parser("rollback", help="Rollback to previous model version")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.set_defaults(func=cmd_rollback)

    p = sub.add_parser("status", help="Show pipeline status")
    p.add_argument("pipeline_id", help="Pipeline ID")
    p.set_defaults(func=cmd_status)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    db_path = Path(args.db) if getattr(args, "db", None) else None
    orch = MLPipelineOrchestrator(db_path=db_path)
    args.func(args, orch)


if __name__ == "__main__":
    main()
