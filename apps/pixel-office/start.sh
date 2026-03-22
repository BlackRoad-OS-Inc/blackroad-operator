#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[pixel] .env creado desde .env.example"
fi

if [ ! -d node_modules ]; then
  echo "[pixel] Instalando dependencias npm..."
  npm install
fi

PORT_VALUE=$(grep -E '^PORT=' .env | tail -1 | cut -d'=' -f2)
PORT_VALUE=${PORT_VALUE:-19000}

echo "[pixel] Iniciando servidor en el puerto ${PORT_VALUE}"
npm start
