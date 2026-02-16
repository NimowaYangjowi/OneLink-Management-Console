#!/usr/bin/env bash
# Runs Codex CLI and triggers the Claude-compatible stop hook automatically when the session exits.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STOP_HOOK="$ROOT_DIR/.codex/hooks/on-stop.sh"

if ! command -v codex >/dev/null 2>&1; then
  echo "[codex-bridge] 'codex' command was not found in PATH." >&2
  exit 1
fi

cleanup() {
  if [[ -x "$STOP_HOOK" ]]; then
    CODEX_PROJECT_DIR="$ROOT_DIR" "$STOP_HOOK" || true
  fi
}

trap cleanup EXIT

cd "$ROOT_DIR"
CODEX_PROJECT_DIR="$ROOT_DIR" codex "$@"
