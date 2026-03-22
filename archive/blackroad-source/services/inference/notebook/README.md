# blackroad-notebook-server

![CI](https://github.com/BlackRoad-Labs/blackroad-notebook-server/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![License](https://img.shields.io/badge/license-proprietary-red)

Jupyter notebook server with AI kernels for the BlackRoad OS platform.

## Features
- Create, load, execute, and export Jupyter notebooks
- SQLite-backed persistence
- Multi-format export: `.ipynb`, `.py`, `.html`
- Execution history tracking

## Install
```bash
pip install jupyter nbconvert
```

## Usage
```bash
python main.py create "My Notebook" notebooks/demo.ipynb
python main.py list
python main.py execute <id>
python main.py export <id> --format script
python main.py history <id>
python main.py kernels
```

## Testing
```bash
python -m pytest test_notebook_server.py -v
```
