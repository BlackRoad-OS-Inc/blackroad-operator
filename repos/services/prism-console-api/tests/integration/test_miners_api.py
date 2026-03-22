from datetime import datetime


def _headers():
    return {"Authorization": "Bearer test-token"}


def test_ingest_and_fetch_miner_samples(client):
    payload = {
        "miner_id": "xmrig",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "pool": "stratum+tcp://p2pool:3333",
        "hashrate_1m": 1200.0,
        "hashrate_15m": 1100.0,
        "shares_accepted": 12,
        "shares_rejected": 1,
        "latency_ms": 42.0,
        "temperature_c": 72.5,
        "last_share_difficulty": 15000.0,
        "last_share_at": datetime.utcnow().isoformat() + "Z",
    }
    response = client.post("/api/miners/sample", json=payload, headers=_headers())
    assert response.status_code == 202

    latest = client.get("/api/miners/latest", headers=_headers()).json()
    assert latest["samples"], "expected at least one sample"
    sample = latest["samples"][0]
    assert sample["miner_id"] == "xmrig"
    assert sample["stale_rate"] >= 0
    assert sample["effective_hashrate"] <= payload["hashrate_1m"]

    tiles_private = client.get("/api/miners/tiles", headers=_headers()).json()
    ids = {tile["id"] for tile in tiles_private["tiles"]}
    assert {"effective-hashrate", "stale-rate", "temperature", "last-share"}.issubset(ids)

    tiles_public = client.get("/miners/tiles").json()
    assert tiles_public["miner_id"] == "xmrig"
