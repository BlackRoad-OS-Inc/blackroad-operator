from pathlib import Path

from qlm_lab.retrieval.ingest import ingest
from qlm_lab.retrieval.index import TfidfIndex
from qlm_lab.retrieval.search import topk

ROOT = Path("modules/qlm_lab/docs_local")
ART = Path("modules/qlm_lab/artifacts")


def test_ingest_index_search():
    ART.mkdir(exist_ok=True)
    corpus = ART / "corpus.jsonl"
    count = ingest(str(ROOT), str(corpus))
    assert count > 0
    index = TfidfIndex()
    index.build(str(corpus))
    index_path = ART / "index.json"
    index.save(str(index_path))
    assert index_path.exists()
    hits = topk(index, "CHSH inequality", k=3)
    assert hits
    assert hits[0][1] >= 0.0
