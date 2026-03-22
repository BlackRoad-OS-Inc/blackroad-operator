#!/bin/bash
# Run all KPI collectors and aggregate into daily report

source "$(dirname "$0")/../lib/common.sh"

log "═══════════════════════════════════════"
log "  BlackRoad OS KPI Collection"
log "  $TODAY"
log "═══════════════════════════════════════"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Run all collectors
for collector in github github-deep github-all-orgs gitea fleet services autonomy loc local cloudflare traffic; do
  log "Running $collector collector..."
  bash "$SCRIPT_DIR/$collector.sh" 2>&1 || err "Collector $collector failed"
  echo
done

# Aggregate into daily file
log "Aggregating daily KPIs..."

python3 -c "
import json, glob, os

data_dir = '$DATA_DIR'
today = '$TODAY'
snapshots = {}

for f in glob.glob(f'{data_dir}/snapshots/{today}-*.json'):
    source = os.path.basename(f).replace(f'{today}-', '').replace('.json', '')
    try:
        with open(f) as fh:
            snapshots[source] = json.load(fh)
    except:
        pass

# Build daily summary
gh = snapshots.get('github', {})
ghd = snapshots.get('github-deep', {})
gha = snapshots.get('github-all-orgs', {})
gt = snapshots.get('gitea', {})
fl = snapshots.get('fleet', {})
sv = snapshots.get('services', {})
au = snapshots.get('autonomy', {})
lc = snapshots.get('loc', {})
lo = snapshots.get('local', {})
cf = snapshots.get('cloudflare', {})
tr = snapshots.get('traffic', {})

daily = {
    'date': today,
    'collected_at': '$TIMESTAMP',
    'summary': {
        # Code velocity
        'commits_today': gh.get('commits', {}).get('today', 0) + gt.get('commits', {}).get('today', 0),
        'push_events_today': gh.get('commits', {}).get('push_events_today', 0),
        'prs_open': gh.get('pull_requests', {}).get('open', 0),
        'prs_merged_today': gh.get('pull_requests', {}).get('merged_today', 0),
        'prs_merged_total': gh.get('pull_requests', {}).get('merged_total', 0),
        'github_events_today': gh.get('activity', {}).get('events_today', 0),

        # Repos
        'repos_github': gha.get('totals', {}).get('repos', gh.get('repos', {}).get('total', 0)),
        'repos_github_active': gha.get('totals', {}).get('active', 0),
        'repos_github_archived': gha.get('totals', {}).get('archived', 0),
        'github_org_count': gha.get('totals', {}).get('org_count', 0),
        'github_language_count': gha.get('totals', {}).get('language_count', 0),
        'github_all_size_mb': gha.get('totals', {}).get('size_mb', 0),
        'repos_gitea': gt.get('repos', {}).get('total', 0),
        'repos_total': gha.get('totals', {}).get('repos', gh.get('repos', {}).get('total', 0)) + gt.get('repos', {}).get('total', 0),
        'repos_active': gha.get('totals', {}).get('active', ghd.get('repos', {}).get('active', 0)),
        'repos_archived': gha.get('totals', {}).get('archived', ghd.get('repos', {}).get('archived', 0)),

        # GitHub profile
        'github_stars': gha.get('totals', {}).get('stars', ghd.get('repos', {}).get('total_stars', 0)),
        'github_forks': gha.get('totals', {}).get('forks', ghd.get('repos', {}).get('total_forks', 0)),
        'github_followers': ghd.get('profile', {}).get('followers', 0),
        'github_following': ghd.get('profile', {}).get('following', 0),
        'github_open_issues': ghd.get('repos', {}).get('total_open_issues', 0),
        'github_size_mb': ghd.get('repos', {}).get('total_size_mb', 0),
        'github_languages': ghd.get('repos', {}).get('languages', {}),

        # Fleet
        'fleet_online': fl.get('fleet', {}).get('online', 0),
        'fleet_total': fl.get('fleet', {}).get('total_nodes', 4),
        'fleet_offline': fl.get('fleet', {}).get('offline_nodes', []),
        'avg_temp_c': fl.get('totals', {}).get('cpu_avg_temp_c', 0),
        'throttled_nodes': fl.get('totals', {}).get('throttled_nodes', []),
        'fleet_mem_used_mb': fl.get('totals', {}).get('mem_used_mb', 0),
        'fleet_mem_total_mb': fl.get('totals', {}).get('mem_total_mb', 0),
        'fleet_disk_used_gb': fl.get('totals', {}).get('disk_used_gb', 0),
        'fleet_disk_total_gb': fl.get('totals', {}).get('disk_total_gb', 0),

        # Services
        'docker_containers': sv.get('totals', {}).get('docker_containers', fl.get('totals', {}).get('docker_containers', 0)),
        'docker_images': sv.get('totals', {}).get('docker_images', 0),
        'ollama_models': sv.get('totals', {}).get('ollama_models', fl.get('totals', {}).get('ollama_models', 0)),
        'ollama_size_gb': sv.get('totals', {}).get('ollama_size_gb', 0),
        'postgres_dbs': sv.get('totals', {}).get('postgres_dbs', 0),
        'nginx_sites': sv.get('totals', {}).get('nginx_sites', 0),
        'systemd_services': sv.get('totals', {}).get('systemd_services', 0),
        'systemd_timers': sv.get('totals', {}).get('systemd_timers', 0),
        'failed_units': sv.get('totals', {}).get('systemd_failed', fl.get('totals', {}).get('systemd_failed', 0)),
        'fleet_processes': sv.get('totals', {}).get('processes', 0),
        'fleet_connections': sv.get('totals', {}).get('network_connections', 0),
        'fleet_swap_used_mb': sv.get('totals', {}).get('swap_used_mb', 0),
        'fleet_swap_total_mb': sv.get('totals', {}).get('swap_total_mb', 0),
        'tailscale_peers': sv.get('totals', {}).get('tailscale_peers', 0),

        # Autonomy
        'autonomy_score': au.get('autonomy_score', 0),
        'heal_events_today': au.get('totals', {}).get('heal_events_today', 0),
        'service_restarts_today': au.get('totals', {}).get('service_restarts_today', 0),
        'fleet_cron_jobs': au.get('totals', {}).get('total_cron_jobs', 0),
        'fleet_timers': au.get('totals', {}).get('active_timers', 0),
        'max_uptime_days': au.get('totals', {}).get('max_uptime_days', 0),

        # LOC
        'total_loc': lc.get('total_estimated_loc', 0),
        'local_repos': lc.get('local', {}).get('repos', 0),
        'local_files': lc.get('local', {}).get('files', 0),
        'local_scripts': lc.get('local', {}).get('scripts', 0),
        'local_script_lines': lc.get('local', {}).get('script_lines', 0),

        # Local Mac
        'bin_tools': lo.get('scripts', {}).get('bin_tools', 0),
        'bin_size_mb': lo.get('scripts', {}).get('bin_size_mb', 0),
        'home_scripts': lo.get('scripts', {}).get('home_scripts', 0),
        'templates': lo.get('scripts', {}).get('templates', 0),
        'sqlite_dbs': lo.get('databases', {}).get('sqlite_count', 0),
        'blackroad_dir_mb': lo.get('databases', {}).get('blackroad_dir_mb', 0),
        'fts5_entries': lo.get('databases', {}).get('fts5_entries', 0),
        'systems_registered': lo.get('databases', {}).get('systems_registered', 0),
        'total_db_rows': lo.get('data', {}).get('total_db_rows', 0),
        'brew_packages': lo.get('packages', {}).get('homebrew', 0),
        'pip_packages': lo.get('packages', {}).get('pip3', 0),
        'npm_global_packages': lo.get('packages', {}).get('npm_global', 0),
        'mac_cron_jobs': lo.get('automation', {}).get('cron_jobs', 0),
        'local_git_repos': lo.get('automation', {}).get('local_git_repos', 0),
        'mac_disk_pct': lo.get('disk', {}).get('pct', 0),
        'mac_disk_used_gb': lo.get('disk', {}).get('used_gb', 0),
        'mac_processes': lo.get('system', {}).get('processes', 0),

        # Cloudflare
        'cf_d1_databases': cf.get('d1', {}).get('count', 0),
        'cf_kv_namespaces': cf.get('kv', {}).get('count', 0),
        'cf_r2_buckets': cf.get('r2', {}).get('count', 0),
        'cf_pages': cf.get('pages', {}).get('count', 0),
        'cf_d1_size_kb': cf.get('d1', {}).get('total_size_kb', 0),

        # Traffic & Velocity (from traffic.sh)
        'github_views_14d': tr.get('github', {}).get('views_14d', 0),
        'github_unique_visitors_14d': tr.get('github', {}).get('unique_visitors_14d', 0),
        'github_clones_14d': tr.get('github', {}).get('clones_14d', 0),
        'github_unique_cloners_14d': tr.get('github', {}).get('unique_cloners_14d', 0),
        'github_contributions_ytd': tr.get('github', {}).get('contributions_ytd', 0),
        'github_commit_streak_days': tr.get('github', {}).get('commit_streak_days', 0),
        'github_avg_commits_per_day': tr.get('github', {}).get('avg_commits_per_day', 0),
        'github_issues_closed_total': tr.get('github', {}).get('issues_closed_total', 0),
        'github_repos_updated_7d': tr.get('github', {}).get('repos_updated_7d', 0),
        'cf_zones_count': tr.get('cloudflare', {}).get('zones_count', 0),
        'cf_workers_total': tr.get('cloudflare', {}).get('workers_total', 0),
        'cf_tunnels_total': tr.get('cloudflare', {}).get('tunnels_total', 0),
        'cf_tunnels_healthy': tr.get('cloudflare', {}).get('tunnels_healthy', 0),

        # Derived
        'unique_loc': int(lc.get('total_estimated_loc', 0) * 0.69),
        'non_fork_repos': max(gha.get('totals', {}).get('repos', 0) + gt.get('repos', {}).get('total', 0) - tr.get('github', {}).get('total_forks', 46), 0),
    },
    'sources': snapshots
}

daily_file = f'{data_dir}/daily/{today}.json'
with open(daily_file, 'w') as f:
    json.dump(daily, f, indent=2)

print(f'Daily KPI file: {daily_file}')
"

log "═══════════════════════════════════════"
log "  Collection complete!"
log "═══════════════════════════════════════"

# Run report
bash "$(dirname "$0")/../reports/daily-report.sh"

# Push KPIs to Cloudflare KV for live resume dashboards
bash "$(dirname "$0")/../reports/push-kv.sh" 2>&1 || err "KV push failed"

# Auto-update resume repo
bash "$(dirname "$0")/../reports/update-resumes.sh" 2>&1 || err "Resume update failed"

# Check for alertable conditions and post to Slack
bash "$(dirname "$0")/../reports/slack-alert.sh" 2>&1 || err "Alert check failed"
