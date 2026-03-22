#!/bin/bash

# Script para añadir un evento al calendario y notificar a Marian
# Uso: ./add_calendar_event.sh "Título del evento" "2026-03-10" "10:00" "11:00"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi
PIXEL_DATA_DIR="${PIXEL_DATA_DIR:-/tmp}"
if [[ "$PIXEL_DATA_DIR" != /* ]]; then
    PIXEL_DATA_DIR="$SCRIPT_DIR/$PIXEL_DATA_DIR"
fi
MARIAN_NEW_EVENT_FILE="${PIXEL_DATA_DIR}/marian_new_event.txt"
MARIAN_MODE_FILE="${PIXEL_DATA_DIR}/marian_mode.txt"
LOG_FILE="${PIXEL_DATA_DIR}/marian_events.log"

TITLE="${1:-Nuevo evento}"
DATE="${2:-$(date +%Y-%m-%d)}"
START_TIME="${3:-09:00}"
END_TIME="${4:-10:00}"

echo "[$(date)] Añadiendo evento: $TITLE - $DATE $START_TIME-$END_TIME" >> "$LOG_FILE"

# Guardar evento para que Marian lo procese
echo "$TITLE|$DATE|$START_TIME|$END_TIME" > "$MARIAN_NEW_EVENT_FILE"

# Notificar a Marian para que vaya a la sala de reuniones
echo "new_event" > "$MARIAN_MODE_FILE"

echo "✅ Evento '$TITLE' programado para $DATE a las $START_TIME"
echo "Marian irá a la sala de reuniones a registrarlo..."
