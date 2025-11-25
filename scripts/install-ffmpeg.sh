#!/usr/bin/env bash
set -e

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "[install-ffmpeg] Installation de ffmpeg..."
  sudo apt-get update
  sudo apt-get install -y ffmpeg
else
  echo "[install-ffmpeg] ffmpeg déjà présent"
fi

exec "$@"

