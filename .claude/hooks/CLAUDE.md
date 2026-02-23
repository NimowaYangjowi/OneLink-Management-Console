# .claude/hooks - Stop Commit Gate

Claude/Codex 세션 종료 시 실행되는 커밋 게이트 문서입니다.

## 개요

- 경로: `.claude/hooks/auto-commit.sh`
- 실행 시점: Stop hook (`.claude/settings.json`) 또는 Codex 브리지(`.codex/hooks/on-stop.sh`)
- 동작: 자동 커밋을 수행하지 않고, 안전한 변경사항이 남아 있으면 종료를 차단하고 모델에게 커밋 수행을 지시

## 실행 흐름

```text
세션 종료 시도
  -> .claude/hooks/auto-commit.sh 실행
  -> 안전한 변경사항 존재 시 exit 2 + 지시문 출력
  -> 변경사항이 없거나 민감 파일만 있으면 exit 0
```

## 민감 파일 제외 패턴

- `.env`
- `.env.local`
- `.env.*.local`
- `credentials*`
- `.secret*`
- `*.pem`
- `*.key`
- `*.crt`
- `node_modules` 트리 전체

## 우회(필요 시)

강제로 게이트를 건너뛰려면 다음 환경변수를 사용합니다.

```bash
AUTO_COMMIT_ALLOW_UNCOMMITTED_EXIT=1
```

## 수동 테스트

```bash
bash .claude/hooks/auto-commit.sh
echo $?
```

- `0`: 종료 허용
- `2`: 커밋 필요(종료 차단)
