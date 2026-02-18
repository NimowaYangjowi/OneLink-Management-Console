# Git Hooks & Auto-Commit Guide

프로젝트의 자동 Git 훅 및 커밋 기능 설명서입니다.

## 📦 설정된 훅

### 1. Post-Merge Hook (`.git/hooks/post-merge`)

**언제 실행되나?**
- 다른 브랜치의 코드를 merge할 때 자동 실행
- 예: `git merge feature/something`

**수행 작업:**
- ✅ 디자인 토큰 자동 동기화 (`pnpm tokens:sync`)
- ✅ 변경된 토큰 파일 자동 커밋

**용도:**
- 팀 협업 시 디자인 토큰 최신 상태 유지
- merge 충돌 방지

---

## 🚀 자동 커밋 스크립트

### 수동 자동 커밋 (`scripts/auto-commit.sh`)

변경 사항을 한 번에 스테이징하고 커밋하는 유틸리티입니다.

#### 사용 방법

**기본 사용 (기본 메시지):**
```bash
pnpm commit
```

**사용자 정의 메시지:**
```bash
pnpm commit "Add new component"
pnpm commit "Fix styling bug"
```

**변경 사항만 확인 (실제 커밋 안 함):**
```bash
pnpm commit:dry
pnpm commit:dry "Custom message"
```

**직접 스크립트 실행:**
```bash
bash scripts/auto-commit.sh
bash scripts/auto-commit.sh "Your commit message"
bash scripts/auto-commit.sh --dry-run
```

#### 동작 방식

1. **변경 사항 감지:** 수정된 파일과 추적되지 않은 파일 확인
2. **변경 사항 표시:** 커밋될 파일 목록 출력
3. **사용자 확인:** `y` 입력으로 승인 후 진행
4. **스테이징 & 커밋:** 모든 변경 사항을 `git add .`한 후 커밋

#### 예시 실행

```
$ pnpm commit

[Auto-Commit] 작업 시작...
→ 변경 사항 확인 중...

수정된 파일:
  src/components/Button.tsx
  src/styles/theme.css

위 변경 사항을 커밋하시겠습니까?
계속 진행하시려면 'y' 입력: y

→ 모든 변경 사항을 스테이징 중...
→ 커밋 중... 'chore(auto): Auto-commit changes'
✓ 자동 커밋 완료

* 1a2b3c4 - chore(auto): Auto-commit changes (HEAD -> main, 2 seconds ago)
```

---

## 🤖 Codex Integration

This project also supports Codex using the same auto-commit hook logic.

### Commands

```bash
# Run the stop-hook manually (quick validation)
pnpm codex:stop-hook

# Run Codex CLI with automatic stop-hook bridge on exit
pnpm codex:bridge-cli -- <codex args>
```

### Hook flow

```text
Codex session end
  -> .codex/hooks/on-stop.sh
  -> .claude/hooks/auto-commit.sh
  -> safe file filtering + auto commit
```

`auto-commit.sh` now detects runtime automatically and writes commit metadata as `Codex` or `Claude`.

---

## 📋 커밋 메시지 규칙

자동 생성되는 커밋 메시지는 다음 규칙을 따릅니다:

```
type(scope): description

changed files list (post-merge 훅의 경우)
```

### 타입 (Type)

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: 스타일 변경
- `chore`: 자동화된 변경
- `docs`: 문서 변경

### 예시

```
chore(auto): Post-merge token sync
- src/styles/tokens/design-tokens.css
- design/tokens/design-tokens.generated.json

chore(auto): Auto-commit changes
```

---

## ⚠️ 주의사항

### 1. Post-Merge 훅

- `.env.local` 같은 민감한 파일이 merge되지 않도록 주의
- `.gitignore`에 제외된 파일은 자동 커밋되지 않음

### 2. 자동 커밋 스크립트

- **모든 변경 사항을 커밋합니다** (`git add .`)
- 환경 변수나 개인 설정이 실수로 커밋되지 않도록 주의
- 반드시 `pnpm commit:dry`로 먼저 확인 후 실행

### 3. 커밋 전 확인

항상 커밋 전에 변경 사항을 확인하세요:

```bash
# 변경 사항 미리보기
git diff

# 추적되지 않은 파일 확인
git status

# 자동 커밋 실행 전 테스트
pnpm commit:dry "Your message"
```

---

## 🔧 커스터마이징

### Post-Merge 훅 수정

`.git/hooks/post-merge` 파일을 편집하여 다음을 추가할 수 있습니다:

```bash
# 예: lint 자동 실행
pnpm lint --fix

# 예: 빌드 테스트
pnpm build

# 예: 특정 파일 커밋
git add design/design-system.pen
```

### 자동 커밋 비활성화

Post-merge 훅을 비활성화하려면:

```bash
# 훅 제거 (또는 이름 변경)
rm .git/hooks/post-merge

# 또는 권한 제거
chmod -x .git/hooks/post-merge
```

---

## 📝 일반적인 워크플로우

### 1. 기능 개발

```bash
git checkout -b feature/new-component
# 코드 작성...
pnpm commit "feat: Add new component"
```

### 2. 변경 사항 검증 후 커밋

```bash
# 변경 사항 확인
pnpm commit:dry "Fix styling"
# 결과 만족 ✓
pnpm commit "Fix styling"
```

### 3. 토큰 동기화 후 병합

```bash
pnpm tokens:sync
# Post-merge 훅이 자동으로:
# 1. 토큰 확인
# 2. 변경사항 커밋
```

---

## 🐛 문제 해결

### "Permission denied" 오류

```bash
# 훅 실행 권한 복구
chmod +x .git/hooks/post-merge
chmod +x scripts/auto-commit.sh
```

### 커밋이 실패함

```bash
# Git 상태 확인
git status

# 수동 커밋 시도
git add .
git commit -m "Your message"
```

### 환경변수 실수 커밋됨

```bash
# 마지막 커밋에서 파일 제거
git reset --soft HEAD~1
git reset src/.env.local
git commit -m "chore: Remove env file from commit"
```

---

## 📚 참고 자료

- [Git Hooks 공식 문서](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [프로젝트 CLAUDE.md](../CLAUDE.md)
- [Git 커밋 메시지 규칙](https://www.conventionalcommits.org/)
