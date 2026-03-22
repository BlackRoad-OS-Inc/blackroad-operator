#!/bin/bash

# Supervisor para mantener a Marian trabajando
# Ejecutar: nohup ./marian_supervisor.sh &

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER_SCRIPT="$SCRIPT_DIR/marian_calendar_checker.sh"

echo "[$(date)] Iniciando supervisor de Marian..."

while true; do
    "$CHECKER_SCRIPT"
    # Esperar 3 minutos entre rondas
    sleep 180
done
