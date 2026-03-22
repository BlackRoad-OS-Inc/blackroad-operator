#!/bin/bash
# BlackRoad Git Autonomy Agent
# Real self-healing git operations — not spam, actual fixes
# Runs locally on Mac, operates across all repos
#
# Capabilities:
#   sync     — pull + push all repos, fix diverged branches
#   clean    — prune stale branches, remove merged branches
#   health   — audit all repos for problems (conflicts, stale locks, detached HEAD)
#   commit   — auto-commit dirty working trees with smart messages
#   deploy   — collect KPIs → aggregate → push KV → deploy Worker → commit + push
#   fix      — auto-fix common git problems (lock files, broken refs, detached HEAD)
#
# Usage: git-agent.sh <command> [--dry-run]

set -euo pipefail

source "$(dirname "$0")/../lib/common.sh" 2>/dev/null || {
  PINK='\033[38;5;205m'; GREEN='\033[38;5;82m'; AMBER='\033[38;5;214m'
  RED='\033[38;5;196m'; BLUE='\033[38;5;69m'; RESET='\033[0m'
  log() { echo -e "${BLUE}[git-agent]${RESET} $*"; }
  ok()  { echo -e "${GREEN}  ✓${RESET} $*"; }
  err() { echo -e "${RED}  ✗${RESET} $*" >&2; }
}

AGENT_LOG="$HOME/.blackroad/logs/git-agent.log"
mkdir -p "$(dirname "$AGENT_LOG")"
DRY_RUN=false
COMMAND="${1:-help}"
SUBCOMMAND="${2:-}"
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN=true
[[ "${3:-}" == "--dry-run" ]] && DRY_RUN=true

ts() { date '+%Y-%m-%d %H:%M:%S'; }
agent_log() { echo "[$(ts)] $*" >> "$AGENT_LOG"; log "$*"; }

# ─── Find all git repos ──────────────────────────────────────────────
find_repos() {
  local dirs=()
  for pattern in "$HOME"/blackroad-*/ "$HOME"/lucidia-*/ "$HOME"/road*/ "$HOME"/br-*/ \
                 "$HOME"/alexa-*/ "$HOME"/images-*/ "$HOME"/roadc/ "$HOME"/roadnet/; do
    for dir in $pattern; do
      [[ -d "$dir/.git" ]] && dirs+=("$dir")
    done
  done
  printf '%s\n' "${dirs[@]}" 2>/dev/null | sort -u
}

# ─── SYNC: pull + push all repos ─────────────────────────────────────
cmd_sync() {
  agent_log "SYNC: starting"
  local pulled=0 pushed=0 conflicts=0 failed=0

  while IFS= read -r repo; do
    local name=$(basename "$repo")
    cd "$repo" || continue

    # Skip if no remote
    if ! git remote | grep -q .; then
      continue
    fi

    local default_remote=$(git remote | head -1)
    local branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    [[ -z "$branch" ]] && continue

    # Pull with rebase
    if $DRY_RUN; then
      ok "[dry] Would sync $name ($branch)"
      pulled=$((pulled + 1))
      continue
    fi

    # Stash dirty changes
    local stashed=false
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
      git stash push -m "git-agent-sync-$(date +%s)" --quiet 2>/dev/null && stashed=true
    fi

    # Pull
    if git pull --rebase "$default_remote" "$branch" --quiet 2>/dev/null; then
      pulled=$((pulled + 1))
    else
      # Rebase conflict — abort and mark
      git rebase --abort 2>/dev/null
      conflicts=$((conflicts + 1))
      err "$name: rebase conflict on $branch"
    fi

    # Push if ahead
    local ahead=$(git rev-list --count "$default_remote/$branch..HEAD" 2>/dev/null || echo 0)
    if [[ "$ahead" -gt 0 ]]; then
      if git push "$default_remote" "$branch" --quiet 2>/dev/null; then
        pushed=$((pushed + 1))
        ok "$name: pushed $ahead commits"
      else
        failed=$((failed + 1))
        err "$name: push failed"
      fi
    fi

    # Push to roadcode (Gitea) if remote exists
    if git remote | grep -q roadcode; then
      git push roadcode --all --quiet 2>/dev/null || true
    fi

    # Restore stash
    if $stashed; then
      git stash pop --quiet 2>/dev/null || true
    fi

  done < <(find_repos)

  agent_log "SYNC: pulled=$pulled pushed=$pushed conflicts=$conflicts failed=$failed"
}

# ─── CLEAN: prune stale branches ─────────────────────────────────────
cmd_clean() {
  agent_log "CLEAN: starting"
  local pruned=0 deleted=0

  while IFS= read -r repo; do
    local name=$(basename "$repo")
    cd "$repo" || continue

    # Prune remote tracking branches
    for remote in $(git remote 2>/dev/null); do
      if $DRY_RUN; then
        local stale=$(git remote prune "$remote" --dry-run 2>/dev/null | grep -c "prune" || true)
        [[ "$stale" -gt 0 ]] && ok "[dry] $name: would prune $stale from $remote"
      else
        local output=$(git remote prune "$remote" 2>&1)
        local count=$(echo "$output" | grep -c "pruned" 2>/dev/null || true)
        if [[ "$count" -gt 0 ]]; then
          pruned=$((pruned + count))
          ok "$name: pruned $count stale branches from $remote"
        fi
      fi
    done

    # Delete local branches that are fully merged into main/master
    local default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
    for branch in $(git branch --merged "$default_branch" 2>/dev/null | grep -v "^\*" | grep -v "$default_branch" | tr -d ' '); do
      if $DRY_RUN; then
        ok "[dry] $name: would delete merged branch $branch"
      else
        git branch -d "$branch" 2>/dev/null && {
          deleted=$((deleted + 1))
          ok "$name: deleted merged branch $branch"
        }
      fi
    done

  done < <(find_repos)

  agent_log "CLEAN: pruned=$pruned deleted=$deleted"
}

# ─── HEALTH: audit all repos ─────────────────────────────────────────
cmd_health() {
  agent_log "HEALTH: auditing repos"
  local total=0 healthy=0 issues=0

  while IFS= read -r repo; do
    local name=$(basename "$repo")
    local problems=()
    cd "$repo" || continue
    total=$((total + 1))

    # Check for lock files
    [[ -f .git/index.lock ]] && problems+=("stale index.lock")
    [[ -f .git/refs/heads/*.lock ]] 2>/dev/null && problems+=("stale ref lock")

    # Check for detached HEAD
    if ! git symbolic-ref HEAD &>/dev/null; then
      problems+=("detached HEAD")
    fi

    # Check for merge conflicts
    if [[ -f .git/MERGE_HEAD ]]; then
      problems+=("unresolved merge")
    fi

    # Check for rebase in progress
    if [[ -d .git/rebase-merge ]] || [[ -d .git/rebase-apply ]]; then
      problems+=("rebase in progress")
    fi

    # Check for uncommitted changes
    local dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    [[ "$dirty" -gt 0 ]] && problems+=("$dirty uncommitted changes")

    # Check if behind remote
    local branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    if [[ -n "$branch" ]]; then
      git fetch --quiet 2>/dev/null || true
      local behind=$(git rev-list --count "HEAD..origin/$branch" 2>/dev/null || echo 0)
      [[ "$behind" -gt 0 ]] && problems+=("$behind commits behind origin")
      local ahead=$(git rev-list --count "origin/$branch..HEAD" 2>/dev/null || echo 0)
      [[ "$ahead" -gt 0 ]] && problems+=("$ahead unpushed commits")
    fi

    if [[ ${#problems[@]} -eq 0 ]]; then
      healthy=$((healthy + 1))
    else
      issues=$((issues + 1))
      err "$name: ${problems[*]}"
    fi

  done < <(find_repos)

  agent_log "HEALTH: $total repos, $healthy healthy, $issues with issues"
  ok "Health: $healthy/$total repos clean"
}

# ─── COMMIT: auto-commit dirty repos with smart messages ─────────────
cmd_commit() {
  agent_log "COMMIT: scanning for dirty repos"
  local committed=0

  while IFS= read -r repo; do
    local name=$(basename "$repo")
    cd "$repo" || continue

    # Skip if clean
    [[ -z "$(git status --porcelain 2>/dev/null)" ]] && continue

    # Build smart commit message from changed files
    local added=$(git status --porcelain 2>/dev/null | grep "^?" | wc -l | tr -d ' ')
    local modified=$(git status --porcelain 2>/dev/null | grep "^ M\|^M" | wc -l | tr -d ' ')
    local deleted=$(git status --porcelain 2>/dev/null | grep "^ D\|^D" | wc -l | tr -d ' ')

    local parts=()
    [[ "$added" -gt 0 ]] && parts+=("$added new")
    [[ "$modified" -gt 0 ]] && parts+=("$modified modified")
    [[ "$deleted" -gt 0 ]] && parts+=("$deleted deleted")
    local summary=$(IFS=', '; echo "${parts[*]}")

    # Detect what kind of changes
    local types=$(git status --porcelain 2>/dev/null | awk '{print $2}' | sed 's/.*\.//' | sort -u | tr '\n' ',' | sed 's/,$//')
    local msg="auto: ${summary} files (${types})"

    if $DRY_RUN; then
      ok "[dry] $name: would commit — $msg"
      committed=$((committed + 1))
      continue
    fi

    # Stage and commit
    git add -A 2>/dev/null
    git commit -m "$msg

Automated by BlackRoad git-agent
$(date -u +%Y-%m-%dT%H:%M:%SZ)" --quiet 2>/dev/null && {
      committed=$((committed + 1))
      ok "$name: $msg"
    }

  done < <(find_repos)

  agent_log "COMMIT: $committed repos auto-committed"
}

# ─── FIX: auto-fix common git problems ───────────────────────────────
cmd_fix() {
  agent_log "FIX: scanning for fixable issues"
  local fixed=0

  while IFS= read -r repo; do
    local name=$(basename "$repo")
    cd "$repo" || continue

    # Fix stale lock files (older than 1 hour)
    if [[ -f .git/index.lock ]]; then
      local lock_age=$(( $(date +%s) - $(stat -f %m .git/index.lock 2>/dev/null || echo 0) ))
      if [[ "$lock_age" -gt 3600 ]]; then
        if $DRY_RUN; then
          ok "[dry] $name: would remove stale index.lock (${lock_age}s old)"
        else
          rm -f .git/index.lock
          fixed=$((fixed + 1))
          ok "$name: removed stale index.lock (${lock_age}s old)"
        fi
      fi
    fi

    # Fix detached HEAD — reattach to default branch
    if ! git symbolic-ref HEAD &>/dev/null; then
      local default=$(git config init.defaultBranch 2>/dev/null || echo main)
      if git show-ref --verify "refs/heads/$default" &>/dev/null; then
        if $DRY_RUN; then
          ok "[dry] $name: would reattach to $default"
        else
          git checkout "$default" --quiet 2>/dev/null && {
            fixed=$((fixed + 1))
            ok "$name: reattached to $default"
          }
        fi
      fi
    fi

    # Abort stale rebases
    if [[ -d .git/rebase-merge ]] || [[ -d .git/rebase-apply ]]; then
      local rebase_age=0
      if [[ -d .git/rebase-merge ]]; then
        rebase_age=$(( $(date +%s) - $(stat -f %m .git/rebase-merge 2>/dev/null || echo 0) ))
      fi
      if [[ "$rebase_age" -gt 3600 ]]; then
        if $DRY_RUN; then
          ok "[dry] $name: would abort stale rebase (${rebase_age}s)"
        else
          git rebase --abort 2>/dev/null && {
            fixed=$((fixed + 1))
            ok "$name: aborted stale rebase (${rebase_age}s)"
          }
        fi
      fi
    fi

    # Abort stale merges
    if [[ -f .git/MERGE_HEAD ]]; then
      if $DRY_RUN; then
        ok "[dry] $name: would abort stale merge"
      else
        git merge --abort 2>/dev/null && {
          fixed=$((fixed + 1))
          ok "$name: aborted stale merge"
        }
      fi
    fi

    # Fix broken refs
    local broken=$(git fsck --no-dangling 2>&1 | grep -c "broken" || true)
    if [[ "$broken" -gt 0 ]]; then
      if $DRY_RUN; then
        ok "[dry] $name: would run gc to fix $broken broken refs"
      else
        git gc --prune=now --quiet 2>/dev/null && {
          fixed=$((fixed + 1))
          ok "$name: gc fixed $broken broken refs"
        }
      fi
    fi

  done < <(find_repos)

  agent_log "FIX: $fixed issues fixed"
}

# ─── DEPLOY: full KPI pipeline ───────────────────────────────────────
cmd_deploy() {
  agent_log "DEPLOY: running full pipeline"
  local kpi_root="$(cd "$(dirname "$0")/.." && pwd)"
  local deploy_start=$(date +%s)
  local failures=()

  source "$kpi_root/lib/slack.sh" 2>/dev/null || true
  slack_load 2>/dev/null || true

  # 1. Collect KPIs
  log "Step 1/5: Collecting KPIs..."
  if ! bash "$kpi_root/collectors/collect-all.sh" 2>&1 | tail -5; then
    failures+=("collect")
  fi

  # 2. Push to KV
  log "Step 2/5: Pushing to KV..."
  if ! bash "$kpi_root/reports/push-kv.sh" 2>&1 | tail -3; then
    failures+=("kv-push")
  fi

  # 3. Deploy Worker
  log "Step 3/5: Deploying resume Worker..."
  if [[ -d "$HOME/alexa-amundson-resume" ]]; then
    if ! (cd "$HOME/alexa-amundson-resume" && npx wrangler deploy 2>&1 | tail -3); then
      failures+=("worker-deploy")
    fi
  fi

  # 4. Update resume markdown
  log "Step 4/5: Updating resume repo..."
  if ! bash "$kpi_root/reports/update-resumes.sh" 2>&1 | tail -3; then
    failures+=("resume-update")
  fi

  # 5. Commit and push KPI data
  log "Step 5/5: Committing KPI data..."
  cd "$kpi_root"
  if [[ -n "$(git status --porcelain data/ 2>/dev/null)" ]]; then
    git add data/
    git commit -m "data: daily KPIs $(date +%Y-%m-%d)

Automated by git-agent deploy pipeline
$(date -u +%Y-%m-%dT%H:%M:%SZ)" --quiet 2>/dev/null
    git push --quiet 2>/dev/null && ok "KPI data committed and pushed"
  fi

  # Push resume repo too
  if [[ -d "$HOME/alexa-amundson-resume" ]]; then
    cd "$HOME/alexa-amundson-resume"
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
      git add -A
      git commit -m "auto: update resume data $(date +%Y-%m-%d)" --quiet 2>/dev/null
      git push --quiet 2>/dev/null && ok "Resume repo pushed"
    fi
  fi

  local elapsed=$(( $(date +%s) - deploy_start ))

  # Post deploy result to Slack
  if slack_ready 2>/dev/null; then
    if [[ ${#failures[@]} -eq 0 ]]; then
      slack_notify ":white_check_mark:" "Deploy Complete" \
        "Pipeline finished in ${elapsed}s — all 5 steps passed\nCollect → KV → Worker → Resume → Git push" 2>/dev/null
    else
      slack_notify ":x:" "Deploy Failed" \
        "Pipeline finished in ${elapsed}s with failures:\n*${failures[*]}*" \
        "${SLACK_ALERTS_WEBHOOK_URL:-${SLACK_WEBHOOK_URL:-}}" 2>/dev/null
    fi
  fi

  agent_log "DEPLOY: pipeline complete (${elapsed}s, failures=${#failures[@]})"
}

# ─── FLEET: git operations on fleet nodes via SSH ──────────────────────
FLEET_NODES="alice:192.168.4.49:pi cecilia:192.168.4.96:blackroad lucidia:192.168.4.38:octavia"

cmd_fleet() {
  agent_log "FLEET: scanning fleet git repos"
  local sub="${SUBCOMMAND:-status}"
  [[ "$sub" == "--dry-run" ]] && sub="status"

  for entry in $FLEET_NODES; do
    local node=$(echo "$entry" | cut -d: -f1)
    local ip=$(echo "$entry" | cut -d: -f2)
    local user=$(echo "$entry" | cut -d: -f3)

    log "─── $node ($user@$ip) ───"

    local result rc
    result=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o PasswordAuthentication=no "$user@$ip" "
      repos=0; dirty=0; behind=0; ahead=0; problems=0
      dirs=\$(ls -d ~/blackroad-*/ ~/lucidia-*/ ~/road*/ ~/br-*/ ~/alexa-*/ 2>/dev/null || true)
      for dir in \$dirs; do
        [ -d \"\$dir/.git\" ] || continue
        cd \"\$dir\" || continue
        repos=\$((repos + 1))
        name=\$(basename \"\$dir\")

        # Check dirty
        changes=\$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        [ \"\$changes\" -gt 0 ] && dirty=\$((dirty + 1))

        # Check branch status
        branch=\$(git symbolic-ref --short HEAD 2>/dev/null || echo '')
        [ -z \"\$branch\" ] && { problems=\$((problems + 1)); continue; }

        # Check behind/ahead (without fetch in status mode)
        if [ '$sub' = 'sync' ]; then
          remote=\$(git remote | head -1)
          [ -z \"\$remote\" ] && continue
          git fetch \"\$remote\" --quiet 2>/dev/null || true
          b=\$(git rev-list --count \"HEAD..\$remote/\$branch\" 2>/dev/null || echo 0)
          a=\$(git rev-list --count \"\$remote/\$branch..HEAD\" 2>/dev/null || echo 0)
          [ \"\$b\" -gt 0 ] && { behind=\$((behind + b)); git pull --rebase \"\$remote\" \"\$branch\" --quiet 2>/dev/null || git rebase --abort 2>/dev/null; }
          [ \"\$a\" -gt 0 ] && { ahead=\$((ahead + a)); git push \"\$remote\" \"\$branch\" --quiet 2>/dev/null || true; }
        fi
      done
      echo \"repos=\$repos dirty=\$dirty behind=\$behind ahead=\$ahead problems=\$problems\"
    " 2>/dev/null) && rc=0 || rc=$?

    if [[ $rc -eq 0 && -n "$result" ]]; then
      ok "$node: $result"
    else
      err "$node: unreachable"
    fi
  done

  agent_log "FLEET: scan complete"
}

# ─── PATROL: combined health + fix + sync ─────────────────────────────
cmd_patrol() {
  agent_log "PATROL: starting autonomous patrol"

  log "Phase 1: Health check..."
  cmd_health

  log "Phase 2: Auto-fix issues..."
  cmd_fix

  log "Phase 3: Sync repos..."
  cmd_sync

  log "Phase 4: Clean stale branches..."
  cmd_clean

  log "Phase 5: Fleet git status..."
  cmd_fleet "" status

  # Post patrol results to Slack (if webhook configured)
  local alert_script="$(dirname "$0")/../reports/slack-alert.sh"
  if [[ -x "$alert_script" ]] && [[ -f "$HOME/.blackroad/slack-webhook.env" ]]; then
    grep -q "hooks.slack.com/services/YOUR" "$HOME/.blackroad/slack-webhook.env" 2>/dev/null || {
      bash "$alert_script" git-patrol 2>/dev/null && log "Patrol posted to Slack" || true
    }
  fi

  agent_log "PATROL: complete"
}

# ─── HELP ─────────────────────────────────────────────────────────────
cmd_help() {
  echo -e "${PINK}BlackRoad Git Autonomy Agent${RESET}"
  echo
  echo "Usage: git-agent.sh <command> [--dry-run]"
  echo
  echo "Commands:"
  echo "  sync      Pull + push all repos, fix diverged branches"
  echo "  clean     Prune stale branches, delete merged branches"
  echo "  health    Audit all repos for problems"
  echo "  commit    Auto-commit dirty working trees with smart messages"
  echo "  fix       Auto-fix lock files, detached HEAD, stale rebases"
  echo "  deploy    Full KPI pipeline: collect → KV → deploy → commit"
  echo "  fleet     Fleet git status/sync (fleet status | fleet sync)"
  echo "  patrol    Combined: health → fix → sync → clean → fleet"
  echo "  help      Show this help"
  echo
  echo "Options:"
  echo "  --dry-run  Show what would happen without making changes"
}

# ─── Dispatch ─────────────────────────────────────────────────────────
case "$COMMAND" in
  sync)    cmd_sync ;;
  clean)   cmd_clean ;;
  health)  cmd_health ;;
  commit)  cmd_commit ;;
  fix)     cmd_fix ;;
  deploy)  cmd_deploy ;;
  fleet)   cmd_fleet ;;
  patrol)  cmd_patrol ;;
  help|*)  cmd_help ;;
esac
