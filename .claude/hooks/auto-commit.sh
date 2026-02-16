#!/bin/bash
# Auto-commit hook: Claude Code 작업 완료 후 자동 커밋
# Event: Stop (Claude가 응답을 마칠 때 실행)

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

# 변경사항이 없으면 종료
if git diff --quiet HEAD 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  exit 0
fi

# 변경된 파일 목록 수집
STAGED=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED=$(git diff --name-only 2>/dev/null)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)

# 민감 파일 제외 패턴
EXCLUDE_PATTERNS=('.env' 'credentials' '.secret' '*.pem' '*.key')

# 스테이징할 파일 수집 (민감 파일 제외)
FILES_TO_ADD=""
for file in $UNSTAGED $UNTRACKED; do
  SKIP=false
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      SKIP=true
      break
    fi
  done
  if [ "$SKIP" = false ] && [ -n "$file" ]; then
    FILES_TO_ADD="$FILES_TO_ADD $file"
  fi
done

# 이미 스테이징된 파일도 포함
for file in $STAGED; do
  SKIP=false
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      SKIP=true
      break
    fi
  done
  if [ "$SKIP" = true ]; then
    git reset HEAD "$file" 2>/dev/null || true
  fi
done

# 파일 스테이징
if [ -n "$FILES_TO_ADD" ]; then
  git add $FILES_TO_ADD 2>/dev/null || true
fi

# 스테이징된 변경사항 확인
if git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

# 변경 파일 수 및 요약 생성
CHANGED_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
CHANGED_FILES=$(git diff --cached --name-only | head -5)
CHANGE_TYPES=""

if git diff --cached --diff-filter=A --name-only | grep -q .; then
  CHANGE_TYPES="${CHANGE_TYPES}add, "
fi
if git diff --cached --diff-filter=M --name-only | grep -q .; then
  CHANGE_TYPES="${CHANGE_TYPES}modify, "
fi
if git diff --cached --diff-filter=D --name-only | grep -q .; then
  CHANGE_TYPES="${CHANGE_TYPES}delete, "
fi
CHANGE_TYPES=$(echo "$CHANGE_TYPES" | sed 's/, $//')

# 커밋 메시지 생성
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

COMMIT_MSG="chore(auto): Claude Code changes (${CHANGED_COUNT} files)

Changed files:
$(echo "$CHANGED_FILES" | sed 's/^/  - /')
$([ "$CHANGED_COUNT" -gt 5 ] && echo "  ... and $((CHANGED_COUNT - 5)) more")

Operations: ${CHANGE_TYPES}
Branch: ${BRANCH}
Time: ${TIMESTAMP}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git commit -m "$COMMIT_MSG" --no-verify 2>&1

exit 0
