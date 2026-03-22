from pathlib import Path

from plm import bom


def test_load_and_explode(tmp_path, monkeypatch):
    art_dir = tmp_path / "plm"
    monkeypatch.setattr(bom, "ART_DIR", art_dir)
    monkeypatch.setattr(bom, "ITEMS_PATH", art_dir / "items.json")
    monkeypatch.setattr(bom, "BOMS_PATH", art_dir / "boms.json")
    monkeypatch.setattr(bom, "WHERE_USED_PATH", art_dir / "where_used.json")

    items_dir = tmp_path / "items"
    boms_dir = tmp_path / "boms"
    items_dir.mkdir()
    boms_dir.mkdir()

    (items_dir / "items.csv").write_text(
        "id,rev,type,uom,lead_time_days,cost,suppliers\n"
        "PROD-100,A,assembly,ea,5,100,SUP-A;SUP-B\n"
        "COMP-001,A,component,ea,2,5,SUP-C\n"
    )
    (boms_dir / "prod.csv").write_text(
        "item_id,rev,component_id,qty,scrap_pct\n"
        "PROD-100,A,COMP-001,2,5\n"
    )

    bom.load_items(str(items_dir))
    bom.load_boms(str(boms_dir))

    results = bom.explode("PROD-100", "A", level=1)
    assert results and results[0]["component_id"] == "COMP-001"
    assert results[0]["qty"] == 2 * (1 + 0.05)

    where_used = Path(bom.WHERE_USED_PATH).read_text(encoding="utf-8")
    assert "PROD-100" in where_used
    assert bom.latest_revision("PROD-100") == "A"
