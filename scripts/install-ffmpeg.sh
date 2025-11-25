#!/usr/bin/env bash
set -e

# Install ffmpeg at runtime (Render filesystem writable during start command)
apt-get update
apt-get install -y ffmpeg

# Run the command passed as arguments (e.g., node server/index.js)
exec "$@"

