-- PostgreSQL Production Database Initialization
-- This script sets up the production database with proper security

-- Create application database
CREATE DATABASE prism_console;

-- Create application user (password should be set via environment variable)
-- CREATE USER prism_app WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';

-- Connect to the application database
\c prism_console;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema
CREATE SCHEMA IF NOT EXISTS app;

-- Grant privileges to application user
-- GRANT CONNECT ON DATABASE prism_console TO prism_app;
-- GRANT USAGE ON SCHEMA app TO prism_app;
-- GRANT CREATE ON SCHEMA app TO prism_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO prism_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO prism_app;

-- Set default privileges for future tables
-- ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO prism_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO prism_app;

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Connection pooling
ALTER SYSTEM SET max_connections = 100;

-- Logging
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Security
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Note: Reload configuration with: SELECT pg_reload_conf();
