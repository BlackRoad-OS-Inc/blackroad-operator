from mfg import routing


def test_cap_math(tmp_path, monkeypatch):
    art_dir = tmp_path / "routing"
    monkeypatch.setattr(routing, 'ART_DIR', art_dir)
    monkeypatch.setattr(routing, 'WC_PATH', art_dir / 'work_centers.json')
    monkeypatch.setattr(routing, 'ROUTINGS_PATH', art_dir / 'routings.json')

    wc_csv = tmp_path / 'work_centers.csv'
    wc_csv.write_text('id,name,capacity_per_shift,cost_rate\nW,Assembly,60,30\n')
    routing.load_work_centers(str(wc_csv))

    rout_dir = tmp_path / 'routings'
    rout_dir.mkdir()
    (rout_dir / 'X_A.yaml').write_text('item: X\nrev: A\nsteps:\n  - wc: W\n    op: OP\n    std_time_min: 3\n')
    routing.load_routings(str(rout_dir))

    out = routing.capcheck('X', 'A', qty=10)
    assert out['work_centers']['W']['required_minutes'] == 30.0
    assert (art_dir / 'capcheck_X_A.json').exists()
