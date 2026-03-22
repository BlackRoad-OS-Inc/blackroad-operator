import os
from pathlib import Path

import pytest

from mfg import routing, work_instructions as wi


def test_wi_paths(tmp_path, monkeypatch):
    monkeypatch.setattr(wi, 'ART_DIR', tmp_path)
    routing.ROUT_DB = {'ITEM_A': {'item': 'ITEM', 'rev': 'A', 'steps': [{'wc': 'WC', 'op': 'OP'}]}}
    wi.render('ITEM', 'A')
    assert os.path.exists(tmp_path / 'ITEM_A.md')
    assert os.path.exists(tmp_path / 'ITEM_A.html')


def test_wi_revision_gate(monkeypatch):
    monkeypatch.setattr(wi, 'ART_DIR', Path('.'))
    with pytest.raises(SystemExit):
        wi.render('ITEM', 'B', {'item': 'ITEM', 'rev': 'C', 'steps': []})
