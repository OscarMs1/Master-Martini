#!/usr/bin/env bash
# Detiene el emulador y vuelve a la página normal (imágenes en disco).
set -euo pipefail
cd "$(dirname "$0")/.."
docker rm -f aws-emulator >/dev/null 2>&1 || true
rm -rf emulador/.local .env.emulador
docker compose up -d catalogo frontend
