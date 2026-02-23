#!/usr/bin/env bash
# Stop hook gate: model must create commit before finishing when safe changes exist.

set -eo pipefail

PROJECT_DIR="${CODEX_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-.}}"
cd "$PROJECT_DIR"

RUNTIME="${AUTO_COMMIT_RUNTIME:-}"
if [[ -z "$RUNTIME" ]]; then
  if [[ -n "${CODEX_PROJECT_DIR:-}" ]]; then
    RUNTIME="codex"
  elif [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    RUNTIME="claude"
  else
    RUNTIME="agent"
  fi
fi

case "$RUNTIME" in
  codex) RUNTIME_LABEL="Codex" ;;
  claude) RUNTIME_LABEL="Claude" ;;
  *) RUNTIME_LABEL="Agent" ;;
esac

EXCLUDE_PATTERNS=(
  '.env'
  '.env.local'
  '.env.*.local'
  'credentials*'
  '.secret*'
  '*.pem'
  '*.key'
  '*.crt'
)

BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
  echo -e "${BLUE}[Stop-Hook]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[Stop-Hook]${NC} $1"
}

error() {
  echo -e "${RED}[Stop-Hook]${NC} $1"
}

array_contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

should_exclude() {
  local file="$1"
  local base
  base=$(basename "$file")

  if [[ "$file" == "node_modules" || "$file" == node_modules/* || "$file" == */node_modules/* ]]; then
    return 0
  fi

  local pattern
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == $pattern || "$base" == $pattern ]]; then
      return 0
    fi
  done
  return 1
}

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  warn "Git 저장소가 아니어서 커밋 게이트를 건너뜁니다."
  exit 0
fi

if [[ "${AUTO_COMMIT_ALLOW_UNCOMMITTED_EXIT:-0}" == "1" ]]; then
  warn "AUTO_COMMIT_ALLOW_UNCOMMITTED_EXIT=1 이 설정되어 게이트를 건너뜁니다."
  exit 0
fi

STAGED_FILES=()
while IFS= read -r -d '' file; do
  STAGED_FILES+=("$file")
done < <(git diff --cached --name-only -z 2>/dev/null || true)

UNSTAGED_FILES=()
while IFS= read -r -d '' file; do
  UNSTAGED_FILES+=("$file")
done < <(git diff --name-only -z 2>/dev/null || true)

UNTRACKED_FILES=()
while IFS= read -r -d '' file; do
  UNTRACKED_FILES+=("$file")
done < <(git ls-files --others --exclude-standard -z 2>/dev/null || true)

if [ ${#STAGED_FILES[@]} -eq 0 ] && [ ${#UNSTAGED_FILES[@]} -eq 0 ] && [ ${#UNTRACKED_FILES[@]} -eq 0 ]; then
  log "${RUNTIME_LABEL} 세션 종료: 변경 사항 없음"
  exit 0
fi

SAFE_FILES=()
EXCLUDED_FILES=()

for file in "${STAGED_FILES[@]}" "${UNSTAGED_FILES[@]}" "${UNTRACKED_FILES[@]}"; do
  if [ -n "$file" ]; then
    if should_exclude "$file"; then
      if ! array_contains "$file" "${EXCLUDED_FILES[@]}"; then
        EXCLUDED_FILES+=("$file")
      fi
    else
      if ! array_contains "$file" "${SAFE_FILES[@]}"; then
        SAFE_FILES+=("$file")
      fi
    fi
  fi
done

if [ ${#SAFE_FILES[@]} -eq 0 ]; then
  if [ ${#EXCLUDED_FILES[@]} -gt 0 ]; then
    warn "민감 파일만 감지되어 종료를 허용합니다."
  fi
  exit 0
fi

CHANGED_COUNT=${#SAFE_FILES[@]}
MAX_LIST=20
LIST_COUNT=$CHANGED_COUNT
if [[ "$LIST_COUNT" -gt "$MAX_LIST" ]]; then
  LIST_COUNT=$MAX_LIST
fi

error "커밋되지 않은 안전한 변경사항이 있어 종료를 차단합니다 (${CHANGED_COUNT} files)."
echo "Runtime: ${RUNTIME_LABEL}"
echo "Required action for the model:"
echo "1) 변경사항을 검토하고 의미 단위로 스테이징"
echo "2) 적절한 커밋 메시지로 git commit 실행"
echo "3) 커밋 SHA와 변경 요약을 응답에 포함"
echo ""
echo "Safe changed files (first ${LIST_COUNT}):"
for ((i = 0; i < LIST_COUNT; i++)); do
  echo "  - ${SAFE_FILES[i]}"
done
if [[ "$CHANGED_COUNT" -gt "$MAX_LIST" ]]; then
  echo "  ... and $((CHANGED_COUNT - MAX_LIST)) more"
fi

if [ ${#EXCLUDED_FILES[@]} -gt 0 ]; then
  echo ""
  echo "Excluded sensitive files (not required for commit):"
  for file in "${EXCLUDED_FILES[@]}"; do
    echo "  - $file"
  done
fi

exit 2
