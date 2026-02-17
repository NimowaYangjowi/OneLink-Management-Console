#!/bin/bash
# 자동 커밋 유틸리티: 현재 변경 사항을 자동으로 커밋

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 함수: 사용 방법 출력
show_usage() {
  echo -e "${BLUE}사용 방법:${NC}"
  echo "  bash scripts/auto-commit.sh [message]"
  echo ""
  echo -e "${BLUE}예시:${NC}"
  echo "  bash scripts/auto-commit.sh 'Fix button styling'"
  echo "  bash scripts/auto-commit.sh  # 기본 메시지: 'chore(auto): Auto-commit changes'"
  echo ""
  echo -e "${BLUE}옵션:${NC}"
  echo "  --help, -h     사용 방법 표시"
  echo "  --dry-run      변경 사항만 확인 (커밋 안 함)"
}

# 헬프 옵션 처리
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  show_usage
  exit 0
fi

# 커밋 메시지 설정
COMMIT_MSG="${1:-chore(auto): Auto-commit changes}"
DRY_RUN=false

if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  COMMIT_MSG="${2:-chore(auto): Auto-commit changes}"
fi

echo -e "${BLUE}[Auto-Commit]${NC} 작업 시작..."

# 1. 스테이징 전 변경 사항 확인
echo -e "${BLUE}→${NC} 변경 사항 확인 중..."
UNSTAGED=$(git diff --name-only)
UNTRACKED=$(git ls-files --others --exclude-standard)

if [ -z "$UNSTAGED" ] && [ -z "$UNTRACKED" ]; then
  echo -e "${YELLOW}ℹ 변경 사항이 없습니다${NC}"
  exit 0
fi

# 2. 변경 사항 출력
if [ ! -z "$UNSTAGED" ]; then
  echo -e "${BLUE}수정된 파일:${NC}"
  echo "$UNSTAGED" | sed 's/^/  /'
fi

if [ ! -z "$UNTRACKED" ]; then
  echo -e "${BLUE}추적되지 않은 파일:${NC}"
  echo "$UNTRACKED" | sed 's/^/  /'
fi

# 3. Dry-run 모드
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} 커밋 메시지: '${COMMIT_MSG}'"
  echo -e "${YELLOW}[DRY-RUN]${NC} 실제 커밋은 수행되지 않습니다"
  exit 0
fi

# 4. 사용자 확인 (대화형 모드)
echo ""
echo -e "${YELLOW}위 변경 사항을 커밋하시겠습니까?${NC}"
read -p "계속 진행하시려면 'y' 입력: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}✗ 취소되었습니다${NC}"
  exit 1
fi

# 5. 스테이징 및 커밋
echo -e "${BLUE}→${NC} 모든 변경 사항을 스테이징 중..."
git add .

echo -e "${BLUE}→${NC} 커밋 중... '${COMMIT_MSG}'"
git commit -m "$COMMIT_MSG" || {
  echo -e "${RED}✗ 커밋 실패${NC}"
  exit 1
}

echo -e "${GREEN}✓ 자동 커밋 완료${NC}"
echo ""
git log --oneline -1
