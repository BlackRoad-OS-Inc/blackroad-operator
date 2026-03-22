export TERM=xterm-256color

# ---------------- COLORS ----------------
export BR_BLUE=33
export BR_AMBER=202
export BR_MAGENTA=163
export BR_ORANGE=208
export BR_PINK=198
export BR_WHITE=255

# ---------------- COLOR PRINT ----------------
br_color() {
  printf "\033[38;5;%sm%s\033[0m\n" "$1" "$2"
}

# ---------------- TYPEWRITER ----------------
br_type() {
  local color="$1"
  local text="$2"
  local delay="${3:-0.03}"

  printf "\033[38;5;%sm" "$color"
  for ((i=1; i<=${#text}; i++)); do
    printf "%s" "$(printf "%s" "$text" | cut -c "$i")"
    sleep "$delay"
  done
  printf "\033[0m\n"
}

# ---------------- TYPE + CURSOR ----------------
br_type_live() {
  local color="$1"
  local text="$2"
  local delay="${3:-0.04}"

  printf "\033[38;5;%sm" "$color"
  for ((i=1; i<=${#text}; i++)); do
    printf "%s" "$(printf "%s" "$text" | cut -c "$i")"
    printf "\033[38;5;%sm▌\033[0m" "$color"
    sleep "$delay"
    printf "\b"
  done
  printf "\033[0m\n"
}

# ---------------- TYPE CHUNK ----------------
br_type_chunk() {
  local color="$1"
  local text="$2"

  printf "\033[38;5;%sm%s\033[0m" "$color" "$text"
}

br_type_live_chunk() {
  local color="$1"
  local text="$2"
  local delay="${3:-0.03}"

  printf "\033[38;5;%sm" "$color"
  for ((i=1; i<=${#text}; i++)); do
    printf "%s" "$(printf "%s" "$text" | cut -c "$i")"
    printf "\033[38;5;%sm▌\033[0m" "$color"
    sleep "$delay"
    printf "\b"
  done
  printf "\033[0m"
}

# ---------------- AGENT (STATIC) ----------------
br_agent() {
  local name="$1"
  local color="$2"
  local msg="$3"

  printf "\033[38;5;255m[%s]\033[0m " "$name"
  br_type "$color" "$msg"
}

# ---------------- AGENT (LIVE) ----------------
br_agent_live() {
  local name="$1"
  local color="$2"
  local msg="$3"

  printf "\033[38;5;255m[%s]\033[0m " "$name"
  br_type_live "$color" "$msg"
}

# ---------------- STREAMING ----------------
br_color_for_agent() {
  case "$1" in
    *planner*|*coordinator*)
      echo "$BR_BLUE"
      ;;
    *risk*|*watchdog*|*auditor*|*regulator*|*sentinel*)
      echo "$BR_AMBER"
      ;;
    *synth*|*explainer*)
      echo "$BR_MAGENTA"
      ;;
    *arbiter*|*command*|*operator*|*gatekeeper*)
      echo "$BR_ORANGE"
      ;;
    *memory*|*archivist*)
      echo "$BR_PINK"
      ;;
    *)
      echo "$BR_BLUE"
      ;;
  esac
}

br_resolve_color() {
  local color="$1"
  local agent="$2"

  case "$color" in
    ""|auto)
      br_color_for_agent "$agent"
      ;;
    BR_BLUE|blue)
      echo "$BR_BLUE"
      ;;
    BR_AMBER|amber)
      echo "$BR_AMBER"
      ;;
    BR_MAGENTA|magenta)
      echo "$BR_MAGENTA"
      ;;
    BR_ORANGE|orange)
      echo "$BR_ORANGE"
      ;;
    BR_PINK|pink)
      echo "$BR_PINK"
      ;;
    BR_WHITE|white)
      echo "$BR_WHITE"
      ;;
    *[!0-9]*)
      br_color_for_agent "$agent"
      ;;
    *)
      echo "$color"
      ;;
  esac
}

br_emit() {
  local agent="$1"
  shift
  local color="auto"
  local text=""

  if [ -z "$agent" ] || [ $# -lt 1 ]; then
    echo "Usage: br_emit <agent> [color|auto] <text>"
    return 1
  fi

  if [ $# -ge 2 ]; then
    color="$1"
    shift
  fi
  text="$*"

  printf '%s|%s|%s\n' "$agent" "$color" "$text"
}

br_emit_begin() {
  local agent="$1"
  local color="${2:-auto}"

  if [ -z "$agent" ]; then
    echo "Usage: br_emit_begin <agent> [color|auto]"
    return 1
  fi

  printf '@begin|%s|%s\n' "$agent" "$color"
}

br_emit_chunk() {
  if [ $# -lt 1 ]; then
    echo "Usage: br_emit_chunk <text>"
    return 1
  fi
  printf '@chunk|%s\n' "$*"
}

br_emit_end() {
  printf '@end\n'
}

br_stream() {
  local mode="live"
  local line=""
  local agent=""
  local color=""
  local text=""
  local resolved=""
  local stream_active=0
  local stream_agent=""
  local stream_color=""
  local delay="${BR_STREAM_DELAY:-0.03}"
  local line_rest=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --static|-s)
        mode="static"
        ;;
      --live|-l)
        mode="live"
        ;;
      --help|-h)
        echo "Usage: br_stream [--live|--static]"
        return 0
        ;;
    esac
    shift
  done

  while IFS= read -r line || [ -n "$line" ]; do
    if [ -z "$line" ]; then
      continue
    fi

    if [ "${line#@begin|}" != "$line" ]; then
      line_rest="${line#@begin|}"
      agent="${line_rest%%|*}"
      if [ "$line_rest" = "$agent" ]; then
        color="auto"
      else
        color="${line_rest#*|}"
      fi
      agent="$(printf '%s' "$agent" | sed 's/^ *//; s/ *$//')"
      color="$(printf '%s' "$color" | sed 's/^ *//; s/ *$//')"
      if [ -z "$agent" ]; then
        continue
      fi
      if [ "$stream_active" -eq 1 ]; then
        printf "\n"
      fi
      stream_active=1
      stream_agent="$agent"
      stream_color="$(br_resolve_color "$color" "$agent")"
      printf "\033[38;5;255m[%s]\033[0m " "$stream_agent"
      continue
    fi

    if [ "$line" = "@end" ]; then
      if [ "$stream_active" -eq 1 ]; then
        printf "\n"
        stream_active=0
      fi
      continue
    fi

    if [ "${line#@chunk|}" != "$line" ]; then
      text="${line#@chunk|}"
      if [ "$stream_active" -eq 1 ]; then
        if [ "$mode" = "static" ]; then
          br_type_chunk "$stream_color" "$text"
        else
          br_type_live_chunk "$stream_color" "$text" "$delay"
        fi
        continue
      fi
      continue
    fi

    agent=""
    color="auto"
    text=""

    if [ "${line#*|}" != "$line" ]; then
      agent="${line%%|*}"
      line_rest="${line#*|}"
      color="${line_rest%%|*}"
      if [ "$line_rest" = "$color" ]; then
        text=""
      else
        text="${line_rest#*|}"
      fi
    elif [ "${line#*:}" != "$line" ]; then
      agent="${line%%:*}"
      text="${line#*:}"
    else
      agent="system"
      text="$line"
      color="white"
    fi

    agent="$(printf '%s' "$agent" | sed 's/^ *//; s/ *$//')"
    text="$(printf '%s' "$text" | sed 's/^ *//; s/ *$//')"
    resolved="$(br_resolve_color "$color" "$agent")"

    if [ "$stream_active" -eq 1 ]; then
      printf "\n"
      stream_active=0
    fi

    if [ "$mode" = "static" ]; then
      br_agent "$agent" "$resolved" "$text"
    else
      br_agent_live "$agent" "$resolved" "$text"
    fi
  done
}

# ---------------- PIPE ADAPTER ----------------
br_pipe() {
  local agent="$1"
  local color="${2:-auto}"
  local line=""

  if [ -z "$agent" ]; then
    echo "Usage: br_pipe <agent> [color|auto]"
    return 1
  fi

  br_emit_begin "$agent" "$color"
  while IFS= read -r line || [ -n "$line" ]; do
    br_emit_chunk "$line"
  done
  br_emit_end
}

# ---------------- BUS ----------------
br_bus_ready() {
  if [ -z "$BR_BUS_PATH" ] || [ ! -p "$BR_BUS_PATH" ]; then
    echo "Bus not started. Use: br_bus_start"
    return 1
  fi
  return 0
}

br_bus_start() {
  local mode="--live"
  local path="${BR_BUS_PATH:-/tmp/br-bus}"
  local owned=0

  if [ -n "$BR_BUS_PID" ] && kill -0 "$BR_BUS_PID" >/dev/null 2>&1; then
    echo "Bus already running (pid $BR_BUS_PID)."
    return 1
  fi

  while [ $# -gt 0 ]; do
    case "$1" in
      --static|-s)
        mode="--static"
        ;;
      --live|-l)
        mode="--live"
        ;;
      --path|-p)
        shift
        if [ -n "$1" ]; then
          path="$1"
        fi
        ;;
      *)
        path="$1"
        ;;
    esac
    shift
  done

  if [ -z "$path" ]; then
    echo "Usage: br_bus_start [--live|--static] [--path <fifo>]"
    return 1
  fi

  if [ -e "$path" ] && [ ! -p "$path" ]; then
    echo "Path exists and is not a pipe: $path"
    return 1
  fi

  if [ ! -p "$path" ]; then
    mkfifo "$path"
    owned=1
  fi

  BR_BUS_PATH="$path"
  BR_BUS_MODE="$mode"
  BR_BUS_OWNED="$owned"

  exec {BR_BUS_KEEPALIVE_FD}<> "$path"
  br_stream "$mode" < "$path" &
  BR_BUS_PID=$!

  echo "Bus started: $path (pid $BR_BUS_PID)"
}

br_bus_stop() {
  if [ -n "$BR_BUS_PID" ]; then
    kill "$BR_BUS_PID" >/dev/null 2>&1
    wait "$BR_BUS_PID" >/dev/null 2>&1
  fi

  if [ -n "$BR_BUS_KEEPALIVE_FD" ]; then
    exec {BR_BUS_KEEPALIVE_FD}>&-
    unset BR_BUS_KEEPALIVE_FD
  fi

  if [ "${BR_BUS_OWNED:-0}" -eq 1 ] && [ -n "$BR_BUS_PATH" ]; then
    rm -f "$BR_BUS_PATH"
  fi

  unset BR_BUS_PID BR_BUS_PATH BR_BUS_OWNED BR_BUS_MODE
}

br_bus_status() {
  if [ -n "$BR_BUS_PID" ] && kill -0 "$BR_BUS_PID" >/dev/null 2>&1; then
    echo "Bus running: $BR_BUS_PATH (pid $BR_BUS_PID, mode ${BR_BUS_MODE:---live})"
    return 0
  fi
  echo "Bus stopped."
  return 1
}

br_bus_join() {
  local mode="--live"
  local path="${BR_BUS_PATH:-/tmp/br-bus}"

  while [ $# -gt 0 ]; do
    case "$1" in
      --static|-s)
        mode="--static"
        ;;
      --live|-l)
        mode="--live"
        ;;
      --path|-p)
        shift
        if [ -n "$1" ]; then
          path="$1"
        fi
        ;;
      *)
        path="$1"
        ;;
    esac
    shift
  done

  if [ -z "$path" ] || [ ! -p "$path" ]; then
    echo "Bus pipe not found: $path"
    return 1
  fi

  br_stream "$mode" < "$path"
}

br_bus_send() {
  local agent="$1"
  shift
  local color="auto"
  local text=""

  if ! br_bus_ready; then
    return 1
  fi

  if [ -z "$agent" ] || [ $# -lt 1 ]; then
    echo "Usage: br_bus_send <agent> [color|auto] <text>"
    return 1
  fi

  if [ $# -ge 2 ]; then
    color="$1"
    shift
  fi
  text="$*"

  br_emit "$agent" "$color" "$text" > "$BR_BUS_PATH"
}

br_bus_begin() {
  if ! br_bus_ready; then
    return 1
  fi
  br_emit_begin "$@" > "$BR_BUS_PATH"
}

br_bus_chunk() {
  if ! br_bus_ready; then
    return 1
  fi
  br_emit_chunk "$@" > "$BR_BUS_PATH"
}

br_bus_end() {
  if ! br_bus_ready; then
    return 1
  fi
  br_emit_end > "$BR_BUS_PATH"
}

br_bus_pipe() {
  local agent="$1"
  local color="${2:-auto}"
  local line=""

  if ! br_bus_ready; then
    return 1
  fi
  if [ -z "$agent" ]; then
    echo "Usage: br_bus_pipe <agent> [color|auto]"
    return 1
  fi

  br_emit_begin "$agent" "$color" > "$BR_BUS_PATH"
  while IFS= read -r line || [ -n "$line" ]; do
    br_emit_chunk "$line" > "$BR_BUS_PATH"
  done
  br_emit_end > "$BR_BUS_PATH"
}

# ---------------- MUX ----------------
br_mux_start() {
  local mode="--live"
  local dir="${BR_MUX_DIR:-/tmp/br-mux}"
  local bus_path=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --static|-s)
        mode="--static"
        ;;
      --live|-l)
        mode="--live"
        ;;
      --dir|-d)
        shift
        if [ -n "$1" ]; then
          dir="$1"
        fi
        ;;
      --bus|-b)
        shift
        if [ -n "$1" ]; then
          bus_path="$1"
        fi
        ;;
      *)
        dir="$1"
        ;;
    esac
    shift
  done

  mkdir -p "$dir"
  BR_MUX_DIR="$dir"
  BR_MUX_PIDS_FILE="$dir/.pids"

  if [ -n "$BR_BUS_PID" ] && kill -0 "$BR_BUS_PID" >/dev/null 2>&1; then
    BR_MUX_BUS="$BR_BUS_PATH"
  else
    if [ -z "$bus_path" ]; then
      bus_path="$dir/bus.fifo"
    fi
    br_bus_start "$mode" --path "$bus_path"
    BR_MUX_BUS="$BR_BUS_PATH"
  fi

  : > "$BR_MUX_PIDS_FILE"
  echo "Mux started: $BR_MUX_DIR (bus $BR_MUX_BUS)"
}

br_mux_add() {
  local agent="$1"
  local color="${2:-auto}"
  local fifo=""
  local pid=""

  if [ -z "$agent" ]; then
    echo "Usage: br_mux_add <agent> [color|auto]"
    return 1
  fi
  if [ -z "$BR_MUX_DIR" ] || [ -z "$BR_MUX_PIDS_FILE" ]; then
    echo "Mux not started. Use: br_mux_start"
    return 1
  fi
  if ! br_bus_ready; then
    return 1
  fi

  fifo="$BR_MUX_DIR/${agent}.fifo"
  if [ -e "$fifo" ] && [ ! -p "$fifo" ]; then
    echo "Path exists and is not a pipe: $fifo"
    return 1
  fi
  if [ ! -p "$fifo" ]; then
    mkfifo "$fifo"
  fi

  br_pipe "$agent" "$color" < "$fifo" > "$BR_BUS_PATH" &
  pid=$!
  printf '%s %s %s\n' "$agent" "$pid" "$fifo" >> "$BR_MUX_PIDS_FILE"
  echo "Mux added: $agent ($fifo, pid $pid)"
}

br_mux_remove() {
  local agent="$1"
  local pid=""
  local fifo=""

  if [ -z "$agent" ]; then
    echo "Usage: br_mux_remove <agent>"
    return 1
  fi
  if [ -z "$BR_MUX_PIDS_FILE" ] || [ ! -f "$BR_MUX_PIDS_FILE" ]; then
    echo "Mux not started."
    return 1
  fi

  pid=$(awk -v a="$agent" '$1 == a { print $2 }' "$BR_MUX_PIDS_FILE")
  fifo=$(awk -v a="$agent" '$1 == a { print $3 }' "$BR_MUX_PIDS_FILE")

  if [ -n "$pid" ]; then
    kill "$pid" >/dev/null 2>&1
  fi
  if [ -n "$fifo" ] && [ -p "$fifo" ]; then
    rm -f "$fifo"
  fi

  awk -v a="$agent" '$1 != a { print }' "$BR_MUX_PIDS_FILE" > "$BR_MUX_PIDS_FILE.tmp"
  mv "$BR_MUX_PIDS_FILE.tmp" "$BR_MUX_PIDS_FILE"
  echo "Mux removed: $agent"
}

br_mux_status() {
  if [ -z "$BR_MUX_PIDS_FILE" ] || [ ! -f "$BR_MUX_PIDS_FILE" ]; then
    echo "Mux stopped."
    return 1
  fi
  echo "Mux running: $BR_MUX_DIR"
  if [ -s "$BR_MUX_PIDS_FILE" ]; then
    cat "$BR_MUX_PIDS_FILE"
  else
    echo "No agents attached."
  fi
  return 0
}

br_mux_stop() {
  local with_bus=0
  local pid=""
  local fifo=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --bus)
        with_bus=1
        ;;
    esac
    shift
  done

  if [ -n "$BR_MUX_PIDS_FILE" ] && [ -f "$BR_MUX_PIDS_FILE" ]; then
    while read -r _agent pid fifo; do
      if [ -n "$pid" ]; then
        kill "$pid" >/dev/null 2>&1
      fi
      if [ -n "$fifo" ] && [ -p "$fifo" ]; then
        rm -f "$fifo"
      fi
    done < "$BR_MUX_PIDS_FILE"
    rm -f "$BR_MUX_PIDS_FILE"
  fi

  if [ "$with_bus" -eq 1 ]; then
    br_bus_stop
  fi

  unset BR_MUX_DIR BR_MUX_PIDS_FILE BR_MUX_BUS
  echo "Mux stopped."
}

# ---------------- BOX ----------------
br_box() {
  local color="$1"
  local text="$2"
  local w=$(( ${#text} + 2 ))

  printf "\033[38;5;255m┌%*s┐\033[0m\n" "$w" ""
  printf "\033[38;5;255m│ \033[0m"
  printf "\033[38;5;%sm%s\033[0m" "$color" "$text"
  printf "\033[38;5;255m │\033[0m\n"
  printf "\033[38;5;255m└%*s┘\033[0m\n" "$w" ""
}

# ---------------- PANEL ----------------
br_panel_live() {
  printf "\033[38;5;255m\n◆ BLACKROAD LIVE PANEL ◆\n\n\033[0m"

  br_agent_live blackroad-planner  $BR_BLUE     "Plan: scope stable but risks remain."
  sleep 0.4
  br_agent_live blackroad-risk     $BR_AMBER    "Risk: unresolved edge cases detected."
  sleep 0.4
  br_agent_live blackroad-synth    $BR_MAGENTA  "Synthesis: delay improves outcome."
  sleep 0.4
  br_agent_live blackroad-arbiter  $BR_ORANGE   "Decision: REJECTED."
  sleep 0.4
  br_agent_live blackroad-memory   $BR_PINK     "Memory committed to company/acme."
}
