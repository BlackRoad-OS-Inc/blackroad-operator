# blackroad-backup-manager

Production-grade backup system with full, incremental, and differential backup types. Uses `tarfile` + `hashlib`. SQLite job tracking.

## Features

- **Full backups**: Complete archive of source directory
- **Incremental backups**: Only files changed since last backup
- **Differential backups**: Files changed since last full backup
- SHA-256 integrity verification
- Restore to any target directory
- Prune old backups (keep last N)
- Exclude patterns (glob-style)
- Multiple compression formats: gz, bz2, xz, none
- SQLite persistence in `~/.blackroad/backup_manager.db`

## Usage

```bash
# Full backup
python backup_manager.py backup /path/to/source /path/to/dest

# Incremental backup
python backup_manager.py backup /src /dest --type incremental

# Differential backup
python backup_manager.py backup /src /dest --type differential --compression bz2

# Restore
python backup_manager.py restore <job-id> /restore/path

# Verify integrity
python backup_manager.py verify <job-id>

# List jobs
python backup_manager.py list --source /path/to/source

# Prune old backups (keep last 5)
python backup_manager.py prune /path/to/source --keep 5

# Schedule info
python backup_manager.py schedule /path/to/source
```

## Testing

```bash
pip install pytest
pytest tests/ -v
```

## Architecture

- **`backup_manager.py`** — Core library + CLI (400+ lines)
- **SQLite tables**: `backup_jobs`, `file_manifests`, `restore_events`
- **No external dependencies** — uses `tarfile`, `hashlib`, `fnmatch`
