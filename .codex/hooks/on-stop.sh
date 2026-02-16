#!/usr/bin/env bash
# Executes Claude's stop hook (`.claude/hooks/auto-commit.sh`) from Codex sessions.

set -euo pipefail

PROJECT_DIR="${CODEX_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}}"
HOOK_SCRIPT="$PROJECT_DIR/.claude/hooks/auto-commit.sh"

if [[ ! -f "$HOOK_SCRIPT" ]]; then
  echo "[codex-bridge] Claude stop hook not found at: $HOOK_SCRIPT" >&2
  exit 0
fi

if [[ ! -x "$HOOK_SCRIPT" ]]; then
  chmod +x "$HOOK_SCRIPT"
fi

export CLAUDE_PROJECT_DIR="$PROJECT_DIR"
"$HOOK_SCRIPT"
