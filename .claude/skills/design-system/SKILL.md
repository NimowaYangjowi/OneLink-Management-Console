---
name: design-system
description: OneLinkManagingConsole 프로젝트의 디자인 시스템 가이드. UI 컴포넌트 스타일링, 색상 사용, 타이포그래피, 레이아웃 작업 시 사용. Pencil 색상 토큰 + Forma 디자인 원칙 기반. 색상 사용, MUI 스타일링, 컴포넌트 생성, Storybook 작성 시 활성화됨.
---

# Design System

Pencil 색상 토큰 + Forma 디자인 원칙 통합 시스템.

## 핵심 원칙

### 1. 중립색 우선 (CRITICAL)

**대부분의 UI는 중립색으로 구성한다.**

```jsx
// ✅ 권장: 중립색 사용
sx={{ color: 'text.primary' }}        // #0a0a0a (거의 검정)
sx={{ color: 'text.secondary' }}      // #737373 (회색)
sx={{ backgroundColor: 'grey.100' }}  // #f5f5f5
sx={{ borderColor: 'divider' }}       // #e5e5e5

// ❌ 지양: 무분별한 포인트 컬러
sx={{ color: 'primary.main' }}        // 필요한 곳에만!
sx={{ backgroundColor: 'error.light' }} // 에러 상태에만!
```

### 2. 포인트 컬러 사용 규칙 (CRITICAL)

포인트 컬러는 **명확한 목적이 있을 때만** 사용:

| 컬러 | 허용되는 사용처 | 금지 사용처 |
|------|----------------|------------|
| `primary.main` | CTA 버튼, 활성 탭, 선택된 항목 | 일반 텍스트, 배경 |
| `error.main` | 에러 메시지, 삭제 버튼, 유효성 오류 | 강조 목적 |
| `warning.main` | 경고 알림, 주의 배지 | 일반 아이콘 |
| `success.main` | 완료 상태, 성공 메시지 | 장식 |
| `info.main` | 정보성 툴팁, 도움말 | 일반 링크 |

### 3. Forma 디자인 원칙

| 원칙 | 적용 | 코드 |
|------|------|------|
| Sharp Corners | 모든 모서리 각진 형태 | `borderRadius: 0` |
| Dimmed Shadow | offset 없이 blur만 | `boxShadow: '0 0 20px rgba(0,0,0,0.1)'` |
| Serif Headlines | 헤딩은 세리프 | h1-h4: Fraunces |

## 색상 토큰 Quick Reference

### 중립색 (기본으로 사용)

```jsx
// 텍스트
'text.primary'      // #0a0a0a - 주요 텍스트
'text.secondary'    // #737373 - 보조 텍스트, 설명
'text.disabled'     // rgba(0,0,0,0.38) - 비활성

// 배경
'background.default' // #fafafa - 페이지 배경
'background.paper'   // #fafafa - 카드, 모달
'grey.100'          // #f5f5f5 - 연한 배경
'grey.200'          // #e5e5e5 - 구분선과 동일

// 구분선/테두리
'divider'           // #e5e5e5
```

### 포인트 컬러 (필요시에만)

```jsx
// Primary - CTA, 강조
'primary.main'       // #171717 (거의 검정)
'primary.contrastText' // #fafafa

// Semantic - 상태 표시용
'error.main'         // #e7000b
'warning.main'       // #f59e0b
'success.main'       // #22c55e
'info.main'          // #3b82f6
```

## 스타일링 규칙

### MUI sx prop 사용

```jsx
// ✅ 권장
<Box sx={{
  p: 2,                          // spacing(2) = 16px
  color: 'text.primary',
  backgroundColor: 'background.paper',
  borderRadius: 0,               // Forma 원칙
}}>

// ❌ 지양
<Box sx={{
  padding: '16px',               // 직접 값 사용 금지
  color: '#0a0a0a',              // 하드코딩 금지
  backgroundColor: '#fafafa',
}}>
```

### 아이콘

- lucide-react 라이브러리 아이콘 우선 사용
- 커스텀 SVG 생성 금지 (lucide-react에 없는 경우에만 예외)
- 아이콘 색상: `text.secondary` 기본, 상호작용 시 `text.primary`

## 상세 가이드

- **색상 토큰 상세**: See [references/color-tokens.md](references/color-tokens.md)
- **타이포그래피**: See [references/typography.md](references/typography.md)
- **간격 및 그림자**: See [references/spacing-shadow.md](references/spacing-shadow.md)
- **컴포넌트 가이드**: See [references/components.md](references/components.md)

## 체크리스트

컴포넌트 작성 전 확인:

1. [ ] 중립색 위주로 구성했는가?
2. [ ] 포인트 컬러는 명확한 목적(CTA, 상태)에만 사용했는가?
3. [ ] borderRadius: 0 적용했는가?
4. [ ] theme 토큰 사용했는가? (하드코딩 금지)
5. [ ] lucide-react 아이콘 사용했는가?
