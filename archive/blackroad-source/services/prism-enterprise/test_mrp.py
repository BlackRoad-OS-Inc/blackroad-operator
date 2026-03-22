import json
import os

from plm import bom
from mfg import mrp


def test_mrp_plan(tmp_path, monkeypatch):
    d = tmp_path
    dem = d / 'demand.csv'; dem.write_text('item_id,qty\nA,10\nB,2\n')
    inv = d / 'inv.csv'; inv.write_text('item_id,qty\nA,8\n')
    pos = d / 'pos.csv'; pos.write_text('item_id,qty_open\nB,2\n')

    art_dir = d / 'mrp'
    monkeypatch.setattr(mrp, 'ART_DIR', art_dir)
    monkeypatch.setattr(mrp, 'ITEMS_PATH', d / 'items.json')
    monkeypatch.setattr(mrp, 'BOMS_PATH', d / 'boms.json')
    os.makedirs(art_dir, exist_ok=True)

    items = [
        {'id': 'A', 'rev': 'A', 'type': 'assembly', 'uom': 'ea', 'lead_time_days': 4, 'cost': 0, 'suppliers': []},
        {'id': 'C1', 'rev': 'A', 'type': 'component', 'uom': 'ea', 'lead_time_days': 2, 'cost': 0, 'suppliers': []},
    ]
    boms = [
        {'item_id': 'A', 'rev': 'A', 'lines': [{'component_id': 'C1', 'qty': 2}]}
    ]
    (mrp.ITEMS_PATH).write_text(json.dumps(items), encoding='utf-8')
    (mrp.BOMS_PATH).write_text(json.dumps(boms), encoding='utf-8')

    # ensure PLM cache does not interfere with catalog fallback
    bom._BOMS = []

    out = mrp.plan(str(dem), str(inv), str(pos))
    assert 'A' in out and out['A']['planned_qty'] == 2
    assert 'B' not in out
    assert out['A']['release_day_offset'] == 4
    assert os.path.exists(art_dir / 'plan.json')
    kitting_path = art_dir / 'kitting_A.csv'
    assert kitting_path.exists()
    assert 'C1' in kitting_path.read_text()
