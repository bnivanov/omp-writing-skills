#!/usr/bin/env bash
# Pre-publish lint gate. Flags negation-reframe, stacked fragments, and structural AI tells.
# Exit 0 = clean. Exit 1 = findings. Exit 2 = tool missing / error.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BIN="$ROOT/node_modules/.bin/slopless"

if [[ ! -x "$BIN" ]]; then
  echo "slopless binary missing. Installing local dependency..." >&2
  npm install --omit=dev --prefix "$ROOT"
fi

if [[ $# -lt 1 ]]; then
  echo "usage: slopless-lint.sh <file-or-glob> [...]" >&2
  exit 2
fi

exec "$BIN" "$@"
