# blackroad-ml-pipeline

> Machine learning pipeline orchestration from ingestion to deployment

Orchestrate end-to-end ML pipelines through five stages: DataIngestion → FeatureEngineering → Training → Evaluation → Deployment. Track all runs, models, and metrics in SQLite.

## Features

- 🔄 **5-stage pipeline** — DataIngestion, FeatureEngineering, Training, Evaluation, Deployment
- 🧠 **Multi-model support** — Train and compare multiple algorithms per pipeline
- 📊 **Metrics tracking** — Accuracy, F1, precision, recall, AUC-ROC per model
- 🔙 **Rollback** — Instantly revert to previous model version
- 📦 **Feature sets** — Register and version training feature sets
- 📈 **Status** — Full pipeline status with stage run history

## Installation

```bash
git clone https://github.com/BlackRoad-Labs/blackroad-ml-pipeline
cd blackroad-ml-pipeline
pip install pytest  # only stdlib + pytest needed
```

## Pipeline Stages

```
DataIngestion → FeatureEngineering → Training → Evaluation → Deployment
     ↓                 ↓               ↓            ↓            ↓
  Load data       Compute         Train model   Evaluate    Deploy to
  from source     features        on features   test set    endpoint
```

## Usage

### Create a pipeline

```bash
python ml_pipeline.py create "iris-classifier" \
  --config '{"dataset": "iris", "n_samples": 1000, "epochs": 50}'
```

### Run stages

```bash
PIPELINE_ID=<id-from-create>
python ml_pipeline.py run $PIPELINE_ID DataIngestion
python ml_pipeline.py run $PIPELINE_ID FeatureEngineering
python ml_pipeline.py run $PIPELINE_ID Training
```

### Register feature set

```bash
python ml_pipeline.py register-features "iris_v1" \
  --features '{"sepal_length": "float", "petal_width": "float"}' \
  --split train \
  --pipeline-id $PIPELINE_ID
```

### Train a model

```bash
python ml_pipeline.py train $PIPELINE_ID random_forest \
  --hyperparams '{"n_estimators": 100, "max_depth": 5}'
```

### Evaluate

```bash
python ml_pipeline.py evaluate $PIPELINE_ID
```

### Deploy

```bash
python ml_pipeline.py deploy $PIPELINE_ID
```

### Rollback

```bash
python ml_pipeline.py rollback $PIPELINE_ID
```

### Check status

```bash
python ml_pipeline.py status $PIPELINE_ID
```

## Tests

```bash
pytest tests/ -v
```
