import json, os
from pathlib import Path

from plm import bom, eco

def test_policy_dual_approval(monkeypatch, tmp_path):
    art_dir = tmp_path / "changes"
    monkeypatch.setattr(eco, 'ART_DIR', art_dir)
    ch = eco.create_change('X', 'A', 'B', 'update')
    path = eco._path(ch.id)
    with open(path) as f:
        data = json.load(f)
    data['risk'] = 'high'
    data['approvals'] = []
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    flag = os.path.join('artifacts','mfg','spc','blocking.flag')
    if os.path.exists(flag):
        os.remove(flag)
    try:
        eco.release(ch.id)
    except SystemExit as e:
        assert 'dual approval' in str(e)
    else:
        assert False, 'expected dual approval policy'
    data['approvals'] = ['QA','ENG']
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    eco.release(ch.id)
    with open(path) as f:
        out = json.load(f)
    assert out['status'] == 'released'

    # prepare catalogs for impact analysis
    plm_art = tmp_path / "plm"
    monkeypatch.setattr(bom, 'ART_DIR', plm_art)
    monkeypatch.setattr(bom, 'ITEMS_PATH', plm_art / 'items.json')
    monkeypatch.setattr(bom, 'BOMS_PATH', plm_art / 'boms.json')
    monkeypatch.setattr(bom, 'WHERE_USED_PATH', plm_art / 'where_used.json')
    monkeypatch.setattr(eco, 'PLM_CATALOG_DIR', plm_art)
    items_dir = tmp_path / "items"
    boms_dir = tmp_path / "boms"
    items_dir.mkdir()
    boms_dir.mkdir()
    (items_dir / 'items.csv').write_text(
        "id,rev,type,uom,lead_time_days,cost,suppliers\n"
        "X,A,assembly,ea,5,20,SUP-1|SUP-2\n"
        "C1,A,component,ea,2,3,SUP-3\n"
        "C2,A,component,ea,2,1,SUP-4\n"
    )
    (boms_dir / 'bom.csv').write_text(
        "item_id,rev,component_id,qty\n"
        "X,B,C1,2\n"
        "X,B,C2,1\n"
    )
    bom.load_items(str(items_dir))
    bom.load_boms(str(boms_dir))

    impact = eco.impact(ch.id)
    assert impact['components_added']
    impact_path = Path(eco.ART_DIR) / f"{ch.id}_impact.json"
    assert impact_path.exists()
