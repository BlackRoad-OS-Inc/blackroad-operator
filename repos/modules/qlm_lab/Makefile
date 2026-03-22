.PHONY: setup demo demo_toolcaller demo_toolformer demo_rag test lint notebooks ingest index gate

setup:
	python -m venv .venv && . .venv/bin/activate && pip install -e .[qiskit] pytest pytest-cov ruff mypy jupyter nbconvert

demo:
	python -m qlm_lab.demos.demo_bell

demo_toolcaller:
	python -m qlm_lab.demos.demo_toolcaller

demo_toolformer:
	python -m qlm_lab.demos.demo_toolformer_prompt

demo_rag: ingest index
	python -m qlm_lab.demos.demo_rag

test:
. .venv/bin/activate && pytest -q

lint:
. .venv/bin/activate && ruff check . && mypy qlm_lab

notebooks:
	jupyter nbconvert --to notebook --execute notebooks/01_bell_chsh.ipynb --output out01.ipynb

ingest:
	python -c "from qlm_lab.retrieval.ingest import ingest; from pathlib import Path; art=Path('modules/qlm_lab/artifacts'); art.mkdir(parents=True, exist_ok=True); print(ingest('modules/qlm_lab/docs_local', str(art / 'corpus.jsonl')))"

index: ingest
	python -c "from qlm_lab.retrieval.index import TfidfIndex; from pathlib import Path; art=Path('modules/qlm_lab/artifacts'); idx=TfidfIndex(); idx.build(str(art / 'corpus.jsonl')); idx.save(str(art / 'index.json')); print('ok')"

gate: test
	python modules/qlm_lab/scripts/make_gate_input.py && cat prism/ci/qlm_lab.coverage.json
