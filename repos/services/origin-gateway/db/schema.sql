-- Origin Campus Gateway canonical schema (Slice A)
--
-- This schema captures the authoritative state for visitor sessions, artifacts,
-- parcel claims, and append-only evidence logs. The design favors append-only
-- writes and declarative state machines so compliance gates can replay history.

CREATE TABLE IF NOT EXISTS campus_profiles (
    id UUID PRIMARY KEY,
    handle TEXT NOT NULL,
    visa_level TEXT NOT NULL DEFAULT 'visitor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES campus_profiles(id),
    spawn_zone TEXT NOT NULL,
    client_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_sessions_profile ON sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE TABLE IF NOT EXISTS qlm_pedestal_jobs (
    id UUID PRIMARY KEY,
    pedestal_id TEXT NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id),
    queue_name TEXT NOT NULL,
    seed TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
    enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    failure_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_pedestal_jobs_status ON qlm_pedestal_jobs(status);
CREATE INDEX IF NOT EXISTS idx_pedestal_jobs_session ON qlm_pedestal_jobs(session_id);

CREATE TABLE IF NOT EXISTS artifact_manifests (
    id UUID PRIMARY KEY,
    pedestal_id TEXT NOT NULL,
    session_id UUID REFERENCES sessions(id),
    artifact_uri TEXT NOT NULL,
    preview_uri TEXT,
    lineage_hash TEXT NOT NULL,
    minted_by TEXT NOT NULL,
    minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    manifest JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_artifact_manifest_pedestal ON artifact_manifests(pedestal_id);
CREATE INDEX IF NOT EXISTS idx_artifact_manifest_lineage ON artifact_manifests(lineage_hash);

CREATE TABLE IF NOT EXISTS parcel_claims (
    id UUID PRIMARY KEY,
    parcel_id TEXT NOT NULL,
    profile_id UUID NOT NULL REFERENCES campus_profiles(id),
    claim_state TEXT NOT NULL CHECK (claim_state IN ('pending', 'active', 'expired', 'revoked')),
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_parcel_claim_active
ON parcel_claims(parcel_id)
WHERE claim_state = 'active';

CREATE TABLE IF NOT EXISTS roadcoin_ledger (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES campus_profiles(id),
    delta NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    artifact_id UUID REFERENCES artifact_manifests(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadcoin_profile ON roadcoin_ledger(profile_id);

CREATE TABLE IF NOT EXISTS evidence_log (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    session_id UUID REFERENCES sessions(id),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hash TEXT NOT NULL,
    previous_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_evidence_session ON evidence_log(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_event_type ON evidence_log(event_type);

CREATE TABLE IF NOT EXISTS health_checks (
    name TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);
