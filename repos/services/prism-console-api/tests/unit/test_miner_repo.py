from datetime import datetime, timedelta

from sqlmodel import Session, SQLModel, create_engine

from prism.models import MinerSample
from prism.repo import MinerRepository


def test_miner_repository_tracks_latest_per_miner() -> None:
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    now = datetime.utcnow()
    samples = [
        MinerSample(
            miner_id="xmrig",
            recorded_at=now - timedelta(minutes=5),
            shares_accepted=5,
            shares_rejected=0,
            shares_stale=0,
        ),
        MinerSample(
            miner_id="xmrig",
            recorded_at=now - timedelta(minutes=1),
            shares_accepted=8,
            shares_rejected=1,
            shares_stale=1,
        ),
        MinerSample(
            miner_id="verus",
            recorded_at=now - timedelta(minutes=2),
            shares_accepted=3,
            shares_rejected=0,
            shares_stale=0,
        ),
    ]
    with Session(engine) as session:
        repo = MinerRepository(session)
        for sample in samples:
            repo.record_sample(sample)
        latest_xmrig = repo.latest_for_miner("xmrig")
        assert latest_xmrig is not None
        assert latest_xmrig.recorded_at == samples[1].recorded_at
        latest = repo.latest_by_miner()
        assert set(latest) == {"xmrig", "verus"}
        assert latest["xmrig"].recorded_at == samples[1].recorded_at
        assert latest["verus"].recorded_at == samples[2].recorded_at
