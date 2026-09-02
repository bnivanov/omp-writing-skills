#!/usr/bin/env bash
# Pre-publish lint gate: slopless AST pass, then Simon Willison cliché detectors.
# Exit 0 = clean. Exit 1 = findings. Exit 2 = usage / tool error.
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
BIN="$ROOT/node_modules/.bin/slopless"
CLICHE="$ROOT/cliche-lint.mjs"

if [[ $# -lt 1 ]]; then
  echo "usage: lint.sh <file-or-glob> [...]" >&2
  echo "       lint.sh --cliche-only <file> [...]" >&2
  exit 2
fi

CLICHE_ONLY=0
if [[ "${1:-}" == "--cliche-only" ]]; then
  CLICHE_ONLY=1
  shift
fi

if [[ $# -lt 1 ]]; then
  echo "usage: lint.sh [--cliche-only] <file-or-glob> [...]" >&2
  exit 2
fi

rc=0

if [[ "$CLICHE_ONLY" -eq 0 ]]; then
  if [[ ! -x "$BIN" ]]; then
    if command -v npm >/dev/null 2>&1; then
      echo "slopless binary missing. Installing local dependency..." >&2
      npm install --omit=dev --prefix "$ROOT" >/dev/null
    else
      echo "warning: npm not found; skipping slopless AST pass" >&2
    fi
  fi
  if [[ -x "$BIN" ]]; then
    "$BIN" "$@"
    s=$?
    if [[ "$s" -gt "$rc" ]]; then rc="$s"; fi
  fi
fi

node "$CLICHE" "$@"
c=$?
if [[ "$c" -gt "$rc" ]]; then rc="$c"; fi
exit "$rc"
