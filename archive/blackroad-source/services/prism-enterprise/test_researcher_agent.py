import json

from qlm_lab.agents.researcher import ARTIFACTS_DIR, CORPUS_PATH, INDEX_PATH, RAG_TOPK_PATH, Researcher
from qlm_lab.bus import Bus
from qlm_lab.proto import new
from qlm_lab.retrieval.index import TfidfIndex
from qlm_lab.retrieval.ingest import ingest


def _prepare_index() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    ingest("modules/qlm_lab/docs_local", str(CORPUS_PATH))
    index = TfidfIndex()
    index.build(str(CORPUS_PATH))
    index.save(str(INDEX_PATH))


def test_researcher_returns_citations():
    _prepare_index()
    bus = Bus()
    researcher = Researcher(bus)
    bus.subscribe(researcher)
    results = []
    bus.subscribe(lambda msg: results.append(msg))
    bus.publish(new("tester", "researcher", "task", "retrieve", query="Bell CHSH", k=2))
    assert any(msg.op == "citations" for msg in results)
    assert RAG_TOPK_PATH.exists()
    data = json.loads(RAG_TOPK_PATH.read_text(encoding="utf-8"))
    assert len(data) >= 1
    first = data[0]
    assert {"path", "start", "end", "score", "text"} <= set(first)
