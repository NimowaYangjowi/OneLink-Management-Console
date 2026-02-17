# .claude/hooks - Claude Code Stop Hook

Claude Code 세션 종료 시 자동으로 실행되는 훅 시스템입니다.

## 📋 개요

### 용도
Claude가 작업을 완료하고 응답을 마칠 때 자동으로 Git 변경사항을 커밋합니다.

### 실행 흐름
```
Claude 작업 완료
     ↓
Claude Code 세션 종료
     ↓
`.codex/hooks/on-stop.sh` 실행 (자동)
     ↓
`.claude/hooks/auto-commit.sh` 실행
     ↓
Git 변경사항 감지 및 커밋
```

---

## 🔧 auto-commit.sh 상세 설명

### 기능

✅ **자동 변경사항 감지**
- Staged, Unstaged, Untracked 파일 자동 감지

✅ **민감 파일 자동 필터링**
- `.env`, `.env.local`, 인증서 파일 등 제외
- `.gitignore`에 등록된 파일 자동 제외

✅ **명확한 커밋 정보**
- 파일 수 및 변경 타입 (추가/수정/삭제) 표시
- 변경된 파일 목록 포함
- 커밋 SHA 및 타임스탬프 기록

✅ **안전한 커밋**
- 확인 없이 자동 커밋 (세션 종료 시점)
- 사용자의 pre-commit 훅 존중
- 오류 시 안전하게 종료

### 변경사항 분석

```bash
# 커밋 메시지 예시
chore(auto): Claude Code changes (43 files)

Operations:
  • Added: 2
  • Modified: 38
  • Deleted: 3

Changed files:
  - src/components/Button.tsx
  - src/styles/theme.css
  - design/design-system.pen
  ... and 40 more

Branch: main
Time: 2026-02-17 15:30:45

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

## 🛡️ 민감 파일 제외 목록

자동으로 커밋되지 않는 파일:
- `.env`, `.env.local`, `.env.*.local`
- `credentials*`
- `.secret*`
- `*.pem`, `*.key`, `*.crt`
- `node_modules`

**주의:** `.gitignore`에 등록된 파일은 자동으로 제외되며, 추가 필터링이 필요하면 `EXCLUDE_PATTERNS`을 수정하세요.

---

## 📝 사용 시나리오

### 1. 일반적인 개발 작업
```
Claude: 새로운 컴포넌트 작성 완료
  → auto-commit.sh 실행
  → src/components/NewComponent.tsx 등이 자동 커밋됨
  → 다음 세션에서 깨끗한 상태에서 시작
```

### 2. 버그 수정
```
Claude: 버그 수정 및 테스트 통과 확인
  → auto-commit.sh 실행
  → 수정 사항이 자동 커밋됨
  → commit 메시지에 "43 files" 표시
```

### 3. 토큰/설정 동기화
```
Claude: 디자인 토큰 동기화
  → auto-commit.sh 실행
  → design-system.pen, 토큰 파일 자동 커밋
  → 민감 파일 (.env)은 제외됨
```

---

## 🔍 로그 출력 예시

```
[Auto-Commit] Claude 작업 종료 훅 실행...
[Auto-Commit] 변경 사항 분석 중...
⚠ 제외된 민감 파일:
     .env.local
[Auto-Commit] 커밋 중...
✓ 자동 커밋 완료
Committed files (43):
  - src/components/Button.tsx
  - src/styles/theme.css
  - design/design-system.pen
[Auto-Commit] Commit: 1a2b3c4
✓ Claude 작업 종료 훅 완료
```

---

## ⚙️ 커스터마이징

### 민감 파일 패턴 추가

`auto-commit.sh`에서 `EXCLUDE_PATTERNS` 배열을 수정합니다:

```bash
EXCLUDE_PATTERNS=(
  '.env'
  '.env.local'
  '*.secret'        # 추가
  'my-private-*'    # 추가
  # ... 기본 패턴
)
```

### 커밋 메시지 포맷 변경

`COMMIT_MSG` 변수를 수정하면 커밋 메시지 형식을 변경할 수 있습니다:

```bash
COMMIT_MSG="feat(auto): Changes from Claude

Files changed: ${CHANGED_COUNT}
..."
```

---

## 🐛 문제 해결

### "Permission denied" 오류

```bash
chmod +x .claude/hooks/auto-commit.sh
```

### 특정 파일이 계속 커밋됨

1. `.gitignore`에 파일 경로 추가
2. 또는 `EXCLUDE_PATTERNS`에 패턴 추가

### 훅이 실행되지 않음

1. `.codex/hooks/on-stop.sh`가 실행 가능한지 확인:
   ```bash
   chmod +x .codex/hooks/on-stop.sh
   ```

2. Claude Code 세션 종료 시 로그 확인

3. 수동 테스트:
   ```bash
   bash .claude/hooks/auto-commit.sh
   ```

---

## 📚 관련 파일

- `.codex/hooks/on-stop.sh` - Claude Code stop 이벤트 핸들러
- `CLAUDE.md` (프로젝트 루트) - 프로젝트 규칙
- `.gitignore` - Git 무시 파일 목록

---

## 🔐 보안 고려사항

### 민감 정보 보호

1. **환경 변수 파일 보호:**
   - `.env.local`, `.env.*.local` 자동 제외

2. **인증서/키 보호:**
   - `*.pem`, `*.key`, `*.crt` 자동 제외

3. **실수 방지:**
   - 새로운 민감 파일 발견 시 로그에 경고 표시
   - `.gitignore`에 명시적으로 등록 권장

### 감사 추적 (Audit Trail)

모든 자동 커밋에 다음 정보 기록:
- 변경된 파일 목록
- 변경 타입 (추가/수정/삭제)
- 실행 시간 및 브랜치
- 모델 정보 (Claude Haiku 4.5 등)

---

## 📞 지원

이 훅 시스템과 관련된 문제나 개선 사항은:
- `.claude/hooks/auto-commit.sh` 내용 검토
- `.codex/hooks/on-stop.sh` 설정 확인
- 프로젝트 CLAUDE.md 참고
