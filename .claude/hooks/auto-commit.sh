#!/usr/bin/env bash
# Auto-commit hook: Claude Code 작업 완료 후 자동 커밋
#
# 실행 시점: Claude Code 세션 종료 시 `.codex/hooks/on-stop.sh`를 통해 자동 호출
# 동작: Git 변경 사항 감지 후 자동 커밋 (민감 파일 제외)

set -euo pipefail

# ============================================================================
# 설정
# ============================================================================

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
  codex)
    RUNTIME_LABEL="Codex"
    COAUTHOR="${AUTO_COMMIT_COAUTHOR:-OpenAI Codex <noreply@openai.com>}"
    ;;
  claude)
    RUNTIME_LABEL="Claude"
    COAUTHOR="${AUTO_COMMIT_COAUTHOR:-Claude Haiku 4.5 <noreply@anthropic.com>}"
    ;;
  *)
    RUNTIME_LABEL="Agent"
    COAUTHOR="${AUTO_COMMIT_COAUTHOR:-}"
    ;;
esac

# 민감 파일 제외 패턴 (배열)
EXCLUDE_PATTERNS=(
  '.env'
  '.env.local'
  '.env.*.local'
  'credentials'
  '.secret'
  '*.pem'
  '*.key'
  '*.crt'
  'node_modules'
)

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m'

# ============================================================================
# 유틸 함수
# ============================================================================

log_section() {
  echo -e "${BLUE}[Auto-Commit]${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# 파일이 제외 패턴에 매칭되는지 확인
should_exclude() {
  local file="$1"
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      return 0  # True (제외)
    fi
  done
  return 1  # False (포함)
}

# ============================================================================
# 메인 로직
# ============================================================================

log_section "${RUNTIME_LABEL} 작업 종료 훅 실행..."

# 1. Git 저장소 확인
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  log_warn "Git 저장소가 아닙니다. 스킵"
  exit 0
fi

# 2. 변경 사항 확인
STAGED=$(git diff --cached --name-only 2>/dev/null || true)
UNSTAGED=$(git diff --name-only 2>/dev/null || true)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || true)

if [ -z "$STAGED" ] && [ -z "$UNSTAGED" ] && [ -z "$UNTRACKED" ]; then
  log_section "변경 사항 없음"
  exit 0
fi

# 3. 민감 파일 필터링 및 스테이징
log_section "변경 사항 분석 중..."

SAFE_FILES=()
EXCLUDED_FILES=()

# Unstaged + Untracked 파일 필터링
for file in $UNSTAGED $UNTRACKED; do
  if [ -n "$file" ]; then
    if should_exclude "$file"; then
      EXCLUDED_FILES+=("$file")
    else
      SAFE_FILES+=("$file")
    fi
  fi
done

# Staged 파일 중 제외 패턴 확인 및 언스테이징
for file in $STAGED; do
  if [ -n "$file" ] && should_exclude "$file"; then
    git reset HEAD "$file" 2>/dev/null || true
    EXCLUDED_FILES+=("$file")
  fi
done

# 안전한 파일 스테이징
if [ ${#SAFE_FILES[@]} -gt 0 ]; then
  for file in "${SAFE_FILES[@]}"; do
    git add "$file" 2>/dev/null || true
  done
fi

# 제외된 파일 경고
if [ ${#EXCLUDED_FILES[@]} -gt 0 ]; then
  log_warn "제외된 민감 파일:"
  for file in "${EXCLUDED_FILES[@]}"; do
    echo "     $file"
  done
fi

# 4. 최종 스테이징된 변경사항 확인
if git diff --cached --quiet 2>/dev/null; then
  log_section "커밋할 변경 사항 없음 (민감 파일 제외 후)"
  exit 0
fi

# 5. 커밋 정보 수집
CHANGED_COUNT=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null | head -10)

# 변경 타입 분류
ADDED_COUNT=$(git diff --cached --diff-filter=A --name-only 2>/dev/null | wc -l | tr -d ' ')
MODIFIED_COUNT=$(git diff --cached --diff-filter=M --name-only 2>/dev/null | wc -l | tr -d ' ')
DELETED_COUNT=$(git diff --cached --diff-filter=D --name-only 2>/dev/null | wc -l | tr -d ' ')

# 6. 커밋 메시지 생성
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COAUTHOR_LINE=""
if [[ -n "$COAUTHOR" ]]; then
  COAUTHOR_LINE=$'\n\n'"Co-Authored-By: ${COAUTHOR}"
fi

MORE_FILES_LINE=""
if [[ "$CHANGED_COUNT" -gt 10 ]]; then
  MORE_FILES_LINE="  ... and $((CHANGED_COUNT - 10)) more"
fi

COMMIT_MSG="chore(auto): ${RUNTIME_LABEL} changes (${CHANGED_COUNT} files)

Operations:
  - Added: ${ADDED_COUNT}
  - Modified: ${MODIFIED_COUNT}
  - Deleted: ${DELETED_COUNT}

Changed files:
$(echo "$CHANGED_FILES" | sed 's/^/  - /')
${MORE_FILES_LINE}

Branch: ${BRANCH}
Time: ${TIMESTAMP}${COAUTHOR_LINE}"

# 7. 커밋 실행
log_section "커밋 중..."

if git commit -m "$COMMIT_MSG" 2>/dev/null; then
  log_success "자동 커밋 완료"

  # 커밋된 파일 목록 출력
  echo -e "${GRAY}Committed files (${CHANGED_COUNT}):${NC}"
  echo "$CHANGED_FILES" | sed 's/^/  /'

  # 최신 커밋 정보
  COMMIT_SHA=$(git rev-parse --short HEAD)
  log_section "Commit: ${COMMIT_SHA}"
else
  log_error "커밋 실패"
  exit 1
fi

log_success "${RUNTIME_LABEL} 작업 종료 훅 완료"
exit 0
