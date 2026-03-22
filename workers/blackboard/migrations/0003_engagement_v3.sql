-- BlackBoard v3 — Enhanced engagement tracking
-- Adds engagement scoring, interaction counts, and extended metrics

-- Sessions: engagement score and interaction tracking
ALTER TABLE sessions ADD COLUMN engagement_score INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN interaction_count INTEGER DEFAULT 0;

-- Index for engagement queries
CREATE INDEX IF NOT EXISTS idx_sessions_engagement ON sessions(engagement_score, started_at);

-- Paths: engagement score per page
ALTER TABLE paths ADD COLUMN engagement_score INTEGER DEFAULT 0;

-- Daily stats: engagement score averages
ALTER TABLE daily_stats ADD COLUMN avg_engagement_score REAL DEFAULT 0;
ALTER TABLE daily_stats ADD COLUMN total_interactions INTEGER DEFAULT 0;
ALTER TABLE daily_stats ADD COLUMN swipe_count INTEGER DEFAULT 0;
ALTER TABLE daily_stats ADD COLUMN long_task_count INTEGER DEFAULT 0;
